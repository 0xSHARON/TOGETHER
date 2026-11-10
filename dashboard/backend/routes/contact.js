const express = require("express");
const { authenticateUser } = require("../middleware/auth");
const botBridge = require("../services/botBridge");

const router = express.Router();

/**
 * POST /api/contact/dispatch
 * Transmit technical support inquiry directly to the bot owner.
 * Gated by Discord authentication: returns 401 if not logged in.
 */
router.post("/dispatch", authenticateUser, async (req, res) => {
  try {
    const { name, discordTag, guildId, category, subject, message } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: "Subject brief is required." });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Detailed message description is required." });
    }

    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({ error: "Active Discord authentication is required." });
    }

    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${(Number(user.discriminator) || 0) % 5}.png`;

    const dispatchData = {
      name: (name && name.trim()) || user.global_name || user.username || "Discord User",
      discordTag: (discordTag && discordTag.trim()) || (user.discriminator && user.discriminator !== "0" ? `${user.username}#${user.discriminator}` : `@${user.username}`),
      userId: user.id,
      avatarUrl,
      guildId: guildId && guildId.trim() ? guildId.trim() : null,
      category: category || "Technical Support",
      subject: subject.trim(),
      message: message.trim()
    };

    const result = await botBridge.sendOwnerSupportDispatch(dispatchData);

    if (result.success) {
      return res.json({
        success: true,
        message: "Support dispatch successfully transmitted to bot owner via Discord Direct Message.",
        dmed: result.dmed,
        ownerNotified: result.ownerNotified,
        dispatchId: result.dispatchId
      });
    } else {
      return res.status(502).json({
        error: result.error || "Failed to deliver dispatch to bot service."
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
