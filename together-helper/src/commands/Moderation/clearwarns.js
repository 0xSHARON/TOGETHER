const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const { Warn } = require("../../schema");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");

module.exports = {
  name: "clearwarns",
  description: "Clear warnings for a member or clear a specific warn ID",
  category: "Moderation",
  userPerms: ["ModerateMembers"],
  slashOptions: [
    {
      name: "user",
      description: "The member to clear warnings for",
      type: ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: "warn_id",
      description: "Specific Warn ID to remove (optional)",
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply(noticePayload({ title: "Permission Denied", description: "You need `Moderate Members` permission.", tone: "danger" }, true));
    }

    const targetUser = interaction.options.getUser("user");
    const warnId = interaction.options.getString("warn_id")?.trim().toUpperCase();

    if (warnId) {
      const deleted = await Warn.findOneAndDelete({ guildId: interaction.guild.id, userId: targetUser.id, warnId });
      if (!deleted) {
        return interaction.reply(noticePayload({ title: "Not Found", description: `Warning ID \`#${warnId}\` not found for ${targetUser.tag}.`, tone: "warning" }, true));
      }
      return interaction.reply(noticePayload({ title: "Warning Removed", description: `Successfully cleared warning \`#${warnId}\` for **${targetUser.tag}**.`, tone: "success" }, false));
    }

    const result = await Warn.deleteMany({ guildId: interaction.guild.id, userId: targetUser.id });
    const card = container(COLORS.success)
      .addTextDisplayComponents(text(`## 🛡️ Warnings Cleared\n-# Action performed by ${interaction.user.tag}`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`Successfully cleared **${result.deletedCount}** warning(s) for **${targetUser.tag}**.`));

    return interaction.reply({ components: [card], flags: flags(false) });
  },

  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply(noticePayload({ title: "Permission Denied", description: "You need `Moderate Members` permission.", tone: "danger" }));
    }

    const targetUser = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null);
    if (!targetUser) {
      return message.reply(noticePayload({ title: "Usage", description: "`-clearwarns <@user/id> [warn_id]`", tone: "warning" }));
    }

    const warnId = args[1]?.trim().toUpperCase();
    if (warnId) {
      const deleted = await Warn.findOneAndDelete({ guildId: message.guild.id, userId: targetUser.id, warnId });
      if (!deleted) return message.reply(noticePayload({ title: "Not Found", description: `Warning ID \`#${warnId}\` not found.`, tone: "warning" }));
      return message.reply(noticePayload({ title: "Warning Removed", description: `Cleared warning \`#${warnId}\` for **${targetUser.tag}**.`, tone: "success" }));
    }

    const result = await Warn.deleteMany({ guildId: message.guild.id, userId: targetUser.id });
    return message.reply(noticePayload({ title: "Warnings Cleared", description: `Cleared **${result.deletedCount}** warning(s) for **${targetUser.tag}**.`, tone: "success" }));
  }
};
