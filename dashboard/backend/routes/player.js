const express = require("express");
const { authenticateUser } = require("../middleware/auth");
const { requireGuildPermission } = require("../middleware/guildAuth");
const { TwoFourSeven, ensureConnected } = require("../services/dbService");
const botBridge = require("../services/botBridge");

const router = express.Router();

// GET /api/player/:guildId -> Fetch player, queue, current track & filters
router.get("/:guildId", authenticateUser, requireGuildPermission, async (req, res) => {
  try {
    await ensureConnected().catch(() => {});
    const [data, twoFourSeven] = await Promise.all([
      botBridge.getGuildPlayer(req.guildId),
      TwoFourSeven.findOne({ Guild: req.guildId }).maxTimeMS(2000).lean().catch(() => null)
    ]);

    const is247 = Boolean(twoFourSeven);

    if (!data) {
      return res.json({
        guildId: req.guildId,
        playing: false,
        paused: true,
        volume: 80,
        position: 0,
        duration: 0,
        loop: "none",
        autoplay: false,
        is247,
        voiceChannel: null,
        current: null,
        queue: []
      });
    }

    data.is247 = is247;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/player/:guildId/action -> Dispatch music controls (pause, resume, skip, seek, etc.)
router.post("/:guildId/action", authenticateUser, requireGuildPermission, async (req, res) => {
  const { action, position, query, value, index } = req.body;
  const validActions = [
    "pause", "resume", "skip", "previous", "seek", "loop", 
    "autoplay", "volume", "clear", "clearQueue", "shuffle", "stop", "play", "removeTrack"
  ];

  if (!action || !validActions.includes(action)) {
    return res.status(400).json({ error: `Invalid action '${action}'. Allowed: ${validActions.join(", ")}` });
  }

  try {
    const result = await botBridge.sendPlayerAction(req.guildId, action, { 
      position, 
      query, 
      value, 
      index, 
      user: req.user 
    });
    
    // Broadcast player update to Socket.IO room if server socket instance attached
    const io = req.app.get("io");
    if (io) {
      io.to(`guild:${req.guildId}`).emit("playerUpdate", { guildId: req.guildId, action, ...result });
    }

    // Log player action to Discord thread
    botBridge.sendDashboardLog({
      event: "PLAYER_ACTION",
      user: req.user,
      guildId: req.guildId,
      action: `Music Control: ${action.toUpperCase()}`,
      details: `Action: \`${action}\`${query ? ` (Query: "${query}")` : ""}${typeof value === "number" ? ` (Volume: ${value}%)` : ""}${typeof position === "number" ? ` (Position: ${position})` : ""}${typeof index === "number" ? ` (Index: ${index})` : ""} by **${req.user.username}**.`,
      color: "#00E676"
    });

    res.json({ success: true, action, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

