const {
  joinVoiceChannel,
  createAudioPlayer,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState
} = require("@discordjs/voice");
const { ChannelType, StageInstancePrivacyLevel } = require("discord.js");
const NativeQueue = require("./NativeQueue");
const TogetherStreamer = require("./TogetherStreamer");

class NativePlayer {
  constructor(manager, options = {}) {
    this.manager = manager;
    this.client = manager.client;
    this.guildId = options.guildId;
    this.voiceId = options.voiceId;
    this.textId = options.textId;
    this.volume = typeof options.volume === "number" ? options.volume : 80;
    this.paused = false;
    this.playing = false;
    this.loop = "none";
    this.data = new Map();
    if (options.requester) {
      this.data.set("lastRequester", options.requester);
    }
    this.queue = new NativeQueue();
    
    this.options = options;
    this._playbackStartTime = 0;
    this._seekOffset = 0;
    this._currentFfmpeg = null;
    this._currentResource = null;
    this._currentStreamUrl = null;
    this._filters = {};
    this._filterString = "";
    this.audioPlayer = null;
    this.connection = null;
    this.subscription = null;

    // Discord Voice connection & audio player
    this._initConnection(options);

    // Shoukaku compatibility object
    const self = this;
    this.shoukaku = {
      get position() {
        return self.position;
      },
      get paused() {
        return self.paused;
      },
      node: {
        name: "Native-TOGETHER",
        state: 1
      },
      seekTo: async (time) => self.seek(time),
      move: async () => true,
      resume: async () => self.pause(false),
      playTrack: async () => true,
      setFilters: async (filters) => self.setFilters(filters),
      clearFilters: async () => self.clearFilters()
    };
  }

