const mongoose = require("mongoose");
const { container, flags, separator, text } = require("../../utils/ui");
const emoji = require("../../emojis");

async function measure(task) {
  const start = performance.now();
  try {
    await task();
    return Math.round(performance.now() - start);
  } catch {
    return null;
  }
}

const latency = (value) => (value === null ? "Unavailable" : `${value} ms`);

module.exports = {
  name: "ping",
  aliases: ["latency", "pong"],
  description: "Check Discord gateway and database latency",
  category: "Information",
  slashOptions: [],

  async slashExecute(interaction, client) {
    await interaction.reply({
      components: [container().addTextDisplayComponents(text(`### ${emoji.load} Checking latency...`))],
      flags: flags(false),
    });

    const startedAt = performance.now();
    const [database] = await Promise.all([
      measure(() => mongoose.connection.db?.admin?.().ping()),
    ]);
    const response = Math.round(performance.now() - startedAt);
    const gateway = Math.max(0, Math.round(client.ws.ping || 0));

    const card = container()
      .addTextDisplayComponents(text(`## ${emoji.info} Latency\n-# Helper Gateway & Database Diagnostics`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `**Gateway**   \`${latency(gateway)}\`\n` +
          `**Database**  \`${latency(database)}\`\n` +
          `**Response**  \`${latency(response)}\``,
        ),
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`-# Requested by ${interaction.user.username} · developed by kajukatli.`));

    return interaction.editReply({
      components: [card],
      flags: flags(false),
    });
  },

  async prefixExecute(message, args, client) {
    const loading = await message.reply({
      components: [container().addTextDisplayComponents(text(`### ${emoji.load} Checking latency...`))],
      flags: flags(false),
    });

    const startedAt = performance.now();
    const [database] = await Promise.all([
      measure(() => mongoose.connection.db?.admin?.().ping()),
    ]);
    const response = Math.round(performance.now() - startedAt);
    const gateway = Math.max(0, Math.round(client.ws.ping || 0));

    const card = container()
      .addTextDisplayComponents(text(`## ${emoji.info} Latency\n-# Helper Gateway & Database Diagnostics`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `**Gateway**   \`${latency(gateway)}\`\n` +
          `**Database**  \`${latency(database)}\`\n` +
          `**Response**  \`${latency(response)}\``,
        ),
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`-# Requested by ${message.author.username} · developed by kajukatli.`));

    return loading.edit({
      components: [card],
      flags: flags(false),
    });
  },
};
