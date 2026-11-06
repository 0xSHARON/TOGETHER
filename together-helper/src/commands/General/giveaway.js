const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  PermissionFlagsBits
} = require("discord.js");
const ms = require("ms");
const { Giveaway } = require("../../schema");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");

module.exports = {
  name: "giveaway",
  description: "Start, end, or reroll a server giveaway with interactive button entries",
  category: "General",
  userPerms: ["ManageGuild"],
  slashOptions: [
    {
      name: "action",
      description: "Action to perform",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "start - Launch a new giveaway", value: "start" },
        { name: "end - End an active giveaway immediately", value: "end" },
        { name: "reroll - Pick new winners for a finished giveaway", value: "reroll" }
      ]
    },
    {
      name: "prize",
      description: "Prize being given away (for start)",
      type: ApplicationCommandOptionType.String,
      required: false
    },
    {
      name: "duration",
      description: "Duration of the giveaway (e.g. 10m, 1h, 1d) (for start)",
      type: ApplicationCommandOptionType.String,
      required: false
    },
    {
      name: "winners",
      description: "Number of winners (default 1) (for start)",
      type: ApplicationCommandOptionType.Integer,
      required: false,
      min_value: 1,
      max_value: 10
    },
    {
      name: "message_id",
      description: "Message ID of the giveaway (for end/reroll)",
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply(noticePayload({ title: "Permission Denied", description: "You need `Manage Server` permission.", tone: "danger" }, true));
    }

    const action = interaction.options.getString("action");

    // ── SUBCOMMAND: START ──
    if (action === "start") {
      const prize = interaction.options.getString("prize");
      const durationInput = interaction.options.getString("duration");
      const winnersCount = interaction.options.getInteger("winners") || 1;

      if (!prize || !durationInput) {
        return interaction.reply(noticePayload({ title: "Missing Parameters", description: "Both `prize` and `duration` are required to start a giveaway.", tone: "warning" }, true));
      }

      const parsedMs = ms(durationInput);
      if (!parsedMs || parsedMs < 10000 || parsedMs > 30 * 24 * 60 * 60 * 1000) {
        return interaction.reply(noticePayload({ title: "Invalid Duration", description: "Duration must be between `10s` and `30d`.", tone: "warning" }, true));
      }

      const endsAt = new Date(Date.now() + parsedMs);
      const endsTimestamp = Math.round(endsAt.getTime() / 1000);

      const enterRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("giveaway:enter")
          .setLabel("Enter Giveaway")
          .setEmoji("🎉")
          .setStyle(ButtonStyle.Success)
      );

      const gwCard = container(COLORS.success)
        .addTextDisplayComponents(text(`## 🎉 GIVEAWAY: ${prize}\n-# Hosted by ${interaction.user.username}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(
          text(
            `Click the button below to enter!\n\n` +
            `• **Prize:** **${prize}**\n` +
            `• **Winners:** \`${winnersCount}\`\n` +
            `• **Ends:** <t:${endsTimestamp}:R> (<t:${endsTimestamp}:F>)\n` +
            `• **Hosted By:** ${interaction.user.toString()}`
          )
        )
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`-# TOGETHER Community Events · Click 🎉 to enter or leave`))
        .addActionRowComponents(enterRow);

      const gwMsg = await interaction.channel.send({ components: [gwCard], flags: flags(false) });

      await Giveaway.create({
        messageId: gwMsg.id,
        channelId: interaction.channel.id,
        guildId: interaction.guild.id,
        prize,
        winnersCount,
        endsAt,
        hostedBy: interaction.user.id,
        entries: []
      });

      await interaction.reply(noticePayload({ title: "Giveaway Started", description: `Giveaway for **${prize}** launched!`, tone: "success" }, true));

      // Schedule resolution
      setTimeout(async () => {
        try {
          const doc = await Giveaway.findOne({ messageId: gwMsg.id, ended: false });
          if (!doc) return;

          doc.ended = true;
          let winners = [];
          if (doc.entries.length > 0) {
            const shuffled = [...doc.entries].sort(() => 0.5 - Math.random());
            winners = shuffled.slice(0, doc.winnersCount);
          }
          doc.winners = winners;
          await doc.save();

          const winnerText = winners.length > 0 ? winners.map(w => `<@${w}>`).join(", ") : "No valid entries.";

          const endedCard = container(COLORS.info)
            .addTextDisplayComponents(text(`## 🎊 GIVEAWAY ENDED: ${prize}`))
            .addSeparatorComponents(separator())
            .addTextDisplayComponents(
              text(
                `• **Winner(s):** ${winnerText}\n` +
                `• **Prize:** **${doc.prize}**\n` +
                `• **Total Entries:** \`${doc.entries.length}\`\n` +
                `• **Hosted By:** <@${doc.hostedBy}>`
              )
            );

          await gwMsg.edit({ components: [endedCard], flags: flags(false) }).catch(() => {});
          if (winners.length > 0) {
            await interaction.channel.send(`🎉 Congratulations ${winnerText}! You won the **${doc.prize}**!`);
          }
        } catch {}
      }, parsedMs);
      return;
    }

    // ── SUBCOMMAND: END ──
    if (action === "end") {
      const messageId = interaction.options.getString("message_id");
      if (!messageId) return interaction.reply(noticePayload({ title: "Missing Message ID", description: "Provide the `message_id` of the giveaway.", tone: "warning" }, true));

      const doc = await Giveaway.findOne({ messageId, guildId: interaction.guild.id });
      if (!doc || doc.ended) return interaction.reply(noticePayload({ title: "Not Found", description: "No active giveaway found with that message ID.", tone: "warning" }, true));

      doc.ended = true;
      let winners = [];
      if (doc.entries.length > 0) {
        const shuffled = [...doc.entries].sort(() => 0.5 - Math.random());
        winners = shuffled.slice(0, doc.winnersCount);
      }
      doc.winners = winners;
      await doc.save();

      const winnerText = winners.length > 0 ? winners.map(w => `<@${w}>`).join(", ") : "No valid entries.";
      return interaction.reply(noticePayload({ title: "Giveaway Concluded", description: `Winner(s): ${winnerText}`, tone: "success" }, false));
    }

    // ── SUBCOMMAND: REROLL ──
    if (action === "reroll") {
      const messageId = interaction.options.getString("message_id");
      if (!messageId) return interaction.reply(noticePayload({ title: "Missing Message ID", description: "Provide the `message_id` of the giveaway to reroll.", tone: "warning" }, true));

      const doc = await Giveaway.findOne({ messageId, guildId: interaction.guild.id });
      if (!doc) return interaction.reply(noticePayload({ title: "Not Found", description: "Giveaway not found.", tone: "warning" }, true));

      if (doc.entries.length === 0) return interaction.reply(noticePayload({ title: "No Entries", description: "No entries exist to reroll from.", tone: "warning" }, true));

      const newWinner = doc.entries[Math.floor(Math.random() * doc.entries.length)];
      return interaction.reply(`🎉 Rerolled! New winner for **${doc.prize}** is <@${newWinner}>!`);
    }
  },

  async prefixExecute(message, args, client) {
    return message.reply(noticePayload({
      title: "Interactive Giveaways",
      description: "Use `/giveaway start prize: <prize> duration: <time> winners: <count>` to launch rich interactive giveaways with one-click entry buttons!",
      tone: "info"
    }));
  }
};

