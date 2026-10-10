const { spawn } = require("child_process");
const { getYtDlpRunner, getCookiesArgs, ensureYtDlpBinary } = require("../utils/systemBinary");

const STREAM_CACHE = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes (prevents expired token reuse)

/**
 * Together Stream Worker (JavaScript Engine)
 * Handles high-speed audio stream resolution, caching, and prebuffering.
 * Fully compatible with Linux, Pterodactyl panels, Docker, and Windows.
 */
class TogetherStreamWorker {
  /**
   * Explicitly evicts a target or all cache entries
   * @param {string} [target] 
   */
  static invalidateCache(target) {
    if (target) {
      STREAM_CACHE.delete(target.trim());
    } else {
      STREAM_CACHE.clear();
    }
  }

  /**
   * Resolves direct media stream URL for any song query or URL
   * @param {string|Object} target - Video URL, search query, or track object
   * @param {boolean} [forceRefresh=false] - Invalidate existing cache and re-extract
   * @returns {Promise<string>}
   */
  static async resolveStream(target, forceRefresh = false) {
    if (!target) throw new Error("No target query provided");

    let cacheKey = "";
    let targetObj = {};
    if (typeof target === "string") {
      cacheKey = target.trim();
      targetObj = { query: cacheKey };
    } else if (typeof target === "object") {
      cacheKey = (target.uri || target.query || `${target.title || ""} ${target.author || ""}`).trim();
      targetObj = target;
    }
    const now = Date.now();

    if (forceRefresh) {
      STREAM_CACHE.delete(cacheKey);
    }

    // 1. Instant Cache Hit (0ms)
    const cached = STREAM_CACHE.get(cacheKey);
    if (!forceRefresh && cached && cached.expiresAt > now) {
      return cached.url;
    }

    // 2. Direct extraction via cross-platform yt-dlp runner
    try {
      const streamUrl = await this.extractStreamUrl(targetObj);
      if (streamUrl) {
        STREAM_CACHE.set(cacheKey, {
          url: streamUrl,
          expiresAt: now + CACHE_TTL_MS,
        });
        return streamUrl;
      }
    } catch (err) {
      // If runner failed or binary was missing, attempt binary auto-install and retry once
      const isMissingBinary = err.message && err.message.includes("ENOENT");
      if (isMissingBinary) {
        const installedPath = await ensureYtDlpBinary();
        if (installedPath) {
          const streamUrl = await this.extractStreamUrl(targetObj);
          if (streamUrl) {
            STREAM_CACHE.set(cacheKey, {
              url: streamUrl,
              expiresAt: now + CACHE_TTL_MS,
            });
            return streamUrl;
          }
        }
      }
      throw err;
    }

    throw new Error(`Failed to resolve audio stream for "${cacheKey}"`);
  }

  /**
   * Spawns yt-dlp process and captures single audio stream URL
   * @param {string[]} args 
   * @returns {Promise<string>}
   */
  static _runYtDlp(args) {
    return new Promise((resolve, reject) => {
      const runner = getYtDlpRunner();
      const proc = spawn(runner.cmd, [...runner.argsPrefix, ...args]);
      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (d) => (stdout += d.toString()));
      proc.stderr.on("data", (d) => (stderr += d.toString()));

      proc.on("error", (err) => reject(err));
      proc.on("close", (code) => {
        if (code === 0 && stdout.trim()) {
          const url = stdout.trim().split("\n")[0].trim();
          resolve(url);
        } else {
          reject(new Error(`Extraction failed (code ${code}): ${stderr || "No stream URL found"}`));
        }
      });
    });
  }

  /**
   * Extracts direct CDN stream URL with automatic cross-platform fallback
   * @param {string|Object} target 
   * @returns {Promise<string>}
   */
  static async extractStreamUrl(target) {
    const cookieArgs = getCookiesArgs();
    const queryStr = typeof target === "string"
      ? target
      : (target.uri || target.query || `${target.title || ""} ${target.author || ""}`.trim());

    const isDirectSoundcloud = queryStr.startsWith("http") && queryStr.includes("soundcloud.com");
    const isDirectYt = queryStr.startsWith("http") && (queryStr.includes("youtube.com") || queryStr.includes("youtu.be"));

    // 1. Direct SoundCloud Stream (Always works)
    if (isDirectSoundcloud) {
      return await this._runYtDlp([
        "--no-update",
        "--no-warnings",
        "--no-playlist",
        "-f", "ba/b",
        "-g",
        queryStr,
      ]);
    }

    // 2. Try YouTube extraction first
    try {
      const ytQuery = isDirectYt ? queryStr : `ytsearch1:${queryStr}`;
      const ytArgs = [
        ...cookieArgs,
        "--no-update",
        "--no-warnings",
        "--no-playlist",
        "--extractor-args", "youtube:player_client=android",
        "-f", "ba/b",
        "-g",
        ytQuery,
      ];
      const url = await this._runYtDlp(ytArgs);
      if (url) return url;
    } catch (ytErr) {
      // 3. Fallback: SoundCloud search (Bypasses YouTube bot block completely)
      let scQuery = "";
      if (typeof target === "object" && (target.title || target.author)) {
        scQuery = `${target.title || ""} ${target.author || ""}`.trim();
      }
      
      if (!scQuery && isDirectYt) {
        // Fetch clean title via YouTube oEmbed without requiring cookies
        try {
          const https = require("https");
          const oembedData = await new Promise((res, rej) => {
            https.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(queryStr)}&format=json`, (r) => {
              let body = "";
              r.on("data", (c) => (body += c));
              r.on("end", () => {
                try { res(JSON.parse(body)); } catch (e) { res(null); }
              });
            }).on("error", () => res(null));
          });
          if (oembedData && oembedData.title) {
            scQuery = `${oembedData.title} ${oembedData.author_name || ""}`.trim();
          }
        } catch {}
      }

      if (!scQuery) {
        scQuery = queryStr.replace(/^https?:\/\/\S+/i, "").trim() || queryStr;
      }

      if (scQuery && !scQuery.startsWith("http")) {
        try {
          const scUrl = await this._runYtDlp([
            "--no-update",
            "--no-warnings",
            "--no-playlist",
            "-f", "ba/b",
            "-g",
            `scsearch1:${scQuery}`,
          ]);
          if (scUrl) return scUrl;
        } catch {}
      }

      throw ytErr;
    }

    throw new Error(`Failed to resolve audio stream for "${queryStr}"`);
  }

  /**
   * Asynchronously prefetches the next song in the background
   * @param {string|Object} track 
   */
  static prefetch(track) {
    if (!track) return;
    const target = typeof track === "string"
      ? track
      : (track.searchQuery || track.uri || `${track.title} - ${track.author}`);
    if (!target) return;

    const cacheKey = (typeof track === "object" ? (track.uri || track.searchQuery || `${track.title} - ${track.author}`) : track).trim();
    if (STREAM_CACHE.has(cacheKey) && STREAM_CACHE.get(cacheKey).expiresAt > Date.now()) {
      return; // Already cached
    }

    this.resolveStream(track).catch(() => {});
  }
}

module.exports = TogetherStreamWorker;
