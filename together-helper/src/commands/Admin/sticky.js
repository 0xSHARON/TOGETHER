const {
  ApplicationCommandOptionType,
  PermissionsBitField,
  EmbedBuilder
} = require("discord.js");
const { StickyMessage } = require("../../schema");
const config = require("../../config");

module.exports = {
  name: "sticky",
  description: "Create or remove an automatically sticking message in a channel",
  userPerms: ["ManageMessages"],
  slashOptions: [
    {
      name: "action",
      type: ApplicationCommandOptionType.String,
      description: "Action to perform",
      required: true,
      choices: [
        { name: "set - Pin a message that stays at the bottom", value: "set" },
        { name: "remove - Stop sticking message in this channel", value: "remove" }
      ]
    },
    {
      name: "message",
      type: ApplicationCommandOptionType.String,
      description: "The text to stick at the bottom of the channel (required for set)",
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages) && !config.ownerIds.includes(interaction.user.id)) {
      return interaction.reply({ content: "❌ You need `Manage Messages` permissions to manage sticky messages.", ephemeral: true });
    }

    const action = interaction.options.getString("action");
    const text = interaction.options.getString("message");

    if (action === "set") {
      if (!text) {
        return interaction.reply({ content: "❌ Please provide the message content to stick.", ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });

      const stickyEmbed = new EmbedBuilder()
        .setColor(config.color)
        .setDescription(`📌 **NOTICE / GUIDELINES**\n\n${text}`)
        .setFooter({ text: "This message will automatically stay at the bottom of the channel." });

      const sentMsg = await interaction.channel.send({ embeds: [stickyEmbed] });

      await StickyMessage.findOneAndUpdate(
        { channelId: interaction.channel.id },
        {
          guildId: interaction.guild.id,
          message: text,
          lastMessageId: sentMsg.id,
          enabled: true
        },
        { upsert: true, new: true }
      );

      return interaction.editReply({
        content: "✅ Sticky message configured! It will now automatically reappear at the bottom whenever members chat."
      });
    }

    if (action === "remove") {
      const existing = await StickyMessage.findOne({ channelId: interaction.channel.id });
      if (!existing) {
        return interaction.reply({ content: "❌ No sticky message is active in this channel.", ephemeral: true });
      }

      if (existing.lastMessageId) {
        try {
          const oldMsg = await interaction.channel.messages.fetch(existing.lastMessageId);
          await oldMsg.delete();
        } catch {}
      }

      await StickyMessage.findOneAndDelete({ channelId: interaction.channel.id });

      return interaction.reply({ content: "✅ Sticky message removed from this channel.", ephemeral: true });
    }
  }
};
