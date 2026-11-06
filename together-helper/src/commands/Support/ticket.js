const {
  ApplicationCommandOptionType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const { TicketConfig, Ticket } = require("../../schema");
const config = require("../../config");

module.exports = {
  name: "ticket",
  description: "Ticket system commands and support panel setup",
  userPerms: ["ManageGuild"],
  slashOptions: [
    {
      name: "action",
      type: ApplicationCommandOptionType.String,
      description: "Action to perform",
      required: true,
      choices: [
        { name: "setup - Deploy interactive ticket panel", value: "setup" },
        { name: "close - Close the current support ticket", value: "close" },
        { name: "config - View current ticket configuration", value: "config" }
      ]
    },
    {
      name: "category",
      type: ApplicationCommandOptionType.Channel,
      description: "Category to create tickets under (for setup)",
      required: false
    },
    {
      name: "staff_role",
      type: ApplicationCommandOptionType.Role,
      description: "Staff role to ping on new tickets (for setup)",
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    const action = interaction.options.getString("action");
    const category = interaction.options.getChannel("category");
    const staffRole = interaction.options.getRole("staff_role");

    // ── SUBCOMMAND: SETUP PANEL ──
    if (action === "setup") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !config.ownerIds.includes(interaction.user.id)) {
        return interaction.reply({ content: "❌ You need `Manage Server` permissions to set up tickets.", ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });

      const panelEmbed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle("📩 TOGETHER SUPPORT // TICKET DESK")
        .setDescription(
          "Need help with **TOGETHER Music**, have a billing inquiry, or want to report an issue?\n\n" +
          "Click one of the buttons below to create a private support ticket with our team:\n\n" +
          "• **🎧 Bot Help & Support** — Playback issues, audio lag, permissions\n" +
          "• **🐛 Bug & Error Report** — Broken features or Lavalink connection drops\n" +
          "• **⭐ VIP & Top.gg Perks** — Voter reward inquiries & partnership requests"
        )
        .setFooter({ text: "TOGETHER Helper • Support Automation" })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket:create:support")
          .setLabel("Bot Help")
          .setEmoji("🎧")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("ticket:create:bug")
          .setLabel("Bug Report")
          .setEmoji("🐛")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("ticket:create:vip")
          .setLabel("VIP & Perks")
          .setEmoji("⭐")
          .setStyle(ButtonStyle.Success)
      );

      const panelMsg = await interaction.channel.send({ embeds: [panelEmbed], components: [row] });

      await TicketConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        {
          panelChannelId: interaction.channel.id,
          panelMessageId: panelMsg.id,
          categoryId: category?.id || null,
          staffRoleId: staffRole?.id || null
        },
        { upsert: true, new: true }
      );

      return interaction.editReply({
        content: `✅ Ticket panel deployed successfully in ${interaction.channel.toString()}!`
      });
    }

    // ── SUBCOMMAND: CLOSE ──
    if (action === "close") {
      const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
      if (!ticket) {
        return interaction.reply({ content: "❌ This channel is not an active support ticket.", ephemeral: true });
      }

      const closeEmbed = new EmbedBuilder()
        .setColor("#FF1E38")
        .setTitle("🔒 Closing Ticket")
        .setDescription("This ticket will be deleted in 5 seconds. Thank you for contacting TOGETHER support!");

      await interaction.reply({ embeds: [closeEmbed] });
      await Ticket.findOneAndUpdate({ channelId: interaction.channel.id }, { status: "closed" });

      setTimeout(async () => {
        try {
          await interaction.channel.delete("Ticket closed by user");
        } catch {}
      }, 5000);
      return;
    }

    // ── SUBCOMMAND: CONFIG ──
    if (action === "config") {
      const cfg = await TicketConfig.findOne({ guildId: interaction.guild.id });
      const confEmbed = new EmbedBuilder()
        .setColor(config.accentColor)
        .setTitle("⚙️ Ticket System Configuration")
        .addFields(
          { name: "Tickets Category", value: cfg?.categoryId ? `<#${cfg.categoryId}>` : "*None (Created at root)*", inline: true },
          { name: "Staff Role", value: cfg?.staffRoleId ? `<@&${cfg.staffRoleId}>` : "*None (Admins only)*", inline: true },
          { name: "Total Tickets Created", value: `${cfg?.ticketCounter || 0}`, inline: true }
        );
      return interaction.reply({ embeds: [confEmbed], ephemeral: true });
    }
  }
};
