const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  ComponentType
} = require("discord.js");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");

module.exports = {
  name: "poll",
  description: "Create an interactive community poll with live button voting",
  category: "Utility",
  slashOptions: [
    {
      name: "question",
      description: "The topic or question for the poll",
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: "option_a",
      description: "First option",
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: "option_b",
      description: "Second option",
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: "option_c",
      description: "Third option",
      type: ApplicationCommandOptionType.String,
      required: false
    },
    {
      name: "option_d",
      description: "Fourth option",
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    const question = interaction.options.getString("question");
    const optionA = interaction.options.getString("option_a");
    const optionB = interaction.options.getString("option_b");
    const optionC = interaction.options.getString("option_c");
    const optionD = interaction.options.getString("option_d");

    const options = [
      { id: "opt_0", label: optionA, votes: new Set() },
      { id: "opt_1", label: optionB, votes: new Set() }
    ];
    if (optionC) options.push({ id: "opt_2", label: optionC, votes: new Set() });
    if (optionD) options.push({ id: "opt_3", label: optionD, votes: new Set() });

    const voterSelections = new Map(); // userId -> optionIndex

    const emojis = ["🇦", "🇧", "🇨", "🇩"];

    function renderCard() {
      const totalVotes = voterSelections.size;

      let description = options.map((opt, idx) => {
        const count = opt.votes.size;
        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        const filled = Math.round(pct / 10);
        const bar = "█".repeat(filled) + "░".repeat(10 - filled);
        return `${emojis[idx]} **${opt.label}**\n\`${bar}\` **${pct}%** (${count} votes)`;
      }).join("\n\n");

      return container(COLORS.info)
        .addTextDisplayComponents(text(`## 📊 Community Poll\n-# Asked by ${interaction.user.username}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`### ${question}\n\n${description}`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`-# Total votes: ${totalVotes} · Click a button below to cast or change your vote`));
    }

    const row = new ActionRowBuilder().addComponents(
      options.map((opt, idx) =>
        new ButtonBuilder()
          .setCustomId(`poll_vote_${idx}`)
          .setLabel(opt.label.length > 20 ? opt.label.slice(0, 17) + "..." : opt.label)
          .setEmoji(emojis[idx])
          .setStyle(ButtonStyle.Secondary)
      )
    );

    const initialCard = renderCard();
    initialCard.addActionRowComponents(row);

    const response = await interaction.reply({
      components: [initialCard],
      flags: flags(false),
      fetchReply: true
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 24 * 60 * 60 * 1000 // 24 hours
    });

    collector.on("collect", async (btnInteraction) => {
      const idx = parseInt(btnInteraction.customId.replace("poll_vote_", ""), 10);
      if (isNaN(idx) || !options[idx]) return;

      const userId = btnInteraction.user.id;
      const prevVote = voterSelections.get(userId);

      if (prevVote !== undefined) {
        options[prevVote].votes.delete(userId);
      }

      if (prevVote === idx) {
        // Toggle off if clicked same button
        voterSelections.delete(userId);
        await btnInteraction.reply({ content: "Vote removed.", ephemeral: true });
      } else {
        options[idx].votes.add(userId);
        voterSelections.set(userId, idx);
        await btnInteraction.reply({ content: `You voted for **${options[idx].label}**!`, ephemeral: true });
      }

      const updatedCard = renderCard();
      updatedCard.addActionRowComponents(row);
      await response.edit({ components: [updatedCard], flags: flags(false) }).catch(() => {});
    });
  },

  async prefixExecute(message, args, client) {
    return message.reply(noticePayload({
      title: "Interactive Polls",
      description: "Please use `/poll question: ... option_a: ... option_b: ...` to launch rich interactive polls with live buttons!",
      tone: "info"
    }));
  }
};
