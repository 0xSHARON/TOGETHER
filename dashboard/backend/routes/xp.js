const express = require("express");
const { authenticateUser } = require("../middleware/auth");
const { UserPreferences } = require("../services/dbService");

const router = express.Router();

// GET /api/xp/leaderboard -> Global leaderboard sorted by XP & Listening Time
router.get("/leaderboard", authenticateUser, async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserPreferences.find()
        .sort({ xp: -1, songsPlayed: -1, listeningSeconds: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserPreferences.countDocuments()
    ]);

    const formatted = users.map((u, i) => ({
      rank: skip + i + 1,
      userId: u.userId,
      xp: u.xp || 0,
      level: u.level || 1,
      songsPlayed: u.songsPlayed || 0,
      listeningMinutes: Math.floor((u.listeningSeconds || 0) / 60),
      streak: u.streak || 0,
      accentColor: u.accentColor || "#FF1E38"
    }));

    res.json({
      leaderboard: formatted,
      page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/xp/me -> Current user's XP & listening statistics
router.get("/me", authenticateUser, async (req, res) => {
  try {
    let profile = await UserPreferences.findOne({ userId: req.user.id });
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

