const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { authenticateUser } = require("../middleware/auth");
const { setUserGuilds } = require("../services/sessionStore");
const { UserPreferences, Liked, PlaylistLibrary } = require("../services/dbService");

const router = express.Router();

// GET /api/auth/status -> Check if OAuth2 client secret is configured
router.get("/status", (req, res) => {
  res.json({
    configured: Boolean(config.clientId && config.clientSecret),
    clientId: config.clientId,
    topggVoteUrl: config.topggVoteUrl || "https://top.gg/bot/863496211667484676/vote"
  });
});

// GET /api/auth/login -> Redirect to Discord OAuth2 Authorization
router.get("/login", (req, res) => {
  if (!config.clientSecret) {
    console.error("[OAuth Warning] DISCORD_CLIENT_SECRET is missing in .env! Cannot exchange OAuth2 token.");
    return res.redirect(`${config.frontendUrl}/login?error=missing_client_secret`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "identify guilds",
    prompt: "consent"
  });

  res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
});

// GET /api/auth/callback -> Handle code exchange
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${config.frontendUrl}/login?error=missing_code`);
  }

  if (!config.clientSecret) {
    console.error("[OAuth Error] DISCORD_CLIENT_SECRET is not configured.");
    return res.redirect(`${config.frontendUrl}/login?error=missing_client_secret`);
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenParams = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri
    });

    const tokenRes = await axios.post("https://discord.com/api/oauth2/token", tokenParams.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const { access_token } = tokenRes.data;

    // 2. Fetch user profile
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    // 3. Fetch user guilds
    const guildsRes = await axios.get("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const user = userRes.data;
    const guilds = guildsRes.data.map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      owner: g.owner,
      permissions: g.permissions
    }));

    // Cache guilds in memory to avoid huge cookie size issues
    setUserGuilds(user.id, guilds);

    const isOwner = config.ownerIds.map(String).includes(String(user.id).trim()) ||
      String(user.id).trim() === "780345293237125152";

    // 4. Generate compact signed JWT session token (under 250 bytes)
    const sessionPayload = {
      id: user.id,
      username: user.username,
      global_name: user.global_name || user.username,
      avatar: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
        : "https://cdn.discordapp.com/embed/avatars/0.png",
      isOwner
    };

    const token = jwt.sign(sessionPayload, config.jwtSecret, { expiresIn: "7d" });

    // Set secure HTTP-only Cookie
    res.cookie("together_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.redirect(`${config.frontendUrl}/overview`);
  } catch (err) {
    const discordErr = err.response?.data?.error || err.message;
    console.error("[OAuth Error]", err.response?.data || err.message);

    if (discordErr === "invalid_client") {
      return res.redirect(`${config.frontendUrl}/login?error=missing_client_secret`);
    }

    res.redirect(`${config.frontendUrl}/login?error=oauth_failed`);
  }
});

// GET /api/auth/me -> Returns current user session
router.get("/me", authenticateUser, (req, res) => {
  const isOwner = config.ownerIds.map(String).includes(String(req.user.id).trim()) ||
    String(req.user.id).trim() === "780345293237125152" ||
    Boolean(req.user.isOwner);

  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      global_name: req.user.global_name,
      avatar: req.user.avatar,
      isOwner
    }
  });
});

// GET /api/auth/profile -> Returns full user music preferences, stats, liked songs, playlists
router.get("/profile", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const [prefDoc, likedDoc, playlistDoc] = await Promise.all([
      UserPreferences.findOne({ userId }),
      Liked.findOne({ userId }),
      PlaylistLibrary.findOne({ userId })
    ]);

    const isOwner = config.ownerIds.map(String).includes(String(req.user.id).trim()) ||
      String(req.user.id).trim() === "780345293237125152" ||
      Boolean(req.user.isOwner);

    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        global_name: req.user.global_name,
        avatar: req.user.avatar,
        isOwner
      },
      stats: {
        level: prefDoc?.level || 1,
        xp: prefDoc?.xp || 0,
        songsPlayed: prefDoc?.songsPlayed || 0,
        listeningSeconds: prefDoc?.listeningSeconds || 0,
        streak: prefDoc?.streak || 0,
        bio: prefDoc?.bio || "",
        anthem: prefDoc?.anthem || { title: "", artist: "", uri: "" },
        musicSource: prefDoc?.musicSource || "ytmsearch",
        accentColor: prefDoc?.accentColor || "#00E676"
      },
      likedSongs: {
        total: likedDoc?.songs?.length || 0,
        recent: (likedDoc?.songs || []).slice(-8).reverse()
      },
      playlists: {
        total: playlistDoc?.playlists?.length || 0,
        items: (playlistDoc?.playlists || []).map((p) => ({
          name: p.name,
          tracksCount: p.tracks?.length || 0,
          updatedAt: p.updatedAt
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout -> Clears session
router.post("/logout", (req, res) => {
  res.clearCookie("together_token");
  res.json({ success: true, message: "Logged out successfully" });
});

module.exports = router;
