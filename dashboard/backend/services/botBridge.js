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

  async getLavalinkNodes() {
    try {
      const resp = await axios.get(`${this.apiUrl}/api/lavalink-nodes`, { timeout: 4000 });
      return resp.data;
    } catch {
      return {
        totalNodes: 1,
        onlineNodes: 1,
        gatewayPing: 24,
        nodes: [{
          name: "Native-Opus-Cluster",
          state: 1,
          status: "ONLINE",
          players: 0,
          playingPlayers: 0,
          uptime: "00:00:00",
          uptimeMs: 0,
          memory: { used: 128, allocated: 256, free: 128, reservable: 350 },
          cpu: { cores: 4, systemLoad: 12.5, lavalinkLoad: 4.8 },
          frameStats: { sent: 12500, nulled: 0, deficit: 0 },
          ping: 24
        }]
      };
    }
  }

  async getDiscordLogs() {
    try {
      const resp = await axios.get(`${this.apiUrl}/api/discord-logs`, { timeout: 4000 });
      return resp.data?.logs || [];
    } catch {
      return [];
    }
  }

  async sendDiscordLog(message) {
    try {
      const resp = await axios.post(`${this.apiUrl}/api/send-discord-log`, { message }, { timeout: 4000 });
      return resp.data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async getLeaderboard(params = {}) {
    try {
      const resp = await axios.get(`${this.apiUrl}/api/leaderboard`, { 
        params,
        timeout: 5000 
      });
      return resp.data || { leaderboard: [], totalUsers: 0 };
    } catch {
      return null;
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

  async getGuildPlayer(guildId, userId = null) {
    if (!guildId) return null;
    try {
      // 1. Primary: query /api/player/:guildId
      const resp = await axios.get(
        `${this.apiUrl}/api/player/${encodeURIComponent(guildId)}?userId=${encodeURIComponent(userId || '')}`,
        { timeout: 4000 }
      );
      const data = resp.data;
      if (!data) return null;

      const hasTrack = Boolean(
        data.title &&
        data.title !== "Waiting for Music..." &&
        data.title !== "Connected in Voice" &&
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
        uri: data.uri || "",
        isStream: Boolean(data.isStream),
        loop: data.loop || "none",
        autoplay: Boolean(data.autoplay),
        voiceChannel: data.voiceChannel || null,
        textChannel: data.textChannel || null,
        listeners: typeof data.listeners === "number" ? data.listeners : (typeof data.audience === "number" ? data.audience : 0),
        audience: typeof data.audience === "number" ? data.audience : (typeof data.listeners === "number" ? data.listeners : 0),
        audienceMembers: Array.isArray(data.audienceMembers) ? data.audienceMembers : [],
        requester: data.requester || null,
        requesterAvatar: data.requesterAvatar || null,
        requesterId: data.requesterId || null,
        userInVoice: Boolean(data.userInVoice),
        userVoiceChannelId: data.userVoiceChannelId || null,
        userInSameVoice: Boolean(data.userInSameVoice),
        timestamp: data.timestamp || Date.now(),
        current: hasTrack
          ? {
              title: data.title,
              author: data.author || "Together Music",
              thumbnail: data.thumbnail || "/logo.png",
              duration: data.duration || 0,
              position: data.position || 0,
              uri: data.uri || "",
              isStream: Boolean(data.isStream),
              requester: data.requester || null,
              requesterAvatar: data.requesterAvatar || null,
              requesterId: data.requesterId || null
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
          const hasTrack = Boolean(
            active.title &&
            active.title !== "Waiting for Music..." &&
            active.title !== "Connected in Voice" &&
            !active.title.startsWith("No Music Playing") &&
            active.title !== "TOGETHER Standby"
          );

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
            voiceChannel: active.voiceChannelName || "Voice Channel",
            listeners: typeof active.listeners === "number" ? active.listeners : 0,
            audience: typeof active.listeners === "number" ? active.listeners : 0,
            audienceMembers: [],
            timestamp: Date.now(),
            current: hasTrack ? {
              title: active.title,
              author: active.author,
              thumbnail: active.thumbnail || "/logo.png",
              duration: active.duration || 0,
              position: active.position || 0
            } : null,
            queue: []
          };
        }
      } catch {}
      return null;
    }
  }

  async getProfileBannerStream(userId) {
    return axios.get(`${this.apiUrl}/api/profile-banner/${encodeURIComponent(userId)}`, {
      responseType: "stream",
      timeout: 8000
    });
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

  async getGuildChannels(guildId) {
    if (!guildId) return { textChannels: [], voiceChannels: [], roles: [] };
    try {
      const resp = await axios.get(`${this.apiUrl}/api/guild-channels/${encodeURIComponent(guildId)}`, { timeout: 4000 });
      return {
        textChannels: Array.isArray(resp.data?.textChannels) ? resp.data.textChannels : [],
        voiceChannels: Array.isArray(resp.data?.voiceChannels) ? resp.data.voiceChannels : [],
        roles: Array.isArray(resp.data?.roles) ? resp.data.roles : []
      };
    } catch {
      return { textChannels: [], voiceChannels: [], roles: [] };
    }
  }

  async checkVoterStatus(userId) {
    if (!userId) return { allowed: false, isOwner: false, isVoter: false };
    if (userId === "780345293237125152" || config.ownerIds.includes(userId)) {
      return { allowed: true, isOwner: true, isVoter: true };
    }
    try {
      const resp = await axios.get(`${this.apiUrl}/api/check-vote?userId=${encodeURIComponent(userId)}`, { timeout: 4000 });
      return resp.data || { allowed: false, isOwner: false, isVoter: false };
    } catch {
      return { allowed: false, isOwner: false, isVoter: false };
    }
  }

  async searchTracks(query, guildId = "", userId = "") {
    if (!query || query.trim().length < 2) return { success: true, tracks: [] };
    try {
      const resp = await axios.get(
        `${this.apiUrl}/api/search?q=${encodeURIComponent(query.trim())}&guildId=${encodeURIComponent(guildId)}&userId=${encodeURIComponent(userId)}`,
        { timeout: 5000 }
      );
      return resp.data || { success: true, tracks: [] };
    } catch (err) {
      console.warn(`[botBridge] searchTracks error:`, err.message);
      return { success: false, tracks: [] };
    }
  }

  async getServerList() {
    try {
      const resp = await axios.get(`${this.apiUrl}/api/server-list`, { timeout: 6000 });
      return resp.data || { success: true, guilds: [] };
    } catch (err) {
      console.warn(`[botBridge] getServerList error:`, err.message);
      return { success: false, guilds: [] };
    }
  }

  async leaveServer(guildId) {
    if (!guildId) throw new Error("Missing guildId");
    const resp = await axios.post(`${this.apiUrl}/api/leave-server`, { guildId }, { timeout: 8000 });
    return resp.data;
  }

  async reloadCommands() {
    const resp = await axios.post(`${this.apiUrl}/api/reload-commands`, {}, { timeout: 10000 });
    return resp.data;
  }

  async sendDashboardLog({ event, user, guildId, guildName, action, details, color }) {
    try {
      await axios.post(
        `${this.apiUrl}/api/dashboard-log`,
        {
          event,
          user,
          guildId,
          guildName,
          action,
          details,
          color,
          timestamp: new Date().toISOString()
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 4000
        }
      );
    } catch (err) {
      // Non-blocking log delivery
    }
  }
}

module.exports = new BotBridgeService();
