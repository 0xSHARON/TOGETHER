// Early Warning Suppression
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('The ready event has been renamed to clientReady')) {
    return;
  }
});

const fs = require('fs');
const util = require('util');
const consoleStreamer = require('./src/utils/consoleStreamer');
const origLog = console.log;
const origError = console.error;
console.log = function() {
  origLog.apply(console, arguments);
  const formatted = util.format.apply(util, arguments);
  try { fs.appendFileSync('bot.log', '[LOG] ' + formatted + '\n'); } catch {}
  consoleStreamer.write(formatted);
};
console.error = function() {
  origError.apply(console, arguments);
  const formatted = util.format.apply(util, arguments);
  try { fs.appendFileSync('bot.log', '[ERR] ' + formatted + '\n'); } catch {}
  consoleStreamer.write(formatted);
};

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const { setGlobalDispatcher, Agent } = require("undici");
setGlobalDispatcher(new Agent({ connect: { timeout: 30_000 } }));

const MusicBot = require("./src/structures/MusicClient");
const Dokdo = require("dokdo");
const Logger = require("./src/utils/logger");
const config = require("./src/config");

const client = new MusicBot();
module.exports = client;

client.connect();

if (config.ownerID.length) {
  client.Jsk = new Dokdo.Client(client, {
    aliases: ["dokdo", "dok", "jsk"],
    prefix: [".."],
    owners: config.ownerID,
  });
}

process.env.SHELL = process.platform === "win32" ? "powershell" : "bash";

const emojis = require("./src/emojis");
client.emoji = emojis;

client.on("messageCreate", (message) => {
  client.Jsk?.run(message);
});

// Suppress specific library deprecation warnings
process.on("warning", (warning) => {
  if (warning?.name === "DeprecationWarning" && warning?.message?.includes("clientReady")) {
    return;
  }
  console.warn(warning);
});

// Improved Error Handling with Logger
process.on("unhandledRejection", (reason, p) => {
  // Filter known Lavalink/Undici timeouts to avoid log spam
  if (reason && (reason.code === 'UND_ERR_CONNECT_TIMEOUT' || (reason.message && reason.message.includes('fetch failed')))) {
    Logger.log("[Lavalink Error] Connection timeout or fetch failed. Node might be down.", "warn");
    return;
  }

  // Filter transient voice UDP socket close errors during reconnects
  const reasonText = reason ? (reason.message || String(reason) || "") : "";
  if (reasonText.includes("Cannot perform IP discovery")) {
    Logger.log("[Voice] Transient IP discovery socket closed during reconnection.", "debug");
    return;
  }

  Logger.log(`[Unhandled Rejection] Reason: ${reason}`, "error");
  console.error(reason, p); // Keep console.error for stack trace details

  // Session Cleanup Logic
  if (reason && reason.message && reason.message.includes('Session not found')) {
    Logger.log("[Session Error] Lavalink session lost, attempting cleanup...", "warn");

    if (reason.path && typeof reason.path === 'string') {
      const guildIdMatch = reason.path.match(/\/players\/(\d+)/);
      if (guildIdMatch && guildIdMatch[1]) {
        const guildId = guildIdMatch[1];
        Logger.log(`[Session Error] Cleaning up player for guild ${guildId}`, "warn");

        try {
          if (client.manager && client.manager.players.has(guildId)) {
            client.manager.players.delete(guildId);
          }
          if (client.voiceHealthMonitor) {
            client.voiceHealthMonitor.stopMonitoring(guildId);
          }
        } catch (cleanupError) {
          Logger.log(`[Session Error] Cleanup failed: ${cleanupError}`, "error");
        }
      }
    }
  }
});

process.on("uncaughtException", (err, origin) => {
  Logger.log(`[Uncaught Exception] ${err}`, "error");
  console.error(origin, err);
  process.exit(1);
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
  Logger.log(`[Uncaught Exception Monitor] ${err}`, "error");
  console.error(origin, err);
});
