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
    support: process.env.SUPPORT_URL || "https://discord.gg/mUdGTs2Dw5",
    invite: process.env.INVITE_URL || "",
    Shafed_Billa: "TOGETHER",
    power: "developed by kajukatli.",
    vanity: process.env.VANITY_URL || "",
    guild: process.env.COMMUNITY_GUILD_ID || "",
    vote: process.env.VOTE_URL || process.env.TOPGG_VOTE_URL || "",
  },
  topggToken: process.env.TOPGG_TOKEN || "",
  voteChannelId: process.env.VOTE_CHANNEL_ID || "1524235256339890327",
  topggWebhookAuth: process.env.TOPGG_WEBHOOK_AUTH || "",
  votePort: Number(process.env.VOTE_PORT) || 5000,
  footerText: "TOGETHER • Sound that brings us closer",

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
        name: "Ajieblogs-V4",
        url: "lava-v4.ajieblogs.eu.org:443",
        auth: "https://dsc.gg/ajidevserver",
        secure: true,
      },
      {
        name: "Millohost-SSL",
        url: "lava-v4.millohost.my.id:443",
        auth: "https://discord.gg/mjS5J2K3ep",
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
      },
      {
        name: "Kasawa-Pro",
        url: "lava2.kasawa.pro:2334",
        auth: "youshallnotpass",
        secure: false,
      },
      {
        name: "Vexanode-Nokia",
        url: "nokia.vexanode.gg:19133",
        auth: "vexanode.cloud",
        secure: false,
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
    statusChannelId: process.env.LAVALINK_STATUS_CHANNEL_ID || "",
    alertChannelId: process.env.LAVALINK_ALERT_CHANNEL_ID || "",
    channelId: process.env.LAVALINK_STATUS_CHANNEL_ID || "",
    alertUserId: process.env.LAVALINK_ALERT_USER_ID || "",
    updateInterval: Number(process.env.LAVALINK_STATUS_INTERVAL) || 60_000,
    embedColor: process.env.LAVALINK_STATUS_COLOR || "#2F3136",
  },

  logging: {
    categoryId: process.env.LOG_CATEGORY_ID || "",
    channelId: process.env.LOG_CHANNEL_ID || "",
    useThreads: true,
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
