const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");
const { dispatchLogThread } = require("../../utils/webhooks");

module.exports = {
  name: "kick",
  description: "Kick a member from the server",
  category: "Moderation",
  userPerms: ["KickMembers"],
  slashOptions: [
    {
      name: "user",
      description: "The member to kick",
      type: ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: "reason",
      description: "Reason for the kick",
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply(noticePayload({ title: "Permission Denied", description: "You need `Kick Members` permission.", tone: "danger" }, true));
    }

    const targetUser = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason specified.";
    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!member) {
      return interaction.reply(noticePayload({ title: "Member Not Found", description: "User is not in this server.", tone: "warning" }, true));
    }

    if (!member.kickable) {
      return interaction.reply(noticePayload({ title: "Cannot Kick", description: "I do not have permission to kick this member.", tone: "danger" }, true));
    }

    try {
      await targetUser.send(`You have been kicked from **${interaction.guild.name}**\n• **Reason:** ${reason}\n• **Moderator:** ${interaction.user.tag}`).catch(() => {});
      await member.kick(`${reason} | By: ${interaction.user.tag}`);

      const card = container(COLORS.success)
        .addTextDisplayComponents(text(`## 🚪 Member Kicked\n-# Action performed by ${interaction.user.tag}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`• **User:** ${targetUser.tag} (\`${targetUser.id}\`)\n• **Reason:** ${reason}`));

      await interaction.reply({ components: [card], flags: flags(false) });

      const auditEmbed = new EmbedBuilder()
        .setColor("#FF7043")
        .setTitle("🚪 Member Kicked")
        .setDescription(`• **Target:** ${targetUser.tag} (\`${targetUser.id}\`)\n• **Moderator:** ${interaction.user.tag}\n• **Reason:** ${reason}`)
        .setTimestamp();
      dispatchLogThread(client, "ticket", auditEmbed);
    } catch (err) {
      return interaction.reply(noticePayload({ title: "Kick Failed", description: err.message, tone: "danger" }, true));
    }
  },

  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply(noticePayload({ title: "Permission Denied", description: "You need `Kick Members` permission.", tone: "danger" }));
    }

    const targetUser = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null);
    if (!targetUser) {
      return message.reply(noticePayload({ title: "Usage", description: "`-kick <@user/id> [reason]`", tone: "warning" }));
    }

    const member = await message.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) return message.reply(noticePayload({ title: "Member Not Found", description: "User is not in this server.", tone: "warning" }));

    if (!member.kickable) {
      return message.reply(noticePayload({ title: "Cannot Kick", description: "I do not have permission to kick this member.", tone: "danger" }));
    }

    const reason = args.slice(1).join(" ") || "No reason specified.";
    try {
      await targetUser.send(`You have been kicked from **${message.guild.name}**\n• **Reason:** ${reason}\n• **Moderator:** ${message.author.tag}`).catch(() => {});
      await member.kick(`${reason} | By: ${message.author.tag}`);
      const card = container(COLORS.success)
        .addTextDisplayComponents(text(`## 🚪 Member Kicked\n-# Action performed by ${message.author.tag}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`• **User:** ${targetUser.tag} (\`${targetUser.id}\`)\n• **Reason:** ${reason}`));
      return message.reply({ components: [card], flags: flags(false) });
    } catch (err) {
      return message.reply(noticePayload({ title: "Kick Failed", description: err.message, tone: "danger" }));
    }
  }
};

