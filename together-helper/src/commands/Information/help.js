const fs = require("fs");
const path = require("path");
const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const { container, flags, noticePayload, separator, text } = require("../../utils/ui");
const { isHttpUrl } = require("../../utils/webhooks");
const emoji = require("../../emojis");
const config = require("../../config");

const BANNERS_DIR = path.resolve(__dirname, "../../../assets/banners");
const BANNER_HOME = path.resolve(__dirname, "../../../assets/banner.png");
const LOCAL_BANNERS_DIR = path.resolve(__dirname, "../../assets/banners");
const LOCAL_BANNER_HOME = path.resolve(__dirname, "../../assets/banner.png");

function bannerFor(key = "home") {
  if (key === "home") {
    if (fs.existsSync(LOCAL_BANNER_HOME)) return { name: "banner.png", filePath: LOCAL_BANNER_HOME };
    if (fs.existsSync(BANNER_HOME)) return { name: "banner.png", filePath: BANNER_HOME };
    return null;
  }
  const slug = key.toLowerCase();
  const localSpecific = path.join(LOCAL_BANNERS_DIR, `${slug}.png`);
  if (fs.existsSync(localSpecific)) return { name: `${slug}.png`, filePath: localSpecific };

  const specific = path.join(BANNERS_DIR, `${slug}.png`);
  if (fs.existsSync(specific)) return { name: `${slug}.png`, filePath: specific };

  if (fs.existsSync(LOCAL_BANNER_HOME)) return { name: "banner.png", filePath: LOCAL_BANNER_HOME };
  if (fs.existsSync(BANNER_HOME)) return { name: "banner.png", filePath: BANNER_HOME };
  return null;
}

const CATEGORY_INFO = Object.freeze({
  Admin: { emoji: emoji.config, bannerKey: "config", description: "Welcome greetings, routing channels, and sticky notices" },
  General: { emoji: emoji.utility, bannerKey: "utility", description: "Community feedback, feature suggestions, and bug reports" },
  Information: { emoji: emoji.info, bannerKey: "information", description: "Bot latency, system diagnostics, and manual" },
  Support: { emoji: emoji.star, bannerKey: "home", description: "Ticket desk panels, support rooms, and issue resolution" },
});

function publicCommands(client) {
  return [...client.commands.values()]
    .filter((command) => command.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function commandGroups(client) {
  return publicCommands(client).reduce((groups, command) => {
    const category = command.category || "General";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(command);
    return groups;
  }, new Map());
}

function menuRow(groups, disabled = false, selected = "home") {
  const options = [{
    label: "Overview",
    value: "home",
    description: "Return to the main helper manual",
    emoji: emoji.home,
    default: selected === "home"
  }];

  for (const [category, commands] of groups) {
    const info = CATEGORY_INFO[category] || { emoji: emoji.utility, description: `${category} commands` };
    options.push({
      label: category,
      value: category,
      description: `${commands.length} commands · ${info.description}`.slice(0, 100),
      emoji: info.emoji,
      default: selected === category
    });
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId("help:category")
    .setPlaceholder(disabled ? "Help menu expired — run help again" : "Browse a command category")
    .setDisabled(disabled)
    .addOptions(options);

  return new ActionRowBuilder().addComponents(menu);
}

function linkRow() {
  const buttons = [];
  if (isHttpUrl(config.supportUrl)) {
    buttons.push(
      new ButtonBuilder()
        .setLabel("Support server")
        .setEmoji(emoji.info)
        .setURL(config.supportUrl)
        .setStyle(ButtonStyle.Link)
    );
  }
  if (config.mainBotId) {
    buttons.push(
      new ButtonBuilder()
        .setLabel("Invite TOGETHER")
        .setEmoji(emoji.home)
        .setURL(`https://discord.com/oauth2/authorize?client_id=${config.mainBotId}&permissions=8&scope=bot%20applications.commands`)
        .setStyle(ButtonStyle.Link)
    );
  }
  if (isHttpUrl(config.dashboardUrl)) {
    buttons.push(
      new ButtonBuilder()
        .setLabel("Dashboard")
        .setEmoji(emoji.config)
        .setURL(config.dashboardUrl)
        .setStyle(ButtonStyle.Link)
    );
  }
  return buttons.length ? new ActionRowBuilder().addComponents(buttons) : null;
}

function compactUptime(milliseconds = 0) {
  const totalMinutes = Math.floor(milliseconds / 60_000);
  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;
  return [days && `${days}d`, hours && `${hours}h`, `${minutes}m`].filter(Boolean).join(" ") || "1m";
}

function homeView(client, requester, groups, disabled = false) {
  const count = [...groups.values()].reduce((total, commands) => total + commands.length, 0);
  const categorySummary = [...groups].map(([category, commands]) => {
    const info = CATEGORY_INFO[category] || { emoji: emoji.utility, description: `${category} commands` };
    return `${info.emoji} **${category}**  \`${commands.length}\``;
  }).join("\n");
  const status = client.isReady?.() !== false ? "Online" : "Connecting";
  const ping = Math.max(0, Math.round(client.ws?.ping || 0));

  const banner = bannerFor("home");
  const card = container();

  if (banner) {
    card.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder()
          .setURL(`attachment://${banner.name}`)
          .setDescription("TOGETHER HELPER Commands Banner"),
      ),
    );
  }

  card
    .addTextDisplayComponents(text(`## TOGETHER HELPER\n-# ${count} commands · ${groups.size} categories`))
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(text(
      `**Status**  \`${status}\`   **Ping**  \`${ping} ms\`   **Uptime**  \`${compactUptime(client.uptime)}\``,
    ))
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(text(categorySummary))
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(text(`-# Requested by ${requester.username} · developed by kajukatli.`))
    .addActionRowComponents(menuRow(groups, disabled, "home"));

  const links = linkRow();
  if (links) card.addActionRowComponents(links);
  return { card, banner };
}

function categoryView(category, commands, prefix, groups, requester, disabled = false) {
  const info = CATEGORY_INFO[category] || { emoji: emoji.utility, bannerKey: "utility", description: `${category} commands` };
  const listing = commands
    .map((c) => `• **\`/${c.name}\`**\n  *${c.description}*`)
    .join("\n\n");
  const banner = bannerFor(info.bannerKey || category);

  const card = container();
  if (banner) {
    card.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder()
          .setURL(`attachment://${banner.name}`)
          .setDescription(`${category} Commands Banner`),
      ),
    );
  }

  card
    .addTextDisplayComponents(text(`## ${info.emoji} ${category}\n-# ${commands.length} commands · ${info.description}`))
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(text(listing || "No public commands available in this category."))
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(text(`Use \`/${commands[0]?.name || "help"}\` or \`${prefix}${commands[0]?.name || "help"}\` for details.\n-# Requested by ${requester.username} · developed by kajukatli.`))
    .addActionRowComponents(menuRow(groups, disabled, category));

  const links = linkRow();
  if (links) card.addActionRowComponents(links);
  return { card, banner };
}

