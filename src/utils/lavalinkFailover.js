const { EmbedBuilder } = require("discord.js");

/**
 * Audio Failover Sentinel
 * Handles mid-song seamless recovery and audio stream migration without dropping playback.
 */
class AudioFailoverManager {
  /**
   * Retrieves all currently connected audio nodes
   */
  static getHealthyNodes(client, excludeNodeName = null) {
    if (client.manager?.shoukaku?.nodes) {
      return [...client.manager.shoukaku.nodes.values()].filter(
        (n) => n.state === 1 && (!excludeNodeName || n.name !== excludeNodeName)
      );
    }
    return [{ name: "Native-TOGETHER", state: 1, stats: { players: client.manager?.players?.size || 0 } }];
  }

  /**
   * Selects the best candidate audio node
   */
  static getIdealFailoverNode(client, excludeNodeName = null) {
    const available = this.getHealthyNodes(client, excludeNodeName);
    if (!available.length) return null;

    return available.sort((a, b) => {
      const aPlayers = a.stats?.players || 0;
      const bPlayers = b.stats?.players || 0;
      if (aPlayers !== bPlayers) return aPlayers - bPlayers;
      const aCpu = a.stats?.cpu?.systemLoad || 0;
      const bCpu = b.stats?.cpu?.systemLoad || 0;
      return aCpu - bCpu;
    })[0];
  }

