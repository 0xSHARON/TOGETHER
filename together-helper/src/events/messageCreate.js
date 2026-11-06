const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { StickyMessage, Afk, AutoModConfig } = require("../schema");
const config = require("../config");
const { container, flags, separator, text, noticePayload, COLORS } = require("../utils/ui");

// Cooldown tracker to prevent rate limits when multiple messages arrive quickly
const stickyCooldowns = new Map();

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    // 0. AutoMod Protection Check (Anti-Invite & Anti-Link)
    try {
      const isStaff = message.member?.permissions.has(PermissionFlagsBits.ManageMessages);
      if (!isStaff) {
        const automod = await AutoModConfig.findOne({ guildId: message.guild.id });
        if (automod) {
          const inviteRegex = /(discord\.(gg|io|me|li)|discordapp\.com\/invite|discord\.com\/invite)\/[a-zA-Z0-9]+/i;
          const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i;

          if (automod.antiInvite && inviteRegex.test(message.content)) {
            await message.delete().catch(() => {});
            return message.channel.send(
              noticePayload({
                title: "AutoMod Action",
                description: `${message.author}, invite links are not allowed in this server!`,
                emoji: "🛡️",
                tone: "danger"
              }, false)
            ).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
          }

          if (automod.antiLink && linkRegex.test(message.content)) {
            await message.delete().catch(() => {});
            return message.channel.send(
              noticePayload({
                title: "AutoMod Action",
                description: `${message.author}, external links are restricted here!`,
                emoji: "🛡️",
                tone: "danger"
              }, false)
            ).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
          }
        }
      }
    } catch {}

    // 1. AFK Detection
    // 1A. If author was AFK, remove their AFK status
    try {
      const authorAfk = await Afk.findOne({ userId: message.author.id, guildId: message.guild.id });
      if (authorAfk) {
        await Afk.deleteOne({ _id: authorAfk._id });
        const afkCard = container(COLORS.success)
          .addTextDisplayComponents(text(`### 👋 Welcome back, ${message.author.username}!\n-# I've removed your AFK status.`));
        message.channel.send({ components: [afkCard], flags: flags(false) })
          .then(m => setTimeout(() => m.delete().catch(() => {}), 6000));
      }

      // 1B. If author mentioned anyone who is AFK, notify them
      if (message.mentions.users.size > 0) {
        for (const [mentionedId, mentionedUser] of message.mentions.users) {
          if (mentionedId === message.author.id || mentionedUser.bot) continue;
          const targetAfk = await Afk.findOne({ userId: mentionedId, guildId: message.guild.id });
          if (targetAfk) {
            const timeAgo = Math.round(new Date(targetAfk.timestamp).getTime() / 1000);
            const card = container(COLORS.warning)
              .addTextDisplayComponents(
                text(`### 💤 **${mentionedUser.username}** is currently AFK\n• **Reason:** ${targetAfk.reason}\n• **Since:** <t:${timeAgo}:R>`)
              );
            message.reply({ components: [card], flags: flags(false) })
              .then(m => setTimeout(() => m.delete().catch(() => {}), 8000));
            break; // notify once per message
          }
        }
      }
    } catch {}

    // 1. Handle Prefix & Mention Commands
    const prefix = config.prefix || "-";
    const mentionRegex = new RegExp(`^<@!?${client.user.id}>(?:\\s+)?`);
    let matchedPrefix = null;

    if (message.content.startsWith(prefix)) {
      matchedPrefix = prefix;
    } else if (mentionRegex.test(message.content)) {
      const match = message.content.match(mentionRegex);
      matchedPrefix = match[0];
    }

    if (matchedPrefix !== null) {
      const rawArgs = message.content.slice(matchedPrefix.length).trim();
      const args = rawArgs.length ? rawArgs.split(/ +/g) : [];
      const commandName = args.shift()?.toLowerCase();

      // If user merely mentions the bot without arguments, show quick helper info
      if (!commandName) {
        return message.reply(
          noticePayload({
            title: "TOGETHER HELPER Online",
            description: `My prefix on this server is \`${prefix}\` or you can use \`/help\` to browse all commands.`,
            emoji: "🤖",
            tone: "info"
          }, false)
        ).catch(() => {});
      }

      const command = client.commands.get(commandName);
      if (command && typeof command.prefixExecute === "function") {
        try {
          await command.prefixExecute(message, args, client);

          const { dispatchLogThread } = require("../utils/webhooks");
          const cmdEmbed = new EmbedBuilder()
            .setColor("#00E676")
            .setAuthor({
              name: `${message.author.tag} (${message.author.id})`,
              iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setTitle("📜 Prefix Command Executed")
            .setDescription(`• **Command:** \`${matchedPrefix}${commandName}\`\n• **Channel:** <#${message.channel.id}>\n• **Server:** \`${message.guild?.name}\``)
            .setTimestamp();
          dispatchLogThread(client, "cmdrun", cmdEmbed);
        } catch (err) {
          console.error(`[Prefix Command Error] ${commandName}:`, err);
          await message.reply(
            noticePayload({
              title: "Command Execution Error",
              description: err.message,
              emoji: "❌",
              tone: "danger"
            }, false)
          ).catch(() => {});
        }
        return;
      }
    }

    // 2. Handle Sticky Message Repositioning
    try {
      const sticky = await StickyMessage.findOne({ channelId: message.channel.id, enabled: true });
      if (!sticky || !sticky.message) return;

      // Avoid spamming if triggered in quick succession (min 3 sec delay)
      const lastTrigger = stickyCooldowns.get(message.channel.id) || 0;
      if (Date.now() - lastTrigger < 3000) return;
      stickyCooldowns.set(message.channel.id, Date.now());

      // Delete previous sticky message if still exists
      if (sticky.lastMessageId) {
        try {
          const oldMsg = await message.channel.messages.fetch(sticky.lastMessageId);
          if (oldMsg) await oldMsg.delete();
        } catch {}
      }

      // Send fresh sticky message using Components V2
      const stickyCard = container()
        .addTextDisplayComponents(text(`## 📌 Channel Guidelines & Notice\n-# Important Information`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(sticky.message))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`-# Dynamic notice · Automatically stays anchored to the bottom`));

      const newMsg = await message.channel.send({
        components: [stickyCard],
        flags: flags(false)
      });

      sticky.lastMessageId = newMsg.id;
      await sticky.save();
    } catch (err) {
      console.error("[Sticky Event Error]", err);
    }
  }
};
