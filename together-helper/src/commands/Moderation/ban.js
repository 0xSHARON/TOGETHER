const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");
const { dispatchLogThread } = require("../../utils/webhooks");

module.exports = {
  name: "ban",
  description: "Ban a user from the server",
  category: "Moderation",
  userPerms: ["BanMembers"],
  slashOptions: [
    {
      name: "user",
      description: "The user to ban",
      type: ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: "reason",
      description: "Reason for the ban",
      type: ApplicationCommandOptionType.String,
      required: false
    },
    {
      name: "delete_days",
      description: "Days of messages to delete (0 to 7)",
      type: ApplicationCommandOptionType.Integer,
      required: false,
      min_value: 0,
      max_value: 7
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply(noticePayload({ title: "Permission Denied", description: "You need `Ban Members` permission.", tone: "danger" }, true));
    }

    const targetUser = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason specified.";
    const deleteDays = interaction.options.getInteger("delete_days") || 0;

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (member && !member.bannable) {
      return interaction.reply(noticePayload({ title: "Cannot Ban", description: "I do not have permission to ban this member.", tone: "danger" }, true));
    }

    try {
      await targetUser.send(`You have been banned from **${interaction.guild.name}**\n• **Reason:** ${reason}\n• **Moderator:** ${interaction.user.tag}`).catch(() => {});
      await interaction.guild.bans.create(targetUser.id, {
        deleteMessageSeconds: deleteDays * 24 * 60 * 60,
        reason: `${reason} | By: ${interaction.user.tag}`
      });

      const card = container(COLORS.danger)
        .addTextDisplayComponents(text(`## 🔨 User Banned\n-# Action performed by ${interaction.user.tag}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(
          text(
            `• **User:** ${targetUser.tag} (\`${targetUser.id}\`)\n` +
            `• **Messages Deleted:** ${deleteDays} day(s)\n` +
            `• **Reason:** ${reason}`
          )
        );

      await interaction.reply({ components: [card], flags: flags(false) });

      const auditEmbed = new EmbedBuilder()
        .setColor("#ED4245")
        .setTitle("🔨 Member Banned")
        .setDescription(`• **Target:** ${targetUser.tag} (\`${targetUser.id}\`)\n• **Moderator:** ${interaction.user.tag}\n• **Reason:** ${reason}`)
        .setTimestamp();
      dispatchLogThread(client, "ticket", auditEmbed);
    } catch (err) {
      return interaction.reply(noticePayload({ title: "Ban Failed", description: err.message, tone: "danger" }, true));
    }
  },

  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply(noticePayload({ title: "Permission Denied", description: "You need `Ban Members` permission.", tone: "danger" }));
    }

    const targetUser = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null);
    if (!targetUser) {
      return message.reply(noticePayload({ title: "Usage", description: "`-ban <@user/id> [reason]`", tone: "warning" }));
    }

    const member = await message.guild.members.fetch(targetUser.id).catch(() => null);
    if (member && !member.bannable) {
      return message.reply(noticePayload({ title: "Cannot Ban", description: "I do not have permission to ban this member.", tone: "danger" }));
    }

    const reason = args.slice(1).join(" ") || "No reason specified.";
    try {
      await targetUser.send(`You have been banned from **${message.guild.name}**\n• **Reason:** ${reason}\n• **Moderator:** ${message.author.tag}`).catch(() => {});
      await message.guild.bans.create(targetUser.id, { reason: `${reason} | By: ${message.author.tag}` });
      const card = container(COLORS.danger)
        .addTextDisplayComponents(text(`## 🔨 User Banned\n-# Action performed by ${message.author.tag}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`• **User:** ${targetUser.tag} (\`${targetUser.id}\`)\n• **Reason:** ${reason}`));
      return message.reply({ components: [card], flags: flags(false) });
    } catch (err) {
      return message.reply(noticePayload({ title: "Ban Failed", description: err.message, tone: "danger" }));
    }
  }
};
