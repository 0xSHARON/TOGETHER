const PremiumCode = require("../schema/premiumCode");
const PremiumSubscription = require("../schema/premiumSubscription");

/**
 * Checks if a specific Discord User has an active TOGETHER PREMIUM subscription.
 * @param {string} userId 
 * @returns {Promise<{ isPremium: boolean, subscription: object|null }>}
 */
async function isUserPremium(userId) {
  if (!userId) return { isPremium: false, subscription: null };
  try {
    const sub = await PremiumSubscription.findOne({ targetId: String(userId), scope: "user", active: true });
    if (!sub) return { isPremium: false, subscription: null };

    // Check expiration if not lifetime
    if (sub.expiresAt && new Date(sub.expiresAt).getTime() < Date.now()) {
      sub.active = false;
      await sub.save().catch(() => {});
      return { isPremium: false, subscription: null };
    }

    return { isPremium: true, subscription: sub.toObject() };
  } catch (err) {
    console.error("[premiumCheck] Error checking user premium:", err.message);
    return { isPremium: false, subscription: null };
  }
}

/**
 * Checks if a specific Discord Guild (Server) has an active TOGETHER PREMIUM subscription.
 * @param {string} guildId 
 * @returns {Promise<{ isPremium: boolean, subscription: object|null }>}
 */
async function isGuildPremium(guildId) {
  if (!guildId) return { isPremium: false, subscription: null };
  try {
    const sub = await PremiumSubscription.findOne({ targetId: String(guildId), scope: "guild", active: true });
    if (!sub) return { isPremium: false, subscription: null };

    // Check expiration if not lifetime
    if (sub.expiresAt && new Date(sub.expiresAt).getTime() < Date.now()) {
      sub.active = false;
      await sub.save().catch(() => {});
      return { isPremium: false, subscription: null };
    }

    return { isPremium: true, subscription: sub.toObject() };
  } catch (err) {
    console.error("[premiumCheck] Error checking guild premium:", err.message);
    return { isPremium: false, subscription: null };
  }
}

/**
 * Checks if a playback session qualifies for Premium perks (if either the user OR guild is premium).
 * @param {string} userId 
 * @param {string} guildId 
 * @returns {Promise<{ isPremium: boolean, reason: 'guild'|'user'|'none', subscription: object|null }>}
 */
async function isPlayerPremium(userId, guildId) {
  const [guildCheck, userCheck] = await Promise.all([
    isGuildPremium(guildId),
    isUserPremium(userId)
  ]);

  if (guildCheck.isPremium) {
    return { isPremium: true, reason: "guild", subscription: guildCheck.subscription };
  }
  if (userCheck.isPremium) {
    return { isPremium: true, reason: "user", subscription: userCheck.subscription };
  }
  return { isPremium: false, reason: "none", subscription: null };
}

/**
 * Redeems a TOGETHER PREMIUM key for a User or a Guild.
 * @param {string} rawCode 
 * @param {string} userId 
 * @param {string} [userName] 
 * @param {string} [guildId] 
 * @param {string} [guildName] 
 */
async function redeemPremiumCode(rawCode, userId, userName = "", guildId = null, guildName = null) {
  if (!rawCode || !userId) {
    throw new Error("Missing required parameters: rawCode and userId are mandatory.");
  }

  const cleanCode = String(rawCode).trim().toUpperCase();
  const codeDoc = await PremiumCode.findOne({ code: cleanCode });

  if (!codeDoc) {
    throw new Error("Invalid redemption code. Please verify and try again.");
  }

  if (codeDoc.redeemed) {
    throw new Error(`This code has already been redeemed on ${new Date(codeDoc.redeemedAt).toLocaleDateString()}.`);
  }

  // Validate scope requirement
  let targetId = String(userId);
  let targetName = userName || `User ${userId}`;
  if (codeDoc.scope === "guild") {
    if (!guildId) {
      throw new Error("This is a Guild (Server) Premium Code. You must specify which Discord server to apply it to.");
    }
    targetId = String(guildId);
    targetName = guildName || `Guild ${guildId}`;
  }

  // Calculate new expiration date
  const now = Date.now();
  let newExpiresAt = null;

  if (codeDoc.durationDays > 0) {
    const durationMs = codeDoc.durationDays * 24 * 60 * 60 * 1000;
    // Check if target already has active time remaining to extend
    const existingSub = await PremiumSubscription.findOne({ targetId, scope: codeDoc.scope, active: true });
    if (existingSub && existingSub.expiresAt && new Date(existingSub.expiresAt).getTime() > now) {
      newExpiresAt = new Date(new Date(existingSub.expiresAt).getTime() + durationMs);
    } else {
      newExpiresAt = new Date(now + durationMs);
    }
  }

  // Mark code redeemed
  codeDoc.redeemed = true;
  codeDoc.redeemedBy = String(userId);
  codeDoc.redeemedByName = userName || null;
  codeDoc.redeemedGuildId = guildId ? String(guildId) : null;
  codeDoc.redeemedGuildName = guildName || null;
  codeDoc.redeemedAt = new Date();
  await codeDoc.save();

  // Upsert subscription
  const sub = await PremiumSubscription.findOneAndUpdate(
    { targetId, scope: codeDoc.scope },
    {
      targetId,
      targetName,
      scope: codeDoc.scope,
      tier: "TOGETHER_PREMIUM",
      plan: codeDoc.plan,
      active: true,
      expiresAt: newExpiresAt,
      redeemedCode: cleanCode,
      redeemedBy: String(userId),
      invoiceId: codeDoc.invoiceId,
      upgradedAt: new Date()
    },
    { upsert: true, returnDocument: 'after' }
  );

  return {
    success: true,
    scope: codeDoc.scope,
    plan: codeDoc.plan,
    targetId,
    targetName,
    expiresAt: newExpiresAt,
    invoiceId: codeDoc.invoiceId,
    amountPaid: codeDoc.amountPaid,
    currency: codeDoc.currency,
    message: codeDoc.scope === "guild"
      ? `Successfully activated TOGETHER Guild Premium for "${targetName}"!`
      : `Successfully activated TOGETHER User Premium for account "${targetName}"!`
  };
}

module.exports = {
  isUserPremium,
  isGuildPremium,
  isPlayerPremium,
  redeemPremiumCode
};
