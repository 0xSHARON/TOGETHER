const express = require("express");
const { authenticateUser } = require("../middleware/auth");
const { checkGuildPermission } = require("../middleware/guildAuth");
const botBridge = require("../services/botBridge");

const router = express.Router();

// GET /api/guilds -> List guilds user can manage, tagged with bot installation status
router.get("/", authenticateUser, async (req, res) => {
  try {
    const userGuilds = req.user.guilds || [];
    const botInfo = await botBridge.getBotInfo();
    const activeSessions = await botBridge.getActiveSessions();

    const activeGuildMap = new Map();
    activeSessions.forEach(s => activeGuildMap.set(s.guildId, s));

    // Filter guilds where user has MANAGE_GUILD or ADMINISTRATOR, or if user is bot owner
    const manageable = userGuilds.filter(g => req.user.isOwner || checkGuildPermission(g.permissions));

    // Map guild details
    const result = manageable.map(g => {
      const activeSession = activeGuildMap.get(g.id);
      return {
        id: g.id,
        name: g.name,
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
        owner: g.owner,
        hasBot: true, // We verify live when accessing player or via activeSessions
        isPlaying: !!activeSession?.playing,
        currentTrack: activeSession ? {
          title: activeSession.title,
          author: activeSession.author,
          thumbnail: activeSession.thumbnail,
          voiceChannelName: activeSession.voiceChannelName,
          listeners: activeSession.listeners
        } : null
      };
    });

    res.json({
      guilds: result,
      total: result.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

