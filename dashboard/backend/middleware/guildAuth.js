// Discord Permissions Bitwise Flags
const MANAGE_GUILD = BigInt(0x20);
const ADMINISTRATOR = BigInt(0x8);

function checkGuildPermission(permissions) {
  if (!permissions) return false;
  try {
    const permBit = BigInt(permissions);
    return (permBit & ADMINISTRATOR) === ADMINISTRATOR || (permBit & MANAGE_GUILD) === MANAGE_GUILD;
  } catch {
    return false;
  }
}

function requireGuildPermission(req, res, next) {
  const guildId = req.params.guildId || req.body.guildId || req.query.guildId;
  if (!guildId) {
    return res.status(400).json({ error: "Missing guildId parameter." });
  }

  if (!req.user || !Array.isArray(req.user.guilds)) {
    return res.status(403).json({ error: "No guild metadata associated with session." });
  }

  // Allow bot owners to manage any guild
  const config = require("../config");
  if (config.ownerIds.includes(req.user.id)) {
    req.guildId = guildId;
    return next();
  }

  const userGuild = req.user.guilds.find(g => g.id === guildId);
  if (!userGuild) {
    return res.status(403).json({ error: "You are not a member of this Discord server." });
  }

  if (!checkGuildPermission(userGuild.permissions)) {
    return res.status(403).json({ error: "Insufficient permissions. Manage Server or Administrator required." });
  }

  req.guildId = guildId;
  req.targetGuild = userGuild;
  next();
}

module.exports = {
  checkGuildPermission,
  requireGuildPermission
};

