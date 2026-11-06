const express = require("express");
const { authenticateUser } = require("../middleware/auth");
const { checkGuildPermission } = require("../middleware/guildAuth");
const botBridge = require("../services/botBridge");

const router = express.Router();

// GET /api/guilds -> List guilds user can manage, tagged with real bot installation status
router.get("/", authenticateUser, async (req, res) => {
  try {
    const userGuilds = req.user.guilds || [];
    const botGuildIds = await botBridge.getBotGuildIds();
    const activeSessions = await botBridge.getActiveSessions();

    const activeGuildMap = new Map();
    activeSessions.forEach((s) => activeGuildMap.set(s.guildId, s));

    // Filter guilds where user has MANAGE_GUILD or ADMINISTRATOR, or if user is bot owner
    const manageable = userGuilds.filter((g) => req.user.isOwner || checkGuildPermission(g.permissions));

    // Map guild details with live bot membership verification
    const result = manageable.map((g) => {
      const activeSession = activeGuildMap.get(g.id);
      // If botGuildIds has items, use it; otherwise fallback to active session check
      const hasBot = botGuildIds.size > 0 ? botGuildIds.has(g.id) : (req.user.isOwner || !!activeSession);

      return {
        id: g.id,
        name: g.name,
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
        owner: g.owner,
        hasBot,
        isPlaying: !!activeSession?.playing,
        currentTrack: activeSession
          ? {
              title: activeSession.title,
              author: activeSession.author,
              thumbnail: activeSession.thumbnail,
              voiceChannelName: activeSession.voiceChannelName,
              listeners: activeSession.listeners
            }
          : null
      };
    });

    // Sort: servers where bot is installed first, then alphabetical
    result.sort((a, b) => {
      if (a.hasBot !== b.hasBot) return b.hasBot ? 1 : -1;
      return a.name.localeCompare(b.name);
    });

    const mutualGuilds = result.filter((g) => g.hasBot);
    const inviteGuilds = result.filter((g) => !g.hasBot);

    res.json({
      guilds: result,
      mutualGuilds,
      inviteGuilds,
      mutualCount: mutualGuilds.length,
      inviteCount: inviteGuilds.length,
      total: result.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
