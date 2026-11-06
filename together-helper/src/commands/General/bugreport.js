const {
  ApplicationCommandOptionType,
  PermissionsBitField,
  EmbedBuilder
} = require("discord.js");
const { BugReportConfig } = require("../../schema");
const config = require("../../config");

module.exports = {
  name: "bugreport",
  description: "Report an issue, error, or playback bug to the developers",
  slashOptions: [
    {
      name: "issue",
      type: ApplicationCommandOptionType.String,
      description: "Brief summary of the issue",
      required: true
    },
    {
      name: "reproduce",
      type: ApplicationCommandOptionType.String,
      description: "Steps or command used when the bug happened",
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    const issue = interaction.options.getString("issue");
    const reproduce = interaction.options.getString("reproduce") || "Not provided";

    const cfg = await BugReportConfig.findOne({ guildId: interaction.guild.id });
    const targetChannel = cfg?.channelId
      ? interaction.guild.channels.cache.get(cfg.channelId)
      : interaction.guild.channels.cache.find(c => c.name.includes("bug") || c.name.includes("report"));

    if (!targetChannel) {
      return interaction.reply({
        content: "❌ Bug report channel is not configured on this server. Please contact an admin or join our support guild.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#FF1E38")
      .setTitle("🐛 NEW BUG REPORT RECEIVED")
      .setAuthor({
        name: `${interaction.user.tag} (${interaction.user.id})`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .addFields(
        { name: "Reported Problem", value: `>>> ${issue}` },
        { name: "Steps to Reproduce", value: `\`\`\`${reproduce}\`\`\`` },
        { name: "Server Context", value: `\`${interaction.guild.name}\` (\`${interaction.guild.id}\`)`, inline: true },
        { name: "Status", value: "🔴 Investigating", inline: true }
      )
      .setFooter({ text: "TOGETHER Helper • Issue Tracking" })
      .setTimestamp();

    await targetChannel.send({ embeds: [embed] });

    return interaction.reply({
      content: `✅ Thank you for reporting! Your bug report has been filed in ${targetChannel.toString()}. Our dev team will inspect it.`,
      ephemeral: true
    });
  }
};
