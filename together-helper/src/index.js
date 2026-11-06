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

  // Deploy Slash commands
  await loadCommands(client);
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
