/**
 * visualizerServer.js  —  TOGETHER 3D Visualizer HTTP & SSE Sync Server
 * Serves the WebGL 3D visualizer frontend and provides real-time SSE stream.
 * Fully compatible with Discord Embedded App SDK & Discord Activities iframe.
 */

const http = require("http");
const fs   = require("fs");
const path = require("path");
const { URL } = require("url");

const PUBLIC_DIR = path.resolve(__dirname, "../../public/visualizer");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
};

/**
 * Resolves target guild ID from guildId or voice channelId
 */
function resolveGuildId(client, identifier) {
  if (!identifier) return "default";
  // Direct guild ID match
  if (client?.guilds?.cache?.has(identifier)) return identifier;
  // Channel ID lookup
  const channel = client?.channels?.cache?.get(identifier);
  if (channel?.guild?.id) return channel.guild.id;
  return identifier;
}

/**
 * Builds current state payload for a guild's audio player
 */
function getGuildPlayerState(client, targetId) {
  const guildId = resolveGuildId(client, targetId);
  let player = client?.manager?.players?.get(guildId);

  // If no player found for targetId, fallback to active player if only 1 exists or if default requested
  if (!player && (!targetId || targetId === "default" || client?.manager?.players?.size === 1)) {
    player = client?.manager?.players?.first?.() || Array.from(client?.manager?.players?.values?.() || [])[0];
  }

  if (!player) {
    return {
      guildId,
      playing: false,
      paused: true,
      title: "No Music Playing",
      author: "Together Music Bot",
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80",
      position: 0,
      duration: 0,
      loop: "none",
      autoplay: false,
      volume: 80,
    };
  }

  const current = player.queue?.current;
  let rawThumb = current?.thumbnail || current?.artworkUrl || (typeof current?.displayThumbnail === "function" ? current.displayThumbnail("hqdefault") : null);
  if (!rawThumb) {
    rawThumb = "logo.png";
  } else if (rawThumb.startsWith("http://")) {
    rawThumb = rawThumb.replace(/^http:\/\//, "https://");
  }

  return {
    guildId,
    playing: Boolean(player.playing && current),
    paused: Boolean(player.paused),
    title: current?.title || "Unknown Track",
    author: current?.author || "Unknown Artist",
    thumbnail: rawThumb,
    position: player.position || 0,
    duration: current?.length || 0,
    loop: player.loop || "none",
    autoplay: Boolean(player.data?.get("autoplay")),
    volume: player.volume || 80,
  };
}

/**
 * Starts the visualizer HTTP server
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

    // Strip visualizer directory prefix ONLY (not visualizer.js!)
    if (pathname === "/visualizer" || pathname === "/visualizer/") {
      pathname = "/";
    } else if (pathname.startsWith("/visualizer/")) {
      pathname = pathname.replace(/^\/visualizer/, "");
    }

    // Enable CORS and iframe embedding for Discord Embedded App (Activities)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    // Discord Activities run inside an iframe hosted by discord.com or discordsays.com
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self' https://discord.com https://*.discord.com https://*.discordsays.com;");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    // ── API: App Info & Client ID (/api/info) ──────────────────
    if (pathname === "/api/info") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        clientId: client?.application?.id || client?.user?.id || null,
        botName: client?.user?.username || "Together",
        version: "2.0.0",
        embeddedActivityReady: true,
      }));
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
      const targetId  = resolveGuildId(client, rawTarget);

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
      const guildId   = resolveGuildId(client, rawTarget);
      const player    = client?.manager?.players?.get(guildId);

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

    // ── Static Web Visualizer Files ───────────────────────────
    // Support root "/" and "/visualizer" or "/visualizer/"
    if (pathname.startsWith("/visualizer/")) {
      pathname = pathname.replace("/visualizer", "");
    } else if (pathname === "/visualizer") {
      pathname = "/";
    }

    let filePath = path.join(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname);
    
    // Security: Prevent directory traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Only fallback to index.html for extension-less SPA routes (never for .js, .css, etc.)
        if (!path.extname(filePath)) {
          fs.readFile(path.join(PUBLIC_DIR, "index.html"), (errIndex, indexData) => {
            if (errIndex) {
              res.writeHead(404, { "Content-Type": "text/plain" });
              return res.end("Visualizer file not found");
            }
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(indexData);
          });
          return;
        }
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("File not found: " + pathname);
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
    client?.logger?.log(`[Visualizer] 3D Visualizer Web Server listening at http://0.0.0.0:${port}`, "ready");
  });

  client.visualizerServer = server;
  client.visualizerPort = port;
  return server;
}

module.exports = {
  startVisualizerServer,
  getGuildPlayerState,
  resolveGuildId,
};
