/**
 * ConsoleStreamer
 * Batches and streams console output (stdout/stderr) directly to
 * the dedicated Discord thread (💻・console-logs) in channel 1551909877356695562.
 */

class ConsoleStreamer {
  constructor() {
    this.client = null;
    this.queue = [];
    this.isFlushing = false;
    this.timer = null;
    this.flushIntervalMs = 2500;
  }

  init(client) {
    this.client = client;
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.flush(), this.flushIntervalMs);
  }

  /**
   * Enqueue a console message
   * @param {string} text
   */
  write(text) {
    if (!text || typeof text !== "string") return;

    // Filter out internal echoes to prevent infinite feedback loops
    if (
      text.includes('[LogThread] Dispatched "console"') ||
      text.includes("console-logs") ||
      text.includes("DeprecationWarning: The ready event has been renamed") ||
      text.includes("Debugger listening on")
    ) {
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    this.queue.push(trimmed);

    // Eagerly flush if backlog accumulates rapidly
    if (this.queue.length >= 15 && !this.isFlushing) {
      this.flush();
    }
  }

  /**
   * Flush queued logs to Discord in batches
   */
  async flush() {
    if (this.isFlushing || !this.client || this.queue.length === 0) return;
    this.isFlushing = true;

    try {
      const { getOrCreateLogThread } = require("./webhooks.js");
      const thread = await getOrCreateLogThread(this.client, "console");
      if (!thread) {
        this.isFlushing = false;
        return;
      }

      // Extract all queued lines
      const items = this.queue.splice(0, this.queue.length);
      const chunks = [];
      let currentChunk = "";

      for (const item of items) {
        const line = item + "\n";
        if (currentChunk.length + line.length > 1750) {
          chunks.push(currentChunk);
          currentChunk = line;
        } else {
          currentChunk += line;
        }
      }
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk);
      }

      for (const chunk of chunks) {
        const content = chunk.trim();
        if (!content) continue;

        await thread.send({
          content: `\`\`\`ansi\n${content}\n\`\`\``,
        }).catch(() => {});
      }
    } catch {
      // Gracefully discard delivery error to avoid crashing the node process
    } finally {
      this.isFlushing = false;
    }
  }
}

const streamer = new ConsoleStreamer();
module.exports = streamer;
