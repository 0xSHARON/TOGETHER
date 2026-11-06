const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");
const { dispatchLogThread } = require("../../utils/webhooks");

module.exports = {
  name: "untimeout",
  aliases: ["unmute"],
  description: "Remove timeout from a member",
  category: "Moderation",
  userPerms: ["ModerateMembers"],
  slashOptions: [
    {
      name: "user",
      description: "The member to remove timeout from",
      type: ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: "reason",
      description: "Reason for removing timeout",
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply(noticePayload({ title: "Permission Denied", description: "You need `Moderate Members` permission.", tone: "danger" }, true));
    }

    const targetUser = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason specified.";
    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!member) {
      return interaction.reply(noticePayload({ title: "Member Not Found", description: "User is not in this server.", tone: "warning" }, true));
    }

    if (!member.isCommunicationDisabled()) {
      return interaction.reply(noticePayload({ title: "Not Timed Out", description: "This member does not have an active timeout.", tone: "info" }, true));
    }

    try {
      await member.timeout(null, `${reason} | By: ${interaction.user.tag}`);
      const card = container(COLORS.success)
        .addTextDisplayComponents(text(`## 🔊 Timeout Removed\n-# Action performed by ${interaction.user.tag}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`• **Target:** ${member.user.tag} (${member.id})\n• **Reason:** ${reason}`));

      return interaction.reply({ components: [card], flags: flags(false) });
    } catch (err) {
      return interaction.reply(noticePayload({ title: "Action Failed", description: err.message, tone: "danger" }, true));
    }
  },

  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply(noticePayload({ title: "Permission Denied", description: "You need `Moderate Members` permission.", tone: "danger" }));
    }

    const targetUser = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null);
    if (!targetUser) {
      return message.reply(noticePayload({ title: "Usage", description: "`-untimeout <@user/id> [reason]`", tone: "warning" }));
    }

    const member = await message.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) return message.reply(noticePayload({ title: "Member Not Found", description: "User is not in this server.", tone: "warning" }));

    if (!member.isCommunicationDisabled()) {
      return message.reply(noticePayload({ title: "Not Timed Out", description: "This member is not timed out.", tone: "info" }));
    }

    const reason = args.slice(1).join(" ") || "No reason specified.";
    try {
      await member.timeout(null, `${reason} | By: ${message.author.tag}`);
      const card = container(COLORS.success)
        .addTextDisplayComponents(text(`## 🔊 Timeout Removed\n-# Action performed by ${message.author.tag}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`• **Target:** ${member.user.tag} (${member.id})\n• **Reason:** ${reason}`));
      return message.reply({ components: [card], flags: flags(false) });
    } catch (err) {
      return message.reply(noticePayload({ title: "Action Failed", description: err.message, tone: "danger" }));
    }
  }
};
