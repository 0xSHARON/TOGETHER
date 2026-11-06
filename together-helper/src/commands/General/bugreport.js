const { ApplicationCommandOptionType } = require("discord.js");
const { BugReportConfig } = require("../../schema");
const {
  container,
  separator,
  text,
  flags,
  noticePayload,
  COLORS
} = require("../../utils/ui");

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
      : interaction.guild.channels.cache.find((c) => c.name.includes("bug") || c.name.includes("report"));

    if (!targetChannel) {
      return interaction.reply(
        noticePayload({
          title: "Channel Not Configured",
          description: "Bug report channel is not configured on this server. Please ask an admin to run `/setchannel bugreports #channel`.",
          emoji: "❌",
          tone: "danger"
        }, true)
      );
    }

    // Components V2 Bug Report Card
    const card = container(COLORS.danger)
      .addTextDisplayComponents(
        text(`## 🐛 Bug Report Filed\n*Reported by ${interaction.user.tag} (<@${interaction.user.id}>)*`)
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(`### 📝 Problem Description\n>>> ${issue}`)
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(`### 🔬 Steps to Reproduce\n\`\`\`\n${reproduce}\n\`\`\``)
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(`**Server:** \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)  •  **Status:** 🔴 Under Investigation`)
      );

    await targetChannel.send({
      components: [card],
      flags: flags(false)
    });

    return interaction.reply(
      noticePayload({
        title: "Report Dispatched",
        description: `Thank you for your report! It has been forwarded to ${targetChannel.toString()} in server for inspection.`,
        emoji: "🛡️",
        tone: "success"
      }, true)
    );
  }
};
