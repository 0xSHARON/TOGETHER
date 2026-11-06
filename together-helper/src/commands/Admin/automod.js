const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const { AutoModConfig } = require("../../schema");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");

module.exports = {
  name: "automod",
  description: "Configure automatic protections (Anti-Invite, Anti-Link, Anti-Spam)",
  category: "Admin",
  userPerms: ["ManageGuild"],
  slashOptions: [
    {
      name: "anti_invite",
      description: "Delete unauthorized Discord invite links",
      type: ApplicationCommandOptionType.Boolean,
      required: false
    },
    {
      name: "anti_link",
      description: "Delete external HTTP/HTTPS links from non-staff",
      type: ApplicationCommandOptionType.Boolean,
      required: false
    },
    {
      name: "anti_spam",
      description: "Filter rapid spam messages",
      type: ApplicationCommandOptionType.Boolean,
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply(noticePayload({ title: "Permission Denied", description: "You need `Manage Server` permission.", tone: "danger" }, true));
    }

    const antiInvite = interaction.options.getBoolean("anti_invite");
    const antiLink = interaction.options.getBoolean("anti_link");
    const antiSpam = interaction.options.getBoolean("anti_spam");

    let cfg = await AutoModConfig.findOne({ guildId: interaction.guild.id });
    if (!cfg) cfg = new AutoModConfig({ guildId: interaction.guild.id });

    if (antiInvite !== null) cfg.antiInvite = antiInvite;
    if (antiLink !== null) cfg.antiLink = antiLink;
    if (antiSpam !== null) cfg.antiSpam = antiSpam;

    await cfg.save();

    const card = container(COLORS.success)
      .addTextDisplayComponents(text(`## 🛡️ AutoMod Settings Updated\n-# Automatic server defense rules`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `• **Anti-Discord-Invites:** \`${cfg.antiInvite ? "Enabled ✅" : "Disabled ❌"}\`\n` +
          `• **Anti-External-Links:** \`${cfg.antiLink ? "Enabled ✅" : "Disabled ❌"}\`\n` +
          `• **Anti-Spam Filter:** \`${cfg.antiSpam ? "Enabled ✅" : "Disabled ❌"}\`\n\n` +
          `*Staff with \`Manage Messages\` bypass these restrictions.*`
        )
      );

    return interaction.reply({ components: [card], flags: flags(false) });
  },

  async prefixExecute(message, args, client) {
    const cfg = await AutoModConfig.findOne({ guildId: message.guild.id });
    const card = container(COLORS.info)
      .addTextDisplayComponents(text(`## 🛡️ Current AutoMod Settings`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `• **Anti-Invites:** \`${cfg?.antiInvite ? "ON" : "OFF"}\`\n` +
          `• **Anti-Links:** \`${cfg?.antiLink ? "ON" : "OFF"}\`\n\n` +
          `Use \`/automod\` to toggle settings.`
        )
      );
    return message.reply({ components: [card], flags: flags(false) });
  }
};
