const express = require("express");
const { authenticateUser } = require("../middleware/auth");
const { checkGuildPermission } = require("../middleware/guildAuth");
const botBridge = require("../services/botBridge");

const router = express.Router();

// GET /api/guilds -> List guilds user belongs to, tagged with live bot presence & active playback
router.get("/", authenticateUser, async (req, res) => {
  try {
    const userGuilds = req.user.guilds || [];
    const botGuildIds = await botBridge.getBotGuildIds();
    const activeSessions = await botBridge.getActiveSessions();

    const activeGuildMap = new Map();
    activeSessions.forEach((s) => activeGuildMap.set(s.guildId, s));

    // Map every guild user belongs to with live status and management permissions
    const result = userGuilds.map((g) => {
      const activeSession = activeGuildMap.get(g.id);
      const hasBot = botGuildIds.size > 0 ? botGuildIds.has(g.id) : (req.user.isOwner || !!activeSession);
      const canManage = Boolean(req.user.isOwner || checkGuildPermission(g.permissions));
      const isPlaying = Boolean(activeSession && (activeSession.playing || (activeSession.title && activeSession.title !== "Connected in Voice" && activeSession.title !== "Waiting for Music...")));

      return {
        id: g.id,
        name: g.name,
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
        owner: g.owner,
        hasBot,
        canManage,
        isPlaying,
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

    // Priority Sort: Active playback servers first, then servers with bot, then alphabetical
    result.sort((a, b) => {
      if (a.isPlaying !== b.isPlaying) return b.isPlaying ? 1 : -1;
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
