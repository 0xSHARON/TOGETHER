const axios = require("axios");
const config = require("../config");

class BotBridgeService {
  constructor() {
    this.apiUrl = config.botApiUrl;
    this.secret = config.botApiSecret;
  }

  async getBotInfo() {
    try {
      const resp = await axios.get(`${this.apiUrl}/api/bot-info`, { timeout: 4000 });
      return resp.data;
    } catch (err) {
      return {
        bot: { name: "TOGETHER", ping: 0, totalGuilds: 0, totalUsers: 0 },
        error: "Bot offline or unreachable"
      };
    }
  }

  async getActiveSessions() {
    try {
      const resp = await axios.get(`${this.apiUrl}/api/active-sessions`, { timeout: 4000 });
      return resp.data?.sessions || [];
    } catch {
      return [];
    }
  }

  async getBotGuildIds() {
    try {
      const resp = await axios.get(`${this.apiUrl}/api/bot-guilds`, { timeout: 4000 });
      if (Array.isArray(resp.data?.guildIds)) {
        return new Set(resp.data.guildIds);
      }
    } catch {}
    return new Set();
  }

  async getGuildPlayer(guildId) {
    if (!guildId) return null;
    try {
      // 1. Primary: query /api/player/:guildId
      const resp = await axios.get(`${this.apiUrl}/api/player/${encodeURIComponent(guildId)}`, { timeout: 4000 });
      const data = resp.data;
      if (!data) return null;

      const hasTrack = Boolean(
        data.title &&
        data.title !== "Waiting for Music..." &&
        !data.title.startsWith("No Music Playing") &&
        data.title !== "TOGETHER Standby"
      );

      return {
        guildId: data.guildId,
        guildName: data.guildName || `Server (${guildId})`,
        playing: Boolean(data.playing),
        paused: Boolean(data.paused),
        volume: typeof data.volume === "number" ? data.volume : 80,
        position: data.position || 0,
        duration: data.duration || 0,
        loop: data.loop || "none",
        autoplay: Boolean(data.autoplay),
        current: hasTrack
          ? {
              title: data.title,
              author: data.author || "Together Music",
              thumbnail: data.thumbnail || "/logo.png",
              duration: data.duration || 0,
              position: data.position || 0
            }
          : null,
        queue: Array.isArray(data.queue) ? data.queue : []
      };
    } catch (err) {
      // Fallback: try active sessions query
      try {
        const sessions = await this.getActiveSessions();
        const active = sessions.find((s) => s.guildId === guildId);
        if (active) {
          return {
            guildId: active.guildId,
            guildName: active.guildName,
            playing: Boolean(active.playing),
            paused: Boolean(active.paused),
            volume: active.volume || 80,
            position: active.position || 0,
            duration: active.duration || 0,
            loop: active.loop || "none",
            autoplay: Boolean(active.autoplay),
            current: {
              title: active.title,
              author: active.author,
              thumbnail: active.thumbnail || "/logo.png",
              duration: active.duration || 0,
              position: active.position || 0
            },
            queue: []
          };
        }
      } catch {}
      return null;
    }
  }

  async sendPlayerAction(guildId, action, payload = {}) {
    try {
      // Try dedicated control route first
      const resp = await axios.post(
        `${this.apiUrl}/api/player/${encodeURIComponent(guildId)}/control`,
        {
          action,
          position: payload.position,
          value: payload.value,
          query: payload.query
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-dashboard-secret": this.secret
          },
          timeout: 6000
        }
      );
      return resp.data;
    } catch (err) {
      // Fallback to /api/player-action
      try {
        const resp = await axios.post(
          `${this.apiUrl}/api/player-action`,
          {
            guildId,
            action,
            ...payload
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-dashboard-secret": this.secret
            },
            timeout: 6000
          }
        );
        return resp.data;
      } catch (innerErr) {
        throw new Error(err.response?.data?.error || err.message || "Failed to dispatch player action");
      }
    }
  }
}

module.exports = new BotBridgeService();
