const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { authenticateUser } = require("../middleware/auth");

const router = express.Router();

// GET /api/auth/login -> Redirect to Discord OAuth2 Authorization
router.get("/login", (req, res) => {
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
    const guilds = guildsRes.data.map(g => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      owner: g.owner,
      permissions: g.permissions
    }));

    const isOwner = config.ownerIds.includes(user.id);

    // 4. Generate signed JWT session token
    const sessionPayload = {
      id: user.id,
      username: user.username,
      global_name: user.global_name || user.username,
      avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256` : "https://cdn.discordapp.com/embed/avatars/0.png",
      isOwner,
      guilds
    };

    const token = jwt.sign(sessionPayload, config.jwtSecret, { expiresIn: "7d" });

    // Set HTTP-only Cookie
    res.cookie("together_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.redirect(`${config.frontendUrl}/overview`);
  } catch (err) {
    console.error("[OAuth Error]", err.response?.data || err.message);
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

