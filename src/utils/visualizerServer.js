/**
 * visualizerServer.js  —  TOGETHER Discord Bot HTTP & 3D Visualizer Server
 * Serves:
 * 1. Root Landing Page (https://together.dpdns.org/): Live server monitoring, commands, features, bot & owner info.
 * 2. 3D Audio Visualizer (https://together.dpdns.org/visualizer/?guild=<id>): Strict per-guild 3D audio stage.
 * 3. Discord Activity RPC Handshake & High-Res Thumbnail Image Proxy.
 */

const http = require("http");
const fs   = require("fs");
const path = require("path");
const { URL } = require("url");

const PUBLIC_ROOT    = path.resolve(__dirname, "../../public");
const VISUALIZER_DIR = path.resolve(__dirname, "../../public/visualizer");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".webp": "image/webp",
};

/**
 * Resolves target guild ID from guildId or voice channelId
 */
function resolveGuildId(client, identifier) {
  if (!identifier) return null;
  const str = String(identifier).trim();
  if (!str || str === "default" || str === "null" || str === "undefined") return null;

  // Direct guild ID match
  if (client?.guilds?.cache?.has(str)) return str;
  // Channel ID lookup
  const channel = client?.channels?.cache?.get(str);
  if (channel?.guild?.id) return channel.guild.id;

  // Check active players for voiceId or guildId match
  if (client?.manager?.players) {
    for (const [gId, p] of client.manager.players.entries()) {
      if (gId === str || p.voiceId === str || p.textId === str) {
        return gId;
      }
    }
  }

  return str;
}

/**
 * Builds current state payload for a specific guild's audio player (STRICT isolation)
 */
