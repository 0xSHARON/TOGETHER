const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { Warn } = require("../../schema");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");
const { dispatchLogThread } = require("../../utils/webhooks");

function generateWarnId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = {
  name: "warn",
  description: "Issue a formal moderation warning to a member",
  category: "Moderation",
  userPerms: ["ModerateMembers"],
  slashOptions: [
    {
      name: "user",
      description: "The member to warn",
      type: ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: "reason",
      description: "Reason for the warning",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply(noticePayload({ title: "Permission Denied", description: "You need `Moderate Members` permission.", tone: "danger" }, true));
    }

    const targetUser = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    const warnId = generateWarnId();

    await Warn.create({
      guildId: interaction.guild.id,
      userId: targetUser.id,
      moderatorId: interaction.user.id,
      reason,
      warnId
    });

    const totalWarns = await Warn.countDocuments({ guildId: interaction.guild.id, userId: targetUser.id });

    await targetUser.send(
      `⚠️ You received a formal warning in **${interaction.guild.name}**\n• **Reason:** ${reason}\n• **Warn ID:** \`${warnId}\`\n• **Active Warnings:** ${totalWarns}`
    ).catch(() => {});

    const card = container(COLORS.warning)
      .addTextDisplayComponents(text(`## ⚠️ Member Warned\n-# Case Reference: \`#${warnId}\``))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `• **Member:** ${targetUser.tag} (\`${targetUser.id}\`)\n` +
          `• **Moderator:** ${interaction.user.tag}\n` +
          `• **Reason:** ${reason}\n` +
          `• **Total Warnings:** **${totalWarns}**`
        )
      );

    await interaction.reply({ components: [card], flags: flags(false) });

    const auditEmbed = new EmbedBuilder()
      .setColor("#F0B232")
      .setTitle(`⚠️ Warning Issued (#${warnId})`)
      .setDescription(`• **Target:** ${targetUser.tag} (\`${targetUser.id}\`)\n• **Moderator:** ${interaction.user.tag}\n• **Reason:** ${reason}\n• **Total Strikes:** ${totalWarns}`)
      .setTimestamp();
    dispatchLogThread(client, "ticket", auditEmbed);
  },

  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply(noticePayload({ title: "Permission Denied", description: "You need `Moderate Members` permission.", tone: "danger" }));
    }

    const targetUser = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null);
    if (!targetUser) {
      return message.reply(noticePayload({ title: "Usage", description: "`-warn <@user/id> <reason>`", tone: "warning" }));
    }

    const reason = args.slice(1).join(" ");
    if (!reason) {
      return message.reply(noticePayload({ title: "Missing Reason", description: "Please provide a reason for the warning.", tone: "warning" }));
    }

    const warnId = generateWarnId();

    await Warn.create({
      guildId: message.guild.id,
      userId: targetUser.id,
      moderatorId: message.author.id,
      reason,
      warnId
    });

    const totalWarns = await Warn.countDocuments({ guildId: message.guild.id, userId: targetUser.id });

    await targetUser.send(
      `⚠️ You received a formal warning in **${message.guild.name}**\n• **Reason:** ${reason}\n• **Warn ID:** \`${warnId}\`\n• **Active Warnings:** ${totalWarns}`
    ).catch(() => {});

    const card = container(COLORS.warning)
      .addTextDisplayComponents(text(`## ⚠️ Member Warned\n-# Case Reference: \`#${warnId}\``))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `• **Member:** ${targetUser.tag} (\`${targetUser.id}\`)\n` +
          `• **Moderator:** ${message.author.tag}\n` +
          `• **Reason:** ${reason}\n` +
          `• **Total Warnings:** **${totalWarns}**`
        )
      );

    return message.reply({ components: [card], flags: flags(false) });
  }
};