  _initConnection(options = {}) {
    const guild = this.client.guilds.cache.get(this.guildId);
    if (!guild) throw new Error(`Guild ${this.guildId} not found`);

    const targetChannel = guild.channels.cache.get(this.voiceId);
    const isStage = targetChannel?.type === ChannelType.GuildStageVoice;

    if (this.connection) {
      try {
        this.connection.destroy();
      } catch {}
      this.connection = null;
    }

    this.connection = joinVoiceChannel({
      channelId: this.voiceId,
      guildId: this.guildId,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: isStage ? false : (options.deaf !== false),
      selfMute: false
    });

    this.connection.on("error", (err) => {
      this.manager.client.logger?.log(`[NativePlayer] Connection error in ${this.guildId}: ${err.message}`, "debug");
    });

    this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(this.connection, VoiceConnectionStatus.Signalling, 5000),
          entersState(this.connection, VoiceConnectionStatus.Connecting, 5000)
        ]);
      } catch {
        if (this.connection && this.connection.state?.status !== VoiceConnectionStatus.Destroyed) {
          try {
            this.connection.rejoin();
          } catch {}
        }
      }
    });

    if (!this.audioPlayer) {
      this.audioPlayer = createAudioPlayer();
      this._setupEventListeners();
    }

    this.subscription = this.connection.subscribe(this.audioPlayer);

    if (isStage && targetChannel) {
      this.handleStageChannel(targetChannel);
    }
  }

  get position() {
    if (!this.playing || this._playbackStartTime === 0) return 0;
    if (this.paused) return this._seekOffset;
    return this._seekOffset + (Date.now() - this._playbackStartTime);
  }

  search(query, options = {}) {
    return this.manager.search(query, options);
  }

  _setupEventListeners() {
    this.audioPlayer.on(AudioPlayerStatus.Idle, async () => {
      this._cleanupFfmpeg();
      const finishedTrack = this.queue.current;
      const elapsedMs = this.position;
      this.playing = false;

      if (!finishedTrack) return;

      const isManualSkip = Boolean(this._isSkipping);
      this._isSkipping = false;

      // Detect premature stream termination (e.g. YouTube stream drop)
      const durationMs = finishedTrack.length || finishedTrack.duration || 0;
      const prematurelyEnded = !isManualSkip && durationMs > 30000 && elapsedMs > 0 && elapsedMs < Math.min(durationMs * 0.85, durationMs - 15000);

      if (prematurelyEnded) {
        const retries = (this._retryCount || 0) + 1;
        this._retryCount = retries;
        if (retries <= 2) {
          this.manager.client.logger?.log(
            `[NativePlayer] Premature stream end detected (${Math.round(elapsedMs / 1000)}s / ${Math.round(durationMs / 1000)}s) for "${finishedTrack.title}". Reconnecting... (attempt ${retries}/2)`,
            "warn"
          );
          this._seekOffset = elapsedMs;
          await this.play(finishedTrack);
          return;
        }
      }
      this._retryCount = 0;

      // Handle Loop Modes
      if (this.loop === "track") {
        this.play(finishedTrack);
        return;
      } else if (this.loop === "queue") {
        this.queue.push(finishedTrack);
      } else {
        this.queue.previous = finishedTrack;
      }

      this.manager.emit("playerEnd", this, finishedTrack);

      if (this.queue.length > 0) {
        await this.play();
      } else {
        // If autoplay is enabled, await attemptAutoplay before declaring playerEmpty
        if (this.data.get("autoplay")) {
          try {
            const { attemptAutoplay } = require("../utils/playerUtils");
            await attemptAutoplay(this.manager.client, this);
          } catch (e) {
            this.manager.client.logger?.log(`[Autoplay] Hook error in Idle: ${e.message}`, "error");
          }
        }

        if (this.queue.length > 0) {
          await this.play();
        } else {
          this.queue.current = null;
          this.manager.emit("playerEmpty", this);
        }
      }
    });

    this.audioPlayer.on("error", (error) => {
      this.manager.client.logger?.log(`[NativePlayer] AudioPlayer error in ${this.guildId}: ${error.message}`, "error");
      this.manager.emit("playerError", this, error);
      this.skip().catch(() => {});
    });

    this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(this.connection, VoiceConnectionStatus.Signalling, 5000),
          entersState(this.connection, VoiceConnectionStatus.Connecting, 5000)
        ]);
      } catch {
        this.destroy().catch(() => {});
      }
    });
  }

  _cleanupFfmpeg() {
    if (this._currentFfmpeg) {
      try {
        this._currentFfmpeg.kill("SIGKILL");
      } catch {}
      this._currentFfmpeg = null;
    }
  }

  async play(track = null) {
    if (track) {
      this.queue.current = track;
    } else if (this.queue.length > 0) {
      this.queue.current = this.queue.shift();
    } else {
      this.queue.current = null;
      this.manager.emit("playerEmpty", this);
      return;
    }

    const current = this.queue.current;
    if (!current) return;

    if (!current.requester && this.data.get("lastRequester")) {
      current.requester = this.data.get("lastRequester");
    } else if (current.requester) {
      this.data.set("lastRequester", current.requester);
    }

    this._cleanupFfmpeg();
    this.playing = true;
    this.paused = false;
    this._playbackStartTime = Date.now();
    this._seekOffset = 0;

    // Ensure Voice Connection is alive, healthy and Ready
    try {
      if (
        !this.connection ||
        this.connection.state?.status === VoiceConnectionStatus.Destroyed
      ) {
        this._initConnection(this.options);
      } else if (this.connection.state?.status === VoiceConnectionStatus.Disconnected) {
        try { this.connection.rejoin(); } catch {}
      }

      const stageGuild = this.client.guilds.cache.get(this.guildId);
      const stageCh = stageGuild?.channels?.cache?.get(this.voiceId);
      const isStage = stageCh?.type === ChannelType.GuildStageVoice;

      if (isStage && stageCh) {
        await this.handleStageChannel(stageCh);
      }

      if (this.connection?.state?.status !== VoiceConnectionStatus.Ready) {
        await entersState(this.connection, VoiceConnectionStatus.Ready, 7000).catch(() => {});
      }
    } catch {}

    try {
      // 1. Resolve Audio Stream URL via Together Engine
      const query = current.searchQuery || current.uri || `${current.title} - ${current.author}`;
      const streamUrl = await TogetherStreamer.getStreamUrl(query);
      this._currentStreamUrl = streamUrl;

      // 2. Stream Audio via FFmpeg to Discord Voice Resource
      const { resource, ffmpeg } = TogetherStreamer.createStreamResource(streamUrl, {
        volume: this.volume,
        seek: this._seekOffset,
        filterString: this._filterString,
        logger: this.manager.client.logger
      });

      this._currentFfmpeg = ffmpeg;
      this._currentResource = resource;

      if (!this.subscription) {
        this.subscription = this.connection.subscribe(this.audioPlayer);
      }

      this.audioPlayer.play(resource);
      this.manager.emit("playerStart", this, current);

      // Force Discord Voice Gateway Opcode 5 (Speaking: 1)
      if (this.connection?.state?.networking?.state?.connectionData) {
        this.connection.state.networking.state.connectionData.speaking = false;
        this.connection.setSpeaking(true);
      }

      // 3. Next-Track Pre-buffering (Zero-gap transition)
      if (this.queue.length > 0 && this.queue[0]) {
        TogetherStreamer.prefetch(this.queue[0]);
      }
    } catch (err) {
      this.manager.client.logger?.log(`[NativePlayer] Failed to stream "${current.title}": ${err.message}`, "error");
      this.manager.emit("playerError", this, err);
      // Auto-skip unplayable track
      setTimeout(() => this.skip(), 1000);
    }
  }

  async pause(pauseBool = true) {
    if (pauseBool) {
      this._seekOffset = this.position;
      this.audioPlayer.pause();
      this.paused = true;
      this.playing = false;
    } else {
      this._playbackStartTime = Date.now();
      this.audioPlayer.unpause();
      this.paused = false;
      this.playing = true;
    }
    return this;
  }

  async resume() {
    return this.pause(false);
  }

  async skip() {
    this._isSkipping = true;
    this._cleanupFfmpeg();
    this.audioPlayer.stop(true);
    return this;
  }

  async stop() {
    this.queue.clear();
    this.playing = false;
    this.paused = false;
    this._cleanupFfmpeg();
    this.audioPlayer.stop(true);
    return this;
  }

  async seek(positionMs) {
    if (!this.queue.current || !this._currentStreamUrl) return this;
    
    this._cleanupFfmpeg();
    this._seekOffset = Math.max(0, positionMs);
    this._playbackStartTime = Date.now();

    const { resource, ffmpeg } = TogetherStreamer.createStreamResource(this._currentStreamUrl, {
      volume: this.volume,
      seek: this._seekOffset
    });

    this._currentFfmpeg = ffmpeg;
    this._currentResource = resource;
    this.audioPlayer.play(resource);
    return this;
  }

  setFilters(filters = {}) {
    this._filters = filters;
    const filterParts = [];

    // 1. Rotation (8D Audio)
    if (filters.rotation) {
      const hz = filters.rotation.rotationHz || 0.2;
      filterParts.push(`apulsator=hz=${hz}`);
    }

    // 2. Equalizer (Bass / Treble)
    if (filters.equalizer && Array.isArray(filters.equalizer)) {
      const bassGain = filters.equalizer.find((b) => b.band === 0)?.gain || 0;
      if (bassGain >= 0.5) {
        filterParts.push("bass=g=12:f=80:w=0.5");
      } else if (bassGain > 0) {
        filterParts.push("bass=g=7:f=110:w=0.6");
      }
      const trebleGain = filters.equalizer.find((b) => b.band >= 10)?.gain || 0;
      if (trebleGain > 0) {
        filterParts.push("treble=g=8");
      }
    }

    // 3. Timescale (Nightcore, Daycore, Chipmunk, China)
    if (filters.timescale) {
      const { speed = 1.0, pitch = 1.0 } = filters.timescale;
      if (pitch !== 1.0 || speed !== 1.0) {
        filterParts.push(`asetrate=48000*${pitch},aresample=48000,atempo=${(speed / pitch).toFixed(3)}`);
      }
    }

    // 4. Reverb (Slowed + Reverb)
    if (filters.reverb) {
      filterParts.push("aecho=0.8:0.88:60:0.4");
    }

    // 5. Tremolo
    if (filters.tremolo) {
      filterParts.push("tremolo=f=10:d=0.3");
    }

    // 6. Karaoke
    if (filters.karaoke) {
      filterParts.push("pan=stereo|c0=c0-c1|c1=c1-c0");
    }

    // 7. Lowpass / Soft
    if (filters.lowPass) {
      filterParts.push("lowpass=f=1200");
    }

    // 8. Vibrato
    if (filters.vibrato) {
      const freq = filters.vibrato.frequency || 4.0;
      const depth = filters.vibrato.depth || 0.75;
      filterParts.push(`vibrato=f=${freq}:d=${depth}`);
    }

    this._filterString = filterParts.join(",");

    // Mid-song hot-rebind with the new audio filter
    if (this.playing && this._currentStreamUrl) {
      const pos = this.position;
      this._cleanupFfmpeg();
      const { resource, ffmpeg } = TogetherStreamer.createStreamResource(this._currentStreamUrl, {
        volume: this.volume,
        seek: pos,
        filterString: this._filterString,
      });
      this._currentFfmpeg = ffmpeg;
      this._currentResource = resource;
      this._seekOffset = pos;
      this._playbackStartTime = Date.now();
      this.audioPlayer.play(resource);
    }

    return true;
  }

  clearFilters() {
    this._filters = {};
    this._filterString = "";
    if (this.playing && this._currentStreamUrl) {
      const pos = this.position;
      this._cleanupFfmpeg();
      const { resource, ffmpeg } = TogetherStreamer.createStreamResource(this._currentStreamUrl, {
        volume: this.volume,
        seek: pos,
      });
      this._currentFfmpeg = ffmpeg;
      this._currentResource = resource;
      this._seekOffset = pos;
      this._playbackStartTime = Date.now();
      this.audioPlayer.play(resource);
    }
    return true;
  }

  setVolume(volume) {
    const vol = Math.max(0, Math.min(200, volume));
    this.volume = vol;
    if (this._currentResource?.volume) {
      this._currentResource.volume.setVolume(vol / 100);
    }
    return this;
  }

  async setVoiceChannel(voiceId) {
    if (!voiceId) return this;
    if (
      this.voiceId === voiceId &&
      this.connection &&
      this.connection.state?.status === VoiceConnectionStatus.Ready
    ) {
      return this;
    }
    this.voiceId = voiceId;
    this._initConnection(this.options);
    return this;
  }

  async handleStageChannel(channel) {
    if (!channel || channel.type !== ChannelType.GuildStageVoice) return;
    const guild = channel.guild;

    try {
      if (!channel.stageInstance) {
        await channel.createStageInstance({
          topic: "TOGETHER • Music",
          privacyLevel: StageInstancePrivacyLevel.GuildOnly,
          sendStartNotification: false
        }).catch(() => {});
      }
    } catch {}

    let me = guild?.members?.me;
    // Wait until bot's voice state is registered in channel (up to 8s)
    if (typeof guild?.members?.fetchMe === "function") {
      for (let i = 0; i < 20; i++) {
        if (me?.voice?.channelId) break;
        await new Promise(r => setTimeout(r, 400));
        try { me = await guild.members.fetchMe(); } catch {}
      }
    }

    if (!me?.voice) return;

    try {
      if (me.voice?.deaf) {
        await me.voice.setDeaf(false).catch(() => {});
      }
      if (me.voice?.setSuppressed) {
        await me.voice.setSuppressed(false);
      }
    } catch {
      try {
        await me.voice?.setRequestToSpeak(true);
      } catch {}
    }

    // Force Speaking Opcode re-announcement once unsuppressed
    if (this.connection?.state?.networking?.state?.connectionData) {
      this.connection.state.networking.state.connectionData.speaking = false;
      if (this.playing) {
        this.connection.setSpeaking(true);
      }
    }
  }

  async destroy() {
    this.stop();
    try {
      this.connection.destroy();
    } catch {}
    this.manager.players.delete(this.guildId);
    this.manager.emit("playerDestroy", this);
    return this;
  }
}

module.exports = NativePlayer;