function getGuildPlayerState(client, targetId) {
  const guildId = resolveGuildId(client, targetId);
  let player = null;

  if (guildId) {
    // STRICT GUILD LOOKUP: only return player for this exact guild! Never leak other guilds.
    player = client?.manager?.players?.get(guildId);
  } else {
    // No specific guild requested: fallback to the first active playing player
    if (client?.manager?.players?.size) {
      for (const p of client.manager.players.values()) {
        if (p.playing && p.queue?.current) {
          player = p;
          break;
        }
      }
      if (!player) {
        player = client.manager.players.first?.() || Array.from(client.manager.players.values())[0];
      }
    }
  }

  // If no player active in this requested guild
  if (!player) {
    const targetGuild = guildId ? client?.guilds?.cache?.get(guildId) : null;
    const guildName = targetGuild ? targetGuild.name : (guildId ? `Server (${guildId})` : "TOGETHER Standby");
    return {
      guildId: guildId || "none",
      guildName,
      playing: false,
      paused: true,
      title: guildId ? `No Music Playing in ${guildName}` : "Waiting for Music...",
      author: guildId ? "Join a voice channel and use /play in this server" : "Use /play in Discord to stream",
      thumbnail: "/logo.png?v=2",
      position: 0,
      duration: 0,
      loop: "none",
      autoplay: false,
      volume: 80,
      queue: [],
      queueLength: 0,
    };
  }

  const currentGuild = client?.guilds?.cache?.get(player.guildId);
  const guildName = currentGuild?.name || `Server (${player.guildId})`;

  // Handle active track vs upcoming / transitioning track
  let current = player.queue?.current;
  const isTransitioning = Boolean(
    player._isSkipping ||
    player._isLoadingAutoplay ||
    player.data?.get("autoplayInProgress")
  );

  // If current is not set yet, but queue has a song waiting, display upcoming track
  if (!current && player.queue?.length > 0) {
    current = player.queue[0];
  }

  let rawThumb = current?.thumbnail || current?.artworkUrl || (typeof current?.displayThumbnail === "function" ? current.displayThumbnail("hqdefault") : null);
  if (!rawThumb) {
    rawThumb = "/logo.png?v=2";
  } else if (rawThumb.startsWith("http://")) {
    rawThumb = rawThumb.replace(/^http:\/\//, "https://");
  }

  // Determine intelligent title & author during transitions
  let title = current?.title;
  let author = current?.author;

  if (!title) {
    if (isTransitioning || player.data?.get("autoplay")) {
      title = "Loading Next Track...";
      author = "TOGETHER Audio Engine • Autoplay";
    } else {
      title = "Waiting for Music...";
      author = "Use /play in Discord to stream";
    }
  }

  const isActuallyPlaying = Boolean(
    (player.playing && current) ||
    isTransitioning ||
    (current && !player.paused)
  );

  const upcomingQueue = (player.queue || []).slice(0, 25).map((t, idx) => {
    let qThumb = t.thumbnail || t.artworkUrl || t.info?.thumbnail || (typeof t.displayThumbnail === "function" ? t.displayThumbnail("hqdefault") : null);
    if (!qThumb) {
      qThumb = "/logo.png?v=2";
    } else if (qThumb.startsWith("http://")) {
      qThumb = qThumb.replace(/^http:\/\//, "https://");
    }
    return {
      index: idx + 1,
      title: t.title || "Unknown Track",
      author: t.author || "Unknown Artist",
      duration: t.length || t.duration || 0,
      uri: t.uri || "",
      thumbnail: qThumb,
      requester: t.requester ? (t.requester.username || t.requester.tag || t.requester.displayName || "Listener") : "Listener"
    };
  });

  // Resolve voice channel and real audience members
  const voiceChannelObj = currentGuild?.channels?.cache?.get(player.voiceId);
  const voiceChannelName = voiceChannelObj?.name || "Voice Channel";
  const textChannelName = currentGuild?.channels?.cache?.get(player.textId)?.name || "Text Channel";

  let audienceCount = 0;
  const audienceMembers = [];

  if (currentGuild?.voiceStates?.cache) {
    currentGuild.voiceStates.cache.forEach((vs) => {
      if (vs.channelId === player.voiceId && vs.id !== client?.user?.id) {
        const u = client.users.cache.get(vs.id) || vs.member?.user;
        if (u && !u.bot) {
          audienceCount++;
          audienceMembers.push({
            id: u.id,
            username: u.username,
            displayName: vs.member?.displayName || u.displayName || u.username,
            avatar: u.displayAvatarURL ? u.displayAvatarURL({ size: 64 }) : null,
            deaf: Boolean(vs.deaf || vs.selfDeaf),
            mute: Boolean(vs.mute || vs.selfMute)
          });
        }
      }
    });
  } else if (voiceChannelObj?.members) {
    voiceChannelObj.members.forEach((m) => {
      if (!m.user?.bot && m.id !== client?.user?.id) {
        audienceCount++;
        audienceMembers.push({
          id: m.id,
          username: m.user?.username || m.displayName,
          displayName: m.displayName || m.user?.username,
          avatar: m.user?.displayAvatarURL ? m.user.displayAvatarURL({ size: 64 }) : null,
          deaf: Boolean(m.voice?.deaf || m.voice?.selfDeaf),
          mute: Boolean(m.voice?.mute || m.voice?.selfMute)
        });
      }
    });
  }

  // Handle requester object / string / id
  let requesterName = null;
  let requesterAvatar = null;
  let requesterId = null;
  const reqObj = current?.requester || player.data?.get("lastRequester");
  if (reqObj) {
    if (typeof reqObj === "object") {
      requesterName = reqObj.displayName || reqObj.username || reqObj.tag || "Listener";
      requesterAvatar = typeof reqObj.displayAvatarURL === "function" ? reqObj.displayAvatarURL({ size: 64 }) : (reqObj.avatar || null);
      requesterId = reqObj.id || null;
    } else if (typeof reqObj === "string") {
      const u = client.users.cache.get(reqObj);
      if (u) {
        requesterName = u.displayName || u.username;
        requesterAvatar = u.displayAvatarURL({ size: 64 });
        requesterId = u.id;
      } else {
        requesterName = reqObj;
      }
    }
  }

  return {
    guildId: player.guildId,
    guildName,
    playing: isActuallyPlaying,
    paused: Boolean(player.paused && !isTransitioning),
    transitioning: isTransitioning,
    title,
    author: author || "Together Music Bot",
    thumbnail: rawThumb,
    position: isTransitioning ? 0 : (player.position || 0),
    duration: current?.length || current?.duration || 0,
    uri: current?.uri || "",
    isStream: Boolean(current?.isStream),
    loop: player.loop || "none",
    autoplay: Boolean(player.data?.get("autoplay")),
    volume: player.volume || 80,
    voiceChannel: voiceChannelName,
    textChannel: textChannelName,
    listeners: audienceCount,
    audience: audienceCount,
    audienceMembers,
    requester: requesterName,
    requesterAvatar,
    requesterId,
    queue: upcomingQueue,
    queueLength: player.queue?.length || 0,
    timestamp: Date.now()
  };
}

/**
 * Returns all active streaming sessions across Discord guilds
 */
function getAllActiveSessions(client) {
  const sessions = [];
  if (!client?.manager?.players) return sessions;

  for (const [guildId, player] of client.manager.players.entries()) {
    const current = player.queue?.current;
    const guild = client.guilds.cache.get(guildId);
    const voiceChannel = guild?.channels?.cache?.get(player.voiceId);

    let audienceCount = 0;
    if (guild?.voiceStates?.cache) {
      audienceCount = guild.voiceStates.cache.filter(
        (vs) => vs.channelId === player.voiceId && !client?.users?.cache?.get(vs.id)?.bot && vs.id !== client?.user?.id
      ).size;
    } else if (voiceChannel?.members) {
      audienceCount = voiceChannel.members.filter(m => !m.user?.bot && m.id !== client?.user?.id).size;
    }

    let rawThumb = current?.thumbnail || current?.artworkUrl || (typeof current?.displayThumbnail === "function" ? current.displayThumbnail("hqdefault") : null);
    if (!rawThumb) {
      rawThumb = "/logo.png?v=2";
    } else if (rawThumb.startsWith("http://")) {
      rawThumb = rawThumb.replace(/^http:\/\//, "https://");
    }

    sessions.push({
      guildId,
      guildName: guild?.name || `Server (${guildId})`,
      guildIcon: guild?.iconURL({ size: 128 }) || null,
      memberCount: guild?.memberCount || 0,
      playing: Boolean(player.playing && current),
      paused: Boolean(player.paused),
      title: current?.title || (player.playing ? "Live Audio Stream" : "Connected in Voice"),
      author: current?.author || "Together Music",
      thumbnail: rawThumb,
      position: player.position || 0,
      duration: current?.length || current?.duration || 0,
      voiceChannelName: voiceChannel?.name || "Voice Channel",
      listeners: audienceCount,
      loop: player.loop || "none",
      autoplay: Boolean(player.data?.get("autoplay")),
      volume: player.volume || 80,
      visualizerUrl: `/visualizer/?guild=${guildId}`,
    });
  }

  // Sort: actively playing first, then by listeners count
  sessions.sort((a, b) => {
    if (a.playing !== b.playing) return b.playing ? 1 : -1;
    return b.listeners - a.listeners;
  });

  return sessions;
}

let cachedOwnerData = {
  id: "780345293237125152",
  name: "KAJU🦋",
  tag: "kajukatli.",
  avatar: "https://cdn.discordapp.com/avatars/780345293237125152/7f51fb84d251a79180344e8ee91a4fb1.png?size=512",
  role: "Bot Owner & Core Audio Systems Architect",
  credit: "Engineered and crafted by kajukatli. High-performance Discord audio streaming & 3D WebGL visuals.",
};

async function refreshOwnerData(client) {
  try {
    const ownerId = "780345293237125152";
    let user = client?.users?.cache?.get(ownerId);
    if (!user && client?.users?.fetch) {
      user = await client.users.fetch(ownerId).catch(() => null);
    }
    if (user) {
      cachedOwnerData = {
        id: user.id,
        name: user.globalName || user.username || "KAJU🦋",
        tag: user.tag || (user.discriminator && user.discriminator !== "0" ? `${user.username}#${user.discriminator}` : user.username),
        avatar: user.displayAvatarURL({ size: 512, extension: "png" }),
        role: "Bot Owner & Core Audio Systems Architect",
        credit: "Engineered and crafted by kajukatli. High-performance Discord audio streaming & 3D WebGL visuals.",
      };
      return cachedOwnerData;
    }
  } catch (err) {
    // quiet fallback
  }
  return cachedOwnerData;
}

/**
 * Builds complete bot metadata, owner info, statistics and command catalog
 */
function getBotInfo(client) {
  const commandsByCategory = {
    Music: [],
    Filters: [],
    Config: [],
    Favourite: [],
    Information: [],
    Utility: [],
  };

  const seen = new Set();
  if (client?.commands) {
    for (const cmd of client.commands.values()) {
      if (!cmd?.name || seen.has(cmd.name.toLowerCase())) continue;
      seen.add(cmd.name.toLowerCase());

      const cat = cmd.category || "Music";
      // Exclude owner-only commands from public API and website
      if (cat.toLowerCase() === "owner" || cmd.owner === true) {
        continue;
      }

      if (!commandsByCategory[cat]) {
        commandsByCategory[cat] = [];
      }

      commandsByCategory[cat].push({
        name: cmd.name,
        description: cmd.description || "TOGETHER high-fidelity music bot command.",
        usage: cmd.usage || `.${cmd.name}`,
        aliases: Array.isArray(cmd.aliases) ? cmd.aliases : [],
        isSlash: client?.slashCommands?.has(cmd.name) || false,
      });
    }
  }

  // Ensure owner category never leaks
  delete commandsByCategory["Owner"];
  delete commandsByCategory["owner"];

  // Sort commands alphabetically
  for (const cat in commandsByCategory) {
    commandsByCategory[cat].sort((a, b) => a.name.localeCompare(b.name));
  }

  const totalUsers = client?.guilds?.cache?.reduce((acc, g) => acc + (g.memberCount || 0), 0) || 6782;

  // Sync owner cache if user is cached in Discord client
  const cachedUser = client?.users?.cache?.get("780345293237125152");
  if (cachedUser) {
    cachedOwnerData = {
      id: cachedUser.id,
      name: cachedUser.globalName || cachedUser.username || "KAJU🦋",
      tag: cachedUser.tag || (cachedUser.discriminator && cachedUser.discriminator !== "0" ? `${cachedUser.username}#${cachedUser.discriminator}` : cachedUser.username),
      avatar: cachedUser.displayAvatarURL({ size: 512, extension: "png" }),
      role: "Bot Owner & Core Audio Systems Architect",
      credit: "Engineered and crafted by kajukatli. High-performance Discord audio streaming & 3D WebGL visuals.",
    };
  } else if (client?.users?.fetch) {
    refreshOwnerData(client).catch(() => {});
  }

  return {
    bot: {
      name: client?.user?.username || "TOGETHER",
      tag: client?.user?.tag || "TOGETHER#0000",
      id: client?.user?.id || "863496211667484676",
      avatar: client?.user?.displayAvatarURL?.({ size: 256 }) || "/logo.png",
      totalGuilds: client?.guilds?.cache?.size || 103,
      totalUsers,
      activeSessions: client?.manager?.players?.size || 0,
      ping: Math.round(client?.ws?.ping) || 24,
      uptime: client?.uptime || 0,
      version: "2.5.0",
      audioEngine: "Native Opus / 24-bit Lossless Studio Transcoder",
    },
    owner: cachedOwnerData || {
      id: "780345293237125152",
      name: "KAJU🦋",
      tag: "kajukatli.",
      avatar: "https://cdn.discordapp.com/avatars/780345293237125152/7f51fb84d251a79180344e8ee91a4fb1.png?size=512",
      role: "Bot Owner & Core Audio Systems Architect",
      credit: "Engineered and crafted by kajukatli. High-performance Discord audio streaming & 3D WebGL visuals.",
    },
    links: {
      invite: client?.config?.links?.invite || "https://discord.com/oauth2/authorize?client_id=863496211667484676&permissions=277298439232&scope=bot%20applications.commands",
      support: client?.config?.links?.support || "https://discord.gg/mUdGTs2Dw5",
      vote: client?.config?.links?.vote || "https://top.gg/bot/863496211667484676/vote",
      visualizer: "https://together.dpdns.org/visualizer/",
    },
    features: [
      {
        title: "24-Bit Lossless Quality",
        desc: "Studio-grade Opus 320kbps lossless streaming engine with custom system FFmpeg pipeline and 0% clipping.",
        badge: "320 KBPS"
      },
      {
        title: "Universal Source Engine",
        desc: "Effortlessly play from YouTube, Spotify, SoundCloud, Apple Music, and direct HTTP/HTTPS audio links.",
        badge: "MULTI-SRC"
      },
      {
        title: "Studio DSP Filter Suite",
        desc: "Real-time DSP sound filters including Bassboost, Nightcore, Vaporwave, 8D Spatial Audio, and Slowed & Reverb.",
        badge: "REALTIME DSP"
      },
      {
        title: "24/7 Persistent Voice",
        desc: "Non-stop 24/7 audio connection with auto-reconnect failover, health monitors, and queue state preservation.",
        badge: "24/7 UPTIME"
      },
      {
        title: "Smart Music Autoplay",
        desc: "Intelligent related song discovery keeping the party alive automatically when your queue ends.",
        badge: "AUTOPLAY"
      },
      {
        title: "Dual Command Parity",
        desc: "69 text prefix commands and 67 Discord slash interactions with interactive search autocomplete.",
        badge: "DUAL COMMANDS"
      }
    ],
    commands: commandsByCategory,
  };
}

/**
 * Starts the unified HTTP server
 */
function startVisualizerServer(client, preferredPort = 5050) {
  const port = Number(process.env.VISUALIZER_PORT) || preferredPort;

  const server = http.createServer(async (req, res) => {
    let cleanUrl = "/" + (req.url || "/").replace(/^\/+/, "");
    let reqUrl;
    try {
      reqUrl = new URL(cleanUrl, "http://localhost");
    } catch {
      reqUrl = new URL("/", "http://localhost");
    }
    let pathname = reqUrl.pathname;

    // Strip Discord Activity Proxy prefix
    if (pathname === "/.proxy" || pathname === "/.proxy/") {
      pathname = "/";
    } else if (pathname.startsWith("/.proxy/")) {
      pathname = pathname.replace(/^\/\.proxy/, "");
    }

    // Enable CORS and iframe embedding for Discord Embedded Activities
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self' https://discord.com https://*.discord.com https://*.discordsays.com;");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    // ── Top.gg Vote Webhook Endpoint (/webhook, /api/webhook, /webhook/topgg) ──
    if (
      pathname === "/webhook" ||
      pathname === "/webhook/" ||
      pathname === "/api/webhook" ||
      pathname === "/webhook/topgg"
    ) {
      const { handleVoteWebhook } = require("./voteNotifier");
      return handleVoteWebhook(client, req, res);
    }

    // ── Root Guild Redirect (?guild=<id>) ─────────────────────
    // If user opens https://together.dpdns.org/?guild=..., redirect to /visualizer/?guild=...
    if (pathname === "/" && (reqUrl.searchParams.has("guild") || reqUrl.searchParams.has("guild_id") || reqUrl.searchParams.has("channel"))) {
      res.writeHead(302, { Location: "/visualizer/?" + reqUrl.searchParams.toString() });
      return res.end();
    }

    // ── API: App Info & Client ID (/api/info) ──────────────────
    if (pathname === "/api/info") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        clientId: client?.application?.id || client?.user?.id || null,
        botName: client?.user?.username || "Together",
        version: "2.5.0",
        embeddedActivityReady: true,
      }));
    }

    // ── API: Live Active Sessions Across All Servers (/api/active-sessions) ─
    if (pathname === "/api/active-sessions" || pathname === "/api/players") {
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-cache" });
      const sessions = getAllActiveSessions(client);
      return res.end(JSON.stringify({
        totalSessions: sessions.length,
        totalGuilds: client?.guilds?.cache?.size || 0,
        sessions,
      }));
    }

    // ── API: Guilds Bot is Installed in (/api/bot-guilds) ───────────────────
    if (pathname === "/api/bot-guilds" || pathname === "/api/guild-ids") {
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-cache" });
      const guildIds = client?.guilds?.cache ? Array.from(client.guilds.cache.keys()) : [];
      return res.end(JSON.stringify({
        total: guildIds.length,
        guildIds,
      }));
    }

    // ── API: Full Bot Metadata, Owner & Command Directory (/api/bot-info) ───
    if (pathname === "/api/bot-info") {
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-cache" });
      return res.end(JSON.stringify(getBotInfo(client)));
    }

    // ── API: Bot Owner Avatar Endpoint (/api/owner-avatar) ────
    if (pathname === "/api/owner-avatar") {
      const getOwnerAvatar = async () => {
        if (cachedOwnerData?.avatar && cachedOwnerData.avatar.startsWith("http")) {
          return cachedOwnerData.avatar;
        }
        const refreshed = await refreshOwnerData(client);
        return refreshed?.avatar || "https://cdn.discordapp.com/avatars/780345293237125152/7f51fb84d251a79180344e8ee91a4fb1.png?size=512";
      };

      getOwnerAvatar().then((avatarUrl) => {
        res.writeHead(302, {
          "Location": avatarUrl,
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*"
        });
        res.end();
      }).catch(() => {
        res.writeHead(302, {
          "Location": "/logo.png?v=2",
          "Access-Control-Allow-Origin": "*"
        });
        res.end();
      });
      return;
    }

    // ── API: High-Res Thumbnail Image Proxy (/api/thumbnail?url=...) ──
    if (pathname === "/api/thumbnail") {
      const rawUrl = reqUrl.searchParams.get("url");
      if (!rawUrl || (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://"))) {
        res.writeHead(302, { "Location": "/logo.png?v=2", "Access-Control-Allow-Origin": "*" });
        return res.end();
      }
      const https = require("https");
      const http = require("http");
      
      const fetchImage = (targetUrl, redirectCount = 0) => {
        if (redirectCount > 3) {
          res.writeHead(302, { "Location": "/logo.png?v=2", "Access-Control-Allow-Origin": "*" });
          return res.end();
        }
        const mod = targetUrl.startsWith("https:") ? https : http;
        mod.get(targetUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
          }
        }, (proxyRes) => {
          if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
            let nextUrl = proxyRes.headers.location;
            if (nextUrl.startsWith("/")) {
              const parsedTarget = new URL(targetUrl);
              nextUrl = `${parsedTarget.protocol}//${parsedTarget.host}${nextUrl}`;
            }
            return fetchImage(nextUrl, redirectCount + 1);
          }
          if (proxyRes.statusCode >= 400) {
            res.writeHead(302, { "Location": "/logo.png?v=2", "Access-Control-Allow-Origin": "*" });
            return res.end();
          }
          res.writeHead(proxyRes.statusCode || 200, {
            "Content-Type": proxyRes.headers["content-type"] || "image/jpeg",
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
            "Access-Control-Allow-Origin": "*"
          });
          proxyRes.pipe(res);
        }).on("error", () => {
          res.writeHead(302, { "Location": "/logo.png?v=2", "Access-Control-Allow-Origin": "*" });
          res.end();
        });
      };

      return fetchImage(rawUrl);
    }

    // ── API: Real-Time SSE Stream (/api/stream/:targetId) ──────
    if (pathname.startsWith("/api/stream/")) {
      const rawTarget = pathname.replace("/api/stream/", "").trim();
      const targetId  = resolveGuildId(client, rawTarget) || rawTarget;

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      });

      // Send initial state immediately
      res.write(`data: ${JSON.stringify(getGuildPlayerState(client, targetId))}\n\n`);

      // Push periodic sync tick every 350ms
      const interval = setInterval(() => {
        if (res.writableEnded) {
          clearInterval(interval);
          return;
        }
        res.write(`data: ${JSON.stringify(getGuildPlayerState(client, targetId))}\n\n`);
      }, 350);

      req.on("close", () => {
        clearInterval(interval);
      });
      return;
    }

    // ── API: Player Snapshot (/api/player/:targetId or /api/state/:targetId) ───
    if ((pathname.startsWith("/api/player/") || pathname.startsWith("/api/state/")) && !pathname.endsWith("/control")) {
      const rawTarget = pathname.replace("/api/player/", "").replace("/api/state/", "").trim();
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(getGuildPlayerState(client, rawTarget)));
    }
    if (pathname === "/api/queue" || pathname === "/api/player") {
      const rawTarget = reqUrl.searchParams.get("guild") || reqUrl.searchParams.get("guildId") || "default";
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(getGuildPlayerState(client, rawTarget)));
    }

    // ── API: Interactive Playback Control ─────────────────────
    if (((pathname.startsWith("/api/player/") && pathname.endsWith("/control")) || pathname === "/api/player-action") && req.method === "POST") {
      let rawTarget = pathname.startsWith("/api/player/") ? pathname.replace("/api/player/", "").replace("/control", "").trim() : "";
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", async () => {
        try {
          const payload = JSON.parse(body || "{}");
          const { action, position, value, query, index, user } = payload;
          if (pathname === "/api/player-action" && payload.guildId) {
            rawTarget = payload.guildId;
          }
          let guildId   = resolveGuildId(client, rawTarget) || rawTarget;
          let player    = guildId ? client?.manager?.players?.get(guildId) : null;
          if (!player && (!guildId || rawTarget === "default")) {
            player = client?.manager?.players?.first?.() || Array.from(client?.manager?.players?.values() || [])[0];
          }

          // If no player active yet and user clicked play, auto-create player via 24/7 channel if configured
          if (!player && action === "play" && guildId) {
            try {
              const TwoFourSeven = require("../schema/247");
              const tfs = await TwoFourSeven.findOne({ Guild: guildId }).maxTimeMS(2000).lean().catch(() => null);
              if (tfs && tfs.VoiceId && tfs.TextId) {
                player = await client.manager.createPlayer({
                  guildId,
                  voiceId: tfs.VoiceId,
                  textId: tfs.TextId,
                  volume: 80,
                  deaf: true
                }).catch(() => null);
              }
            } catch {}
          }

          if (player) {
            if (action === "pause") await player.pause(true);
            if (action === "resume") await player.pause(false);
            if (action === "skip") await player.skip();
            if (action === "previous") {
              const { playPreviousTrack } = require("./previousTrack");
              await playPreviousTrack(player);
            }
            if (action === "seek" && typeof position === "number") {
              await player.seek(position);
            }
            if (action === "loop") {
              const modes = ["none", "track", "queue"];
              const curIdx = modes.indexOf(player.loop || "none");
              player.loop = modes[(curIdx + 1) % modes.length];
            }
            if (action === "autoplay") {
              const cur = player.data.get("autoplay") || false;
              player.data.set("autoplay", !cur);
            }
            if (action === "volume") {
              const vol = typeof value === "number" ? value : (typeof position === "number" ? position : null);
              if (vol !== null) player.setVolume(vol);
            }
            if (action === "shuffle" && player.queue?.shuffle) {
              player.queue.shuffle();
            }
            if ((action === "clearQueue" || action === "clear") && player.queue) {
              if (typeof player.queue.clear === "function") player.queue.clear();
              else player.queue.length = 0;
            }
            if (action === "removeTrack" && typeof index === "number" && player.queue) {
              if (typeof player.queue.remove === "function") player.queue.remove(index);
              else player.queue.splice(index, 1);
            }
            if (action === "stop") {
              await player.destroy();
            }
            if (action === "play" && query) {
              const requester = user ? { id: user.id, username: user.username } : (client?.user || { id: "0", username: "Dashboard" });
              const searchRes = await client.manager.search(query, requester);
              if (searchRes && searchRes.tracks && searchRes.tracks.length) {
                if (searchRes.type === "PLAYLIST") {
                  for (const tr of searchRes.tracks) {
                    player.queue.add(tr);
                  }
                } else {
                  player.queue.add(searchRes.tracks[0]);
                }
                if (!player.playing && !player.paused) {
                  await player.play();
                }
              }
            }
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, action }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // ── API: Guild Channels for 24/7 Selector (/api/guild-channels/:guildId) ──
    if (pathname.startsWith("/api/guild-channels/")) {
      const rawTarget = pathname.replace("/api/guild-channels/", "").trim();
      const targetGuildId = resolveGuildId(client, rawTarget) || rawTarget;
      const guild = client?.guilds?.cache?.get(targetGuildId);
      if (!guild) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ textChannels: [], voiceChannels: [] }));
      }
      const textChannels = [];
      const voiceChannels = [];
      guild.channels.cache.forEach((c) => {
        if (!c) return;
        if (c.type === 2 || c.type === 13 || c.isVoiceBased?.()) {
          voiceChannels.push({ id: c.id, name: c.name, type: c.type });
        } else if (c.type === 0 || c.type === 5 || c.isTextBased?.()) {
          textChannels.push({ id: c.id, name: c.name, type: c.type });
        }
      });
      textChannels.sort((a, b) => a.name.localeCompare(b.name));
      voiceChannels.sort((a, b) => a.name.localeCompare(b.name));
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ textChannels, voiceChannels }));
    }

    // ── API: Check Top.gg Voter Access (/api/check-vote) ─────
    if (pathname === "/api/check-vote") {
      const userId = reqUrl.searchParams.get("userId");
      const { checkVoterAccess } = require("./voterCheck");
      checkVoterAccess(client, userId).then((status) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(status));
      }).catch(() => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ allowed: false, isOwner: false, isVoter: false }));
      });
      return;
    }

    // ── API: Global Bot Leaderboard (/api/leaderboard) ────────
    if (pathname === "/api/leaderboard" && req.method === "GET") {
      try {
        const UserPreferences = require("../schema/userpreferences");
        const rawDocs = await UserPreferences.find()
          .sort({ xp: -1, songsPlayed: -1, listeningSeconds: -1 })
          .limit(100)
          .lean()
          .catch(() => []);

        let docs = Array.isArray(rawDocs) ? rawDocs.filter((d) => (d.songsPlayed > 0 || d.xp > 0 || d.listeningSeconds > 0)) : [];
        if (docs.length === 0 && Array.isArray(rawDocs)) docs = rawDocs;

        const resolvedUsers = await Promise.all(
          docs.map(async (doc, idx) => {
            let discordUser = null;
            try {
              discordUser =
                client.users.cache.get(doc.userId) ||
                (await client.users.fetch(doc.userId).catch(() => null));
            } catch {}

            return {
              rank: idx + 1,
              userId: doc.userId,
              name: discordUser?.displayName || discordUser?.username || `User_${doc.userId.slice(-4)}`,
              username: discordUser?.username || `user_${doc.userId.slice(-4)}`,
              avatarUrl: discordUser?.displayAvatarURL?.({ extension: "png", size: 256 }) || null,
              level: Math.max(1, Number(doc.level) || 1),
              xp: Math.max(0, Number(doc.xp) || 0),
              songsPlayed: Math.max(0, Number(doc.songsPlayed) || 0),
              listeningSeconds: Math.max(0, Number(doc.listeningSeconds) || 0),
              listeningMinutes: Math.floor((Math.max(0, Number(doc.listeningSeconds) || 0)) / 60),
              streak: Math.max(0, Number(doc.streak) || 0),
              anthem: doc.anthem,
              accentColor: doc.accentColor || "#00E676"
            };
          })
        );

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({
          leaderboard: resolvedUsers,
          totalUsers: docs.length
        }));
      } catch (err) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ leaderboard: [], totalUsers: 0, error: err.message }));
      }
    }

    // ── API: User Discord Profile Canvas Banner (/api/profile-banner/:userId) ──
    if (pathname.startsWith("/api/profile-banner/") && req.method === "GET") {
      try {
        const rawUserId = pathname.replace("/api/profile-banner/", "").trim();
        const { renderProfileCanvas } = require("./profileCanvas");
        const UserPreferences = require("../schema/userpreferences");
        const Liked = require("../schema/liked");

        let discordUser = client.users.cache.get(rawUserId);
        if (!discordUser) {
          discordUser = await client.users.fetch(rawUserId).catch(() => null);
        }
        if (!discordUser) {
          discordUser = {
            id: rawUserId,
            username: `user_${rawUserId.slice(-4)}`,
            displayName: `User_${rawUserId.slice(-4)}`,
            displayAvatarURL: () => null,
          };
        }

        const [pref, likedDoc] = await Promise.all([
          UserPreferences.findOne({ userId: rawUserId }).lean().catch(() => null),
          Liked.findOne({ userId: rawUserId }).lean().catch(() => null)
        ]);

        const likedCount = likedDoc?.songs?.length || 0;
        const totalSec = Math.max(0, Number(pref?.listeningSeconds) || 0);
        const hoursNum = Math.floor(totalSec / 3600);
        const minutesNum = Math.floor((totalSec % 3600) / 60);
        const hoursStr = hoursNum > 0 ? `${hoursNum}h` : (minutesNum > 0 ? `${minutesNum}m` : "0h");
        const songsCount = Math.max(0, Number(pref?.songsPlayed) || 0);
        const songsStr = songsCount.toLocaleString();
        const streakCount = Math.max(0, Number(pref?.streak) || 0);
        const streakStr = `${streakCount} ${streakCount === 1 ? "day" : "days"}`;
        const level = Math.max(1, Number(pref?.level) || 1);
        const xp = Math.max(0, Number(pref?.xp) || 0);
        const maxXP = Math.max(100, level * 100);

        // Compute badges
        const badges = [];
        if (songsCount >= 1) badges.push("vinyl");
        if (totalSec >= 3600) badges.push("wave");
        if (level >= 5 || songsCount >= 50) badges.push("crown");
        if (pref?.anthem?.title) badges.push("star");
        if (streakCount >= 2) badges.push("planet");
        if (likedCount >= 1) badges.push("bars");

        const profilePayload = {
          bio: pref?.bio || "",
          accentColor: pref?.accentColor || "#FF1E38",
          listeningHours: hoursStr,
          songsPlayed: songsStr,
          streak: streakStr,
          level,
          xp,
          maxXP,
          badges,
          anthem: pref?.anthem || null,
        };

        const canvasBuffer = await renderProfileCanvas(discordUser, profilePayload);
        res.writeHead(200, {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=120, stale-while-revalidate=300",
          "Access-Control-Allow-Origin": "*"
        });
        return res.end(canvasBuffer);
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: err.message }));
      }
    }

    // ── API: Dispatch Dashboard Log to Discord Log Thread (/api/dashboard-log) ──
    if (pathname === "/api/dashboard-log" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", async () => {
        try {
          const payload = JSON.parse(body || "{}");
          const { sendWebhook } = require("./webhooks");
          const { EmbedBuilder } = require("discord.js");
          const guild = payload.guildId ? client?.guilds?.cache?.get(payload.guildId) : null;
          const guildName = guild?.name || payload.guildName || (payload.guildId ? `Server (${payload.guildId})` : "Global");

          // Handle console stdout/stderr stream from dashboard backend
          if (payload.isConsole || payload.event === "CONSOLE") {
            const rawDetails = String(payload.details || "").trim();
            if (!rawDetails) {
              res.writeHead(200, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ success: true }));
            }
            const embed = new EmbedBuilder()
              .setColor(payload.color || "#00E676")
              .setAuthor({
                name: "TOGETHER Dashboard • Live Console",
                iconURL: client?.user?.displayAvatarURL({ dynamic: true })
              })
              .setTitle(`💻 Dashboard Backend Console Log`)
              .setDescription(`\`\`\`ansi\n${rawDetails.slice(0, 3900)}\n\`\`\``)
              .setFooter({
                text: `${client?.user?.username || "TOGETHER"} • Console Stream`,
                iconURL: client?.user?.displayAvatarURL({ dynamic: true })
              })
              .setTimestamp();

            await sendWebhook(client, "dashboard", { embeds: [embed] });
            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ success: true }));
          }

          const embed = new EmbedBuilder()
            .setColor(payload.color || "#00E676")
            .setAuthor({
              name: `${payload.user?.username || "Web User"} • Dashboard Action`,
              iconURL: payload.user?.avatar || client?.user?.displayAvatarURL({ dynamic: true })
            })
            .setTitle(`🌐 Dashboard Event: ${payload.action || "Configuration Update"}`)
            .setDescription(
              `**• Executor:** <@${payload.user?.id}> (\`${payload.user?.username || payload.user?.id}\`)\n` +
              `**• Target Server:** \`${guildName}\` (${payload.guildId || "N/A"})\n` +
              `**• Action Details:** ${payload.details || "N/A"}\n` +
              `**• Timestamp:** <t:${Math.floor(Date.now() / 1000)}:R>`
            )
            .setFooter({
              text: `${client?.user?.username || "TOGETHER"} • Web Sentinel`,
              iconURL: client?.user?.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

          await sendWebhook(client, "dashboard", { embeds: [embed] });
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        } catch (err) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // ── Static Web Serving ────────────────────────────────────
    let filePath;

    if (pathname === "/visualizer" || pathname === "/visualizer/") {
      filePath = path.join(VISUALIZER_DIR, "index.html");
    } else if (pathname.startsWith("/visualizer/")) {
      const sub = pathname.replace(/^\/visualizer\//, "");
      filePath = path.join(VISUALIZER_DIR, sub);
    } else if (pathname === "/") {
      filePath = path.join(PUBLIC_ROOT, "index.html");
    } else {
      // Check PUBLIC_ROOT first, fallback to VISUALIZER_DIR
      const candidatePublic = path.join(PUBLIC_ROOT, pathname);
      if (fs.existsSync(candidatePublic) && fs.statSync(candidatePublic).isFile()) {
        filePath = candidatePublic;
      } else {
        filePath = path.join(VISUALIZER_DIR, pathname);
      }
    }

    // Security: Prevent directory traversal
    if (!filePath.startsWith(PUBLIC_ROOT)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Fallback to home index.html for root routes, or visualizer index.html for /visualizer/*
        if (pathname.startsWith("/visualizer")) {
          fs.readFile(path.join(VISUALIZER_DIR, "index.html"), (errViz, vizData) => {
            if (errViz) {
              res.writeHead(404, { "Content-Type": "text/plain" });
              return res.end("File not found");
            }
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(vizData);
          });
          return;
        }

        fs.readFile(path.join(PUBLIC_ROOT, "index.html"), (errHome, homeData) => {
          if (errHome) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            return res.end("File not found");
          }
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(homeData);
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      if (ext === ".html") {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      } else if (ext === ".css" || ext === ".js") {
        res.setHeader("Cache-Control", "no-cache, must-revalidate");
      } else {
        res.setHeader("Cache-Control", "public, max-age=86400");
      }

      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      client?.logger?.log(`[Visualizer] Port ${port} is already in use by another process.`, "warn");
    } else {
      client?.logger?.log(`[Visualizer] Server error: ${err.message}`, "error");
    }
  });

  server.listen(port, "0.0.0.0", () => {
    client?.logger?.log(`[Visualizer] Web & Visualizer Server listening at http://0.0.0.0:${port}`, "ready");
    // Pre-cache owner avatar and Discord details
    refreshOwnerData(client).catch(() => {});
  });

  client.visualizerServer = server;
  client.visualizerPort = port;
  return server;
}

module.exports = {
  startVisualizerServer,
  getGuildPlayerState,
  getAllActiveSessions,
  getBotInfo,
  resolveGuildId,
};
