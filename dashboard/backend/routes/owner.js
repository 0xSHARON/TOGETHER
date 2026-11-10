const express = require("express");
const { requireOwner } = require("../middleware/auth");
const botBridge = require("../services/botBridge");
const { flushLogs } = require("../services/consoleStream");
const { TwoFourSeven, UserPreferences, Blacklist } = require("../services/dbService");

const router = express.Router();

// GET /api/owner/overview -> Comprehensive system & bot diagnostics
router.get("/overview", requireOwner, async (req, res) => {
  try {
    const [botInfo, activeSessions, total247, totalUsers, totalBlacklisted, nodeData, discordLogs] = await Promise.all([
      botBridge.getBotInfo().catch(() => ({})),
      botBridge.getActiveSessions().catch(() => []),
      TwoFourSeven.countDocuments().maxTimeMS(2500).catch(() => 0),
      UserPreferences.countDocuments().maxTimeMS(2500).catch(() => 0),
      Blacklist.countDocuments().maxTimeMS(2500).catch(() => 0),
      botBridge.getLavalinkNodes().catch(() => null),
      botBridge.getDiscordLogs().catch(() => [])
    ]);

    res.json({
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      },
      bot: botInfo?.bot || {},
      lavalink: nodeData || {
        totalNodes: 1,
        onlineNodes: 1,
        gatewayPing: botInfo?.bot?.ping || 24,
        nodes: []
      },
      discordLogs: {
        channelId: "1557621712948830388",
        channelName: "system-logs",
        total: Array.isArray(discordLogs) ? discordLogs.length : 0,
        logs: Array.isArray(discordLogs) ? discordLogs : []
      },
      database: {
        total247Guilds: Number(total247) || 0,
        registeredListeners: Number(totalUsers) || 0,
        blacklistedEntities: Number(totalBlacklisted) || 0
      },
      activeMusicSessions: Array.isArray(activeSessions) ? activeSessions : []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/owner/nodes -> Dedicated Lavalink cluster telemetry
router.get("/nodes", requireOwner, async (req, res) => {
  try {
    const data = await botBridge.getLavalinkNodes();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/owner/discord-logs -> Real-time logs from channel 1557621712948830388
router.get("/discord-logs", requireOwner, async (req, res) => {
  try {
    const logs = await botBridge.getDiscordLogs();
    res.json({
      channelId: "1557621712948830388",
      channelName: "system-logs",
      total: logs.length,
      logs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/owner/send-log -> Send a log/diagnostic ping into channel 1557621712948830388
router.post("/send-log", requireOwner, async (req, res) => {
  try {
    const { message } = req.body || {};
    const result = await botBridge.sendDiscordLog(message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/owner/flush-logs -> Manually flush buffered console logs to Discord thread
router.post("/flush-logs", requireOwner, async (req, res) => {
  try {
    await flushLogs();
    res.json({ success: true, message: "Dashboard logs flushed to 🌐・dashboard-logs" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/owner/servers -> All servers/guilds the bot is currently in (serverlist feature)
router.get("/servers", requireOwner, async (req, res) => {
  try {
    const data = await botBridge.getServerList();
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, guilds: [] });
  }
});

// POST /api/owner/leave-server -> Leave a guild by ID (leaveserver feature)
router.post("/leave-server", requireOwner, async (req, res) => {
  try {
    const { guildId } = req.body || {};
    if (!guildId) return res.status(400).json({ success: false, error: "Missing guildId." });
    const result = await botBridge.leaveServer(guildId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/owner/blacklist -> List blacklisted users from database (blacklist feature)
router.get("/blacklist", requireOwner, async (req, res) => {
  try {
    const list = await Blacklist.find().sort({ timestamp: -1 }).lean();
    res.json({ success: true, count: list.length, blacklist: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, blacklist: [] });
  }
});

// POST /api/owner/blacklist -> Add or remove user from blacklist
router.post("/blacklist", requireOwner, async (req, res) => {
  try {
    const { action, userId } = req.body || {};
    if (!userId) return res.status(400).json({ success: false, error: "Missing userId." });

    if (action === "add") {
      const existing = await Blacklist.findOne({ userId });
      if (existing) {
        return res.json({ success: true, message: `User ${userId} is already blacklisted.` });
      }
      await Blacklist.create({ userId, type: "user" });
      return res.json({ success: true, message: `User ${userId} has been blacklisted.` });
    } else if (action === "remove") {
      await Blacklist.deleteOne({ userId });
      return res.json({ success: true, message: `User ${userId} removed from blacklist.` });
    }

    res.status(400).json({ success: false, error: "Invalid action. Use 'add' or 'remove'." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/owner/reload -> Reload commands and reset slash command cache (reload feature)
router.post("/reload", requireOwner, async (req, res) => {
  try {
    const result = await botBridge.reloadCommands();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/owner/support-dispatches -> Get recent support dispatches
router.get("/support-dispatches", requireOwner, async (req, res) => {
  try {
    const dispatches = await botBridge.getSupportDispatches();
    res.json({ success: true, dispatches });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/owner/dm-issuer -> Owner sends direct message to ticket issuer through Together Bot
router.post("/dm-issuer", requireOwner, async (req, res) => {
  try {
    const { userId, ticketId, subject, message } = req.body;
    if (!userId || !message || !message.trim()) {
      return res.status(400).json({ error: "User ID and message are required." });
    }
    const replyBy = req.user.global_name || req.user.username || "KAJU🦋 (Lead Systems Architect)";
    const result = await botBridge.dmIssuer({
      userId,
      ticketId,
      subject,
      message: message.trim(),
      replyBy
    });
    if (result.success) {
      res.json(result);
    } else {
      res.status(502).json({ error: result.error || "Failed to deliver DM to user." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

