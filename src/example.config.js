// Deprecated compatibility entrypoint. Configure the bot with `.env` instead.
// See `.env.example` in the repository root for every supported setting.
module.exports = require("./config");
const { existsSync } = require("node:fs");
const { resolve } = require("node:path");

const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath) && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(envPath);
}

const list = (value = "") => value.split(",").map((item) => item.trim()).filter(Boolean);
const boolean = (value, fallback = false) => {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const config = {
  token: process.env.BOT_TOKEN || "",
  prefix: process.env.BOT_PREFIX || ".",
  ownerID: list(process.env.OWNER_IDS),
  SpotifyID: process.env.SPOTIFY_CLIENT_ID || "",
  SpotifySecret: process.env.SPOTIFY_CLIENT_SECRET || "",
  youtubeAPIKey: process.env.YOUTUBE_API_KEY || "",
  mongourl: process.env.MONGODB_URL || "",
  color: process.env.BOT_COLOR || "#3F4652",
  logs: process.env.LOG_LEVEL || "info",
  node_source: process.env.LAVALINK_SOURCE || "scsearch",

  links: {
    BG: process.env.BACKGROUND_URL || "",
    support: process.env.SUPPORT_URL || "",
    invite: process.env.INVITE_URL || "",
    Shafed_Billa: "TOGETHER",
    power: "developed by kajukatli.",
    vanity: process.env.VANITY_URL || "",
    guild: process.env.COMMUNITY_GUILD_ID || "",
  },

  Webhooks: {
    black: process.env.BLACKLIST_WEBHOOK_URL || "",
    player_create: process.env.PLAYER_CREATE_WEBHOOK_URL || "",
    player_delete: process.env.PLAYER_DELETE_WEBHOOK_URL || "",
    guild_join: process.env.GUILD_JOIN_WEBHOOK_URL || "",
    guild_leave: process.env.GUILD_LEAVE_WEBHOOK_URL || "",
    cmdrun: process.env.COMMAND_WEBHOOK_URL || "",
  },

  nodes: [
    {
      name: "Serenetia-SSL",
      url: "lavalinkv4.serenetia.com:443",
      auth: "https://seretia.link/discord",
      secure: true,
    },
    {
      name: "Serenetia-NonSSL",
      url: "lavalinkv4.serenetia.com:80",
      auth: "https://seretia.link/discord",
      secure: false,
    },
    ...(boolean(process.env.ENABLE_PUBLIC_LAVALINK, true) ? [
      {
        name: "Public-Trinium-4333",
        url: "lavalink.triniumhost.com:4333",
        auth: "free",
        secure: false,
      },
      {
        name: "Public-Trinium-2333",
        url: "lavalink.triniumhost.com:2333",
        auth: "kirito",
        secure: false,
      },
      {
        name: "Public-Trinium-SSL",
        url: "lavalink-v4.triniumhost.com:443",
        auth: "free",
        secure: true,
      },
      {
        name: "Nazha-SG-1",
        url: "sg-1.nazha.online:443",
        auth: "https://discord.gg/XeSCnk57ZF",
        secure: true,
      },
      {
        name: "Nazha-SG-2",
        url: "sg-2.nazha.online:443",
        auth: "https://discord.gg/XeSCnk57ZF",
        secure: true,
      },
      {
        name: "Nazha-SG-3",
        url: "sg-3.nazha.online:443",
        auth: "https://discord.gg/XeSCnk57ZF",
        secure: true,
      },
      {
        name: "Nazha-Global",
        url: "lavalink.nazha.online:443",
        auth: "nazhafreelava",
        secure: true,
      }
    ] : [])
  ],

  node_options: {
    moveOnDisconnect: true,
    resume: true,
    resumeTimeout: 60,
    resumeByLibrary: true,
    reconnectTries: 5,
    reconnectInterval: 5,
    restTimeout: 60_000,
    voiceConnectionTimeout: 30_000,
    userAgent: "TOGETHER",
  },

  lavalinkStatus: {
    channelId: process.env.LAVALINK_STATUS_CHANNEL_ID || "1551903730402590781",
    alertUserId: process.env.LAVALINK_ALERT_USER_ID || "780345293237125152",
    updateInterval: Number(process.env.LAVALINK_STATUS_INTERVAL) || 60_000,
    embedColor: process.env.LAVALINK_STATUS_COLOR || "#2F3136",
  },
};

config.validate = () => {
  const missing = [];
  if (!config.token) missing.push("BOT_TOKEN");
  if (!config.mongourl) missing.push("MONGODB_URL");
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}. Copy .env.example to .env and fill in the values.`);
  }
};

module.exports = config;
