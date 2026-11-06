const mongoose = require("mongoose");

// 1. Welcome Configuration
const welcomeSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  channelId: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  message: { type: String, default: "Welcome to **{server}**, {user}! Dive into lossless audio with TOGETHER." },
  dmWelcome: { type: Boolean, default: false }
});

// 2. Suggestions System
const suggestionSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  enabled: { type: Boolean, default: true }
});

// 3. Bug Reports System
const bugReportSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  enabled: { type: Boolean, default: true }
});

// 4. Sticky Message System
const stickySchema = new mongoose.Schema({
  channelId: { type: String, required: true, unique: true },
  guildId: { type: String, required: true },
  message: { type: String, required: true },
  lastMessageId: { type: String, default: null },
  enabled: { type: Boolean, default: true }
});

// 5. Ticket System Configuration & Active Tickets
const ticketConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  categoryId: { type: String, default: null },
  staffRoleId: { type: String, default: null },
  logsChannelId: { type: String, default: null },
  panelChannelId: { type: String, default: null },
  panelMessageId: { type: String, default: null },
  ticketCounter: { type: Number, default: 0 }
});

const ticketSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  ticketNumber: { type: Number, required: true },
  category: { type: String, default: "General Support" },
  status: { type: String, default: "open" }, // open, closed
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  WelcomeConfig: mongoose.model("HelperWelcome", welcomeSchema),
  SuggestionConfig: mongoose.model("HelperSuggestion", suggestionSchema),
  BugReportConfig: mongoose.model("HelperBugReport", bugReportSchema),
  StickyMessage: mongoose.model("HelperSticky", stickySchema),
  TicketConfig: mongoose.model("HelperTicketConfig", ticketConfigSchema),
  Ticket: mongoose.model("HelperTicket", ticketSchema)
};
