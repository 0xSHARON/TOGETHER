const express = require("express");
const { requireOwner } = require("../middleware/auth");
const botBridge = require("../services/botBridge");
const { flushLogs } = require("../services/consoleStream");
const { TwoFourSeven, UserPreferences, Blacklist } = require("../services/dbService");

const router = express.Router();

// GET /api/owner/overview -> Comprehensive system & bot diagnostics
router.get("/overview", requireOwner, async (req, res) => {
  try {
    const [botInfo, activeSessions, total247, totalUsers, totalBlacklisted] = await Promise.all([
      botBridge.getBotInfo().catch(() => ({})),
      botBridge.getActiveSessions().catch(() => []),
      TwoFourSeven.countDocuments().maxTimeMS(2500).catch(() => 0),
      UserPreferences.countDocuments().maxTimeMS(2500).catch(() => 0),
      Blacklist.countDocuments().maxTimeMS(2500).catch(() => 0)
    ]);

    res.json({
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      },
      bot: botInfo?.bot || {},
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

