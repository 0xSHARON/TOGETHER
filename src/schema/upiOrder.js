const { Schema, model, models } = require("mongoose");

const upiOrderSchema = new Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    default: ""
  },
  userAvatar: {
    type: String,
    default: "/logo.png"
  },
  planId: {
    type: String,
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  scope: {
    type: String,
    enum: ["user", "guild"],
    required: true
  },
  durationDays: {
    type: Number,
    default: 30
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  utr: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    index: true
  },
  generatedCode: {
    type: String,
    default: null
  },
  invoiceId: {
    type: String,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  reviewedBy: {
    type: String,
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = models.UpiOrder || model("UpiOrder", upiOrderSchema);
