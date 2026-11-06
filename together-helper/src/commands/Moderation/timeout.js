const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const ms = require("ms");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");
const { dispatchLogThread } = require("../../utils/webhooks");
const emoji = require("../../emojis");

module.exports = {
  name: "timeout",
  aliases: ["mute"],
  description: "Timeout a member to restrict them from sending messages or speaking",
  category: "Moderation",
  userPerms: ["ModerateMembers"],
  slashOptions: [
    {
      name: "user",
      description: "The member to timeout",
      type: ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: "duration",
      description: "Duration of the timeout (e.g., 5m, 1h, 1d)",
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: "reason",
      description: "Reason for the timeout",
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply(noticePayload({ title: "Permission Denied", description: "You need `Moderate Members` permission to use this.", tone: "danger" }, true));
    }

    const targetUser = interaction.options.getUser("user");
    const durationInput = interaction.options.getString("duration");
    const reason = interaction.options.getString("reason") || "No reason specified.";

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      return interaction.reply(noticePayload({ title: "Member Not Found", description: "That user is not in this server.", tone: "warning" }, true));
    }

    if (!member.moderatable) {
      return interaction.reply(noticePayload({ title: "Cannot Moderate", description: "I cannot timeout this member (their role might be higher than mine).", tone: "danger" }, true));
    }

    const parsedMs = ms(durationInput);
    if (!parsedMs || parsedMs < 5000 || parsedMs > 28 * 24 * 60 * 60 * 1000) {
      return interaction.reply(noticePayload({ title: "Invalid Duration", description: "Please enter a valid duration between `5s` and `28d` (e.g. `10m`, `2h`, `1d`).", tone: "warning" }, true));
    }

    try {
      await member.timeout(parsedMs, `${reason} | By: ${interaction.user.tag}`);

      const successCard = container(COLORS.success)
        .addTextDisplayComponents(text(`## ⏳ Member Timed Out\n-# Action performed by ${interaction.user.tag}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(
          text(
            `• **Target:** ${member.user.tag} (${member.id})\n` +
            `• **Duration:** \`${durationInput}\`\n` +
            `• **Reason:** ${reason}`
          )
        );

      await interaction.reply({ components: [successCard], flags: flags(false) });

      // Dispatch to audit log
      const auditEmbed = new EmbedBuilder()
        .setColor("#F0B232")
        .setTitle("⏳ Member Timed Out")
        .setDescription(`• **Target:** ${member.user.tag} (\`${member.id}\`)\n• **Moderator:** ${interaction.user.tag}\n• **Duration:** \`${durationInput}\`\n• **Reason:** ${reason}`)
        .setTimestamp();
      dispatchLogThread(client, "ticket", auditEmbed);
    } catch (err) {
      return interaction.reply(noticePayload({ title: "Timeout Failed", description: err.message, tone: "danger" }, true));
    }
  },

  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply(noticePayload({ title: "Permission Denied", description: "You need `Moderate Members` permission to use this.", tone: "danger" }));
    }

    const targetUser = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null);
    if (!targetUser) {
      return message.reply(noticePayload({ title: "Usage", description: "`-timeout <@user/id> <duration> [reason]`\nExample: `-timeout @user 10m Spamming`", tone: "warning" }));
    }

    const durationInput = args[1];
    if (!durationInput) {
      return message.reply(noticePayload({ title: "Missing Duration", description: "Please specify a duration (e.g., `10m`, `1h`, `1d`).", tone: "warning" }));
    }

    const parsedMs = ms(durationInput);
    if (!parsedMs || parsedMs < 5000 || parsedMs > 28 * 24 * 60 * 60 * 1000) {
      return message.reply(noticePayload({ title: "Invalid Duration", description: "Duration must be between `5s` and `28d`.", tone: "warning" }));
    }

    const reason = args.slice(2).join(" ") || "No reason specified.";
    const member = await message.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) return message.reply(noticePayload({ title: "Member Not Found", description: "User is not in this server.", tone: "warning" }));

    if (!member.moderatable) {
      return message.reply(noticePayload({ title: "Cannot Moderate", description: "I cannot timeout this member (higher role).", tone: "danger" }));
    }

    try {
      await member.timeout(parsedMs, `${reason} | By: ${message.author.tag}`);
      const successCard = container(COLORS.success)
        .addTextDisplayComponents(text(`## ⏳ Member Timed Out\n-# Action performed by ${message.author.tag}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(
          text(
            `• **Target:** ${member.user.tag} (${member.id})\n` +
            `• **Duration:** \`${durationInput}\`\n` +
            `• **Reason:** ${reason}`
          )
        );
      return message.reply({ components: [successCard], flags: flags(false) });
    } catch (err) {
      return message.reply(noticePayload({ title: "Timeout Failed", description: err.message, tone: "danger" }));
    }
  }
};

