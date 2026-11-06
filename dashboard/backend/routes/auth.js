const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { authenticateUser } = require("../middleware/auth");
const { setUserGuilds } = require("../services/sessionStore");

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

    const isOwner = config.ownerIds.includes(user.id);

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
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      global_name: req.user.global_name,
      avatar: req.user.avatar,
      isOwner: req.user.isOwner
    }
  });
});

// POST /api/auth/logout -> Clears session
router.post("/logout", (req, res) => {
  res.clearCookie("together_token");
  res.json({ success: true, message: "Logged out successfully" });
});

module.exports = router;
