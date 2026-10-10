/**
 * visualizer.js  —  TOGETHER 3D Audio Visualizer & Activity Command
 * Launches the real-time 3D WebGL visualizer for the current voice session.
 */

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  InviteTargetType,
} = require("discord.js");
const { noticePayload } = require("../../utils/ui");

module.exports = {
  name: "visualizer",
  aliases: ["stage", "vz", "3d", "vibe"],
  category: "Music",
  description: "Launch the 3D Audio Visualizer & Stage in your voice channel",
  cooldown: 3,
  player: false,
  inVoiceChannel: true,
  sameVoiceChannel: false,
  slashOptions: [],

  async slashExecute(interaction, client) {
    const wrapper = {
      guild: interaction.guild,
      member: interaction.member,
      channel: interaction.channel,
      author: interaction.user,
      reply: async (options) => {
        if (interaction.replied || interaction.deferred) return interaction.editReply(options);
        return interaction.reply(options);
      },
    };
    return this.execute(wrapper, [], client);
  },

  async execute(message, _args, client) {
    const member = message.member || message.guild.members.cache.get(message.author?.id);
    const voiceChannel = member?.voice?.channel;

    if (!voiceChannel) {
      return message.reply(noticePayload({
        title: "Voice Channel Required",
        description: "You must be inside a voice channel to launch the 3D Visualizer Stage.",
        emoji: client.emoji?.warn || "⚠️",
        tone: "warn",
      }));
    }

    const player = client.manager?.players?.get(message.guild.id);
    const track = player?.queue?.current;

    // 1. Construct Web Visualizer Link
    const baseHost = (process.env.VISUALIZER_URL || `http://localhost:${client.visualizerPort || 5050}`).replace(/\/+$/, "");
    const webUrl = `${baseHost}/?guild=${message.guild.id}`;

    // 2. Try creating Discord Embedded Application Activity Invite
    let activityInviteUrl = null;
    try {
      const invite = await voiceChannel.createInvite({
        targetType: InviteTargetType.EmbeddedApplication,
        targetApplication: client.user.id,
        maxAge: 86400,
        reason: "TOGETHER 3D Visualizer Stage",
      });
      if (invite?.url) activityInviteUrl = invite.url;
    } catch {
      // Activity not enabled yet in Developer Portal, fallback to Web Link
    }

    // 3. Build Action Buttons
    const buttons = [];

    if (activityInviteUrl) {
      buttons.push(
        new ButtonBuilder()
          .setLabel("🚀 Launch in Discord")
          .setStyle(ButtonStyle.Link)
          .setURL(activityInviteUrl)
      );
    }

    buttons.push(
      new ButtonBuilder()
        .setLabel("🌐 Open 3D Visualizer")
        .setStyle(ButtonStyle.Link)
        .setURL(webUrl)
        .setEmoji("✨")
    );

    const actionRow = new ActionRowBuilder().addComponents(buttons);

    // 4. Build Neo-Brutalist Visualizer Card
    const embed = new EmbedBuilder()
      .setColor("#6366F1")
      .setTitle("🌌 TOGETHER 3D AUDIO STAGE // VISUALIZER")
      .setDescription(
        `Experience high-fidelity sound with real-time **3D WebGL Visuals** synced directly to **<#${voiceChannel.id}>**.\n\n` +
        `✦ **Current Track:** ${track ? `**[${track.title}](${track.uri})** — \`${track.author}\`` : "*No track playing right now. Use `/play` to start!*"}\n` +
        `✦ **3D Features:** 64-band radial spectrum, floating vinyl hologram, beat reactivity, and multiple cyberpunk themes.\n` +
        `✦ **Shared Experience:** Click below to open the visualizer on desktop, mobile, or as a Discord Activity.`
      )
      .setFooter({
        text: "TOGETHER • Real-time 3D WebGL Engine",
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp();

    const thumbUrl = track?.thumbnail || track?.artworkUrl || (typeof track?.displayThumbnail === "function" ? track.displayThumbnail("hqdefault") : null);
    if (thumbUrl) {
      embed.setThumbnail(thumbUrl.startsWith("http://") ? thumbUrl.replace(/^http:\/\//, "https://") : thumbUrl);
    } else {
      embed.setThumbnail(`${baseHost}/logo.png?v=2`);
    }

    return message.reply({
      embeds: [embed],
      components: [actionRow],
    });
  },
};
