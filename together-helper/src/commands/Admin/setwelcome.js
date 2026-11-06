const {
  ApplicationCommandOptionType,
  PermissionsBitField,
  EmbedBuilder
} = require("discord.js");
const { WelcomeConfig } = require("../../schema");
const config = require("../../config");

module.exports = {
  name: "setwelcome",
  description: "Configure automatic welcome messages for new joining members",
  userPerms: ["ManageGuild"],
  slashOptions: [
    {
      name: "channel",
      type: ApplicationCommandOptionType.Channel,
      description: "Channel where welcome messages should be announced",
      required: true
    },
    {
      name: "message",
      type: ApplicationCommandOptionType.String,
      description: "Custom message. Use {user} for mention, {server} for server name, {count} for member count",
      required: false
    },
    {
      name: "dm",
      type: ApplicationCommandOptionType.Boolean,
      description: "Also send a direct message welcome to the user?",
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !config.ownerIds.includes(interaction.user.id)) {
      return interaction.reply({ content: "❌ You need `Manage Server` permissions to configure welcome messages.", ephemeral: true });
    }

    const channel = interaction.options.getChannel("channel");
    const customMsg = interaction.options.getString("message") || "Welcome to **{server}**, {user}! Dive into lossless audio with TOGETHER.";
    const dm = interaction.options.getBoolean("dm") || false;

    await WelcomeConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        channelId: channel.id,
        message: customMsg,
        dmWelcome: dm,
        enabled: true
      },
      { upsert: true, new: true }
    );

    const embed = new EmbedBuilder()
      .setColor(config.accentColor)
      .setTitle("🎉 Welcome System Configured")
      .setDescription(
        `• **Announcement Channel:** ${channel.toString()}\n` +
        `• **DM Welcome:** \`${dm ? "ENABLED" : "DISABLED"}\`\n\n` +
        `**Message Preview:**\n>>> ${customMsg
          .replace(/{user}/g, interaction.user.toString())
          .replace(/{server}/g, interaction.guild.name)
          .replace(/{count}/g, interaction.guild.memberCount)}`
      );

    return interaction.reply({ embeds: [embed] });
  }
};
