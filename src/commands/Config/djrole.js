const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  PermissionsBitField,
  ApplicationCommandOptionType,
  MessageFlags
} = require("discord.js");
const DJRole = require("../../schema/djrole");
const { checkDJ } = require("../../utils/djCheck");

module.exports = {
  name: "djrole",
  aliases: ["dj", "setdj"],
  category: "Config",
  description: "Configure the server DJ role to restrict playback controls",
  args: false,
  usage: "<set @role | remove | toggle | status>",
  userPerms: ["ManageGuild"],
  botPerms: ["EmbedLinks"],
  owner: false,
  slashOptions: [
    {
      name: "action",
      type: ApplicationCommandOptionType.String,
      description: "Action to perform",
      required: true,
      choices: [
        { name: "status - View current DJ configuration", value: "status" },
        { name: "set - Assign a role as the DJ role", value: "set" },
        { name: "remove - Remove the DJ role requirement", value: "remove" },
        { name: "toggle - Toggle DJ mode on or off", value: "toggle" }
      ]
    },
    {
      name: "role",
      type: ApplicationCommandOptionType.Role,
      description: "The role to set as DJ role (required if action is 'set')",
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    const interactionWrapper = {
      guild: interaction.guild,
      channel: interaction.channel,
      author: interaction.user,
      member: interaction.member,
      createdTimestamp: interaction.createdTimestamp,
      reply: async (options) => {
        if (interaction.deferred) {
          return await interaction.editReply(options);
        } else if (interaction.replied) {
          return await interaction.followUp(options);
        } else {
          return await interaction.reply(options);
        }
      },
    };

    const action = interaction.options.getString("action") || "status";
    const role = interaction.options.getRole("role");

    const args = [action];
    if (role) args.push(role.id);

    return this.execute(interactionWrapper, args, client, client.prefix);
  },

  async execute(message, args, client, prefix) {
    try {
      const sub = (args[0] || "status").toLowerCase();

      // ── SUBCOMMAND: STATUS ──
      if (sub === "status" || sub === "view" || sub === "show") {
        const djDoc = await DJRole.findOne({ guildId: message.guild.id }).lean();
        const role = djDoc?.roleId ? message.guild.roles.cache.get(djDoc.roleId) : null;

        const isEnabled = djDoc ? djDoc.mode !== false : false;
        const statusEmoji = isEnabled && role ? (client.emoji.check || "✅") : (client.emoji.cross || "❌");

        const display = new TextDisplayBuilder()
          .setContent(
            `##  TOGETHER // DJ Role Management\n\n` +
            `**DJ System Status:** ${statusEmoji} \`${isEnabled && role ? "ACTIVE / ENFORCED" : "DISABLED / FREE FOR ALL"}\`\n\n` +
            `• **Configured Role:** ${role ? `<@&${role.id}> (\`${role.name}\`)` : "*None configured*"}\n` +
            `• **Enforcement Mode:** \`${isEnabled ? "ENABLED" : "DISABLED"}\`\n` +
            `• **Protected Commands:** \`stop\`, \`forceskip\`, \`pause\`, \`resume\`, \`volume\`, \`clear\`, \`seek\`, \`shuffle\`, \`filter\`\n\n` +
            `*Tip: Administrators, server owners, and solo voice listeners always bypass DJ role restrictions.*`
          );

        const container = new ContainerBuilder().addTextDisplayComponents(display);
        return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      // ── SUBCOMMAND: SET <@role | roleId | name> ──
      if (sub === "set" || sub === "add") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !client.config.ownerID.includes(message.author.id)) {
          const permDisplay = new TextDisplayBuilder()
            .setContent(`**${client.emoji.cross || "❌"} You need \`Manage Guild\` permissions to configure DJ roles.**`);
          const container = new ContainerBuilder().addTextDisplayComponents(permDisplay);
          return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        const roleTarget = message.mentions?.roles?.first() ||
          message.guild.roles.cache.get(args[1]) ||
          message.guild.roles.cache.find(r => r.name.toLowerCase() === args.slice(1).join(" ").toLowerCase());

        if (!roleTarget) {
          const usageDisplay = new TextDisplayBuilder()
            .setContent(
              `**${client.emoji.warn || "⚠️"} Please specify a valid role to set as the DJ role.**\n` +
              `Usage: \`${prefix}djrole set <@role | role_id | role_name>\``
            );
          const container = new ContainerBuilder().addTextDisplayComponents(usageDisplay);
          return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        await DJRole.findOneAndUpdate(
          { guildId: message.guild.id },
          { roleId: roleTarget.id, mode: true, updatedAt: new Date() },
          { upsert: true, new: true }
        );

        const successDisplay = new TextDisplayBuilder()
          .setContent(
            `**${client.emoji.check || "✅"} Successfully configured <@&${roleTarget.id}> as the official DJ role!**\n\n` +
            `• Members with this role can now manage DJ playback commands.\n` +
            `• Server administrators and solo listeners retain full bypass control.`
          );

        const container = new ContainerBuilder().addTextDisplayComponents(successDisplay);
        return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      // ── SUBCOMMAND: REMOVE / RESET ──
      if (sub === "remove" || sub === "delete" || sub === "clear" || sub === "reset") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !client.config.ownerID.includes(message.author.id)) {
          const permDisplay = new TextDisplayBuilder()
            .setContent(`**${client.emoji.cross || "❌"} You need \`Manage Guild\` permissions to remove DJ roles.**`);
          const container = new ContainerBuilder().addTextDisplayComponents(permDisplay);
          return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        await DJRole.findOneAndDelete({ guildId: message.guild.id });

        const resetDisplay = new TextDisplayBuilder()
          .setContent(`**${client.emoji.check || "✅"} DJ role has been removed. All voice listeners can now freely use playback commands.**`);

        const container = new ContainerBuilder().addTextDisplayComponents(resetDisplay);
        return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      // ── SUBCOMMAND: TOGGLE ──
      if (sub === "toggle") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !client.config.ownerID.includes(message.author.id)) {
          const permDisplay = new TextDisplayBuilder()
            .setContent(`**${client.emoji.cross || "❌"} You need \`Manage Guild\` permissions to toggle DJ mode.**`);
          const container = new ContainerBuilder().addTextDisplayComponents(permDisplay);
          return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        const djDoc = await DJRole.findOne({ guildId: message.guild.id });
        if (!djDoc || !djDoc.roleId) {
          const noRoleDisplay = new TextDisplayBuilder()
            .setContent(`**${client.emoji.warn || "⚠️"} No DJ role has been configured yet. Use \`${prefix}djrole set <@role>\` first.**`);
          const container = new ContainerBuilder().addTextDisplayComponents(noRoleDisplay);
          return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        djDoc.mode = !djDoc.mode;
        djDoc.updatedAt = new Date();
        await djDoc.save();

        const toggleDisplay = new TextDisplayBuilder()
          .setContent(
            `**${client.emoji.check || "✅"} DJ Role enforcement is now \`${djDoc.mode ? "ENABLED" : "DISABLED"}\` for <@&${djDoc.roleId}>.**`
          );

        const container = new ContainerBuilder().addTextDisplayComponents(toggleDisplay);
        return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      // Default fallback usage
      const fallbackDisplay = new TextDisplayBuilder()
        .setContent(
          `** TOGETHER DJ Role Help**\n` +
          `• \`${prefix}djrole status\` — Check active DJ role settings\n` +
          `• \`${prefix}djrole set @role\` — Assign a new DJ role\n` +
          `• \`${prefix}djrole toggle\` — Enable / disable DJ enforcement\n` +
          `• \`${prefix}djrole remove\` — Remove DJ role requirement`
        );
      const container = new ContainerBuilder().addTextDisplayComponents(fallbackDisplay);
      return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });

    } catch (err) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.cross || "❌"} Error: ${err.message}**`);
      const container = new ContainerBuilder().addTextDisplayComponents(errorDisplay);
      return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
  }
};
