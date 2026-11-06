const jwt = require("jsonwebtoken");
const config = require("../config");
const { getUserGuilds } = require("../services/sessionStore");

function isBotOwner(user) {
  if (!user) return false;
  const idStr = String(user.id || "").trim();
  const uname = String(user.username || "").toLowerCase().trim();
  const globalName = String(user.global_name || "").toLowerCase().trim();

  if (idStr === "780345293237125152") return true;
  if (config.ownerIds.map(String).map(s => s.trim()).includes(idStr)) return true;
  if ((process.env.OWNER_IDS || "").split(",").map(s => s.trim()).includes(idStr)) return true;
  if (uname === "kajukatli." || uname === "kaju" || user.username === "KAJU🦋") return true;
  if (globalName.includes("kaju") || globalName.includes("kajukatli")) return true;
  if (Boolean(user.isOwner)) return true;
  return false;
}

function authenticateUser(req, res, next) {
  const token = req.cookies?.together_token || req.headers?.authorization?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Please authenticate via Discord." });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;

    // Dynamically verify owner status against config.ownerIds and hardcoded master ID
    req.user.isOwner = isBotOwner(decoded);

    // Attach guilds from memory cache or fallback to decoded payload
    req.user.guilds = getUserGuilds(decoded.id) || decoded.guilds || [];
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }
}

function requireOwner(req, res, next) {
  authenticateUser(req, res, () => {
    if (!req.user || !isBotOwner(req.user)) {
      return res.status(403).json({ error: "Access denied. Bot owner privileges required." });
    }
    req.user.isOwner = true;
    next();
  });
}

module.exports = {
  authenticateUser,
  requireOwner,
  isBotOwner
};
