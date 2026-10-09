const { EventEmitter } = require("events");
const NativePlayer = require("./NativePlayer");
const { TogetherResolver } = require("./TogetherResolver");

class NativePlayerManager extends EventEmitter {
  constructor(client) {
    super();
    this.client = client;
    this.players = new Map();

    const nativeNode = {
      name: "Native-TOGETHER",
      state: 1, // 1 = CONNECTED in Shoukaku
      get stats() {
        return {
          players: client.manager?.players?.size || 0,
          playingPlayers: [...(client.manager?.players?.values() || [])].filter(p => p.playing).length,
          uptime: Math.floor(process.uptime() * 1000),
          memory: {
            free: 1024 * 1024 * 1024,
            used: process.memoryUsage().heapUsed,
            allocated: process.memoryUsage().heapTotal,
            reservable: 2 * 1024 * 1024 * 1024
          },
          cpu: { cores: 8, systemLoad: 0.05, lavalinkLoad: 0.02 }
        };
      }
    };

    const shoukakuEmitter = new EventEmitter();
    this.shoukaku = Object.assign(shoukakuEmitter, {
      nodes: new Map([["Native-TOGETHER", nativeNode]]),
      getIdealNode: () => nativeNode,
    });
  }

  async createPlayer(options = {}) {
    if (!options.guildId) throw new Error("Guild ID is required to create a player");

    let player = this.players.get(options.guildId);
    if (player) {
      const isDead = !player.connection ||
        player.connection.state?.status === "destroyed";
      if (isDead) {
        try { player.destroy(); } catch {}
        player = null;
      } else {
        if (options.voiceId && player.voiceId !== options.voiceId) {
          await player.setVoiceChannel(options.voiceId);
        }
        if (options.textId && player.textId !== options.textId) {
          player.textId = options.textId;
        }
        return player;
      }
    }

    player = new NativePlayer(this, options);
    this.players.set(options.guildId, player);
    this.emit("playerCreate", player);
    return player;
  }

  getPlayer(guildId) {
    return this.players.get(guildId);
  }

  async search(query, options = {}) {
    if (!query || typeof query !== "string") {
      return { type: "SEARCH", loadType: "SEARCH", tracks: [] };
    }

    let cleanQuery = query.trim();
    // Strip Lavalink engine prefixes like ytsearch:, ytmsearch:, etc.
    cleanQuery = cleanQuery.replace(/^(ytsearch|ytmsearch|scsearch|spsearch|dzsearch|sprec):/i, "").trim();

    const result = await TogetherResolver.resolve(cleanQuery, options);

    return {
      type: result.type,
      loadType: result.type,
      playlistName: result.playlistName,
      tracks: result.tracks || []
    };
  }

  destroyPlayer(guildId) {
    const player = this.players.get(guildId);
    if (player) {
      player.destroy();
    }
  }
}

module.exports = NativePlayerManager;
