const fs = require("fs");
const path = require("path");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

const ONLINE_BANNER_NAME = "lavalink-online.png";
const OFFLINE_BANNER_NAME = "lavalink-offline.png";
const ONLINE_BANNER_PATH = path.resolve(__dirname, "../../assets/lavalink-online.png");
const OFFLINE_BANNER_PATH = path.resolve(__dirname, "../../assets/lavalink-offline.png");

function prettyBytes(bytes) {
  if (typeof bytes !== "number" || isNaN(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function formatDuration(ms) {
  if (!ms || ms <= 0) return "0 minutes";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  return parts.join(", ");
}

const arrayChunker = (array, chunkSize = 8) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

class LavalinkStatusMonitor {
  constructor(client) {
    this.client = client;
    this.statusChannelId = process.env.LAVALINK_STATUS_CHANNEL_ID || client.config?.lavalinkStatus?.statusChannelId || "";
    this.alertChannelId = process.env.LAVALINK_ALERT_CHANNEL_ID || client.config?.lavalinkStatus?.alertChannelId || "";
    this.channelId = this.statusChannelId;
    this.alertUserId = process.env.LAVALINK_ALERT_USER_ID || client.config?.lavalinkStatus?.alertUserId || "";
    this.updateInterval = client.config?.lavalinkStatus?.updateInterval || 60_000;
    this.embedColor = client.config?.lavalinkStatus?.embedColor || "#2F3136";

    this.statusMessage = null;
    this.nodeStates = new Map(); // nodeName -> { isOnline: boolean, lastAlert: number }
    this.isInitialized = false;
    this.intervalId = null;
    this.startupTime = Date.now();
  }

  async init() {
    if (this.client.cluster && this.client.cluster.id !== 0) {
      return; // Only cluster 0 manages the status channel
    }

    if (!this.statusChannelId && !this.alertChannelId) {
      return; // No status or alert channels configured
    }

    if (this.isInitialized) return;
    this.isInitialized = true;
    this.client.lavalinkStatusMonitor = this;
    this.client.audioStatusMonitor = this;
    monitorInstance = this;

    // Attach Shoukaku event listeners for live updates & alerts
    if (this.client.manager?.shoukaku) {
      this.attachShoukakuEvents();

      // Check existing connected nodes and trigger online alert
      if (this.client.manager.shoukaku.nodes) {
        for (const node of this.client.manager.shoukaku.nodes.values()) {
          if (node.state === 1) {
            await this.handleNodeReady(node.name);
          } else {
            this.nodeStates.set(node.name, { isOnline: false, lastAlert: 0 });
          }
        }
      }
    }

    // Delay 3 seconds before initial status render
    setTimeout(async () => {
      await this.updateStatus().catch((err) => {
        this.client.logger?.log(`[AudioStatus] Initial update failed: ${err.message}`, "warn");
      });

      this.intervalId = setInterval(() => {
        this.updateStatus().catch((err) => {
          this.client.logger?.log(`[AudioStatus] Interval update failed: ${err.message}`, "warn");
        });
      }, this.updateInterval);
    }, 3_000);
  }

  attachShoukakuEvents() {
    const shoukaku = this.client.manager.shoukaku;

    shoukaku.on("ready", async (name, resumed) => {
      await this.handleNodeReady(name);
    });

    shoukaku.on("close", async (name, code, reason) => {
      await this.handleNodeDown(name, `Closed (Code ${code || "Unknown"}: ${reason || "No reason"})`);
    });

    shoukaku.on("disconnect", async (name, count) => {
      await this.handleNodeDown(name, `Disconnected (Attempt #${count || 1})`);
    });

    shoukaku.on("error", async (name, error) => {
      const errStr = error?.message || error?.code || error?.error || String(error);
      if (errStr.includes("ETIMEDOUT") || errStr.includes("ECONNREFUSED") || errStr.includes("banned") || errStr.includes("403") || errStr.includes("502")) {
        await this.handleNodeDown(name, `Error (${errStr})`);
      }
    });
  }

  async handleNodeReady(rawName) {
    const name = typeof rawName === "string" ? rawName : rawName?.name || "Native-TOGETHER";
    const prev = this.nodeStates.get(name);
    if (!prev || prev.isOnline !== true) {
      this.nodeStates.set(name, { isOnline: true, lastAlert: Date.now() });
      await this.sendAlert({ name, isOffline: false });
    } else {
      this.nodeStates.set(name, { isOnline: true, lastAlert: prev.lastAlert || Date.now() });
    }
    this.updateStatusDebounced();
  }

  async handleNodeDown(rawName, reason = "Connection closed / unreachable") {
    const name = typeof rawName === "string" ? rawName : rawName?.name || "Native-TOGETHER";
    const prev = this.nodeStates.get(name);
    const now = Date.now();

    // Prevent duplicate alerts if already offline and event fired within 10 seconds
    if (prev && prev.isOnline === false && (now - prev.lastAlert < 10_000)) {
      return;
    }

    this.nodeStates.set(name, { isOnline: false, lastAlert: now });
    await this.sendAlert({ name, reason, isOffline: true });
    this.updateStatusDebounced();
  }

  async sendAlert({ name, reason = "", isOffline = true }) {
    try {
      const channel = await this.getAlertChannel();
      if (!channel) return;

      const alertBanner = isOffline ? OFFLINE_BANNER_PATH : ONLINE_BANNER_PATH;
      const alertName = isOffline ? OFFLINE_BANNER_NAME : ONLINE_BANNER_NAME;
      const files = fs.existsSync(alertBanner)
        ? [new AttachmentBuilder(alertBanner, { name: alertName })]
        : [];

      const connectedCount = this.client.manager?.shoukaku?.nodes
        ? [...this.client.manager.shoukaku.nodes.values()].filter((n) => n.state === 1).length
        : 0;
      const totalCount = this.client.manager?.shoukaku?.nodes?.size || 1;

      const embed = new EmbedBuilder()
        .setColor(isOffline ? "#ED4245" : (this.client.color || "#35C47C"))
        .setAuthor({
          name: `${this.client.user?.username || "TOGETHER"} • Audio Sentinel`,
          iconURL: this.client.user?.displayAvatarURL({ dynamic: true }) || undefined,
        })
        .setTitle(
          isOffline
            ? `${this.client.emoji?.cross || "🔴"} Audio Node Disconnected`
            : `${this.client.emoji?.check || "🟢"} Audio Node Connected`
        )
        .setDescription(
          `### ${isOffline ? "⚠️ Audio Engine Outage Detected" : "✅ Audio Engine Connection Restored"}\n\n` +
          `**${this.client.emoji?.dot || "•"} Node Name:** \`${name}\`\n` +
          `**${this.client.emoji?.dot || "•"} State:** ${isOffline ? "`Disconnected / Offline` 🔴" : "`Connected & Operational` 🟢"}\n` +
          (isOffline
            ? `**${this.client.emoji?.dot || "•"} Drop Reason:** \`${reason || "Connection closed / unreachable"}\`\n`
            : `**${this.client.emoji?.dot || "•"} Gateway Ping:** \`${Math.round(this.client.ws?.ping || 0)} ms\`\n`) +
          `**${this.client.emoji?.dot || "•"} Operational Fleet:** \`${connectedCount}/${totalCount} Nodes Online\`\n` +
          `**${this.client.emoji?.dot || "•"} Event Time:** <t:${Math.floor(Date.now() / 1000)}:F> (<t:${Math.floor(Date.now() / 1000)}:R>)`
        )
        .addFields(
          { name: "📡 Target Node", value: `\`${name}\``, inline: true },
          { name: "⚡ Health Status", value: isOffline ? "`Offline` 🔴" : "`Online` 🟢", inline: true },
          { name: "🕒 Logged At", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
        )
        .setFooter({
          text: isOffline ? "Failover Engine Engaged • Audio Rerouted" : "Health Check Passed • Audio Pipeline Ready",
          iconURL: this.client.user?.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      if (files.length > 0) {
        embed.setImage(`attachment://${alertName}`);
      }

      await channel.send({
        content: isOffline
          ? `⚠️ <@${this.alertUserId}> **Audio Node Offline Alert!**`
          : `🟢 <@${this.alertUserId}> **Audio Node Restored Online!**`,
        embeds: [embed],
        files,
        allowedMentions: { users: [this.alertUserId] },
      });

      this.client.logger?.log(
        `[AudioAlert] Sent ${isOffline ? "OFFLINE" : "ONLINE"} alert for node "${name}" to channel ${this.alertChannelId}${reason ? ` (${reason})` : ""}`,
        isOffline ? "warn" : "ready"
      );
    } catch (err) {
      this.client.logger?.log(`[AudioStatus] Failed to send alert: ${err.message}`, "warn");
    }
  }

  updateStatusDebounced() {
    if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.updateStatus().catch(() => {});
    }, 3_000);
  }

  async getStatusChannel() {
    if (!this.statusChannelId) return null;
    try {
      const channel = this.client.channels.cache.get(this.statusChannelId) || 
                      await this.client.channels.fetch(this.statusChannelId).catch(() => null);
      return channel && channel.isTextBased() ? channel : null;
    } catch {
      return null;
    }
  }

  async getAlertChannel() {
    if (!this.alertChannelId) return null;
    try {
      const channel = this.client.channels.cache.get(this.alertChannelId) || 
                      await this.client.channels.fetch(this.alertChannelId).catch(() => null);
      return channel && channel.isTextBased() ? channel : null;
    } catch {
      return null;
    }
  }

  async getChannel() {
    return this.getStatusChannel();
  }

  async updateStatus() {
    const channel = await this.getStatusChannel();
    if (!channel) return;

    const nodes = this.client.manager?.shoukaku?.nodes 
      ? [...this.client.manager.shoukaku.nodes.values()] 
      : [];

    if (!nodes.length) return;

    const connectedNodes = nodes.filter((n) => n.state === 1);
    const isOnline = connectedNodes.length > 0;
    const totalPlayers = nodes.reduce((acc, n) => acc + (n.stats?.players || 0), 0);
    const totalPlaying = nodes.reduce((acc, n) => acc + (n.stats?.playingPlayers || 0), 0);
    const totalMemory = nodes.reduce((acc, n) => acc + (n.stats?.memory?.used || 0), 0);

    const all = [];

    for (const node of nodes) {
      const isConnected = node.state === 1;
      const color = isConnected ? "+" : "-";

      const info = [];
      info.push(`${color} Node          :: ${node.name}`);
      info.push(`${color} Status        :: ${isConnected ? "Connected [🟢]" : "Disconnected [🔴]"}`);

      if (isConnected && node.stats) {
        info.push(`${color} Players       :: ${node.stats.playingPlayers || 0}/${node.stats.players || 0}`);
        info.push(`${color} Uptime        :: ${formatDuration(node.stats.uptime)}`);
        info.push(`${color} Cores         :: ${node.stats.cpu?.cores || 1} Core(s)`);
        info.push(
          `${color} Memory Usage  :: ${prettyBytes(node.stats.memory?.used || 0)}/${prettyBytes(
            node.stats.memory?.reservable || node.stats.memory?.allocated || 0
          )}`
        );
        info.push(
          `${color} System Load   :: ${(Math.round((node.stats.cpu?.systemLoad || 0) * 100) / 100).toFixed(2)}%`
        );
        info.push(
          `${color} Engine Load   :: ${(Math.round((node.stats.cpu?.lavalinkLoad || 0) * 100) / 100).toFixed(2)}%`
        );
      }

      all.push(info.join("\n"));
    }

    const bannerPath = isOnline ? ONLINE_BANNER_PATH : OFFLINE_BANNER_PATH;
    const bannerName = isOnline ? ONLINE_BANNER_NAME : OFFLINE_BANNER_NAME;
    const files = fs.existsSync(bannerPath)
      ? [new AttachmentBuilder(bannerPath, { name: bannerName })]
      : [];

    const overviewText = [
      `### ${this.client.emoji?.music || "🎵"} Audio Nodes Monitor`,
      `**${this.client.emoji?.dot || "•"} Fleet Status:** ${isOnline ? "`Operational` 🟢" : "`Degraded / Outage` 🔴"}`,
      `**${this.client.emoji?.dot || "•"} Online Nodes:** \`${connectedNodes.length}/${nodes.length} Connected\``,
      `**${this.client.emoji?.dot || "•"} Active Players:** \`${totalPlayers} total (${totalPlaying} playing)\``,
      `**${this.client.emoji?.dot || "•"} Memory Used:** \`${prettyBytes(totalMemory)}\``,
      `**${this.client.emoji?.dot || "•"} Latency:** \`${Math.round(this.client.ws?.ping || 0)} ms\``,
      `**${this.client.emoji?.dot || "•"} Last Synced:** <t:${Math.floor(Date.now() / 1000)}:R>`,
    ].join("\n");

    const chunked = arrayChunker(all, 8);
    const statusEmbeds = chunked.map((data, index) => {
      const embed = new EmbedBuilder()
        .setColor(isOnline ? (this.client.color || "#35C47C") : "#ED4245")
        .setAuthor({
          name: `${this.client.user?.username || "TOGETHER"} • Audio Status Monitor`,
          iconURL: this.client.user?.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`${index === 0 ? `${overviewText}\n\n` : ""}\`\`\`diff\n${data.join("\n\n")}\`\`\``)
        .setFooter({
          text: `${this.client.user?.username || "TOGETHER"} • Auto-refreshing every 60s • ${connectedNodes.length}/${nodes.length} Nodes Online`,
          iconURL: this.client.user?.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp(Date.now());

      if (index === 0 && files.length > 0) {
        embed.setImage(`attachment://${bannerName}`);
      }

      return embed;
    });

    // Locate or create message
    if (!this.statusMessage) {
      const recentMessages = await channel.messages.fetch({ limit: 10 }).catch(() => null);
      if (recentMessages) {
        this.statusMessage = recentMessages.find(
          (m) => m.author.id === this.client.user.id && m.embeds.some((e) => e.author?.name?.includes("Status Monitor"))
        );
      }
    }

    if (this.statusMessage) {
      try {
        await this.statusMessage.edit({ embeds: statusEmbeds, files });
      } catch (err) {
        // If message was deleted, send new one
        if (err.code === 10008 || err.message?.includes("Unknown Message")) {
          this.statusMessage = await channel.send({ embeds: statusEmbeds, files }).catch(() => null);
        }
      }
    } else {
      this.statusMessage = await channel.send({ embeds: statusEmbeds, files }).catch(() => null);
    }

    this.client.logger?.log(
      `[AudioStatus] Synced status embed: ${connectedNodes.length}/${nodes.length} nodes online (${totalPlayers} players)`,
      "info"
    );
  }
}

let monitorInstance = null;

function initAudioStatus(client) {
  if (!monitorInstance) {
    monitorInstance = new LavalinkStatusMonitor(client);
    monitorInstance.init();
  }
  return monitorInstance;
}

const initLavalinkStatus = initAudioStatus;
const AudioStatusMonitor = LavalinkStatusMonitor;

module.exports = {
  AudioStatusMonitor,
  initAudioStatus,
  getAudioStatusMonitor: () => monitorInstance,
  LavalinkStatusMonitor,
  initLavalinkStatus,
  getLavalinkStatusMonitor: () => monitorInstance,
};
