const {
  PermissionsBitField,
  EmbedBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags
} = require("discord.js");
const {
  getGuildPrefix,
  isChannelIgnored,
  hasNoPrefix,
  isUserBlacklisted
} = require("../../utils/botCache");
const { sendWebhook } = require("../../utils/webhooks");
const cooldowns = new Map();

module.exports = {
  name: "messageCreate",
  once: false,
  run: async (client, message) => {
    if (message.author.bot || !message.guild || !message.content) return;
    if (!client.emoji || Object.keys(client.emoji).length < 5) {
      await client.emojiReady?.catch(() => {});
    }

    const content = message.content.trim();
    const contentLower = content.toLowerCase();
    const prefix = await getGuildPrefix(message.guild.id, client.prefix || ".");

    // Bot mention greeting
    const mentionRegex = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (content.match(mentionRegex)) {
      if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages) || !message.guild.members.me.permissions.has(PermissionsBitField.Flags.EmbedLinks)) {
        return;
      }

      const greetDisplay = new TextDisplayBuilder()
        .setContent(
          `**${client.emoji?.check || "✅"} Hey ${message.author}!**\n` +
          `**${client.emoji?.info || "ℹ️"} My prefix for this server is  **\`${prefix}\`\n\n` +
          `**${client.emoji?.info || "ℹ️"} Type \`${prefix}help\` for a list of commands.**`
        );

      const container = new ContainerBuilder()
        .addTextDisplayComponents(greetDisplay);

      await message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => null);
      return;
    }

    // Fast-path: Check if message starts with prefix or mention
    let usedPrefix = "";
    if (contentLower.startsWith(prefix.toLowerCase())) {
      usedPrefix = prefix;
    } else {
      const mentionPrefixMatch = content.match(new RegExp(`^<@!?${client.user.id}>`));
      if (mentionPrefixMatch) {
        usedPrefix = mentionPrefixMatch[0];
      }
    }

    // If message doesn't start with prefix or mention, check if user has noprefix
    if (!usedPrefix) {
      const userHasNoPrefix = await hasNoPrefix(message.author.id);
      if (!userHasNoPrefix) return; // Immediate exit! 0 DB queries! 0 ms delay!
    }

    // Check if channel is ignored
    if (await isChannelIgnored(message.guild.id, message.channel.id)) {
      return;
    }

    const args = message.content.slice(usedPrefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const command = client.commands.get(commandName)
      || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (await isUserBlacklisted(message.author.id)) {
      const blacklistDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji?.warn || "⚠️"} You have been blacklisted from using the bot!**`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(blacklistDisplay);

      const reply = await message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => null);
      if (reply) setTimeout(() => reply.delete().catch(() => { }), 5000);
      return;
    }

    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Map());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = ((expirationTime - now) / 1000).toFixed(1);

        const cooldownDisplay = new TextDisplayBuilder()
          .setContent(`**${client.emoji.warn} Please wait ${timeLeft}s before using \`${command.name}\` command again.**`);

        const container = new ContainerBuilder()
          .addTextDisplayComponents(cooldownDisplay);

        return message.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2
        }).then((msg) => {
          const delayTime = expirationTime - now;
          setTimeout(() => {
            msg.delete().catch(() => { });
          }, delayTime);
        });
      }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.cross} I don't have \`SEND_MESSAGES\` permission in ${message.guild.name} to execute the \`${command.name}\` command.**`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorDisplay);

      return await message.author.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => { });
    }

    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.EmbedLinks)) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.cross} I don't have \`EMBED_LINKS\` permission in this channel to execute the \`${command.name}\` command.**`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorDisplay);

      return await message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => { });
    }

    if (command.args && !args.length) {
      let reply = `You didn't provide any arguments, ${message.author}!`;
      if (command.usage) {
        reply += `\nUsage: \`${prefix}${command.name} ${command.usage}\``;
      }

      const argsDisplay = new TextDisplayBuilder()
        .setContent(reply);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(argsDisplay);

      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => null);
    }

    if (command.botPerms && !message.guild.members.me.permissions.has(PermissionsBitField.resolve(command.botPerms || []))) {
      const permDisplay = new TextDisplayBuilder()
        .setContent(`I need the **\`${command.botPerms.join(', ')}\`** permission(s) to execute this command.`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(permDisplay);

      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => null);
    }

    if (command.userPerms && !message.member.permissions.has(PermissionsBitField.resolve(command.userPerms || []))) {
      const permDisplay = new TextDisplayBuilder()
        .setContent(`You need the **\`${command.userPerms.join(', ')}\`** permission(s) to use this command.`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(permDisplay);

      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => null);
    }

    if (command.owner && !client.config.ownerID.includes(message.author.id)) {
      return;
    }

    const player = client.manager.players.get(message.guild.id);
    if (command.player && !player) {
      const playerDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.warn} There is no music player active in this server.**`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(playerDisplay);

      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => null);
    }

    if (command.inVoiceChannel && !message.member.voice.channel) {
      const vcDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.warn} You must be in a voice channel to use this command.**`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(vcDisplay);

      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => null);
    }

    if (command.sameVoiceChannel && player && message.member.voice.channel.id !== player.voiceId) {
      const sameVcDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.warn} You must be in the same voice channel as me.**`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(sameVcDisplay);

      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => null);
    }

    try {
      await command.execute(message, args, client, prefix);

      client.logger?.log(
        `[CMD] Prefix command "${prefix}${command.name}" executed by ${message.author.tag} (${message.author.id}) in "${message.guild?.name || "DM"}" (#${message.channel?.name || "unknown"})`,
        "cmd"
      );

      if (client.config.Webhooks?.cmdrun || client.config.logging?.channelId) {
        const commandlog = new EmbedBuilder()
          .setAuthor({
            name: `${message.author.tag} (${message.author.id})`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setColor(client.color || "#3F4652")
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
          .setDescription(
            `**${client.emoji?.check || "✅"} Prefix Command Executed**\n\n` +
            `**${client.emoji?.dot || "•"} Command:** \`${prefix}${command.name}\`\n` +
            `**${client.emoji?.dot || "•"} Server:** \`${message.guild.name} | ${message.guild.id}\`\n` +
            `**${client.emoji?.dot || "•"} Channel:** <#${message.channel.id}> (\`${message.channel.name}\`)\n` +
            `**${client.emoji?.dot || "•"} Executor:** <@${message.author.id}> (\`${message.author.tag}\`)\n` +
            `**${client.emoji?.dot || "•"} Message Content:** \`${message.content.slice(0, 1000)}\`\n` +
            `**${client.emoji?.dot || "•"} Executed At:** <t:${Math.floor(Date.now() / 1000)}:F> (<t:${Math.floor(Date.now() / 1000)}:R>)`
          )
          .setFooter({
            text: `${client.user.username} • Prefix Command Logger`,
            iconURL: client.user.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        sendWebhook(client, "cmdrun", { embeds: [commandlog] }).catch(() => {});
      }
    } catch (error) {
      client.logger.log(`Error executing command ${command.name}: ${error.stack}`, "error");

      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.warn} An error occurred while executing this command!**`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorDisplay);

      try {
        await message.channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2
        });
      } catch (sendError) {
        client.logger.log(`Failed to send error message: ${sendError}`, "error");
      }
    }
  },
};
