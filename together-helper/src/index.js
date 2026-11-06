// Early Warning Suppression
process.on("warning", (warning) => {
  if (warning.name === "DeprecationWarning" && warning.message.includes("The ready event has been renamed to clientReady")) {
    return;
  }
});

const util = require("util");
const consoleStreamer = require("./utils/consoleStreamer");
const { initAllLogThreads, dispatchLogThread } = require("./utils/webhooks");
const { EmbedBuilder } = require("discord.js");

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

// Initialize Discord Client with full Guild Members and Message Content Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember]
});

client.commands = new Collection();
client.config = config;

// Connect to MongoDB
async function initDatabase() {
  const uri = config.mongoUri;
  if (!uri) {
    console.warn("[MongoDB Warning] MONGODB_URL is not configured in .env! Features requiring persistence will run with limited functionality.");
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log("[MongoDB] Connected to database successfully.");
  } catch (err) {
    console.error("[MongoDB Error] Failed to connect:", err.message);
  }
}

// Client Ready Event
client.once("ready", async () => {
  console.log(`\n==============================================`);
  console.log(`🤖 TOGETHER HELPER ONLINE: ${client.user.tag}`);
  console.log(`👑 Operating in ${client.guilds.cache.size} guilds`);
  console.log(`==============================================\n`);

  client.user.setPresence({
    activities: [{
      name: "over TOGETHER Community | /ticket",
      type: ActivityType.Watching
    }],
    status: "online"
  });

  // 1. Initialize Discord Console Streamer
  try {
    consoleStreamer.init(client);
    console.log("[ConsoleStreamer] Connected to Discord thread.");
  } catch (err) {
    console.error("[ConsoleStreamer Error]", err);
  }

  // 2. Pre-create and verify log threads in channel 1568284208533864498
  try {
    console.log(`[LogThreads] Initializing dedicated log threads in #${config.logChannelId}...`);
    await initAllLogThreads(client);
    console.log("[LogThreads] All log threads verified and active.");
  } catch (err) {
    console.error("[LogThreads Error]", err);
  }

  // 3. Deploy Slash commands
  await loadCommands(client);
});

// Error handling with Discord thread logging
process.on("unhandledRejection", (reason, p) => {
  console.error("[Unhandled Rejection]", reason);
  try {
    const errorEmbed = new EmbedBuilder()
      .setColor("#ED4245")
      .setTitle("⚠️ Unhandled Promise Rejection")
      .setDescription(`\`\`\`js\n${String(reason?.stack || reason).slice(0, 4000)}\n\`\`\``)
      .setTimestamp();
    dispatchLogThread(client, "error", errorEmbed);
  } catch {}
});

process.on("uncaughtException", (err, origin) => {
  console.error("[Uncaught Exception]", err);
  try {
    const errorEmbed = new EmbedBuilder()
      .setColor("#ED4245")
      .setTitle("🚨 Uncaught Exception")
      .setDescription(`**Origin:** \`${origin}\`\n\`\`\`js\n${String(err?.stack || err).slice(0, 3900)}\n\`\`\``)
      .setTimestamp();
    dispatchLogThread(client, "error", errorEmbed);
  } catch {}
});

// Bootstrap Bot
async function main() {
  await initDatabase();
  loadEvents(client);

  if (!config.token) {
    console.warn("\n[Helper Warning] BOT_TOKEN is empty in together-helper/.env!");
    console.warn("Please provide your helper bot token in together-helper/.env to start the bot.\n");
    return;
  }

  await client.login(config.token);
}

main().catch((err) => {
  console.error("[Startup Fatal Error]", err);
});
