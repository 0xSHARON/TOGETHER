const { spawn } = require("child_process");
const { getYtDlpRunner, getCookiesArgs, ensureYtDlpBinary } = require("../utils/systemBinary");

const STREAM_CACHE = new Map();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Together Stream Worker (JavaScript Engine)
 * Handles high-speed audio stream resolution, caching, and prebuffering.
 * Fully compatible with Linux, Pterodactyl panels, Docker, and Windows.
 */
class TogetherStreamWorker {
  /**
   * Resolves direct media stream URL for any song query or URL
   * @param {string} target - Video URL or search query
   * @returns {Promise<string>}
   */
  static async resolveStream(target) {
    if (!target) throw new Error("No target query provided");
    const cacheKey = target.trim();
    const now = Date.now();

    // 1. Instant Cache Hit (0ms)
    const cached = STREAM_CACHE.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.url;
    }

    // 2. Direct extraction via cross-platform yt-dlp runner
    try {
      const streamUrl = await this.extractStreamUrl(cacheKey);
      if (streamUrl) {
        STREAM_CACHE.set(cacheKey, {
          url: streamUrl,
          expiresAt: now + CACHE_TTL_MS,
        });
        return streamUrl;
      }
    } catch (err) {
      // If runner failed or binary was missing, attempt binary auto-install and retry once
      const isMissingBinary = err.message && (err.message.includes("ENOENT") || err.message.includes("Extraction failed"));
      if (isMissingBinary) {
        const installedPath = await ensureYtDlpBinary();
        if (installedPath) {
          const streamUrl = await this.extractStreamUrl(cacheKey);
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

    throw new Error(`Failed to resolve audio stream for "${target}"`);
  }

  /**
   * Extracts direct CDN stream URL using mobile player clients
   * @param {string} target 
   * @returns {Promise<string>}
   */
  static extractStreamUrl(target) {
    return new Promise((resolve, reject) => {
      const runner = getYtDlpRunner();
      const cookieArgs = getCookiesArgs();
      const isDirectYt = target.startsWith("http") && (target.includes("youtube.com") || target.includes("youtu.be"));
      const query = isDirectYt ? target : `ytsearch1:${target}`;
      const args = [
        ...runner.argsPrefix,
        ...cookieArgs,
        "--no-update",
        "--no-warnings",
        "--no-playlist",
        "--extractor-args", "youtube:player_client=android",
        "-f", "ba/b",
        "-g",
        query,
      ];

      const proc = spawn(runner.cmd, args);
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
   * Asynchronously prefetches the next song in the background
   * @param {string|Object} track 
   */
  static prefetch(track) {
    if (!track) return;
    const target = typeof track === "string"
      ? track
      : (track.searchQuery || track.uri || `${track.title} - ${track.author}`);
    if (!target) return;

    const cacheKey = target.trim();
    if (STREAM_CACHE.has(cacheKey) && STREAM_CACHE.get(cacheKey).expiresAt > Date.now()) {
      return; // Already cached
    }

    this.resolveStream(cacheKey).catch(() => {});
  }
}

module.exports = TogetherStreamWorker;