  /**
   * Migrates or seamlessly recovers a single player mid-song without ending playback.
   */
  static async migratePlayer(client, player, reason = "Audio Stream Failover") {
    if (!player || player._isMigrating) return false;
    player._isMigrating = true;

    const guildId = player.guildId;
    const currentTrack = player.queue?.current;
    const position = Math.max(0, player.position || player.shoukaku?.position || 0);
    const volume = player.volume || 80;
    const fromNodeName = player.node?.name || player.shoukaku?.node?.name || "Native-TOGETHER";

    const targetNode = this.getIdealFailoverNode(client, fromNodeName) || { name: "Native-TOGETHER" };

    client.logger?.log(
      `[FAILOVER] Starting mid-song stream recovery for guild ${guildId} on "${targetNode.name}" (Track: "${currentTrack?.title || "None"}" at ${Math.round(position / 1000)}s)...`,
      "warn"
    );

    let migrationSuccess = false;

    // 1. Native Player Stream Recovery (Direct FFmpeg Re-pipe with exact seek)
    if (typeof player._cleanupFfmpeg === "function" && currentTrack) {
      try {
        const TogetherStreamer = require("../structures/TogetherStreamer");
        const query = currentTrack.searchQuery || currentTrack.uri || `${currentTrack.title} - ${currentTrack.author}`;
        const streamUrl = await TogetherStreamer.getStreamUrl(query);

        if (streamUrl) {
          player._cleanupFfmpeg();
          const { resource, ffmpeg } = TogetherStreamer.createStreamResource(streamUrl, {
            volume: volume,
            seek: position,
          });

          player._currentFfmpeg = ffmpeg;
          player._currentResource = resource;
          player._seekOffset = position;
          player._playbackStartTime = Date.now();
          player.audioPlayer.play(resource);
          migrationSuccess = true;
        }
      } catch (err) {
        client.logger?.log(`[FAILOVER] Native stream recovery error: ${err.message}`, "warn");
      }
    }

    // 2. Legacy Shoukaku Node Move Fallback
    if (!migrationSuccess && typeof player.shoukaku?.move === "function") {
      try {
        const moved = await player.shoukaku.move(targetNode.name).catch(() => false);
        if (moved) migrationSuccess = true;
      } catch (moveErr) {
        client.logger?.log(`[FAILOVER] Shoukaku move error: ${moveErr.message}`, "warn");
      }
    }

    player._isMigrating = false;

    if (migrationSuccess) {
      client.logger?.log(
        `[FAILOVER SUCCESS] Player for guild ${guildId} successfully recovered on "${targetNode.name}" at ${Math.round(position / 1000)}s`,
        "ready"
      );

      // Post notification embed strictly to failover log thread
      try {
        const { sendWebhook } = require("./webhooks");
        const guild = client.guilds.cache.get(guildId);
        const posMin = Math.floor(position / 60000);
        const posSec = Math.floor((position % 60000) / 1000).toString().padStart(2, "0");

        const embed = new EmbedBuilder()
          .setColor(client.color || "#35C47C")
          .setAuthor({
            name: `${client.user?.username || "TOGETHER"} • Audio Failover Sentinel`,
            iconURL: client.user?.displayAvatarURL({ dynamic: true }),
          })
          .setTitle(`${client.emoji?.check || "🟢"} Audio Failover Engaged`)
          .setDescription(
            `### 🔄 Mid-Song Audio Stream Recovery (Zero Downtime)\n\n` +
            `**${client.emoji?.dot || "•"} Server:** \`${guild?.name || "Unknown Server"}\` (\`${guildId}\`)\n` +
            `**${client.emoji?.dot || "•"} Track Playing:** \`${currentTrack?.title || "Unknown Track"}\` (${currentTrack?.author || "Unknown"})\n` +
            `**${client.emoji?.dot || "•"} Audio Node:** \`${targetNode.name}\` 🟢\n` +
            `**${client.emoji?.dot || "•"} Resumed At:** \`${posMin}:${posSec}\`\n` +
            `**${client.emoji?.dot || "•"} Voice Channel:** <#${player.voiceId}> (\`${player.voiceId}\`)\n` +
            `**${client.emoji?.dot || "•"} Trigger Reason:** \`${reason}\`\n` +
            `**${client.emoji?.dot || "•"} Event Time:** <t:${Math.floor(Date.now() / 1000)}:F>`
          )
          .setFooter({
            text: "Mid-Song Audio Failover Engine • Thread Telemetry Only",
            iconURL: client.user?.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        sendWebhook(client, "failover", { embeds: [embed] }).catch(() => {});
      } catch {}

      return true;
    } else {
      try {
        const { sendWebhook } = require("./webhooks");
        const guild = client.guilds.cache.get(guildId);
        const embed = new EmbedBuilder()
          .setColor("#ED4245")
          .setAuthor({
            name: `${client.user?.username || "TOGETHER"} • Audio Failover Sentinel`,
            iconURL: client.user?.displayAvatarURL({ dynamic: true }),
          })
          .setTitle("🔴 Audio Failover Failed: Recovery Incomplete")
          .setDescription(
            `### ⚠️ Mid-Song Migration Failed\n\n` +
            `**${client.emoji?.dot || "•"} Server:** \`${guild?.name || "Unknown Server"}\` (\`${guildId}\`)\n` +
            `**${client.emoji?.dot || "•"} Audio Node:** \`${fromNodeName}\`\n` +
            `**${client.emoji?.dot || "•"} Voice Channel:** <#${player.voiceId}> (\`${player.voiceId}\`)\n` +
            `**${client.emoji?.dot || "•"} Trigger Reason:** \`${reason}\``
          )
          .setFooter({
            text: "Mid-Song Audio Failover Engine • Thread Telemetry Only",
            iconURL: client.user?.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        sendWebhook(client, "failover", { embeds: [embed] }).catch(() => {});
      } catch {}
    }

    return false;
  }

  /**
   * Concurrently recovers all players currently affected
   */
  static async failoverAllPlayersOnNode(client, nodeName, reason = "Node dropped") {
    if (!client.manager?.players) return;
    const players = [...client.manager.players.values()].filter(
      (p) => p.node?.name === nodeName || p.shoukaku?.node?.name === nodeName || true
    );

    if (!players.length) return;

    client.logger?.log(
      `[FAILOVER] Triggering audio stream recovery for ${players.length} active player session(s)...`,
      "warn"
    );

    for (const player of players) {
      await this.migratePlayer(client, player, reason);
      await new Promise((r) => setTimeout(r, 600));
    }
  }
}

const LavalinkFailoverManager = AudioFailoverManager;

module.exports = AudioFailoverManager;
module.exports.AudioFailoverManager = AudioFailoverManager;
module.exports.LavalinkFailoverManager = LavalinkFailoverManager;
