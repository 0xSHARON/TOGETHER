const express = require("express");
const { authenticateUser } = require("../middleware/auth");
const { requireGuildPermission } = require("../middleware/guildAuth");
const { TwoFourSeven, Setup, Prefix } = require("../services/dbService");

const router = express.Router();

// GET /api/config/:guildId -> Get 24/7, Setup channel, and prefix
router.get("/:guildId", authenticateUser, requireGuildPermission, async (req, res) => {
  try {
    const [twoFourSeven, setup, prefixDoc] = await Promise.all([
      TwoFourSeven.findOne({ Guild: req.guildId }),
      Setup.findOne({ Guild: req.guildId }),
      Prefix.findOne({ Guild: req.guildId })
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
      prefix: prefixDoc?.Prefix || "."
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/config/:guildId/247 -> Toggle or update 24/7 settings
router.post("/:guildId/247", authenticateUser, requireGuildPermission, async (req, res) => {
  const { enabled, textId, voiceId } = req.body;

  try {
    if (!enabled) {
      await TwoFourSeven.deleteOne({ Guild: req.guildId });
      return res.json({ success: true, enabled: false });
    }

    if (!textId || !voiceId) {
      return res.status(400).json({ error: "Text channel ID and Voice channel ID are required for 24/7 mode." });
    }

    const doc = await TwoFourSeven.findOneAndUpdate(
      { Guild: req.guildId },
      { TextId: String(textId).trim(), VoiceId: String(voiceId).trim() },
      { upsert: true, new: true }
    );

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
    const existing = await Prefix.findOne({ Guild: req.guildId });
    const oldPrefix = existing?.Prefix || ".";

    const doc = await Prefix.findOneAndUpdate(
      { Guild: req.guildId },
      { Prefix: cleanPrefix, oldPrefix },
      { upsert: true, new: true }
    );

    res.json({ success: true, prefix: doc.Prefix });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/config/:guildId/reset-prefix -> Reset prefix back to default '.'
router.post("/:guildId/reset-prefix", authenticateUser, requireGuildPermission, async (req, res) => {
  try {
    await Prefix.deleteOne({ Guild: req.guildId });
    res.json({ success: true, prefix: "." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
