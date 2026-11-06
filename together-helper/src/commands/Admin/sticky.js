const {
  ApplicationCommandOptionType,
  PermissionsBitField
} = require("discord.js");
const { StickyMessage } = require("../../schema");
const config = require("../../config");
const {
  container,
  separator,
  text,
  flags,
  noticePayload,
  COLORS
} = require("../../utils/ui");

module.exports = {
  name: "sticky",
  description: "Create or remove an automatically sticking message in a channel",
  userPerms: ["ManageMessages"],
  slashOptions: [
    {
      name: "action",
      type: ApplicationCommandOptionType.String,
      description: "Action to perform",
      required: true,
      choices: [
        { name: "set - Pin a message that stays at the bottom", value: "set" },
        { name: "remove - Stop sticking message in this channel", value: "remove" }
      ]
    },
    {
      name: "message",
      type: ApplicationCommandOptionType.String,
      description: "The text to stick at the bottom of the channel (required for set)",
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages) && !config.ownerIds.includes(interaction.user.id)) {
      return interaction.reply(
        noticePayload({
          title: "Permission Denied",
          description: "You need `Manage Messages` permissions to manage sticky messages.",
          emoji: "🚫",
          tone: "danger"
        }, true)
      );
    }

    const action = interaction.options.getString("action");
    const content = interaction.options.getString("message");

    if (action === "set") {
      if (!content) {
        return interaction.reply(
          noticePayload({
            title: "Missing Content",
            description: "Please specify the message text you wish to stick to the bottom.",
            emoji: "⚠️",
            tone: "warning"
          }, true)
        );
      }

      await interaction.deferReply({ ephemeral: true });

      const stickyCard = container(COLORS.brand)
        .addTextDisplayComponents(text("### 📌 Channel Notice & Guidelines"))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(content))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text("*This notice dynamically stays anchored to the bottom of the channel.*"));

      const sentMsg = await interaction.channel.send({
        components: [stickyCard],
        flags: flags(false)
      });

      await StickyMessage.findOneAndUpdate(
        { channelId: interaction.channel.id },
        {
          guildId: interaction.guild.id,
          message: content,
          lastMessageId: sentMsg.id,
          enabled: true
        },
        { upsert: true, new: true }
      );

      return interaction.editReply(
        noticePayload({
          title: "Sticky Notice Anchored",
          description: "Sticky configured. It will seamlessly reposition as members chat.",
          emoji: "✅",
          tone: "success"
        }, true)
      );
    }

    if (action === "remove") {
      const existing = await StickyMessage.findOne({ channelId: interaction.channel.id });
      if (!existing) {
        return interaction.reply(
          noticePayload({
            title: "No Sticky Notice",
            description: "There is no active sticky notice in this channel.",
            emoji: "ℹ️",
            tone: "neutral"
          }, true)
        );
      }

      if (existing.lastMessageId) {
        try {
          const oldMsg = await interaction.channel.messages.fetch(existing.lastMessageId);
          await oldMsg.delete();
        } catch {}
      }

      await StickyMessage.findOneAndDelete({ channelId: interaction.channel.id });

      return interaction.reply(
        noticePayload({
          title: "Sticky Notice Removed",
          description: "The sticky notice has been removed from this channel.",
          emoji: "🗑️",
          tone: "info"
        }, true)
      );
    }
  }
};
