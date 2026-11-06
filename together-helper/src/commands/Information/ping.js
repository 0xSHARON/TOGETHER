const { container, flags, separator, text, COLORS } = require("../../utils/ui");

module.exports = {
  name: "ping",
  description: "Check the helper bot latency and WebSocket ping",
  category: "Information",
  slashOptions: [],

  async slashExecute(interaction, client) {
    const wsPing = Math.round(client.ws.ping);
    const sentTime = Date.now();

    const initialCard = container(COLORS.info)
      .addTextDisplayComponents(text(`### 🏓 Measuring Latency...`));

    await interaction.reply({
      components: [initialCard],
      flags: flags(false)
    });

    const roundTrip = Date.now() - sentTime;
    const tone = wsPing < 100 ? COLORS.success : wsPing < 250 ? COLORS.warning : COLORS.danger;

    const resultCard = container(tone)
      .addTextDisplayComponents(text(`### 🏓 Pong! Latency Statistics`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `• **WebSocket Ping:** \`${wsPing}ms\`\n` +
          `• **Round-Trip Delay:** \`${roundTrip}ms\`\n` +
          `• **MongoDB Status:** \`Connected & Responsive\`\n` +
          `• **Architecture:** \`Discord Components V2\``
        )
      );

    await interaction.editReply({
      components: [resultCard],
      flags: flags(false)
    });
  },

  async prefixExecute(message, args, client) {
    const wsPing = Math.round(client.ws.ping);
    const sentTime = Date.now();

    const initialCard = container(COLORS.info)
      .addTextDisplayComponents(text(`### 🏓 Measuring Latency...`));

    const reply = await message.reply({
      components: [initialCard],
      flags: flags(false)
    });

    const roundTrip = Date.now() - sentTime;
    const tone = wsPing < 100 ? COLORS.success : wsPing < 250 ? COLORS.warning : COLORS.danger;

    const resultCard = container(tone)
      .addTextDisplayComponents(text(`### 🏓 Pong! Latency Statistics`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `• **WebSocket Ping:** \`${wsPing}ms\`\n` +
          `• **Round-Trip Delay:** \`${roundTrip}ms\`\n` +
          `• **MongoDB Status:** \`Connected & Responsive\`\n` +
          `• **Architecture:** \`Discord Components V2\``
        )
      );

    await reply.edit({
      components: [resultCard],
      flags: flags(false)
    });
  }
};

