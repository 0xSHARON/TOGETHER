const {
  ApplicationCommandOptionType,
  PermissionsBitField
} = require("discord.js");
const { SuggestionConfig, BugReportConfig } = require("../../schema");
const config = require("../../config");
const { noticePayload } = require("../../utils/ui");

module.exports = {
  name: "setchannel",
  description: "Configure destination channels for suggestions and bug reports",
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
          description: `Suggestions channel set to ${channel.toString()}! Users can now submit ideas via \`/suggest\`.`,
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
          description: `Bug reports channel set to ${channel.toString()}! Members can now report issues via \`/bugreport\`.`,
          emoji: "🐛",
          tone: "success"
        }, false)
      );
    }
  }
};
