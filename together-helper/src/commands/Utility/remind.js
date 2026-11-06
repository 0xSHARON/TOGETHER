const { ApplicationCommandOptionType } = require("discord.js");
const ms = require("ms");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");

module.exports = {
  name: "remind",
  aliases: ["reminder"],
  description: "Set a reminder with a custom time and note",
  category: "Utility",
  slashOptions: [
    {
      name: "duration",
      description: "When should I remind you? (e.g. 10m, 1h, 1d)",
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: "note",
      description: "What should I remind you about?",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],

  async slashExecute(interaction, client) {
    const durationInput = interaction.options.getString("duration");
    const note = interaction.options.getString("note");

    const parsedMs = ms(durationInput);
    if (!parsedMs || parsedMs < 5000 || parsedMs > 30 * 24 * 60 * 60 * 1000) {
      return interaction.reply(noticePayload({ title: "Invalid Duration", description: "Reminder duration must be between `5s` and `30d`.", tone: "warning" }, true));
    }

    const fireTimestamp = Math.round((Date.now() + parsedMs) / 1000);

    const card = container(COLORS.success)
      .addTextDisplayComponents(text(`## ⏰ Reminder Scheduled\n-# Time: <t:${fireTimestamp}:F>`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`• **Note:** ${note}\n• **Trigger:** <t:${fireTimestamp}:R>\n\n*I will notify you here when the time is up.*`));

    await interaction.reply({ components: [card], flags: flags(false) });

    const channelId = interaction.channelId;
    const userId = interaction.user.id;

    setTimeout(async () => {
      try {
        const channel = await client.channels.fetch(channelId).catch(() => null);
        const reminderAlert = container(COLORS.warning)
          .addTextDisplayComponents(text(`## ⏰ Reminder Alert!\n-# Notification for <@${userId}>`))
          .addSeparatorComponents(separator())
          .addTextDisplayComponents(text(`**You asked to be reminded about:**\n${note}`));

        if (channel) {
          await channel.send({ content: `<@${userId}>`, components: [reminderAlert], flags: flags(false) });
        } else {
          const user = await client.users.fetch(userId).catch(() => null);
          if (user) await user.send({ components: [reminderAlert], flags: flags(false) });
        }
      } catch {}
    }, parsedMs);
  },

  async prefixExecute(message, args, client) {
    const durationInput = args[0];
    if (!durationInput) {
      return message.reply(noticePayload({ title: "Usage", description: "`-remind <duration> <note>`\nExample: `-remind 30m Check server logs`", tone: "warning" }));
    }

    const parsedMs = ms(durationInput);
    if (!parsedMs || parsedMs < 5000 || parsedMs > 30 * 24 * 60 * 60 * 1000) {
      return message.reply(noticePayload({ title: "Invalid Duration", description: "Duration must be between `5s` and `30d`.", tone: "warning" }));
    }

    const note = args.slice(1).join(" ");
    if (!note) {
      return message.reply(noticePayload({ title: "Missing Note", description: "Please enter what you want to be reminded about.", tone: "warning" }));
    }

    const fireTimestamp = Math.round((Date.now() + parsedMs) / 1000);
    const card = container(COLORS.success)
      .addTextDisplayComponents(text(`## ⏰ Reminder Scheduled\n-# Trigger: <t:${fireTimestamp}:R>`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`• **Note:** ${note}`));

    await message.reply({ components: [card], flags: flags(false) });

    const channelId = message.channel.id;
    const userId = message.author.id;

    setTimeout(async () => {
      try {
        const channel = await client.channels.fetch(channelId).catch(() => null);
        const reminderAlert = container(COLORS.warning)
          .addTextDisplayComponents(text(`## ⏰ Reminder Alert!\n-# Notification for <@${userId}>`))
          .addSeparatorComponents(separator())
          .addTextDisplayComponents(text(`**You asked to be reminded about:**\n${note}`));

        if (channel) {
          await channel.send({ content: `<@${userId}>`, components: [reminderAlert], flags: flags(false) });
        }
      } catch {}
    }, parsedMs);
  }
};

