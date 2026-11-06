const { ApplicationCommandOptionType } = require("discord.js");
const { SuggestionConfig } = require("../../schema");
const {
  container,
  separator,
  text,
  flags,
  noticePayload,
  COLORS
} = require("../../utils/ui");

module.exports = {
  name: "suggest",
  description: "Submit a feature idea or suggestion for TOGETHER Music",
  slashOptions: [
    {
      name: "idea",
      type: ApplicationCommandOptionType.String,
      description: "Describe your suggestion or feature idea in detail",
      required: true
    }
  ],

  async slashExecute(interaction, client) {
    const idea = interaction.options.getString("idea");

    const cfg = await SuggestionConfig.findOne({ guildId: interaction.guild.id });
    const targetChannel = cfg?.channelId
      ? interaction.guild.channels.cache.get(cfg.channelId)
      : interaction.guild.channels.cache.find((c) => c.name.includes("suggest"));

    if (!targetChannel) {
      return interaction.reply(
        noticePayload({
          title: "Channel Not Set",
          description: "Suggestions channel is not configured on this server yet. An admin can set it up with `/setchannel suggestions #channel`.",
          emoji: "❌",
          tone: "danger"
        }, true)
      );
    }

    // Components V2 Suggestion Card
    const card = container(COLORS.success)
      .addTextDisplayComponents(
        text(`## 💡 Community Suggestion\n*Submitted by ${interaction.user.tag} (<@${interaction.user.id}>)*`)
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(`>>> ${idea}`)
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text("⏳ **Status:** Pending Community Review • Vote using the reactions below!")
      );

    const msg = await targetChannel.send({
      components: [card],
      flags: flags(false)
    });

    await msg.react("👍").catch(() => {});
    await msg.react("👎").catch(() => {});

    return interaction.reply(
      noticePayload({
        title: "Suggestion Submitted",
        description: `Your idea has been published to ${targetChannel.toString()} in server!`,
        emoji: "🚀",
        tone: "success"
      }, true)
    );
  }
};
