const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config(); // Fallback to root .env if present

module.exports = {
  token: process.env.BOT_TOKEN || "",
  prefix: process.env.BOT_PREFIX || "-",
  ownerIds: (process.env.OWNER_IDS || "780345293237125152").split(",").map(s => s.trim()).filter(Boolean),
  mainBotId: process.env.MAIN_BOT_ID || "863496211667484676",
  mongoUri: process.env.MONGODB_URL || "",
  ticketsCategoryId: process.env.TICKETS_CATEGORY_ID || "",
  supportGuildId: process.env.SUPPORT_GUILD_ID || "",
  logChannelId: process.env.LOG_CHANNEL_ID || "1557621712948830388",
  color: "#FF1E38", // Neo-Brutalist Red Accent
  accentColor: "#00E676", // Neo Emerald Accent
  dashboardUrl: process.env.DASHBOARD_URL || "https://dash.together.dpdns.org",
  supportUrl: process.env.SUPPORT_URL || "https://discord.gg/mUdGTs2Dw5"
};
