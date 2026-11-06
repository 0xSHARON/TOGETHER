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

// 6. AFK System
const afkSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  reason: { type: String, default: "AFK" },
  timestamp: { type: Date, default: Date.now }
});
afkSchema.index({ userId: 1, guildId: 1 }, { unique: true });

// 7. Moderation Warning Records
const warnSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  moderatorId: { type: String, required: true },
  reason: { type: String, default: "No reason provided." },
  warnId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 8. AutoMod & Server Protection Configuration
const autoModSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  antiLink: { type: Boolean, default: false },
  antiInvite: { type: Boolean, default: false },
  antiSpam: { type: Boolean, default: false },
  ignoredRoles: { type: [String], default: [] },
  ignoredChannels: { type: [String], default: [] }
});

// 9. Giveaways System
const giveawaySchema = new mongoose.Schema({
  messageId: { type: String, required: true, unique: true },
  channelId: { type: String, required: true },
  guildId: { type: String, required: true },
  prize: { type: String, required: true },
  winnersCount: { type: Number, default: 1 },
  endsAt: { type: Date, required: true },
  hostedBy: { type: String, required: true },
  entries: { type: [String], default: [] },
  ended: { type: Boolean, default: false },
  winners: { type: [String], default: [] }
});

// 10. Verification Gatekeeper System
const verifySchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  roleId: { type: String, required: true },
  channelId: { type: String, required: true },
  enabled: { type: Boolean, default: true }
});

// 11. AutoRole Configuration
const autoRoleSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  humanRoleId: { type: String, default: null },
  botRoleId: { type: String, default: null },
  enabled: { type: Boolean, default: true }
});

module.exports = {
  WelcomeConfig: mongoose.model("HelperWelcome", welcomeSchema),
  SuggestionConfig: mongoose.model("HelperSuggestion", suggestionSchema),
  BugReportConfig: mongoose.model("HelperBugReport", bugReportSchema),
  StickyMessage: mongoose.model("HelperSticky", stickySchema),
  TicketConfig: mongoose.model("HelperTicketConfig", ticketConfigSchema),
  Ticket: mongoose.model("HelperTicket", ticketSchema),
  Afk: mongoose.model("HelperAfk", afkSchema),
  Warn: mongoose.model("HelperWarn", warnSchema),
  AutoModConfig: mongoose.model("HelperAutoModConfig", autoModSchema),
  Giveaway: mongoose.model("HelperGiveaway", giveawaySchema),
  VerifyConfig: mongoose.model("HelperVerifyConfig", verifySchema),
  AutoRoleConfig: mongoose.model("HelperAutoRoleConfig", autoRoleSchema)
};
