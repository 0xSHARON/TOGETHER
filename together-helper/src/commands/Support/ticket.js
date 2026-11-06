const {
  ApplicationCommandOptionType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const { TicketConfig, Ticket } = require("../../schema");
const config = require("../../config");
const {
  container,
  separator,
  text,
  flags,
  noticePayload,
  COLORS
} = require("../../utils/ui");

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
        return interaction.reply(
          noticePayload({
            title: "Permission Denied",
            description: "You need `Manage Server` permissions to deploy the ticket desk.",
            emoji: "🚫",
            tone: "danger"
          }, true)
        );
      }

      await interaction.deferReply({ ephemeral: true });

      // Build Components V2 Ticket Panel
      const panelCard = container(COLORS.brand)
        .addTextDisplayComponents(
          text("## 📩 TOGETHER SUPPORT // TICKET DESK\n*Fast, dedicated assistance from our team*")
        )
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(
          text(
            "Need help with **TOGETHER Music**, have a billing inquiry, or want to report an issue?\n\n" +
            "Click one of the buttons below to open a private assistance channel:\n\n" +
            "• **🎧 Bot Help & Support** — Playback issues, audio lag, permissions\n" +
            "• **🐛 Bug & Error Report** — Broken features or Lavalink connection drops\n" +
            "• **⭐ VIP & Top.gg Perks** — Voter reward inquiries & partnership requests"
          )
        )
        .addSeparatorComponents(separator())
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
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
          )
        );

      const panelMsg = await interaction.channel.send({
        components: [panelCard],
        flags: flags(false)
      });

      await TicketConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        {
          panelChannelId: interaction.channel.id,
          panelMessageId: panelMsg.id,
          categoryId: category?.id || config.ticketsCategoryId || null,
          staffRoleId: staffRole?.id || null
        },
        { upsert: true, new: true }
      );

      return interaction.editReply(
        noticePayload({
          title: "Ticket Panel Deployed",
          description: `Interactive Components V2 desk deployed in ${interaction.channel.toString()}!`,
          emoji: "✅",
          tone: "success"
        }, true)
      );
    }

    // ── SUBCOMMAND: CLOSE ──
    if (action === "close") {
      const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
      if (!ticket) {
        return interaction.reply(
          noticePayload({
            title: "Invalid Channel",
            description: "This channel is not an active support ticket.",
            emoji: "❌",
            tone: "danger"
          }, true)
        );
      }

      const closeCard = container(COLORS.danger)
        .addTextDisplayComponents(text("## 🔒 Closing Support Ticket"))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(
          text("This channel will be archived and deleted in 5 seconds. Thank you for contacting TOGETHER support!")
        );

      await interaction.reply({
        components: [closeCard],
        flags: flags(false)
      });

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
      const configCard = container(COLORS.info)
        .addTextDisplayComponents(text("## ⚙️ Ticket Desk Configuration"))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(
          text(
            `**Tickets Category**\n${cfg?.categoryId ? `<#${cfg.categoryId}>` : "*None (Created at root)*"}\n\n` +
            `**Staff Ping Role**\n${cfg?.staffRoleId ? `<@&${cfg.staffRoleId}>` : "*None (Admins only)*"}\n\n` +
            `**Total Tickets Created**\n\`${cfg?.ticketCounter || 0}\``
          )
        );

      return interaction.reply({
        components: [configCard],
        flags: flags(true)
      });
    }
  }
};
