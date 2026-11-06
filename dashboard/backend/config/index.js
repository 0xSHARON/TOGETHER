const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

module.exports = {
  port: parseInt(process.env.DASHBOARD_PORT || "5080", 10),
  jwtSecret: process.env.JWT_SECRET || "together_brutalist_jwt_secret_cyber_2026",
  botApiUrl: process.env.BOT_API_URL || "http://127.0.0.1:5050",
  botApiSecret: process.env.BOT_API_SECRET || "together_internal_secret_key_9918",
  clientId: process.env.DISCORD_CLIENT_ID || "863496211667484676",
  clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
  redirectUri: process.env.DASHBOARD_REDIRECT_URI || "https://dash.together.dpdns.org/api/auth/callback",
  frontendUrl: process.env.DASHBOARD_FRONTEND_URL || "https://dash.together.dpdns.org",
  mongoUri: process.env.MONGODB_URL || "",
  ownerIds: (process.env.OWNER_IDS || "780345293237125152").split(",").map(id => id.trim()).filter(Boolean),
  topggToken: process.env.TOPGG_TOKEN || "",
  topggVoteUrl: process.env.TOPGG_VOTE_URL || "https://top.gg/bot/863496211667484676/vote"
};

