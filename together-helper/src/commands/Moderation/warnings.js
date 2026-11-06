const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const { Warn } = require("../../schema");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");

module.exports = {
  name: "warnings",
  aliases: ["warns", "strikes"],
  description: "View warning history and infractions for a member",
  category: "Moderation",
  userPerms: ["ModerateMembers"],
  slashOptions: [
    {
      name: "user",
      description: "The member to check warnings for",
      type: ApplicationCommandOptionType.User,
      required: true
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply(noticePayload({ title: "Permission Denied", description: "You need `Moderate Members` permission.", tone: "danger" }, true));
    }

    const targetUser = interaction.options.getUser("user");
    const warns = await Warn.find({ guildId: interaction.guild.id, userId: targetUser.id }).sort({ createdAt: -1 });

    if (!warns.length) {
      return interaction.reply(noticePayload({ title: "Clean Record", description: `**${targetUser.tag}** has no active warnings.`, tone: "success" }, true));
    }

    const warnList = warns.slice(0, 10).map((w, i) => {
      const date = `<t:${Math.round(w.createdAt.getTime() / 1000)}:R>`;
      return `**#${w.warnId}** · ${w.reason} (${date}) - <@${w.moderatorId}>`;
    }).join("\n");

    const card = container(COLORS.warning)
      .addTextDisplayComponents(text(`## 📋 Infraction History\n-# Showing ${warns.length} warning(s) for ${targetUser.tag}`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(warnList))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`-# Use \`/clearwarns user: @${targetUser.username}\` to reset records.`));

    return interaction.reply({ components: [card], flags: flags(false) });
  },

  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply(noticePayload({ title: "Permission Denied", description: "You need `Moderate Members` permission.", tone: "danger" }));
    }

    const targetUser = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null);
    if (!targetUser) {
      return message.reply(noticePayload({ title: "Usage", description: "`-warnings <@user/id>`", tone: "warning" }));
    }

    const warns = await Warn.find({ guildId: message.guild.id, userId: targetUser.id }).sort({ createdAt: -1 });
    if (!warns.length) {
      return message.reply(noticePayload({ title: "Clean Record", description: `**${targetUser.tag}** has no active warnings.`, tone: "success" }));
    }

    const warnList = warns.slice(0, 10).map((w) => {
      const date = `<t:${Math.round(w.createdAt.getTime() / 1000)}:R>`;
      return `**#${w.warnId}** · ${w.reason} (${date}) - <@${w.moderatorId}>`;
    }).join("\n");

    const card = container(COLORS.warning)
      .addTextDisplayComponents(text(`## 📋 Infraction History\n-# ${warns.length} warning(s) for ${targetUser.tag}`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(warnList));

    return message.reply({ components: [card], flags: flags(false) });
  }
};

