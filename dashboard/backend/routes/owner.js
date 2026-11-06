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
        channelId: "1568284208533864498",
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

// GET /api/owner/discord-logs -> Real-time logs from channel 1568284208533864498
router.get("/discord-logs", requireOwner, async (req, res) => {
  try {
    const logs = await botBridge.getDiscordLogs();
    res.json({
      channelId: "1568284208533864498",
      channelName: "system-logs",
      total: logs.length,
      logs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/owner/send-log -> Send a log/diagnostic ping into channel 1568284208533864498
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

module.exports = router;

