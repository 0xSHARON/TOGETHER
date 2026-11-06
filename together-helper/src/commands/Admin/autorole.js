const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const { AutoRoleConfig } = require("../../schema");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");

module.exports = {
  name: "autorole",
  description: "Configure roles automatically given to new members or bots when joining",
  category: "Admin",
  userPerms: ["ManageRoles"],
  slashOptions: [
    {
      name: "human_role",
      description: "Role given automatically to human members",
      type: ApplicationCommandOptionType.Role,
      required: false
    },
    {
      name: "bot_role",
      description: "Role given automatically to bot accounts",
      type: ApplicationCommandOptionType.Role,
      required: false
    },
    {
      name: "enabled",
      description: "Toggle autorole on or off",
      type: ApplicationCommandOptionType.Boolean,
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply(noticePayload({ title: "Permission Denied", description: "You need `Manage Roles` permission.", tone: "danger" }, true));
    }

    const humanRole = interaction.options.getRole("human_role");
    const botRole = interaction.options.getRole("bot_role");
    const enabled = interaction.options.getBoolean("enabled");

    let cfg = await AutoRoleConfig.findOne({ guildId: interaction.guild.id });
    if (!cfg) cfg = new AutoRoleConfig({ guildId: interaction.guild.id });

    if (humanRole) cfg.humanRoleId = humanRole.id;
    if (botRole) cfg.botRoleId = botRole.id;
    if (enabled !== null) cfg.enabled = enabled;

    await cfg.save();

    const card = container(COLORS.success)
      .addTextDisplayComponents(text(`## 🎭 AutoRole Updated\n-# Automatically assigned upon joining`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `• **Status:** \`${cfg.enabled ? "Active ✅" : "Disabled ❌"}\`\n` +
          `• **Human Member Role:** ${cfg.humanRoleId ? `<@&${cfg.humanRoleId}>` : "*None*"}\n` +
          `• **Bot Account Role:** ${cfg.botRoleId ? `<@&${cfg.botRoleId}>` : "*None*"}`
        )
      );

    return interaction.reply({ components: [card], flags: flags(false) });
  },

  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return message.reply(noticePayload({ title: "Permission Denied", description: "You need `Manage Roles` permission.", tone: "danger" }));
    }

    const role = message.mentions.roles.first();
    if (!role) {
      return message.reply(noticePayload({ title: "Usage", description: "`-autorole <@role>` to set human auto-role, or use `/autorole` for advanced options.", tone: "warning" }));
    }

    await AutoRoleConfig.findOneAndUpdate(
      { guildId: message.guild.id },
      { humanRoleId: role.id, enabled: true },
      { upsert: true, new: true }
    );

    const card = container(COLORS.success)
      .addTextDisplayComponents(text(`## 🎭 AutoRole Updated\n-# Assigned upon join`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`• **Human Role:** <@&${role.id}>\n• **Status:** \`Active ✅\``));

    return message.reply({ components: [card], flags: flags(false) });
  }
};
