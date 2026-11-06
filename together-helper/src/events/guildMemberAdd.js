const {
  SectionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const { WelcomeConfig } = require("../schema");
const config = require("../config");
const {
  container,
  separator,
  text,
  flags,
  COLORS
} = require("../utils/ui");

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

      const heading = text(
        `## 🎵 Welcome to ${member.guild.name}!\n*Hey ${member.toString()}, you are member #${member.guild.memberCount}!*`
      );
      const details = text(
        `${formatted}\n\n` +
        `• **Listen in Voice**: Join any VC and use \`/play\`\n` +
        `• **Web Dashboard**: [Open Web Dashboard](${config.dashboardUrl})\n` +
        `• **Official Support**: [Join Support Server](${config.supportUrl})`
      );

      const avatar = member.user.displayAvatarURL({ dynamic: true, size: 256 });
      const card = container(COLORS.brand);

      if (avatar) {
        const section = new SectionBuilder()
          .addTextDisplayComponents(heading, details)
          .setThumbnailAccessory((t) => t.setURL(avatar));
        card.addSectionComponents(section);
      } else {
        card.addTextDisplayComponents(heading, details);
      }

      const buttons = [];
      if (config.dashboardUrl) {
        buttons.push(
          new ButtonBuilder()
            .setLabel("Web Dashboard")
            .setURL(config.dashboardUrl)
            .setStyle(ButtonStyle.Link)
            .setEmoji("🌐")
        );
      }
      if (config.supportUrl) {
        buttons.push(
          new ButtonBuilder()
            .setLabel("Support Server")
            .setURL(config.supportUrl)
            .setStyle(ButtonStyle.Link)
            .setEmoji("🎧")
        );
      }

      if (buttons.length > 0) {
        card.addSeparatorComponents(separator());
        card.addActionRowComponents(new ActionRowBuilder().addComponents(buttons));
      }

      await channel.send({
        content: `${member.toString()}`,
        components: [card],
        flags: flags(false)
      }).catch(() => {});

      if (cfg.dmWelcome) {
        const dmCard = container(COLORS.info)
          .addTextDisplayComponents(text(`## Welcome to ${member.guild.name}!`))
          .addSeparatorComponents(separator())
          .addTextDisplayComponents(text(formatted));
        await member.send({
          components: [dmCard],
          flags: flags(false)
        }).catch(() => {});
      }
    } catch (err) {
      if (client.logger) {
        client.logger.error(`[Welcome Event Error] ${err.message}`);
      }
    }
  }
};
