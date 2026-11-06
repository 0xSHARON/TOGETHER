const { Schema, model, models } = require("mongoose");

const premiumSubscriptionSchema = new Schema({
  targetId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  }, // User ID or Guild ID
  targetName: {
    type: String,
    default: ""
  },
  scope: { 
    type: String, 
    enum: ["user", "guild"], 
    required: true,
    index: true 
  },
  tier: { 
    type: String, 
    default: "TOGETHER_PREMIUM" 
  },
  plan: {
    type: String,
    enum: ["user_monthly", "user_lifetime", "guild_monthly", "guild_lifetime"],
    required: true
  },
  active: { 
    type: Boolean, 
    default: true,
    index: true 
  },
  expiresAt: { 
    type: Date, 
    default: null // null means lifetime
  },
  redeemedCode: { 
    type: String, 
    required: true 
  },
  redeemedBy: {
    type: String,
    required: true
  },
  invoiceId: {
    type: String,
    default: ""
  },
  upgradedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = models.PremiumSubscription || model("PremiumSubscription", premiumSubscriptionSchema);
