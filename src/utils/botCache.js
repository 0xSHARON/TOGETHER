const PrefixSchema = require("../schema/prefix");
const IgnoreChannelModel = require("../schema/ignorechannel");
const NoPrefixSchema = require("../schema/noprefix");
const BlacklistSchema = require("../schema/blacklist");

// In-memory caches with timestamps
const prefixCache = new Map();
const ignoredChannelsCache = new Map();
const noPrefixCache = new Map();
const blacklistCache = new Map();

const TTL = 120_000; // 2 minutes

/**
 * Get the configured prefix for a guild with fast in-memory caching.
 */
async function getGuildPrefix(guildId, defaultPrefix = ".") {
  if (!guildId) return defaultPrefix;
  const cached = prefixCache.get(guildId);
  const now = Date.now();

  if (cached && now - cached.timestamp < TTL) {
    return cached.prefix;
  }

  try {
    const data = await PrefixSchema.findOne({ Guild: guildId }).lean();
    const prefix = data?.Prefix || defaultPrefix;
    prefixCache.set(guildId, { prefix, timestamp: now });
    return prefix;
  } catch (err) {
    return cached ? cached.prefix : defaultPrefix;
  }
}

/**
 * Invalidate or update prefix cache for a guild.
 */
function setGuildPrefixCache(guildId, prefix) {
  if (!guildId) return;
  prefixCache.set(guildId, { prefix, timestamp: Date.now() });
}

/**
 * Check if a channel is ignored with fast in-memory caching.
 */
async function isChannelIgnored(guildId, channelId) {
  if (!guildId || !channelId) return false;
  const key = `${guildId}:${channelId}`;
  const cached = ignoredChannelsCache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < TTL) {
    return cached.ignored;
  }

  try {
    const isIgnored = Boolean(await IgnoreChannelModel.findOne({ guildId, channelId }).lean());
    ignoredChannelsCache.set(key, { ignored: isIgnored, timestamp: now });
    return isIgnored;
  } catch {
    return cached ? cached.ignored : false;
  }
}

/**
 * Check if user has active NoPrefix status with in-memory caching.
 */
async function hasNoPrefix(userId) {
  if (!userId) return false;
  const cached = noPrefixCache.get(userId);
  const now = Date.now();

  if (cached && now - cached.timestamp < TTL) {
    return cached.hasNoPrefix;
  }

  try {
    const doc = await NoPrefixSchema.findOne({
      userId,
      guildId: "GLOBAL",
      noprefix: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    }).lean();

    const result = Boolean(doc);
    noPrefixCache.set(userId, { hasNoPrefix: result, timestamp: now });
    return result;
  } catch {
    return cached ? cached.hasNoPrefix : false;
  }
}

/**
 * Check if a user is blacklisted with in-memory caching.
 */
async function isUserBlacklisted(userId) {
  if (!userId) return false;
  const cached = blacklistCache.get(userId);
  const now = Date.now();

  if (cached && now - cached.timestamp < TTL) {
    return cached.blacklisted;
  }

  try {
    const doc = await BlacklistSchema.findOne({ userId }).lean();
    const result = Boolean(doc);
    blacklistCache.set(userId, { blacklisted: result, timestamp: now });
    return result;
  } catch {
    return cached ? cached.blacklisted : false;
  }
}

module.exports = {
  getGuildPrefix,
  setGuildPrefixCache,
  isChannelIgnored,
  hasNoPrefix,
  isUserBlacklisted
};
