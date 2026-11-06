const fs = require("fs");
const path = require("path");
const {
  ApplicationCommandOptionType,
  PermissionsBitField,
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} = require("discord.js");
const { TicketConfig, Ticket } = require("../../schema");
const config = require("../../config");
const { container, flags, noticePayload, separator, text } = require("../../utils/ui");
const emoji = require("../../emojis");

const BANNERS_DIR = path.resolve(__dirname, "../../../assets/banners");
const BANNER_HOME = path.resolve(__dirname, "../../../assets/banner.png");
const LOCAL_BANNERS_DIR = path.resolve(__dirname, "../../assets/banners");
const LOCAL_BANNER_HOME = path.resolve(__dirname, "../../assets/banner.png");

function bannerFor(key = "config") {
  const slug = key.toLowerCase();
  const localSpecific = path.join(LOCAL_BANNERS_DIR, `${slug}.png`);
  if (fs.existsSync(localSpecific)) return { name: `${slug}.png`, filePath: localSpecific };

  const specific = path.join(BANNERS_DIR, `${slug}.png`);
  if (fs.existsSync(specific)) return { name: `${slug}.png`, filePath: specific };

  if (fs.existsSync(LOCAL_BANNER_HOME)) return { name: "banner.png", filePath: LOCAL_BANNER_HOME };
  if (fs.existsSync(BANNER_HOME)) return { name: "banner.png", filePath: BANNER_HOME };
  return null;
}

function renderPanelCard() {
  const banner = bannerFor("config");
  const card = container();

  if (banner) {
    card.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder()
          .setURL(`attachment://${banner.name}`)
          .setDescription("TOGETHER Support Banner"),
      ),
    );
  }

  card
    .addTextDisplayComponents(text(`## ${emoji.star} TOGETHER SUPPORT // TICKET DESK\n-# Dedicated community assistance and issue resolution`))
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(
      text(
        `Need help with **TOGETHER Music**, have a VIP inquiry, or encountered an issue?\n\n` +
        `Click one of the buttons below to create a private support room with our team:\n\n` +
        `• **🎧 Bot Help & Playback** — Playback errors, audio lag, command permissions\n` +
        `• **🐛 Bug & Node Report** — Connection drops, queue desync, audio stutter\n` +
        `• **⭐ VIP & Partnerships** — Voter perks, billing, or server collaboration`,
      ),
    )
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(text(`-# Select an option below · One ticket per member at a time`))
    .addActionRowComponents(panelRow());

  return { card, banner };
}

function panelRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket:create:support")
      .setLabel("Bot Help")
      .setEmoji(emoji.headphones || "🎧")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("ticket:create:bug")
      .setLabel("Bug Report")
      .setEmoji(emoji.warn || "🐛")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("ticket:create:vip")
      .setLabel("VIP & Perks")
      .setEmoji(emoji.star || "⭐")
      .setStyle(ButtonStyle.Success),
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
        { name: "config - View current ticket configuration", value: "config" },
      ],
    },
    {
      name: "category",
      type: ApplicationCommandOptionType.Channel,
      description: "Category to create tickets under (for setup)",
      required: false,
    },
    {
      name: "staff_role",
      type: ApplicationCommandOptionType.Role,
      description: "Staff role to ping on new tickets (for setup)",
      required: false,
    },
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
            emoji: emoji.cross,
            tone: "danger",
          }, true),
        );
      }

      await interaction.deferReply({ ephemeral: true });

      const { card, banner } = renderPanelCard();
      const files = banner ? [new AttachmentBuilder(banner.filePath, { name: banner.name })] : [];

      const panelMsg = await interaction.channel.send({
        components: [card],
        files,
        flags: flags(false),
      });

      await TicketConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        {
          panelChannelId: interaction.channel.id,
          panelMessageId: panelMsg.id,
          categoryId: category?.id || config.ticketsCategoryId || null,
          staffRoleId: staffRole?.id || null,
        },
        { upsert: true, new: true },
      );

      return interaction.editReply(
        noticePayload({
          title: "Ticket Panel Deployed",
          description: `Support ticket desk deployed to <#${interaction.channel.id}>. Members can now open tickets with one click.`,
          emoji: emoji.check,
          tone: "success",
        }, true),
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
            emoji: emoji.warn,
            tone: "warning",
          }, true),
        );
      }

      const closeNotice = noticePayload({
        title: "Closing Support Ticket",
        description: "This channel will be closed and archived in 5 seconds. Thank you for contacting TOGETHER support!",
        emoji: emoji.lock,
        tone: "danger",
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

      const confCard = container()
        .addTextDisplayComponents(text(`## ${emoji.config} Ticket Desk Configuration\n-# Current Server Settings`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(
          text(
            `**Tickets Category**  ${cfg?.categoryId ? `<#${cfg.categoryId}>` : (config.ticketsCategoryId ? `<#${config.ticketsCategoryId}>` : "*Root / Default*")}\n` +
            `**Staff Ping Role**  ${cfg?.staffRoleId ? `<@&${cfg.staffRoleId}>` : "*None (Admins only)*"}\n` +
            `**Total Tickets Processed**  \`${cfg?.ticketCounter || 0}\``,
          ),
        )
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`-# Requested by ${interaction.user.username} · TOGETHER Helper`));

      return interaction.reply({
        components: [confCard],
        flags: flags(true),
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
            emoji: emoji.cross,
            tone: "danger",
          }, false),
        );
      }

      const { card, banner } = renderPanelCard();
      const files = banner ? [new AttachmentBuilder(banner.filePath, { name: banner.name })] : [];

      const panelMsg = await message.channel.send({
        components: [card],
        files,
        flags: flags(false),
      });

      await TicketConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        {
          panelChannelId: message.channel.id,
          panelMessageId: panelMsg.id,
          categoryId: config.ticketsCategoryId || null,
        },
        { upsert: true, new: true },
      );

      return message.reply(
        noticePayload({
          title: "Ticket Panel Deployed",
          description: `Support ticket desk deployed to <#${message.channel.id}>!`,
          emoji: emoji.check,
          tone: "success",
        }, false),
      );
    }

    if (action === "close") {
      const ticket = await Ticket.findOne({ channelId: message.channel.id });
      if (!ticket) {
        return message.reply(
          noticePayload({
            title: "Not a Ticket",
            description: "This channel is not an active support ticket.",
            emoji: emoji.warn,
            tone: "warning",
          }, false),
        );
      }

      await message.reply(
        noticePayload({
          title: "Closing Support Ticket",
          description: "This channel will be closed and deleted in 5 seconds.",
          emoji: emoji.lock,
          tone: "danger",
        }, false),
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

      const confCard = container()
        .addTextDisplayComponents(text(`## ${emoji.config} Ticket Desk Configuration\n-# Current Server Settings`))
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(
          text(
            `**Tickets Category**  ${cfg?.categoryId ? `<#${cfg.categoryId}>` : (config.ticketsCategoryId ? `<#${config.ticketsCategoryId}>` : "*Root / Default*")}\n` +
            `**Staff Ping Role**  ${cfg?.staffRoleId ? `<@&${cfg.staffRoleId}>` : "*None (Admins only)*"}\n` +
            `**Total Tickets Processed**  \`${cfg?.ticketCounter || 0}\``,
          ),
        )
        .addSeparatorComponents(separator())
        .addTextDisplayComponents(text(`-# Requested by ${message.author.username} · TOGETHER Helper`));

      return message.reply({
        components: [confCard],
        flags: flags(false),
      });
    }

    return message.reply(
      noticePayload({
        title: "Ticket Commands",
        description: "• `-ticket setup` — Deploy interactive ticket desk panel\n• `-ticket close` — Close and delete active ticket\n• `-ticket config` — View ticket system configuration",
        emoji: emoji.info,
        tone: "info",
      }, false),
    );
  },
};
