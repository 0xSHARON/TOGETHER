const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");

module.exports = {
  name: "lock",
  description: "Lock down a channel to prevent @everyone from sending messages",
  category: "Moderation",
  userPerms: ["ManageChannels"],
  slashOptions: [
    {
      name: "channel",
      description: "The channel to lock (defaults to current channel)",
      type: ApplicationCommandOptionType.Channel,
      required: false
    },
    {
      name: "reason",
      description: "Reason for locking down the channel",
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply(noticePayload({ title: "Permission Denied", description: "You need `Manage Channels` permission.", tone: "danger" }, true));
    }

    const channel = interaction.options.getChannel("channel") || interaction.channel;
    const reason = interaction.options.getString("reason") || "Channel lockdown initiated.";

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false,
        AddReactions: false
      }, { reason: `${reason} | By: ${interaction.user.tag}` });

      const card = container(COLORS.danger)
        .addTextDisplayComponents(text(`## 🔒 Channel Locked\n-# Lockdown by ${interaction.user.tag}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(
          text(`• **Channel:** <#${channel.id}>\n• **Status:** \`Locked (@everyone SendMessages: Off)\`\n• **Reason:** ${reason}`)
        );

      return interaction.reply({ components: [card], flags: flags(false) });
    } catch (err) {
      return interaction.reply(noticePayload({ title: "Lock Failed", description: err.message, tone: "danger" }, true));
    }
  },

  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply(noticePayload({ title: "Permission Denied", description: "You need `Manage Channels` permission.", tone: "danger" }));
    }

    const channel = message.mentions.channels.first() || message.channel;
    const reason = args.join(" ") || "Channel lockdown initiated.";

    try {
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false,
        AddReactions: false
      }, { reason: `${reason} | By: ${message.author.tag}` });

      const card = container(COLORS.danger)
        .addTextDisplayComponents(text(`## 🔒 Channel Locked\n-# Lockdown by ${message.author.tag}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(
          text(`• **Channel:** <#${channel.id}>\n• **Status:** \`Locked\`\n• **Reason:** ${reason}`)
        );

      return message.reply({ components: [card], flags: flags(false) });
    } catch (err) {
      return message.reply(noticePayload({ title: "Lock Failed", description: err.message, tone: "danger" }));
    }
  }
};

