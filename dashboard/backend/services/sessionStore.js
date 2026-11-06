// In-memory session cache for user guilds to prevent 4KB+ cookie overflow
const userGuildsCache = new Map();

function setUserGuilds(userId, guilds) {
  if (!userId || !Array.isArray(guilds)) return;
  userGuildsCache.set(userId, {
    guilds,
    updatedAt: Date.now()
  });
}

function getUserGuilds(userId) {
  if (!userId) return null;
  const entry = userGuildsCache.get(userId);
  if (!entry) return null;
  // Cache for 24 hours
  if (Date.now() - entry.updatedAt > 24 * 60 * 60 * 1000) {
    userGuildsCache.delete(userId);
    return null;
  }
  return entry.guilds;
}

module.exports = {
  setUserGuilds,
  getUserGuilds
};
