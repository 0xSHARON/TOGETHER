const { EmbedBuilder } = require("discord.js");
const { WelcomeConfig } = require("../schema");
const config = require("../config");

module.exports = {
  name: "guildMemberAdd",
  async execute(member, client) {
    if (member.user.bot) return;

    try {
      const cfg = await WelcomeConfig.findOne({ guildId: member.guild.id });
      if (!cfg || !cfg.enabled || !cfg.channelId) return;

      const channel = member.guild.channels.cache.get(cfg.channelId);
      if (!channel) return;

      const formatted = cfg.message
        .replace(/{user}/g, member.toString())
        .replace(/{username}/g, member.user.username)
        .replace(/{server}/g, member.guild.name)
        .replace(/{count}/g, member.guild.memberCount.toString());

      const embed = new EmbedBuilder()
        .setColor(config.color)
        .setAuthor({
          name: `${member.user.tag} joined the soundstage!`,
          iconURL: member.user.displayAvatarURL({ dynamic: true })
        })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setDescription(
          `### 🎵 Welcome to ${member.guild.name}!\n\n` +
          `Hey ${member.toString()}, ${formatted}\n\n` +
          `• **Listen in Voice**: Join any VC and type \`/play\`\n` +
          `• **Web Dashboard**: [Open Dashboard](${config.dashboardUrl})\n` +
          `• **Official Support**: [Join Support Server](${config.supportUrl})\n\n` +
          `*You are member #${member.guild.memberCount}!*`
        )
        .setFooter({ text: "TOGETHER Helper • Member Onboarding" })
        .setTimestamp();

      await channel.send({ content: `${member.toString()}`, embeds: [embed] }).catch(() => {});

      if (cfg.dmWelcome) {
        const dmEmbed = new EmbedBuilder()
          .setColor(config.accentColor)
          .setTitle(`Welcome to ${member.guild.name}!`)
          .setDescription(formatted)
          .setFooter({ text: "TOGETHER Music Bot" });
        await member.send({ embeds: [dmEmbed] }).catch(() => {});
      }
    } catch (err) {
      console.error("[Welcome Event Error]", err);
    }
  }
};
