const jwt = require("jsonwebtoken");
const config = require("../config");
const { getUserGuilds } = require("../services/sessionStore");

function authenticateUser(req, res, next) {
  const token = req.cookies?.together_token || req.headers?.authorization?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Please authenticate via Discord." });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;

    // Dynamically verify owner status against config.ownerIds and hardcoded master ID
    const isOwner = config.ownerIds.map(String).includes(String(decoded.id).trim()) ||
      String(decoded.id).trim() === "780345293237125152" ||
      Boolean(decoded.isOwner);

    req.user.isOwner = isOwner;

    // Attach guilds from memory cache or fallback to decoded payload
    req.user.guilds = getUserGuilds(decoded.id) || decoded.guilds || [];
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }
}

function requireOwner(req, res, next) {
  authenticateUser(req, res, () => {
    const isOwner = config.ownerIds.map(String).includes(String(req.user?.id).trim()) ||
      String(req.user?.id).trim() === "780345293237125152" ||
      Boolean(req.user?.isOwner);

    if (!req.user || !isOwner) {
      return res.status(403).json({ error: "Access denied. Owner privilege required." });
    }
    next();
  });
}

module.exports = {
  authenticateUser,
  requireOwner
};
