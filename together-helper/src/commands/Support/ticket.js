const {
  ApplicationCommandOptionType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const { TicketConfig, Ticket } = require("../../schema");
const config = require("../../config");
const { container, flags, noticePayload, separator, text, COLORS } = require("../../utils/ui");

function renderPanelCard() {
  return container(COLORS.brand)
    .addTextDisplayComponents(text(`### 📩 TOGETHER SUPPORT // TICKET DESK`))
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(
      text(
        `Need help with **TOGETHER Music**, have a VIP inquiry, or want to report an issue?\n\n` +
        `Click one of the buttons below to create a private support room with our team:\n\n` +
        `• 🎧 **Bot Help & Playback Support** — Song errors, playback lag, command issues\n` +
        `• 🐛 **Bug & Lavalink Report** — Connection drops, queue desync, node issues\n` +
        `• ⭐ **VIP, Top.gg & Perks** — Voter perks, billing, or server partnerships`
      )
    )
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(text(`*One ticket per member at a time. Staff will respond promptly.*`));
}

function panelRow() {
  return new ActionRowBuilder().addComponents(
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
}

module.exports = {
  name: "ticket",
  description: "Ticket system commands and support panel setup",
  category: "Support",
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
            description: "You need `Manage Server` permissions to set up tickets.",
            emoji: "🚫",
            tone: "danger"
          }, true)
        );
      }

      await interaction.deferReply({ ephemeral: true });

      const card = renderPanelCard();
      const row = panelRow();

      const panelMsg = await interaction.channel.send({
        components: [card, row],
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
          description: `Support ticket desk deployed to <#${interaction.channel.id}>. Members can now open tickets with one click.`,
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
            title: "Not a Ticket",
            description: "This channel is not an active support ticket.",
            emoji: "⚠️",
            tone: "warning"
          }, true)
        );
      }

      const closeNotice = noticePayload({
        title: "Closing Support Ticket",
        description: "This channel will be archived and deleted in 5 seconds. Thank you for contacting TOGETHER support!",
        emoji: "🔒",
        tone: "danger"
      }, false);

      await interaction.reply(closeNotice);
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

      const confCard = container(COLORS.brand)
        .addTextDisplayComponents(text(`### ⚙️ Ticket Desk Configuration`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(
          text(
            `• **Tickets Category:** ${cfg?.categoryId ? `<#${cfg.categoryId}>` : (config.ticketsCategoryId ? `<#${config.ticketsCategoryId}>` : "*Root / Default*")}\n` +
            `• **Staff Ping Role:** ${cfg?.staffRoleId ? `<@&${cfg.staffRoleId}>` : "*None (Server Admins only)*"}\n` +
            `• **Total Tickets Processed:** \`${cfg?.ticketCounter || 0}\``
          )
        );

      return interaction.reply({
        components: [confCard],
        flags: flags(true)
      });
    }
  },

  async prefixExecute(message, args, client) {
    const action = args[0]?.toLowerCase() || "help";

    if (action === "setup") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !config.ownerIds.includes(message.author.id)) {
        return message.reply(
          noticePayload({
            title: "Permission Denied",
            description: "You need `Manage Server` permissions to set up tickets.",
            emoji: "🚫",
            tone: "danger"
          }, false)
        );
      }

      const card = renderPanelCard();
      const row = panelRow();

      const panelMsg = await message.channel.send({
        components: [card, row],
        flags: flags(false)
      });

      await TicketConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        {
          panelChannelId: message.channel.id,
          panelMessageId: panelMsg.id,
          categoryId: config.ticketsCategoryId || null
        },
        { upsert: true, new: true }
      );

      return message.reply(
        noticePayload({
          title: "Ticket Panel Deployed",
          description: `Support ticket desk deployed to <#${message.channel.id}>!`,
          emoji: "✅",
          tone: "success"
        }, false)
      );
    }

    if (action === "close") {
      const ticket = await Ticket.findOne({ channelId: message.channel.id });
      if (!ticket) {
        return message.reply(
          noticePayload({
            title: "Not a Ticket",
            description: "This channel is not an active support ticket.",
            emoji: "⚠️",
            tone: "warning"
          }, false)
        );
      }

      await message.reply(
        noticePayload({
          title: "Closing Support Ticket",
          description: "This channel will be archived and deleted in 5 seconds.",
          emoji: "🔒",
          tone: "danger"
        }, false)
      );

      await Ticket.findOneAndUpdate({ channelId: message.channel.id }, { status: "closed" });

      setTimeout(async () => {
        try {
          await message.channel.delete("Ticket closed by user");
        } catch {}
      }, 5000);
      return;
    }

    if (action === "config") {
      const cfg = await TicketConfig.findOne({ guildId: message.guild.id });

      const confCard = container(COLORS.brand)
        .addTextDisplayComponents(text(`### ⚙️ Ticket Desk Configuration`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(
          text(
            `• **Tickets Category:** ${cfg?.categoryId ? `<#${cfg.categoryId}>` : (config.ticketsCategoryId ? `<#${config.ticketsCategoryId}>` : "*Root / Default*")}\n` +
            `• **Staff Ping Role:** ${cfg?.staffRoleId ? `<@&${cfg.staffRoleId}>` : "*None (Server Admins only)*"}\n` +
            `• **Total Tickets Processed:** \`${cfg?.ticketCounter || 0}\``
          )
        );

      return message.reply({
        components: [confCard],
        flags: flags(false)
      });
    }

    return message.reply(
      noticePayload({
        title: "Ticket Commands",
        description: "• `-ticket setup` — Deploy interactive ticket desk panel\n• `-ticket close` — Close and delete active ticket\n• `-ticket config` — View ticket system configuration",
        emoji: "ℹ️",
        tone: "info"
      }, false)
    );
  }
};
