const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const PremiumCode = require("../../../src/schema/premiumCode");
const PremiumSubscription = require("../../../src/schema/premiumSubscription");
const { isUserPremium, isGuildPremium, redeemPremiumCode } = require("../../../src/utils/premiumCheck");
const botBridge = require("../services/botBridge");

// Official Plan Pricing Catalog
const PLANS = {
  user_monthly: {
    id: "user_monthly",
    name: "User Pass (Monthly)",
    scope: "user",
    durationDays: 30,
    priceINR: 149,
    priceUSD: 2.49,
    popular: false,
    badge: "PERSONAL",
    description: "Lossless 320kbps audio, 200% volume, and audio DSP filters for your account in any server.",
    perks: [
      "Lossless 320kbps Opus Studio Audio",
      "Volume boost up to 200%",
      "All 10-Band EQ & DSP Filters (Bass Heavy, 8D, Nightcore, Vaporwave)",
      "Follows your account in any Discord server",
      "VIP Profile Badge on Web Leaderboard",
      "Priority Audio Encoding Queue"
    ]
  },
  user_lifetime: {
    id: "user_lifetime",
    name: "User Pass (Lifetime)",
    scope: "user",
    durationDays: 0,
    priceINR: 499,
    priceUSD: 7.99,
    popular: false,
    badge: "LIFETIME VALUE",
    description: "One-time payment for permanent personal premium access forever.",
    perks: [
      "Everything in User Monthly",
      "Permanent Lifetime Access (No Recurring Fees)",
      "Exclusive Golden VIP Crown on Dashboard",
      "Direct Priority Support Channel"
    ]
  },
  guild_monthly: {
    id: "guild_monthly",
    name: "Server Pass (Monthly)",
    scope: "guild",
    durationDays: 30,
    priceINR: 299,
    priceUSD: 4.99,
    popular: true,
    badge: "MOST POPULAR",
    description: "Unlocks 24/7 channel persistence and studio audio for every member in your Discord server.",
    perks: [
      "Permanent 24/7 Voice Channel Lock (Never Disconnects)",
      "Unlocks Premium for ALL server members in voice",
      "Unlimited Queue Size (Free is capped at 30)",
      "Lossless 320kbps Studio Transcoding for Guild",
      "Continuous Autoplay Replenishment",
      "Synchronized Live Lyrics on Dashboard"
    ]
  },
  guild_lifetime: {
    id: "guild_lifetime",
    name: "Server Pass (Lifetime)",
    scope: "guild",
    durationDays: 0,
    priceINR: 999,
    priceUSD: 14.99,
    popular: false,
    badge: "ULTIMATE SERVER",
    description: "Permanent 24/7 music & lossless streaming for your entire community forever.",
    perks: [
      "Everything in Server Pass Monthly",
      "Permanent Server Lifetime Access (Never Expires)",
      "Exclusive Server Verified Sound Badge",
      "Access to Dedicated VIP Canary Voice Node"
    ]
  }
};

function generateRedeemCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let part1 = "";
  let part2 = "";
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TOGETHER-PREM-${part1}-${part2}`;
}

function generateInvoiceNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `INV-${timestamp}-${rand}`;
}

// ── GET /api/premium/plans ──────────────────────────────────
router.get("/plans", (req, res) => {
  res.json({
    success: true,
    plans: Object.values(PLANS)
  });
});

// ── GET /api/premium/status ─────────────────────────────────
router.get("/status", authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const guildId = req.query?.guildId || null;

    const userStatus = await isUserPremium(userId);
    let guildStatus = { isPremium: false, subscription: null };
    if (guildId) {
      guildStatus = await isGuildPremium(guildId);
    }

    res.json({
      success: true,
      user: {
        isPremium: userStatus.isPremium,
        subscription: userStatus.subscription
      },
      guild: {
        isPremium: guildStatus.isPremium,
        subscription: guildStatus.subscription
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/premium/create-order ──────────────────────────
router.post("/create-order", authenticateUser, async (req, res) => {
  try {
    const { planId, currency = "INR" } = req.body || {};
    const plan = PLANS[planId];
    if (!plan) {
      return res.status(400).json({ success: false, error: "Invalid plan selected." });
    }

    const curr = currency.toUpperCase() === "USD" ? "USD" : "INR";
    const amount = curr === "USD" ? plan.priceUSD : plan.priceINR;

    const orderId = `order_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const invoiceId = generateInvoiceNumber();

    // Check if Razorpay keys are configured in environment
    const rzpKeyId = process.env.RAZORPAY_KEY_ID || null;
    const isMock = !rzpKeyId;

    res.json({
      success: true,
      orderId,
      invoiceId,
      planId: plan.id,
      planName: plan.name,
      scope: plan.scope,
      amount,
      currency: curr,
      keyId: rzpKeyId || "rzp_test_together_demo",
      isMock,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email || `${req.user.id}@discord.together`
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/premium/verify-payment ────────────────────────
router.post("/verify-payment", authenticateUser, async (req, res) => {
  try {
    const { planId, currency = "INR", orderId, paymentId, signature } = req.body || {};
    const plan = PLANS[planId];
    if (!plan) {
      return res.status(400).json({ success: false, error: "Invalid plan." });
    }

    const curr = currency.toUpperCase() === "USD" ? "USD" : "INR";
    const amountPaid = curr === "USD" ? plan.priceUSD : plan.priceINR;
    const finalPaymentId = paymentId || `pay_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const invoiceId = generateInvoiceNumber();
    const code = generateRedeemCode();

    // Save in Database
    const newCode = await PremiumCode.create({
      code,
      plan: plan.id,
      scope: plan.scope,
      durationDays: plan.durationDays,
      purchasedBy: String(req.user.id),
      purchasedByName: req.user.username || `User ${req.user.id}`,
      paymentId: finalPaymentId,
      amountPaid,
      currency: curr,
      invoiceId
    });

    // Send Real-Time Discord Log to #1568284208533864498
    await botBridge.sendDashboardLog({
      event: "PREMIUM_PURCHASE",
      user: req.user.username || req.user.id,
      action: `Purchased ${plan.name}`,
      details: `Code: ${code} | Invoice: ${invoiceId} | Amount: ${curr} ${amountPaid}`,
      color: "#00E676"
    }).catch(() => {});

    res.json({
      success: true,
      code,
      invoiceId,
      plan: plan.id,
      planName: plan.name,
      scope: plan.scope,
      durationDays: plan.durationDays,
      amountPaid,
      currency: curr,
      paymentId: finalPaymentId,
      purchasedAt: newCode.createdAt,
      message: "Payment verified successfully! Your redemption code and digital tax invoice are ready."
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/premium/redeem ────────────────────────────────
router.post("/redeem", authenticateUser, async (req, res) => {
  try {
    const { code, guildId, guildName } = req.body || {};
    if (!code) {
      return res.status(400).json({ success: false, error: "Please enter your redemption code." });
    }

    const result = await redeemPremiumCode(
      code,
      req.user.id,
      req.user.username || `User ${req.user.id}`,
      guildId || null,
      guildName || null
    );

    // Send Discord notification to #1568284208533864498
    await botBridge.sendDashboardLog({
      event: "PREMIUM_REDEEMED",
      user: req.user.username || req.user.id,
      guildId: guildId || "PERSONAL_ACCOUNT",
      guildName: guildName || "User Account",
      action: `Redeemed ${result.plan.toUpperCase()}`,
      details: `Code: ${code.toUpperCase()} | Target: ${result.targetName}`,
      color: "#FFD700"
    }).catch(() => {});

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── GET /api/premium/invoice/:invoiceId ─────────────────────
router.get("/invoice/:invoiceId", authenticateUser, async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const codeDoc = await PremiumCode.findOne({ invoiceId });
    if (!codeDoc) {
      return res.status(404).json({ success: false, error: "Invoice not found." });
    }

    // Only purchaser or bot owner can view
    const isOwner = req.user.id === (process.env.OWNER_ID || "852857077650423828");
    if (codeDoc.purchasedBy !== req.user.id && !isOwner) {
      return res.status(403).json({ success: false, error: "Unauthorized to view this invoice." });
    }

    const plan = PLANS[codeDoc.plan] || { name: codeDoc.plan };

    res.json({
      success: true,
      invoice: {
        invoiceNumber: codeDoc.invoiceId,
        date: codeDoc.createdAt,
        planName: plan.name,
        scope: codeDoc.scope,
        durationDays: codeDoc.durationDays,
        amount: codeDoc.amountPaid,
        currency: codeDoc.currency,
        paymentId: codeDoc.paymentId,
        code: codeDoc.code,
        redeemed: codeDoc.redeemed,
        redeemedAt: codeDoc.redeemedAt,
        purchaser: {
          id: codeDoc.purchasedBy,
          name: codeDoc.purchasedByName
        },
        company: {
          name: "TOGETHER TECHNOLOGIES // AUDIO CLUSTER",
          taxGst: "NOT-REGISTERED-DIGITAL-SERVICES",
          website: "https://dash.together.dpdns.org",
          support: "https://help.together.dpdns.org"
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
