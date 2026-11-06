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

  async getGuildPlayer(guildId) {
    try {
      const resp = await axios.get(`${this.apiUrl}/api/queue?guild=${encodeURIComponent(guildId)}`, { timeout: 4000 });
      return resp.data;
    } catch {
      return null;
    }
  }

  async sendPlayerAction(guildId, action, payload = {}) {
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
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message || "Failed to dispatch player action");
    }
  }
}

module.exports = new BotBridgeService();

