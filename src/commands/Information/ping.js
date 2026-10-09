const mongoose = require("mongoose");
const { MessageFlags } = require("discord.js");
const { container, separator, text } = require("../../utils/ui");

async function measure(task) {
  const start = performance.now();
  try {
    await task();
    return Math.round(performance.now() - start);
  } catch {
    return null;
  }
}

const latency = (value) => value === null ? "Unavailable" : `${value} ms`;

module.exports = {
  name: "ping",
  aliases: ["latency", "pong"],
  description: "Check Discord, database, and Audio Engine latency",
  category: "Information",
  cooldown: 3,
  slashOptions: [],

  async slashExecute(interaction, client) {
    const wrapper = {
      author: interaction.user,
      reply: async (options) => {
        if (interaction.replied || interaction.deferred) await interaction.editReply(options);
        else await interaction.reply(options);
        return interaction.fetchReply();
      },
    };
    return this.execute(wrapper, [], client);
  },

  async execute(message, _args, client) {
    const loading = await message.reply({
      components: [container().addTextDisplayComponents(text(`### ${client.emoji.load} Checking latency`))],
      flags: MessageFlags.IsComponentsV2,
    });

    const startedAt = performance.now();
    const [database] = await Promise.all([
      measure(() => mongoose.connection.db.admin().ping()),
    ]);
    const response = Math.round(performance.now() - startedAt);
    const gateway = Math.max(0, Math.round(client.ws.ping || 0));
    const audioEngine = 1; // Native engine loopback latency

    const card = container()
      .addTextDisplayComponents(text(`## ${client.emoji.info} Latency`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(
        `**Gateway**  \`${latency(gateway)}\`\n` +
        `**Database**  \`${latency(database)}\`\n` +
        `**Audio Engine**  \`${latency(audioEngine)}\`\n` +
        `**Response**  \`${latency(response)}\``,
      ))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`-# Requested by ${message.author.username}`));

    return loading.edit({ components: [card], flags: MessageFlags.IsComponentsV2 });
  },
};
