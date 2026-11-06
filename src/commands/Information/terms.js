const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags
} = require("discord.js");

module.exports = {
  name: "terms",
  aliases: ["tos", "privacy", "policy"],
  category: "Information",
  description: "View TOGETHER's Terms of Service and Privacy Policy",
  args: false,
  usage: "",
  userPerms: [],
  botPerms: ["EmbedLinks"],
  owner: false,
  slashOptions: [],
  async slashExecute(interaction, client) {
    const interactionWrapper = {
      guild: interaction.guild,
      channel: interaction.channel,
      author: interaction.user,
      member: interaction.member,
      createdTimestamp: interaction.createdTimestamp,
      reply: async (options) => {
        if (interaction.deferred) {
          return await interaction.editReply(options);
        } else if (interaction.replied) {
          return await interaction.followUp(options);
        } else {
          return await interaction.reply(options);
        }
      },
    };

    const args = [];
    return this.execute(interactionWrapper, args, client, client.prefix);
  },
  async execute(message, args, client, prefix) {
    try {
      const termsUrl = "https://dash.together.dpdns.org/terms";
      const privacyUrl = "https://dash.together.dpdns.org/privacy";
      const supportUrl = client.config.links?.support || "https://discord.gg/mUdGTs2Dw5";

      const linkRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Terms of Service")
          .setEmoji(client.emoji.utility || "📜")
          .setStyle(ButtonStyle.Link)
          .setURL(termsUrl),
        new ButtonBuilder()
          .setLabel("Privacy Policy")
          .setEmoji(client.emoji.lock || "🔒")
          .setStyle(ButtonStyle.Link)
          .setURL(privacyUrl),
        new ButtonBuilder()
          .setLabel("Support Server")
          .setEmoji(client.emoji.info || "ℹ️")
          .setStyle(ButtonStyle.Link)
          .setURL(supportUrl)
      );

      const header = new TextDisplayBuilder()
        .setContent(
          `## 🛡️ TOGETHER // Terms & Privacy Policy\n\n` +
          `TOGETHER is dedicated to transparent data practices, Discord Developer Terms compliance, and high-fidelity audio privacy.\n\n` +
          `• **No Audio Eavesdropping:** Outbound audio playback only. Voice channels are never recorded, tapped, or stored.\n` +
          `• **Minimal Telemetry:** We only retain user IDs for rank XP/likes and server IDs for 24/7/prefix settings.\n` +
          `• **Full GDPR Right-to-Erasure:** Request full data wipes anytime in our support server.`
        );

      const separator = new SeparatorBuilder();

      const container = new ContainerBuilder()
        .addTextDisplayComponents(header)
        .addSeparatorComponents(separator)
        .addActionRowComponents(linkRow);

      return message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (error) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.cross || "❌"} Error: ${error.message}**`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorDisplay);

      return message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }
  },
};
