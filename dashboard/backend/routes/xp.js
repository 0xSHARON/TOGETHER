const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { authenticateUser } = require("../middleware/auth");
const { UserPreferences } = require("../services/dbService");
const botBridge = require("../services/botBridge");

const router = express.Router();

// Helper to extract optional user from cookie or authorization header
function getOptionalUser(req) {
  const token = req.cookies?.together_token || req.headers?.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
}

// GET /api/xp/leaderboard -> Global or Server leaderboard (PUBLIC)
router.get("/leaderboard", async (req, res) => {
  try {
    const viewer = getOptionalUser(req);
    const viewerId = viewer?.id ? String(viewer.id).trim() : null;
    const { guildId, sort } = req.query;

    // 1. Primary: query bot process for Discord-resolved usernames and avatars
    let botData = await botBridge.getLeaderboard({ guildId, sort });
    let leaderboard = botData?.leaderboard || [];

    // 2. Fallback to MongoDB if bot is temporarily restarting
    if (!leaderboard || leaderboard.length === 0) {
      const rawUsers = await UserPreferences.find()
        .sort({ xp: -1, songsPlayed: -1, listeningSeconds: -1 })
        .limit(100)
        .lean()
        .catch(() => []);

      let activeUsers = rawUsers.filter((d) => 
        (d.songsPlayed > 0 || d.xp > 0 || d.listeningSeconds > 0) &&
        d.userId !== "863496211667484676"
      );
      if (activeUsers.length === 0) activeUsers = rawUsers;

      leaderboard = activeUsers.map((u, i) => ({
        rank: i + 1,
        userId: u.userId,
        name: `User_${String(u.userId || "").slice(-4)}`,
        username: `user_${String(u.userId || "").slice(-4)}`,
        avatarUrl: null,
        xp: u.xp || 0,
        level: u.level || 1,
        songsPlayed: u.songsPlayed || 0,
        listeningSeconds: u.listeningSeconds || 0,
        listeningMinutes: Math.floor((u.listeningSeconds || 0) / 60),
        streak: u.streak || 0,
        accentColor: u.accentColor || "#FF1E38"
      }));
    }

    // 3. Compute viewer rank & profile
    let myRank = null;
    let myProfile = null;
    if (viewerId) {
      const idx = leaderboard.findIndex((u) => String(u.userId) === viewerId);
      if (idx !== -1) {
        myRank = idx + 1;
        myProfile = leaderboard[idx];
      } else {
        // Logged-in user is not in the top slice, fetch their own stats
        const personalDoc = await UserPreferences.findOne({ userId: viewerId }).lean().catch(() => null);
        if (personalDoc) {
          myProfile = {
            rank: "100+",
            userId: viewerId,
            name: viewer.username || `User_${viewerId.slice(-4)}`,
            username: viewer.username || `user_${viewerId.slice(-4)}`,
            avatarUrl: viewer.avatar ? `https://cdn.discordapp.com/avatars/${viewerId}/${viewer.avatar}.png?size=256` : null,
            xp: personalDoc.xp || 0,
            level: personalDoc.level || 1,
            songsPlayed: personalDoc.songsPlayed || 0,
            listeningSeconds: personalDoc.listeningSeconds || 0,
            listeningMinutes: Math.floor((personalDoc.listeningSeconds || 0) / 60),
            streak: personalDoc.streak || 0,
            accentColor: personalDoc.accentColor || "#FF1E38"
          };
        }
      }
    }

    res.json({
      leaderboard,
      totalUsers: botData?.totalUsers || leaderboard.length,
      scope: botData?.scope || (guildId ? "server" : "global"),
      serverName: botData?.serverName || (guildId ? "Server" : "Global"),
      myRank,
      myProfile
    });
  } catch (err) {
    res.status(500).json({ error: err.message, leaderboard: [], totalUsers: 0 });
  }
});

// GET /api/xp/me -> Current user's XP & listening statistics
router.get("/me", authenticateUser, async (req, res) => {
  try {
    let profile = await UserPreferences.findOne({ userId: req.user.id }).lean();
    if (!profile) {
      profile = {
        userId: req.user.id,
        xp: 0,
        level: 1,
        songsPlayed: 0,
        listeningSeconds: 0,
        streak: 0,
        accentColor: "#00E676"
      };
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
