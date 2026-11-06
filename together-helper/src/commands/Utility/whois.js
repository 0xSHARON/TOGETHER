const { ApplicationCommandOptionType } = require("discord.js");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");

module.exports = {
  name: "whois",
  aliases: ["userinfo", "user"],
  description: "Display detailed account and membership information for a user",
  category: "Utility",
  slashOptions: [
    {
      name: "user",
      description: "User to inspect (defaults to yourself)",
      type: ApplicationCommandOptionType.User,
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    const targetUser = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    const createdStamp = Math.round(targetUser.createdTimestamp / 1000);
    const joinedStamp = member ? Math.round(member.joinedTimestamp / 1000) : null;

    const roles = member
      ? member.roles.cache
          .filter(r => r.id !== interaction.guild.id)
          .sort((a, b) => b.position - a.position)
          .map(r => `<@&${r.id}>`)
          .slice(0, 8)
          .join(" ") || "None"
      : "Not in server";

    const keyPerms = member
      ? member.permissions.toArray().filter(p => ["Administrator", "ManageGuild", "ManageRoles", "ManageChannels", "KickMembers", "BanMembers", "ModerateMembers"].includes(p)).join(", ") || "Standard Member"
      : "N/A";

    const card = container(COLORS.info)
      .addTextDisplayComponents(
        text(
          `## 👤 ${targetUser.username}\n-# User Identity & Server Profile`
        )
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `• **User Tag:** \`${targetUser.tag}\`\n` +
          `• **ID:** \`${targetUser.id}\`\n` +
          `• **Bot:** ${targetUser.bot ? "Yes 🤖" : "No"}\n` +
          `• **Account Created:** <t:${createdStamp}:D> (<t:${createdStamp}:R>)\n` +
          (joinedStamp ? `• **Joined Server:** <t:${joinedStamp}:D> (<t:${joinedStamp}:R>)\n` : "") +
          `• **Key Permissions:** \`${keyPerms}\`\n` +
          `• **Roles:** ${roles}`
        )
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`-# Requested by ${interaction.user.username} · TOGETHER Ecosystem`));

    return interaction.reply({ components: [card], flags: flags(false) });
  },

  async prefixExecute(message, args, client) {
    const targetUser = message.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : message.author);
    const member = await message.guild.members.fetch(targetUser.id).catch(() => null);

    const createdStamp = Math.round(targetUser.createdTimestamp / 1000);
    const joinedStamp = member ? Math.round(member.joinedTimestamp / 1000) : null;

    const roles = member
      ? member.roles.cache
          .filter(r => r.id !== message.guild.id)
          .sort((a, b) => b.position - a.position)
          .map(r => `<@&${r.id}>`)
          .slice(0, 8)
          .join(" ") || "None"
      : "Not in server";

    const card = container(COLORS.info)
      .addTextDisplayComponents(text(`## 👤 ${targetUser.username}\n-# User Identity & Server Profile`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `• **User Tag:** \`${targetUser.tag}\`\n` +
          `• **ID:** \`${targetUser.id}\`\n` +
          `• **Account Created:** <t:${createdStamp}:R>\n` +
          (joinedStamp ? `• **Joined Server:** <t:${joinedStamp}:R>\n` : "") +
          `• **Roles:** ${roles}`
        )
      );

    return message.reply({ components: [card], flags: flags(false) });
  }
};
