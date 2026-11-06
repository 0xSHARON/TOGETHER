const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");
const { dispatchLogThread } = require("../../utils/webhooks");

module.exports = {
  name: "unban",
  description: "Unban a user from the server using their user ID",
  category: "Moderation",
  userPerms: ["BanMembers"],
  slashOptions: [
    {
      name: "user_id",
      description: "The user ID to unban",
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: "reason",
      description: "Reason for unbanning",
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply(noticePayload({ title: "Permission Denied", description: "You need `Ban Members` permission.", tone: "danger" }, true));
    }

    const userId = interaction.options.getString("user_id").trim();
    const reason = interaction.options.getString("reason") || "No reason specified.";

    try {
      const ban = await interaction.guild.bans.fetch(userId).catch(() => null);
      if (!ban) {
        return interaction.reply(noticePayload({ title: "Not Banned", description: `User ID \`${userId}\` is not banned on this server.`, tone: "info" }, true));
      }

      await interaction.guild.bans.remove(userId, `${reason} | By: ${interaction.user.tag}`);

      const card = container(COLORS.success)
        .addTextDisplayComponents(text(`## 🔓 User Unbanned\n-# Action performed by ${interaction.user.tag}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`• **User:** ${ban.user.tag} (\`${ban.user.id}\`)\n• **Reason:** ${reason}`));

      return interaction.reply({ components: [card], flags: flags(false) });
    } catch (err) {
      return interaction.reply(noticePayload({ title: "Unban Failed", description: err.message, tone: "danger" }, true));
    }
  },

  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply(noticePayload({ title: "Permission Denied", description: "You need `Ban Members` permission.", tone: "danger" }));
    }

    const userId = args[0]?.replace(/[<@!>]/g, "");
    if (!userId) {
      return message.reply(noticePayload({ title: "Usage", description: "`-unban <user_id> [reason]`", tone: "warning" }));
    }

    const reason = args.slice(1).join(" ") || "No reason specified.";
    try {
      const ban = await message.guild.bans.fetch(userId).catch(() => null);
      if (!ban) {
        return message.reply(noticePayload({ title: "Not Banned", description: `User ID \`${userId}\` is not banned.`, tone: "info" }));
      }

      await message.guild.bans.remove(userId, `${reason} | By: ${message.author.tag}`);
      const card = container(COLORS.success)
        .addTextDisplayComponents(text(`## 🔓 User Unbanned\n-# Action performed by ${message.author.tag}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`• **User:** ${ban.user.tag} (\`${ban.user.id}\`)\n• **Reason:** ${reason}`));
      return message.reply({ components: [card], flags: flags(false) });
    } catch (err) {
      return message.reply(noticePayload({ title: "Unban Failed", description: err.message, tone: "danger" }));
    }
  }
};
