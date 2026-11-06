const { Schema, model, models } = require("mongoose");

const premiumCodeSchema = new Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true,
    index: true 
  },
  plan: { 
    type: String, 
    enum: ["user_monthly", "user_lifetime", "guild_monthly", "guild_lifetime"], 
    required: true 
  },
  scope: { 
    type: String, 
    enum: ["user", "guild"], 
    required: true 
  },
  durationDays: { 
    type: Number, 
    default: 30 // 0 means permanent / lifetime
  },
  purchasedBy: { 
    type: String, 
    required: true 
  }, // Discord user ID
  purchasedByName: {
    type: String,
    default: ""
  },
  paymentId: { 
    type: String, 
    required: true 
  }, // Transaction / Gateway reference ID
  amountPaid: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: "INR",
    uppercase: true 
  },
  invoiceId: { 
    type: String, 
    required: true,
    unique: true,
    index: true 
  },
  redeemed: { 
    type: Boolean, 
    default: false 
  },
  redeemedBy: { 
    type: String, 
    default: null 
  }, // Discord user ID who redeemed
  redeemedByName: {
    type: String,
    default: null
  },
  redeemedGuildId: { 
    type: String, 
    default: null 
  }, // Guild ID if redeemed for a server
  redeemedGuildName: {
    type: String,
    default: null
  },
  redeemedAt: { 
    type: Date, 
    default: null 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = models.PremiumCode || model("PremiumCode", premiumCodeSchema);

