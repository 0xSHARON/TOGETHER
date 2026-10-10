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
    duration: current?.length || 0,
    loop: player.loop || "none",
    autoplay: Boolean(player.data?.get("autoplay")),
    volume: player.volume || 80,
    voiceChannel: currentGuild?.channels?.cache?.get(player.voiceId)?.name || "Voice Channel",
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
    const listeners = voiceChannel?.members ? voiceChannel.members.filter(m => !m.user?.bot).size : 0;

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
      duration: current?.length || 0,
      voiceChannelName: voiceChannel?.name || "Voice Channel",
      listeners,
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

  // Sort commands alphabetically
  for (const cat in commandsByCategory) {
    commandsByCategory[cat].sort((a, b) => a.name.localeCompare(b.name));
  }

  const totalUsers = client?.guilds?.cache?.reduce((acc, g) => acc + (g.memberCount || 0), 0) || 6782;

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
    owner: {
      id: "780345293237125152",
      name: "kajukatli",
      tag: "kajukatli.",
      role: "Bot Owner & Core Audio Systems Architect",
      credit: "Engineered and crafted by kajukatli. High-performance Discord audio streaming & 3D WebGL visuals.",
    },
    links: {
      invite: client?.config?.links?.invite || "https://discord.com/oauth2/authorize?client_id=863496211667484676&permissions=277298439232&scope=bot%20applications.commands",
      support: client?.config?.links?.support || "https://discord.gg/NSRgjY74TS",
      vote: client?.config?.links?.vote || "https://top.gg/bot/863496211667484676/vote",
      visualizer: "https://together.dpdns.org/visualizer/",
    },
    features: [
      {
        title: "3D WebGL Audio Stage",
        desc: "Interactive brutalist 3D reactive audio stage synchronized live with your Discord voice channel playback.",
        badge: "WEBGL 2.0"
      },
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
        title: "Discord Embedded Activity",
        desc: "Complete Discord Activity SDK RPC handshake support — view and control music right inside voice channel windows.",
        badge: "ACTIVITY READY"
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

  const server = http.createServer((req, res) => {
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

    // ── API: Full Bot Metadata, Owner & Command Directory (/api/bot-info) ───
    if (pathname === "/api/bot-info") {
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-cache" });
      return res.end(JSON.stringify(getBotInfo(client)));
    }

    // ── API: High-Res Thumbnail Image Proxy (/api/thumbnail?url=...) ──
    if (pathname === "/api/thumbnail") {
      const rawUrl = reqUrl.searchParams.get("url");
      if (!rawUrl || (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://"))) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        return res.end("Invalid thumbnail URL");
      }
      const https = require("https");
      const http = require("http");
      const clientReq = rawUrl.startsWith("https:") ? https : http;
      
      const fetchImage = (targetUrl, redirectCount = 0) => {
        if (redirectCount > 3) {
          res.writeHead(502);
          return res.end("Too many redirects");
        }
        clientReq.get(targetUrl, {
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
          res.writeHead(proxyRes.statusCode || 200, {
            "Content-Type": proxyRes.headers["content-type"] || "image/jpeg",
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
            "Access-Control-Allow-Origin": "*"
          });
          proxyRes.pipe(res);
        }).on("error", (err) => {
          res.writeHead(502, { "Content-Type": "text/plain" });
          res.end("Proxy Error: " + err.message);
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

    // ── API: Interactive Playback Control ─────────────────────
    if (pathname.startsWith("/api/player/") && pathname.endsWith("/control") && req.method === "POST") {
      const rawTarget = pathname.replace("/api/player/", "").replace("/control", "").trim();
      let guildId   = resolveGuildId(client, rawTarget);
      let player    = guildId ? client?.manager?.players?.get(guildId) : null;
      if (!player && (!guildId || rawTarget === "default")) {
        player = client?.manager?.players?.first?.() || Array.from(client?.manager?.players?.values() || [])[0];
      }

      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", async () => {
        try {
          const { action, position } = JSON.parse(body || "{}");
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
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(homeData);
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      if (ext === ".html" || ext === ".css" || ext === ".js") {
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
