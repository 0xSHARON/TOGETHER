const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");

module.exports = {
  name: "serverinfo",
  aliases: ["guildinfo", "server"],
  description: "Display statistics and information about the current server",
  category: "Utility",
  slashOptions: [],

  async slashExecute(interaction, client) {
    const { guild } = interaction;
    const createdStamp = Math.round(guild.createdTimestamp / 1000);
    const owner = await guild.fetchOwner().catch(() => null);

    const totalMembers = guild.memberCount;
    const botMembers = guild.members.cache.filter(m => m.user.bot).size;
    const humanMembers = totalMembers - botMembers;

    const channels = guild.channels.cache;
    const textCount = channels.filter(c => c.isTextBased() && !c.isVoiceBased() && !c.isThread()).size;
    const voiceCount = channels.filter(c => c.isVoiceBased()).size;
    const categoryCount = channels.filter(c => c.type === 4).size;

    const card = container(COLORS.info)
      .addTextDisplayComponents(
        text(`## 🏰 ${guild.name}\n-# Server Overview & Infrastructure Statistics`)
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `• **Owner:** ${owner ? `${owner.user.tag} (<@${owner.id}>)` : "Unknown"}\n` +
          `• **Server ID:** \`${guild.id}\`\n` +
          `• **Created:** <t:${createdStamp}:D> (<t:${createdStamp}:R>)\n` +
          `• **Boost Level:** Tier ${guild.premiumTier} (${guild.premiumSubscriptionCount || 0} boosts)\n\n` +
          `### 👥 Members\n` +
          `• **Total:** **${totalMembers}** (Humans: \`${humanMembers}\` · Bots: \`${botMembers}\`)\n\n` +
          `### 📁 Channels\n` +
          `• **Categories:** \`${categoryCount}\` · **Text:** \`${textCount}\` · **Voice:** \`${voiceCount}\`\n` +
          `• **Roles:** \`${guild.roles.cache.size}\` · **Emojis:** \`${guild.emojis.cache.size}\``
        )
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`-# Requested by ${interaction.user.username} · TOGETHER Community`));

    return interaction.reply({ components: [card], flags: flags(false) });
  },

  async prefixExecute(message, args, client) {
    const { guild } = message;
    const createdStamp = Math.round(guild.createdTimestamp / 1000);
    const owner = await guild.fetchOwner().catch(() => null);

    const card = container(COLORS.info)
      .addTextDisplayComponents(text(`## 🏰 ${guild.name}\n-# Server Overview`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `• **Owner:** ${owner ? owner.user.tag : "Unknown"}\n` +
          `• **ID:** \`${guild.id}\`\n` +
          `• **Members:** **${guild.memberCount}**\n` +
          `• **Created:** <t:${createdStamp}:R>\n` +
          `• **Boost Tier:** Tier ${guild.premiumTier}`
        )
      );

    return message.reply({ components: [card], flags: flags(false) });
  }
};

