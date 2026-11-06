const express = require("express");
const { authenticateUser } = require("../middleware/auth");
const { requireGuildPermission } = require("../middleware/guildAuth");
const botBridge = require("../services/botBridge");

const router = express.Router();

// GET /api/player/:guildId -> Fetch player, queue, current track & filters
router.get("/:guildId", authenticateUser, requireGuildPermission, async (req, res) => {
  try {
    const data = await botBridge.getGuildPlayer(req.guildId);
    if (!data) {
      return res.status(404).json({ error: "No active music session in this server." });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/player/:guildId/action -> Dispatch music controls (pause, resume, skip, seek, etc.)
router.post("/:guildId/action", authenticateUser, requireGuildPermission, async (req, res) => {
  const { action, position, query } = req.body;
  const validActions = ["pause", "resume", "skip", "previous", "seek", "loop", "autoplay", "volume", "clear", "shuffle", "stop", "play"];

  if (!action || !validActions.includes(action)) {
    return res.status(400).json({ error: `Invalid action '${action}'. Allowed: ${validActions.join(", ")}` });
  }

  try {
    const result = await botBridge.sendPlayerAction(req.guildId, action, { position, query, user: req.user });
    
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
      details: `Action: \`${action}\`${query ? ` (Query: "${query}")` : ""}${typeof position === "number" ? ` (Value: ${position})` : ""} by **${req.user.username}**.`,
      color: "#00E676"
    });

    res.json({ success: true, action, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

