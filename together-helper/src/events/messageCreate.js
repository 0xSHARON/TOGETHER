const { EmbedBuilder } = require("discord.js");
const { StickyMessage } = require("../schema");
const config = require("../config");
const { container, flags, separator, text, noticePayload, COLORS } = require("../utils/ui");

// Cooldown tracker to prevent rate limits when multiple messages arrive quickly
const stickyCooldowns = new Map();

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    // 1. Handle Prefix & Mention Commands
    const prefix = config.prefix || "-";
    const mentionRegex = new RegExp(`^<@!?${client.user.id}>(?:\\s+)?`);
    let matchedPrefix = null;

    if (message.content.startsWith(prefix)) {
      matchedPrefix = prefix;
    } else if (mentionRegex.test(message.content)) {
      const match = message.content.match(mentionRegex);
      matchedPrefix = match[0];
    }

    if (matchedPrefix !== null) {
      const rawArgs = message.content.slice(matchedPrefix.length).trim();
      const args = rawArgs.length ? rawArgs.split(/ +/g) : [];
      const commandName = args.shift()?.toLowerCase();

      // If user merely mentions the bot without arguments, show quick helper info
      if (!commandName) {
        return message.reply(
          noticePayload({
            title: "TOGETHER HELPER Online",
            description: `My prefix on this server is \`${prefix}\` or you can use \`/help\` to browse all commands.`,
            emoji: "🤖",
            tone: "info"
          }, false)
        ).catch(() => {});
      }

      const command = client.commands.get(commandName);
      if (command && typeof command.prefixExecute === "function") {
        try {
          await command.prefixExecute(message, args, client);
        } catch (err) {
          console.error(`[Prefix Command Error] ${commandName}:`, err);
          await message.reply(
            noticePayload({
              title: "Command Execution Error",
              description: err.message,
              emoji: "❌",
              tone: "danger"
            }, false)
          ).catch(() => {});
        }
        return;
      }
    }

    // 2. Handle Sticky Message Repositioning
    try {
      const sticky = await StickyMessage.findOne({ channelId: message.channel.id, enabled: true });
      if (!sticky || !sticky.message) return;

      // Avoid spamming if triggered in quick succession (min 3 sec delay)
      const lastTrigger = stickyCooldowns.get(message.channel.id) || 0;
      if (Date.now() - lastTrigger < 3000) return;
      stickyCooldowns.set(message.channel.id, Date.now());

      // Delete previous sticky message if still exists
      if (sticky.lastMessageId) {
        try {
          const oldMsg = await message.channel.messages.fetch(sticky.lastMessageId);
          if (oldMsg) await oldMsg.delete();
        } catch {}
      }

      // Send fresh sticky message using Components V2
      const stickyCard = container(COLORS.brand)
        .addTextDisplayComponents(text(`### 📌 NOTICE / CHANNEL GUIDELINES`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(sticky.message))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`*This message will automatically stay anchored to the bottom of the channel.*`));

      const newMsg = await message.channel.send({
        components: [stickyCard],
        flags: flags(false)
      });

      sticky.lastMessageId = newMsg.id;
      await sticky.save();
    } catch (err) {
      console.error("[Sticky Event Error]", err);
    }
  }
};
