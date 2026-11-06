const {
  ApplicationCommandOptionType,
  PermissionsBitField
} = require("discord.js");
const { SuggestionConfig, BugReportConfig } = require("../../schema");
const config = require("../../config");
const { container, flags, noticePayload, separator, text, COLORS } = require("../../utils/ui");

module.exports = {
  name: "setchannel",
  description: "Configure destination channels for suggestions and bug reports",
  category: "Admin",
  userPerms: ["ManageGuild"],
  slashOptions: [
    {
      name: "type",
      type: ApplicationCommandOptionType.String,
      description: "Type of channel to configure",
      required: true,
      choices: [
        { name: "suggestions - Destination for /suggest", value: "suggestions" },
        { name: "bugreports - Destination for /bugreport", value: "bugreports" }
      ]
    },
    {
      name: "channel",
      type: ApplicationCommandOptionType.Channel,
      description: "Target text channel",
      required: true
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !config.ownerIds.includes(interaction.user.id)) {
      return interaction.reply(
        noticePayload({
          title: "Permission Denied",
          description: "You need `Manage Server` permissions to configure helper channels.",
          emoji: "🚫",
          tone: "danger"
        }, true)
      );
    }

    const type = interaction.options.getString("type");
    const channel = interaction.options.getChannel("channel");

    if (type === "suggestions") {
      await SuggestionConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { channelId: channel.id, enabled: true },
        { upsert: true, new: true }
      );
      return interaction.reply(
        noticePayload({
          title: "Suggestions Channel Configured",
          description: `Suggestions channel updated to <#${channel.id}>. Members can now submit ideas using \`/suggest\` or \`-suggest\`.`,
          emoji: "💡",
          tone: "success"
        }, false)
      );
    }

    if (type === "bugreports") {
      await BugReportConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { channelId: channel.id, enabled: true },
        { upsert: true, new: true }
      );
      return interaction.reply(
        noticePayload({
          title: "Bug Reports Channel Configured",
          description: `Bug reports channel updated to <#${channel.id}>. Members can now report issues using \`/bugreport\` or \`-bugreport\`.`,
          emoji: "🐛",
          tone: "success"
        }, false)
      );
    }
  },

  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !config.ownerIds.includes(message.author.id)) {
      return message.reply(
        noticePayload({
          title: "Permission Denied",
          description: "You need `Manage Server` permissions to configure helper channels.",
          emoji: "🚫",
          tone: "danger"
        }, false)
      );
    }

    const type = args[0]?.toLowerCase();
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);

    if (!type || !["suggestions", "bugreports"].includes(type) || !channel) {
      return message.reply(
        noticePayload({
          title: "Invalid Usage",
          description: "Usage: `-setchannel <suggestions|bugreports> #channel`",
          emoji: "⚠️",
          tone: "warning"
        }, false)
      );
    }

    if (type === "suggestions") {
      await SuggestionConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { channelId: channel.id, enabled: true },
        { upsert: true, new: true }
      );
      return message.reply(
        noticePayload({
          title: "Suggestions Channel Configured",
          description: `Suggestions channel updated to <#${channel.id}>. Members can now submit ideas using \`/suggest\` or \`-suggest\`.`,
          emoji: "💡",
          tone: "success"
        }, false)
      );
    }

    if (type === "bugreports") {
      await BugReportConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { channelId: channel.id, enabled: true },
        { upsert: true, new: true }
      );
      return message.reply(
        noticePayload({
          title: "Bug Reports Channel Configured",
          description: `Bug reports channel updated to <#${channel.id}>. Members can now report issues using \`/bugreport\` or \`-bugreport\`.`,
          emoji: "🐛",
          tone: "success"
        }, false)
      );
    }
  }
};
