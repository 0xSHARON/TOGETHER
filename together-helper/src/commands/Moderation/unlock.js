const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");

module.exports = {
  name: "unlock",
  description: "Unlock a previously locked channel",
  category: "Moderation",
  userPerms: ["ManageChannels"],
  slashOptions: [
    {
      name: "channel",
      description: "The channel to unlock (defaults to current channel)",
      type: ApplicationCommandOptionType.Channel,
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply(noticePayload({ title: "Permission Denied", description: "You need `Manage Channels` permission.", tone: "danger" }, true));
    }

    const channel = interaction.options.getChannel("channel") || interaction.channel;

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: null,
        AddReactions: null
      }, { reason: `Channel unlocked by ${interaction.user.tag}` });

      const card = container(COLORS.success)
        .addTextDisplayComponents(text(`## 🔓 Channel Unlocked\n-# Unlocked by ${interaction.user.tag}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`• **Channel:** <#${channel.id}>\n• **Status:** \`Unlocked (Default permissions restored)\``));

      return interaction.reply({ components: [card], flags: flags(false) });
    } catch (err) {
      return interaction.reply(noticePayload({ title: "Unlock Failed", description: err.message, tone: "danger" }, true));
    }
  },

  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply(noticePayload({ title: "Permission Denied", description: "You need `Manage Channels` permission.", tone: "danger" }));
    }

    const channel = message.mentions.channels.first() || message.channel;

    try {
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: null,
        AddReactions: null
      }, { reason: `Channel unlocked by ${message.author.tag}` });

      const card = container(COLORS.success)
        .addTextDisplayComponents(text(`## 🔓 Channel Unlocked\n-# Unlocked by ${message.author.tag}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`• **Channel:** <#${channel.id}>\n• **Status:** \`Unlocked\``));

      return message.reply({ components: [card], flags: flags(false) });
    } catch (err) {
      return message.reply(noticePayload({ title: "Unlock Failed", description: err.message, tone: "danger" }));
    }
  }
};

