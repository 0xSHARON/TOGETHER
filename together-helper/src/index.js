// Early Warning Suppression
process.on("warning", (warning) => {
  if (warning.name === "DeprecationWarning" && warning.message.includes("The ready event has been renamed to clientReady")) {
    return;
  }
});

const util = require("util");
const consoleStreamer = require("./utils/consoleStreamer");
const Logger = require("./utils/logger");

// Intercept console stdout/stderr to mirror into Discord #console-logs thread
const origLog = console.log;
const origError = console.error;
console.log = function () {
  origLog.apply(console, arguments);
  const formatted = util.format.apply(util, arguments);
  consoleStreamer.write(formatted);
};
console.error = function () {
  origError.apply(console, arguments);
  const formatted = util.format.apply(util, arguments);
  consoleStreamer.write(formatted);
};

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  ActivityType
} = require("discord.js");
const mongoose = require("mongoose");
const config = require("./config");
const loadCommands = require("./loaders/commandLoader");
const loadEvents = require("./loaders/eventLoader");

// Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();
client.config = config;
client.logger = Logger;

// Connect to MongoDB
async function initDatabase() {
  const uri = config.mongoUri;
  if (!uri) {
    Logger.warn("MONGODB_URL is not configured in together-helper/.env! Some features will run in-memory.");
    return;
  }
  try {
    await mongoose.connect(uri);
    Logger.ready("Connected to MongoDB successfully.");
  } catch (err) {
    Logger.error(`[MongoDB Error] Failed to connect: ${err.message}`);
  }
}

// Client Ready Event
client.once("ready", async () => {
  Logger.ready(`==============================================`);
  Logger.ready(`TOGETHER HELPER ONLINE: ${client.user.tag}`);
  Logger.ready(`Operating across ${client.guilds.cache.size} guilds`);
  Logger.ready(`==============================================`);

  client.user.setPresence({
    activities: [{
      name: "over TOGETHER Community | /ticket",
      type: ActivityType.Watching
    }],
    status: "online"
  });

  // Initialize Discord console streamer thread
  try {
    consoleStreamer.init(client);
    Logger.info("Discord ConsoleStreamer linked to log thread.");
  } catch (err) {
    Logger.warn(`Failed to link ConsoleStreamer: ${err.message}`);
  }

  // Deploy Slash commands
  await loadCommands(client);
});

// Bootstrap Bot
async function main() {
  await initDatabase();
  loadEvents(client);

  if (!config.token) {
    Logger.warn("BOT_TOKEN is empty in together-helper/.env!");
    return;
  }

  await client.login(config.token);
}

main().catch((err) => {
  Logger.error(`[Startup Fatal Error] ${err.stack || err.message}`);
});
