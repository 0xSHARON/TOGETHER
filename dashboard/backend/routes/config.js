const express = require("express");
const { authenticateUser } = require("../middleware/auth");
const { requireGuildPermission } = require("../middleware/guildAuth");
const { TwoFourSeven, Setup, Prefix, DJRole, ensureConnected, mongoose } = require("../services/dbService");
const botBridge = require("../services/botBridge");
const config = require("../config");

const router = express.Router();

// GET /api/config/:guildId -> Get 24/7, Setup channel, prefix, guild channels, and voter status
router.get("/:guildId", authenticateUser, requireGuildPermission, async (req, res) => {
  try {
    await ensureConnected().catch(() => {});

    const isDbReady = mongoose.connection.readyState === 1;

    const [twoFourSeven, setup, prefixDoc, djDoc, channels, voterStatus] = await Promise.all([
      isDbReady ? TwoFourSeven.findOne({ Guild: req.guildId }).maxTimeMS(2500).lean().catch(() => null) : null,
      isDbReady ? Setup.findOne({ Guild: req.guildId }).maxTimeMS(2500).lean().catch(() => null) : null,
      isDbReady ? Prefix.findOne({ Guild: req.guildId }).maxTimeMS(2500).lean().catch(() => null) : null,
      isDbReady ? DJRole.findOne({ guildId: req.guildId }).maxTimeMS(2500).lean().catch(() => null) : null,
      botBridge.getGuildChannels(req.guildId).catch(() => ({ textChannels: [], voiceChannels: [], roles: [] })),
      botBridge.checkVoterStatus(req.user.id).catch(() => ({ allowed: false, isOwner: false, isVoter: false }))
    ]);

    res.json({
      twoFourSeven: twoFourSeven
        ? {
            enabled: true,
            textId: twoFourSeven.TextId,
            voiceId: twoFourSeven.VoiceId
          }
        : { enabled: false, textId: null, voiceId: null },
      setup: setup
        ? {
            channelId: setup.Channel,
            messageId: setup.Message,
            voiceChannelId: setup.voiceChannel
          }
        : null,
      prefix: prefixDoc?.Prefix || ".",
      djRole: djDoc
        ? {
            roleId: djDoc.roleId,
            enabled: djDoc.mode !== false
          }
        : { roleId: null, enabled: false },
      channels: channels || { textChannels: [], voiceChannels: [], roles: [] },
      voterStatus: voterStatus || { allowed: false, isOwner: false, isVoter: false },
      topggVoteUrl: config.topggVoteUrl || "https://top.gg/bot/863496211667484676/vote"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/config/:guildId/247 -> Toggle or update 24/7 settings (Requires Top.gg Vote)
router.post("/:guildId/247", authenticateUser, requireGuildPermission, async (req, res) => {
  const { enabled, textId, voiceId } = req.body;

  try {
    // 1. Enforce Voter Gate: Only users who have voted on Top.gg (or bot owners) can update 24/7 mode
    const voterStatus = await botBridge.checkVoterStatus(req.user.id);
    if (!voterStatus?.allowed) {
      return res.status(403).json({
        error: "Top.gg vote required! You must vote for TOGETHER on Top.gg to configure 24/7 voice persistence.",
        voterOnly: true,
        voteUrl: config.topggVoteUrl || "https://top.gg/bot/863496211667484676/vote"
      });
    }

    await ensureConnected().catch(() => {});
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database is connecting. Please retry in a few moments." });
    }

    if (!enabled) {
      await TwoFourSeven.deleteOne({ Guild: req.guildId }).maxTimeMS(2500).catch(() => {});

      // Dispatch audit log to Discord thread
      botBridge.sendDashboardLog({
        event: "247_DISABLE",
        user: req.user,
        guildId: req.guildId,
        action: "24/7 Mode Disabled",
        details: `Voice persistence was turned off via Web Dashboard by **${req.user.username}**.`,
        color: "#FFA000"
      });

      return res.json({ success: true, enabled: false });
    }

    if (!textId || !voiceId) {
      return res.status(400).json({ error: "Text channel and Voice channel selections are required for 24/7 mode." });
    }

    const doc = await TwoFourSeven.findOneAndUpdate(
      { Guild: req.guildId },
      { TextId: String(textId).trim(), VoiceId: String(voiceId).trim() },
      { upsert: true, returnDocument: "after", maxTimeMS: 2500 }
    );

    // Dispatch audit log to Discord thread
    botBridge.sendDashboardLog({
      event: "247_ENABLE",
      user: req.user,
      guildId: req.guildId,
      action: "24/7 Mode Enabled & Locked",
      details: `Locked to Voice: <#${voiceId}> | Text: <#${textId}>\nConfigured via Web Dashboard by **${req.user.username}**.`,
      color: "#00E676"
    });

    res.json({ success: true, enabled: true, data: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/config/:guildId/prefix -> Update custom server prefix
router.post("/:guildId/prefix", authenticateUser, requireGuildPermission, async (req, res) => {
  const { prefix } = req.body;

  if (!prefix || typeof prefix !== "string") {
    return res.status(400).json({ error: "Prefix string is required." });
  }

  const cleanPrefix = prefix.trim();
  if (cleanPrefix.length > 5) {
    return res.status(400).json({ error: "Prefix cannot exceed 5 characters." });
  }

  try {
    await ensureConnected().catch(() => {});
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database is connecting. Please retry in a few moments." });
    }

    const existing = await Prefix.findOne({ Guild: req.guildId }).maxTimeMS(2500).lean().catch(() => null);
    const oldPrefix = existing?.Prefix || ".";

    const doc = await Prefix.findOneAndUpdate(
      { Guild: req.guildId },
      { Prefix: cleanPrefix, oldPrefix },
      { upsert: true, returnDocument: "after", maxTimeMS: 2500 }
    );

    // Dispatch audit log to Discord thread
    botBridge.sendDashboardLog({
      event: "PREFIX_CHANGE",
      user: req.user,
      guildId: req.guildId,
      action: "Prefix Updated",
      details: `Prefix changed from \`${oldPrefix}\` to \`${cleanPrefix}\` by **${req.user.username}**.`,
      color: "#00E676"
    });

    res.json({ success: true, prefix: doc?.Prefix || cleanPrefix });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/config/:guildId/reset-prefix -> Reset prefix back to default '.'
router.post("/:guildId/reset-prefix", authenticateUser, requireGuildPermission, async (req, res) => {
  try {
    await ensureConnected().catch(() => {});
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database is connecting. Please retry in a few moments." });
    }

    await Prefix.deleteOne({ Guild: req.guildId }).maxTimeMS(2500).catch(() => {});

    // Dispatch audit log to Discord thread
    botBridge.sendDashboardLog({
      event: "PREFIX_RESET",
      user: req.user,
      guildId: req.guildId,
      action: "Prefix Reset to Default",
      details: `Prefix reset to \`.\` by **${req.user.username}**.`,
      color: "#00E676"
    });

    res.json({ success: true, prefix: "." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/config/:guildId/djrole -> Set or update DJ role configuration
router.post("/:guildId/djrole", authenticateUser, requireGuildPermission, async (req, res) => {
  const { roleId, enabled } = req.body;

  try {
    await ensureConnected().catch(() => {});
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database is connecting. Please retry in a few moments." });
    }

    if (!roleId && enabled) {
      return res.status(400).json({ error: "Please select a valid Discord role to enforce DJ mode." });
    }

    let doc;
    if (!roleId || enabled === false) {
      doc = await DJRole.findOneAndUpdate(
        { guildId: req.guildId },
        { mode: false, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    } else {
      doc = await DJRole.findOneAndUpdate(
        { guildId: req.guildId },
        { roleId: String(roleId), mode: Boolean(enabled), updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    // Dispatch audit log to Discord thread
    botBridge.sendDashboardLog({
      event: "DJROLE_UPDATE",
      user: req.user,
      guildId: req.guildId,
      action: "DJ Role Configured",
      details: enabled && roleId
        ? `DJ Role set to <@&${roleId}> (Enforced: \`YES\`) by **${req.user.username}**.`
        : `DJ Role restrictions disabled by **${req.user.username}**.`,
      color: "#FF1E38"
    });

    res.json({
      success: true,
      djRole: {
        roleId: doc.roleId,
        enabled: doc.mode !== false
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
