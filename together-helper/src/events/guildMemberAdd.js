const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const { WelcomeConfig } = require("../schema");
const config = require("../config");
const { container, flags, separator, text } = require("../utils/ui");
const { isHttpUrl, dispatchLogThread } = require("../utils/webhooks");
const emoji = require("../emojis");

function welcomeLinks() {
  const buttons = [];
  if (isHttpUrl(config.dashboardUrl)) {
    buttons.push(
      new ButtonBuilder()
        .setLabel("Web Dashboard")
        .setStyle(ButtonStyle.Link)
        .setURL(config.dashboardUrl)
        .setEmoji(emoji.config || "🌐"),
    );
  }
  if (isHttpUrl(config.supportUrl)) {
    buttons.push(
      new ButtonBuilder()
        .setLabel("Support server")
        .setStyle(ButtonStyle.Link)
        .setURL(config.supportUrl)
        .setEmoji(emoji.info || "💬"),
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

      const welcomeCard = container()
        .addTextDisplayComponents(text(`## ${emoji.music || "🎵"} Welcome to ${member.guild.name}!\n-# Member #${member.guild.memberCount}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(
          text(
            `Hey ${member.toString()},\n\n` +
            `${formatted}\n\n` +
            `• **Listen in Voice**  Hop into any Voice Channel and type \`/play\`\n` +
            `• **Web Audio Controls**  Adjust volume, 24/7 mode, and loop from Dashboard\n` +
            `• **Support Desk**  Need help? Open a ticket in <#tickets> anytime`,
          ),
        )
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`-# Sound that brings us closer · TOGETHER`));

      const links = welcomeLinks();
      if (links) welcomeCard.addActionRowComponents(links);

      await channel.send({
        content: `${member.toString()}`,
        components: [welcomeCard],
        flags: flags(false),
      }).catch(() => {});

      const joinLog = new EmbedBuilder()
        .setColor("#5865F2")
        .setAuthor({
          name: `${member.user.tag} (${member.user.id})`,
          iconURL: member.user.displayAvatarURL({ dynamic: true }),
        })
        .setTitle("👋 Member Joined")
        .setDescription(`• **Member:** ${member.toString()}\n• **Total Count:** \`${member.guild.memberCount}\`\n• **Channel:** <#${channel.id}>`)
        .setTimestamp();
      dispatchLogThread(client, "welcome", joinLog);

      if (cfg.dmWelcome) {
        const dmCard = container()
          .addTextDisplayComponents(text(`## Welcome to ${member.guild.name}!`))
          .addSeparatorComponents(separator())
          .addTextDisplayComponents(text(formatted));

        await member.send({
          components: [dmCard],
          flags: flags(false),
        }).catch(() => {});
      }
    } catch (err) {
      console.error("[Welcome Event Error]", err);
    }
  },
};