module.exports = {
  name: "help",
  description: "View all commands and modules for TOGETHER HELPER",
  category: "Information",
  slashOptions: [],

  async slashExecute(interaction, client) {
    const groups = commandGroups(client);
    const prefix = config.prefix || "-";
    const requester = interaction.user;

    const { card, banner } = homeView(client, requester, groups);
    const files = banner ? [new AttachmentBuilder(banner.filePath, { name: banner.name })] : [];

    const reply = await interaction.reply({
      components: [card],
      files,
      flags: flags(false),
      fetchReply: true,
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 120_000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply(
          noticePayload({
            title: "Interaction Unavailable",
            description: "Please run `/help` yourself to browse categories.",
            tone: "warning",
          }, true),
        );
      }

      const selected = i.values[0];
      const view = selected === "home"
        ? homeView(client, requester, groups, false)
        : categoryView(selected, groups.get(selected) || [], prefix, groups, requester, false);

      const updateFiles = view.banner ? [new AttachmentBuilder(view.banner.filePath, { name: view.banner.name })] : [];

      await i.update({
        components: [view.card],
        files: updateFiles,
        flags: flags(false),
      });
    });

    collector.on("end", async () => {
      try {
        const expired = homeView(client, requester, groups, true);
        await interaction.editReply({
          components: [expired.card],
          flags: flags(false),
        });
      } catch {}
    });
  },

  async prefixExecute(message, args, client) {
    const groups = commandGroups(client);
    const prefix = config.prefix || "-";
    const requester = message.author;

    const { card, banner } = homeView(client, requester, groups);
    const files = banner ? [new AttachmentBuilder(banner.filePath, { name: banner.name })] : [];

    const reply = await message.reply({
      components: [card],
      files,
      flags: flags(false),
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 120_000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== message.author.id) {
        return i.reply(
          noticePayload({
            title: "Interaction Unavailable",
            description: "Please run `help` yourself to browse categories.",
            tone: "warning",
          }, true),
        );
      }

      const selected = i.values[0];
      const view = selected === "home"
        ? homeView(client, requester, groups, false)
        : categoryView(selected, groups.get(selected) || [], prefix, groups, requester, false);

      const updateFiles = view.banner ? [new AttachmentBuilder(view.banner.filePath, { name: view.banner.name })] : [];

      await i.update({
        components: [view.card],
        files: updateFiles,
        flags: flags(false),
      });
    });
  },
};
