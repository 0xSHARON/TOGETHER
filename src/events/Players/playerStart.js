const { AttachmentBuilder, MessageFlags } = require("discord.js");
const { createPlayerCard } = require("../../utils/playerCard");
const { createTrackBanner } = require("../../utils/trackBanner");
const { syncVoiceChannelStatus } = require("../../utils/voiceChannelStatus");
const { reconcilePlaybackModes } = require("../../utils/playbackModes");

const BANNER_NAME = "now-playing-banner.png";

async function refreshNowPlayingMessage(client, player, options = {}) {
  try {
    const message = player.data?.get("nowPlayingMessage");
    const track = player.queue?.current;
    if (!message || !track) return;

    await message.edit({
      components: [createPlayerCard(client, player, track, {
        bannerName: player.data.get("nowPlayingBanner") ? BANNER_NAME : null,
        controls: true,
        ...options,
      })],
      flags: MessageFlags.IsComponentsV2,
    });
  } catch (error) {
    player.data?.delete("nowPlayingMessage");
    client.logger?.log(`[Player] Could not refresh controls: ${error.message}`, "warn");
  }
}

async function updateNowPlayingButtons(client, player, isPaused) {
  await syncVoiceChannelStatus(client, player, { state: isPaused ? "paused" : "playing" });
  return refreshNowPlayingMessage(client, player, { paused: isPaused });
}

async function recordTrackListening(track, client) {
  try {
    const requester = track?.requester;
    const userId = requester?.id;
    if (!userId) return;

    const UserPreferences = require("../../schema/userpreferences");
    let pref = await UserPreferences.findOne({ userId });
    if (!pref) {
      pref = new UserPreferences({ userId });
    }

    pref.songsPlayed = (Number(pref.songsPlayed) || 0) + 1;
    const durMs = Number(track.duration || track.length) || 180000;
    const durSec = Math.max(10, Math.min(3600, Math.round(durMs / 1000)));
    pref.listeningSeconds = (Number(pref.listeningSeconds) || 0) + durSec;

    // Daily streak logic
    const now = new Date();
    if (!pref.lastActive) {
      pref.streak = 1;
    } else {
      const last = new Date(pref.lastActive);
      const isSameDay =
        now.getUTCFullYear() === last.getUTCFullYear() &&
        now.getUTCMonth() === last.getUTCMonth() &&
        now.getUTCDate() === last.getUTCDate();

      if (!isSameDay) {
        const yesterday = new Date(now);
        yesterday.setUTCDate(now.getUTCDate() - 1);
        const isYesterday =
          yesterday.getUTCFullYear() === last.getUTCFullYear() &&
          yesterday.getUTCMonth() === last.getUTCMonth() &&
          yesterday.getUTCDate() === last.getUTCDate();

        if (isYesterday) {
          pref.streak = (Number(pref.streak) || 0) + 1;
        } else {
          pref.streak = 1;
        }
      }
    }
    pref.lastActive = now;

    // XP and Level progression (+15 XP per song)
    pref.xp = (Number(pref.xp) || 0) + 15;
    pref.level = Math.max(1, Math.floor(Math.sqrt(pref.xp / 10)) + 1);

    await pref.save();
  } catch (err) {
    client?.logger?.log(`[UserPreferences] Failed to record listening stats: ${err.message}`, "warn");
  }
}

module.exports = {
  name: "playerStart",
  run: async (client, player, track) => {
    if (!player || !track) return;
    if (!player.data) player.data = new Map();

    if (!track.requester && player.data.get("lastRequester")) {
      track.requester = player.data.get("lastRequester");
    } else if (track.requester) {
      player.data.set("lastRequester", track.requester);
    }

    if (track.requester && typeof track.requester === "string" && /^\d+$/.test(track.requester)) {
      const user = client.users.cache.get(track.requester);
      if (user) track.requester = user;
    }

    reconcilePlaybackModes(player);
    await syncVoiceChannelStatus(client, player, { track, state: "playing" });
    const lastTrack = player.data.get("lastTrack");
    const changed = lastTrack && (lastTrack.identifier || lastTrack.uri) !== (track.identifier || track.uri);
    if (changed) {
      const history = [...(player.data.get("history") || []), lastTrack].slice(-50);
      player.data.set("history", history);
    }
    player.data.set("lastTrack", track);
    recordTrackListening(track, client).catch(() => {});

    const channel = client.channels.cache.get(player.textId);
    if (!channel) return;

    try {
      client.voiceHealthMonitor?.updateActivity(player.guildId);

      const previous = player.data.get("nowPlayingMessage");
      if (previous?.deletable) await previous.delete().catch(() => {});

      let banner = null;
      try {
        banner = await createTrackBanner(track);
      } catch (error) {
        client.logger?.log(`[Player banner] ${error.message}`, "warn");
      }

      if (banner) player.data.set("nowPlayingBanner", banner);
      else player.data.delete("nowPlayingBanner");

      const payload = {
        components: [createPlayerCard(client, player, track, {
          bannerName: banner ? BANNER_NAME : null,
          controls: true,
        })],
        flags: MessageFlags.IsComponentsV2,
      };
      if (banner) payload.files = [new AttachmentBuilder(banner, { name: BANNER_NAME })];

      const message = await channel.send(payload);
      player.data.set("nowPlayingMessage", message);
    } catch (error) {
      client.logger?.log(`[Player] Could not send now-playing card: ${error.stack || error.message}`, "error");
    }
  },
  refreshNowPlayingMessage,
  updateNowPlayingButtons,
};
