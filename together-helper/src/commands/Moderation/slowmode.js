const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const ms = require("ms");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");

module.exports = {
  name: "slowmode",
  aliases: ["slow"],
  description: "Set slowmode rate limit for the channel",
  category: "Moderation",
  userPerms: ["ManageChannels"],
  slashOptions: [
    {
      name: "seconds",
      description: "Slowmode in seconds (e.g. 5, 10, 60 or 0 to disable)",
      type: ApplicationCommandOptionType.Integer,
      required: true,
      min_value: 0,
      max_value: 21600
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply(noticePayload({ title: "Permission Denied", description: "You need `Manage Channels` permission.", tone: "danger" }, true));
    }

    const seconds = interaction.options.getInteger("seconds");

    try {
      await interaction.channel.setRateLimitPerUser(seconds, `Slowmode set by ${interaction.user.tag}`);

      const stateText = seconds === 0 ? "Disabled" : `${seconds} second(s) per user`;
      const card = container(COLORS.success)
        .addTextDisplayComponents(text(`## ⏱️ Slowmode Updated\n-# Set by ${interaction.user.tag}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`• **Channel:** <#${interaction.channel.id}>\n• **Rate Limit:** \`${stateText}\``));

      return interaction.reply({ components: [card], flags: flags(false) });
    } catch (err) {
      return interaction.reply(noticePayload({ title: "Slowmode Failed", description: err.message, tone: "danger" }, true));
    }
  },

  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply(noticePayload({ title: "Permission Denied", description: "You need `Manage Channels` permission.", tone: "danger" }));
    }

    const seconds = parseInt(args[0], 10);
    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      return message.reply(noticePayload({ title: "Usage", description: "`-slowmode <0-21600>` (in seconds)\nExample: `-slowmode 10` or `-slowmode 0`", tone: "warning" }));
    }

    try {
      await message.channel.setRateLimitPerUser(seconds, `Slowmode set by ${message.author.tag}`);
      const stateText = seconds === 0 ? "Disabled" : `${seconds}s`;
      const card = container(COLORS.success)
        .addTextDisplayComponents(text(`## ⏱️ Slowmode Updated\n-# Set by ${message.author.tag}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`• **Channel:** <#${message.channel.id}>\n• **Rate Limit:** \`${stateText}\``));
      return message.reply({ components: [card], flags: flags(false) });
    } catch (err) {
      return message.reply(noticePayload({ title: "Slowmode Failed", description: err.message, tone: "danger" }));
    }
  }
};
