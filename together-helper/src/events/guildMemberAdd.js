const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");
const { WelcomeConfig } = require("../schema");
const config = require("../config");
const { container, flags, separator, text, COLORS } = require("../utils/ui");
const { isHttpUrl, dispatchLogThread } = require("../utils/webhooks");

function welcomeLinks() {
  const buttons = [];
  if (isHttpUrl(config.dashboardUrl)) {
    buttons.push(
      new ButtonBuilder()
        .setLabel("Web Dashboard")
        .setStyle(ButtonStyle.Link)
        .setURL(config.dashboardUrl)
        .setEmoji("🌐")
    );
  }
  if (isHttpUrl(config.supportUrl)) {
    buttons.push(
      new ButtonBuilder()
        .setLabel("Support Server")
        .setStyle(ButtonStyle.Link)
        .setURL(config.supportUrl)
        .setEmoji("💬")
    );
  }
  return buttons.length ? new ActionRowBuilder().addComponents(buttons) : null;
}

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

      const welcomeCard = container(COLORS.brand)
        .addTextDisplayComponents(text(`### 🎵 Welcome to ${member.guild.name}!`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(
          text(
            `Hey ${member.toString()},\n\n` +
            `${formatted}\n\n` +
            `• **Listen Together**: Hop into any Voice Channel and queue songs using \`/play\`\n` +
            `• **Web Audio Controls**: Adjust volume, loop, and 24/7 settings from the Dashboard\n\n` +
            `*You are member #${member.guild.memberCount}! Enjoy high-fidelity audio with us.*`
          )
        )
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`*TOGETHER Helper • Community Member Onboarding*`));

      const links = welcomeLinks();
      const components = [welcomeCard];
      if (links) components.push(links);

      await channel.send({
        content: `${member.toString()}`,
        components,
        flags: flags(false)
      }).catch(() => {});

      const joinLog = new EmbedBuilder()
        .setColor("#5865F2")
        .setAuthor({
          name: `${member.user.tag} (${member.user.id})`,
          iconURL: member.user.displayAvatarURL({ dynamic: true })
        })
        .setTitle("👋 Member Joined")
        .setDescription(`• **Member:** ${member.toString()}\n• **Total Count:** \`${member.guild.memberCount}\`\n• **Channel:** <#${channel.id}>`)
        .setTimestamp();
      dispatchLogThread(client, "welcome", joinLog);

      if (cfg.dmWelcome) {
        const dmCard = container(COLORS.accent)
          .addTextDisplayComponents(text(`### Welcome to ${member.guild.name}!`))
          .addSeparatorComponents(separator())
          .addTextDisplayComponents(text(formatted));

        await member.send({
          components: [dmCard],
          flags: flags(false)
        }).catch(() => {});
      }
    } catch (err) {
      console.error("[Welcome Event Error]", err);
    }
  }
};
