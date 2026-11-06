require("dotenv").config();

module.exports = {
  token: process.env.BOT_TOKEN || "",
  prefix: process.env.BOT_PREFIX || "?",
  ownerIds: (process.env.OWNER_IDS || "780345293237125152").split(",").map(s => s.trim()).filter(Boolean),
  mainBotId: process.env.MAIN_BOT_ID || "863496211667484676",
  mongoUri: process.env.MONGODB_URL || "",
  color: "#FF1E38", // Neo-Brutalist Red Accent
  accentColor: "#00E676", // Neo Emerald Accent
  dashboardUrl: process.env.DASHBOARD_URL || "https://dash.together.dpdns.org",
  supportUrl: process.env.SUPPORT_URL || "https://discord.gg/mUdGTs2Dw5"
};
