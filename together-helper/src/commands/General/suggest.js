const {
  ApplicationCommandOptionType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const { SuggestionConfig } = require("../../schema");
const config = require("../../config");

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
      : interaction.guild.channels.cache.find(c => c.name.includes("suggest"));

    if (!targetChannel) {
      return interaction.reply({
        content: "❌ Suggestions channel is not configured on this server yet. An admin can set it up with `/setsuggestion #channel`.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor(config.accentColor)
      .setAuthor({
        name: `Suggestion by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setDescription(`>>> ${idea}`)
      .addFields(
        { name: "Status", value: "⏳ Pending Community Review", inline: true },
        { name: "Submitter ID", value: `\`${interaction.user.id}\``, inline: true }
      )
      .setFooter({ text: "Vote using the reactions below!" })
      .setTimestamp();

    const msg = await targetChannel.send({ embeds: [embed] });
    await msg.react("👍").catch(() => {});
    await msg.react("👎").catch(() => {});

    return interaction.reply({
      content: `✅ Your suggestion has been posted to ${targetChannel.toString()}!`,
      ephemeral: true
    });
  }
};
