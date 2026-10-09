const { createAudioResource, StreamType } = require("@discordjs/voice");
const { spawn } = require("child_process");
const TogetherStreamWorker = require("./togetherStreamWorker");
const { getFfmpegPath } = require("../utils/systemBinary");

const { PassThrough } = require("stream");

class TogetherStreamer {
  /**
   * Resolves the direct media audio URL
   * @param {string} target - YouTube URL or search query
   * @returns {Promise<string>}
   */
  static async getStreamUrl(target) {
    return TogetherStreamWorker.resolveStream(target);
  }

  /**
   * Background pre-fetch for upcoming tracks (zero-gap transition)
   * @param {string|Object} track - Track object or query string
   */
  static prefetch(track) {
    TogetherStreamWorker.prefetch(track);
  }

  /**
   * Spawns FFmpeg to convert the audio stream into 48kHz stereo PCM
   * @param {string} streamUrl - Direct audio CDN URL
   * @param {Object} options - Seek offset, volume, filterString, logger, etc.
   * @returns {{ resource: AudioResource, ffmpeg: ChildProcess }}
   */
  static createStreamResource(streamUrl, options = {}) {
    const seekSeconds = options.seek ? Math.max(0, Math.floor(options.seek / 1000)) : 0;

    const ffmpegArgs = [
      "-reconnect", "1",
      "-reconnect_streamed", "1",
      "-reconnect_at_eof", "1",
      "-reconnect_delay_max", "5",
      "-user_agent", "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      "-probesize", "32768",
      "-analyzeduration", "0",
    ];

    if (seekSeconds > 0) {
      ffmpegArgs.push("-ss", seekSeconds.toString());
    }

    ffmpegArgs.push(
      "-i", streamUrl,
      "-loglevel", "warning"
    );

    if (options.filterString) {
      ffmpegArgs.push("-af", options.filterString);
    }

    ffmpegArgs.push(
      "-f", "s16le",
      "-ar", "48000",
      "-ac", "2",
      "pipe:1"
    );

    const ffmpeg = spawn(getFfmpegPath(), ffmpegArgs);

    // 512 KB jitter buffer (~2.7s audio) to prevent packet underrun and Discord stuttering
    const audioBufferStream = new PassThrough({ highWaterMark: 1024 * 512 });
    ffmpeg.stdout.pipe(audioBufferStream);

    ffmpeg.on("error", (err) => {
      if (options.logger) options.logger.log(`[FFmpeg] Process error: ${err.message}`, "error");
    });

    ffmpeg.stderr.on("data", (data) => {
      const msg = data.toString().trim();
      if (!msg) return;

      // Filter transient TLS/HTTPS auto-reconnection notices (handled automatically by FFmpeg)
      if (
        msg.includes("Will reconnect at") ||
        msg.includes("Error in the pull function") ||
        msg.includes("error=I/O error")
      ) {
        if (options.logger) options.logger.log(`[FFmpeg] Stream auto-reconnecting (handled by buffer)`, "debug");
        return;
      }

      if (msg.includes("Error") || msg.includes("error") || msg.includes("403")) {
        if (options.logger) options.logger.log(`[FFmpeg] Stderr: ${msg}`, "warn");
      }
    });

    ffmpeg.on("close", (code) => {
      if (code !== 0 && code !== null) {
        if (options.logger) options.logger.log(`[FFmpeg] Exited with code ${code}`, "warn");
      }
    });

    const resource = createAudioResource(audioBufferStream, {
      inputType: StreamType.Raw,
      inlineVolume: true,
    });

    if (typeof options.volume === "number") {
      resource.volume?.setVolume(options.volume / 100);
    }

    return { resource, ffmpeg };
  }
}

module.exports = TogetherStreamer;
