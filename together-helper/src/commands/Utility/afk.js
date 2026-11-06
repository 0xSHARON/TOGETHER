const { ApplicationCommandOptionType } = require("discord.js");
const { Afk } = require("../../schema");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");

module.exports = {
  name: "afk",
  description: "Set your status as AFK (Away From Keyboard) with an optional reason",
  category: "Utility",
  slashOptions: [
    {
      name: "reason",
      description: "Why are you going AFK?",
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    const reason = interaction.options.getString("reason") || "AFK";

    await Afk.findOneAndUpdate(
      { userId: interaction.user.id, guildId: interaction.guild.id },
      { reason, timestamp: new Date() },
      { upsert: true, new: true }
    );

    const card = container(COLORS.info)
      .addTextDisplayComponents(text(`## 💤 AFK Status Set\n-# Away From Keyboard`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(`• **User:** ${interaction.user.username}\n• **Reason:** ${reason}\n\n*Your AFK will automatically be removed next time you send a message.*`)
      );

    return interaction.reply({ components: [card], flags: flags(false) });
  },

  async prefixExecute(message, args, client) {
    const reason = args.join(" ") || "AFK";

    await Afk.findOneAndUpdate(
      { userId: message.author.id, guildId: message.guild.id },
      { reason, timestamp: new Date() },
      { upsert: true, new: true }
    );

    const card = container(COLORS.info)
      .addTextDisplayComponents(text(`## 💤 AFK Status Set\n-# Away From Keyboard`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(`• **User:** ${message.author.username}\n• **Reason:** ${reason}\n\n*Your AFK will automatically be removed next time you send a message.*`)
      );

    return message.reply({ components: [card], flags: flags(false) });
  }
};
