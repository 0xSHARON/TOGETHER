const {
  ApplicationCommandOptionType,
  PermissionsBitField,
} = require("discord.js");
const { StickyMessage } = require("../../schema");
const config = require("../../config");
const { container, flags, noticePayload, separator, text } = require("../../utils/ui");
const emoji = require("../../emojis");

module.exports = {
  name: "sticky",
  description: "Create or remove an automatically sticking message in a channel",
  category: "Admin",
  userPerms: ["ManageMessages"],
  slashOptions: [
    {
      name: "action",
      type: ApplicationCommandOptionType.String,
      description: "Action to perform",
      required: true,
      choices: [
        { name: "set - Pin a message that stays at the bottom", value: "set" },
        { name: "remove - Stop sticking message in this channel", value: "remove" },
      ],
    },
    {
      name: "message",
      type: ApplicationCommandOptionType.String,
      description: "The text to stick at the bottom of the channel (required for set)",
      required: false,
    },
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages) && !config.ownerIds.includes(interaction.user.id)) {
      return interaction.reply(
        noticePayload({
          title: "Permission Denied",
          description: "You need `Manage Messages` permissions to manage sticky messages.",
          emoji: emoji.cross,
          tone: "danger",
        }, true),
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
            emoji: emoji.warn,
            tone: "warning",
          }, true),
        );
      }

      await interaction.deferReply({ ephemeral: true });

      const stickyCard = container()
        .addTextDisplayComponents(text(`## ${emoji.warn} Channel Guidelines & Notice\n-# Important Information`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(content))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`-# Dynamic notice · Automatically stays anchored to the bottom`));

      const sentMsg = await interaction.channel.send({
        components: [stickyCard],
        flags: flags(false),
      });

      await StickyMessage.findOneAndUpdate(
        { channelId: interaction.channel.id },
        {
          guildId: interaction.guild.id,
          message: content,
          lastMessageId: sentMsg.id,
          enabled: true,
        },
        { upsert: true, new: true },
      );

      return interaction.editReply(
        noticePayload({
          title: "Sticky Notice Anchored",
          description: "Sticky configured. It will seamlessly reposition as members chat.",
          emoji: emoji.check,
          tone: "success",
        }, true),
      );
    }

    if (action === "remove") {
      const existing = await StickyMessage.findOne({ channelId: interaction.channel.id });
      if (!existing) {
        return interaction.reply(
          noticePayload({
            title: "No Sticky Notice",
            description: "There is no active sticky notice in this channel.",
            emoji: emoji.info,
            tone: "neutral",
          }, true),
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
          emoji: emoji.check,
          tone: "info",
        }, true),
      );
    }
  },

  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages) && !config.ownerIds.includes(message.author.id)) {
      return message.reply(
        noticePayload({
          title: "Permission Denied",
          description: "You need `Manage Messages` permissions to manage sticky messages.",
          emoji: emoji.cross,
          tone: "danger",
        }, false),
      );
    }

    const action = args[0]?.toLowerCase();
    const content = args.slice(1).join(" ");

    if (action === "set") {
      if (!content) {
        return message.reply(
          noticePayload({
            title: "Missing Content",
            description: "Usage: `-sticky set <message content>`",
            emoji: emoji.warn,
            tone: "warning",
          }, false),
        );
      }

      const stickyCard = container()
        .addTextDisplayComponents(text(`## ${emoji.warn} Channel Guidelines & Notice\n-# Important Information`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(content))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`-# Dynamic notice · Automatically stays anchored to the bottom`));

      const sentMsg = await message.channel.send({
        components: [stickyCard],
        flags: flags(false),
      });

      await StickyMessage.findOneAndUpdate(
        { channelId: message.channel.id },
        {
          guildId: message.guild.id,
          message: content,
          lastMessageId: sentMsg.id,
          enabled: true,
        },
        { upsert: true, new: true },
      );

      return message.reply(
        noticePayload({
          title: "Sticky Notice Anchored",
          description: "Sticky configured. It will seamlessly reposition as members chat.",
          emoji: emoji.check,
          tone: "success",
        }, false),
      );
    }

    if (action === "remove") {
      const existing = await StickyMessage.findOne({ channelId: message.channel.id });
      if (!existing) {
        return message.reply(
          noticePayload({
            title: "No Sticky Notice",
            description: "There is no active sticky notice in this channel.",
            emoji: emoji.info,
            tone: "neutral",
          }, false),
        );
      }

      if (existing.lastMessageId) {
        try {
          const oldMsg = await message.channel.messages.fetch(existing.lastMessageId);
          await oldMsg.delete();
        } catch {}
      }

      await StickyMessage.findOneAndDelete({ channelId: message.channel.id });

      return message.reply(
        noticePayload({
          title: "Sticky Notice Removed",
          description: "The sticky notice has been removed from this channel.",
          emoji: emoji.check,
          tone: "info",
        }, false),
      );
    }

    return message.reply(
      noticePayload({
        title: "Sticky Command Usage",
        description: "• `-sticky set <message>` — Anchor a message to the bottom\n• `-sticky remove` — Remove sticky from this channel",
        emoji: emoji.info,
        tone: "info",
      }, false),
    );
  },
};
