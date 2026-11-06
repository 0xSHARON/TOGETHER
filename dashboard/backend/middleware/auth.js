const jwt = require("jsonwebtoken");
const config = require("../config");

function authenticateUser(req, res, next) {
  const token = req.cookies?.together_token || req.headers?.authorization?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Please authenticate via Discord." });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }
}

function requireOwner(req, res, next) {
  authenticateUser(req, res, () => {
    if (!req.user || !config.ownerIds.includes(req.user.id)) {
      return res.status(403).json({ error: "Access denied. Owner privilege required." });
    }
    next();
  });
}

module.exports = {
  authenticateUser,
  requireOwner
};

