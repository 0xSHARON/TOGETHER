const { StickyMessage } = require("../schema");
const {
  container,
  separator,
  text,
  flags,
  COLORS
} = require("../utils/ui");

// Cooldown tracker to prevent rate limits when multiple messages arrive quickly
const stickyCooldowns = new Map();

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    try {
      const sticky = await StickyMessage.findOne({ channelId: message.channel.id, enabled: true });
      if (!sticky || !sticky.message) return;

      // Avoid spamming if triggered in quick succession (min 3 sec delay)
      const lastTrigger = stickyCooldowns.get(message.channel.id) || 0;
      if (Date.now() - lastTrigger < 3000) return;
      stickyCooldowns.set(message.channel.id, Date.now());

      // 1. Delete previous sticky message if still exists
      if (sticky.lastMessageId) {
        try {
          const oldMsg = await message.channel.messages.fetch(sticky.lastMessageId);
          if (oldMsg) await oldMsg.delete();
        } catch {}
      }

      // 2. Re-send fresh sticky message at the bottom with Components V2
      const stickyCard = container(COLORS.brand)
        .addTextDisplayComponents(text("### 📌 Channel Notice & Guidelines"))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(sticky.message))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text("*This notice dynamically stays anchored to the bottom of the channel.*"));

      const newMsg = await message.channel.send({
        components: [stickyCard],
        flags: flags(false)
      });

      // 3. Update last message ID in MongoDB
      sticky.lastMessageId = newMsg.id;
      await sticky.save();
    } catch (err) {
      if (client.logger) {
        client.logger.error(`[Sticky Reposition Error] ${err.message}`);
      }
    }
  }
};
