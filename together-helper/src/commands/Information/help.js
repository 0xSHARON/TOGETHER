const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ComponentType
} = require("discord.js");
const { container, flags, noticePayload, separator, text, COLORS } = require("../../utils/ui");
const { isHttpUrl } = require("../../utils/webhooks");
const config = require("../../config");

const CATEGORIES = {
  Support: {
    emoji: "📩",
    label: "Support & Tickets",
    description: "Ticket panels, ticket closing and staff roles",
    commands: [
      { name: "/ticket setup", desc: "Deploy interactive ticket panel in a channel" },
      { name: "/ticket close", desc: "Close and archive the current ticket" },
      { name: "/ticket config", desc: "Set tickets category and staff support role" }
    ]
  },
  General: {
    emoji: "💡",
    label: "General & Community",
    description: "Community suggestions and bug reporting",
    commands: [
      { name: "/suggest", desc: "Submit an idea or feedback for community voting (👍/👎)" },
      { name: "/bugreport", desc: "Report an issue with reproduction steps to staff" }
    ]
  },
  Admin: {
    emoji: "⚙️",
    label: "Administration",
    description: "Welcome embeds, channel routing and sticky notices",
    commands: [
      { name: "/setwelcome", desc: "Configure dynamic welcome greetings for new members" },
      { name: "/setchannel", desc: "Route suggestions and bug reports to dedicated channels" },
      { name: "/sticky", desc: "Set or remove a message permanently anchored to channel bottom" }
    ]
  },
  Information: {
    emoji: "ℹ️",
    label: "Information",
    description: "Bot status, ping and help guide",
    commands: [
      { name: "/help", desc: "Display this interactive command manual" },
      { name: "/ping", desc: "Check bot latency and gateway WebSocket ping" }
    ]
  }
};

function linkRow() {
  const buttons = [];
  if (isHttpUrl(config.supportUrl)) {
    buttons.push(
      new ButtonBuilder()
        .setLabel("Support Server")
        .setStyle(ButtonStyle.Link)
        .setURL(config.supportUrl)
        .setEmoji("💬")
    );
  }
  if (isHttpUrl(config.dashboardUrl)) {
    buttons.push(
      new ButtonBuilder()
        .setLabel("Dashboard")
        .setStyle(ButtonStyle.Link)
        .setURL(config.dashboardUrl)
        .setEmoji("🌐")
    );
  }
  if (config.mainBotId) {
    buttons.push(
      new ButtonBuilder()
        .setLabel("Invite Main Bot")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/oauth2/authorize?client_id=${config.mainBotId}&permissions=8&scope=bot%20applications.commands`)
        .setEmoji("🎵")
    );
  }
  return buttons.length ? new ActionRowBuilder().addComponents(buttons) : null;
}

function menuRow(selected = "home", disabled = false) {
  const options = [
    {
      label: "Overview",
      value: "home",
      description: "Return to the main helper manual",
      emoji: "🏠",
      default: selected === "home"
    }
  ];

  for (const [key, data] of Object.entries(CATEGORIES)) {
    options.push({
      label: data.label,
      value: key,
      description: data.description.slice(0, 100),
      emoji: data.emoji,
      default: selected === key
    });
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId("help:select")
    .setPlaceholder("Select a category to view commands...")
    .setDisabled(disabled)
    .addOptions(options);

  return new ActionRowBuilder().addComponents(menu);
}

function renderHomeView(client) {
  const card = container(COLORS.brand)
    .addTextDisplayComponents(text(`### 🤖 TOGETHER HELPER • Operations & Support System`))
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(
      text(
        `Welcome to **TOGETHER HELPER** — the dedicated companion bot designed to power community operations, support tickets, moderation sticky notices, and feedback channels.\n\n` +
        `**Available Modules:**\n` +
        `• 📩 **Support Tickets:** Ephemeral buttons, staff category isolation, and auto-archive.\n` +
        `• 💡 **Suggestions:** Automated voting threads with instant reaction tallies.\n` +
        `• 🐛 **Bug Reporting:** Structured triage embeds with reproduction steps.\n` +
        `• 📌 **Sticky Messages:** Keep essential rules or links glued to the bottom of busy chats.\n` +
        `• 👋 **Welcome Greetings:** Rich dynamic member join cards with member counter.`
      )
    )
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(
      text(`*Select a module from the dropdown below to explore specific commands and options.*`)
    );

  return card;
}

function renderCategoryView(categoryKey) {
  const cat = CATEGORIES[categoryKey];
  if (!cat) return renderHomeView();

  const cmdList = cat.commands
    .map(c => `• **\`${c.name}\`**\n  *${c.desc}*`)
    .join("\n\n");

  const card = container(COLORS.accent)
    .addTextDisplayComponents(text(`### ${cat.emoji} ${cat.label}`))
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(text(`${cat.description}\n\n${cmdList}`))
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(text(`*Use \`/command\` or prefix \`${config.prefix}command\` to run any command.*`));

  return card;
}

module.exports = {
  name: "help",
  description: "View the command manual and features for TOGETHER HELPER",
  category: "Information",
  slashOptions: [],

  async slashExecute(interaction, client) {
    const card = renderHomeView(client);
    const mRow = menuRow("home");
    const lRow = linkRow();

    const components = [card, mRow];
    if (lRow) components.push(lRow);

    const reply = await interaction.reply({
      components,
      flags: flags(false),
      fetchReply: true
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 120_000
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply(
          noticePayload({
            title: "Interaction Unavailable",
            description: "Please run `/help` yourself to browse categories.",
            tone: "warning"
          }, true)
        );
      }

      const selected = i.values[0];
      const newCard = selected === "home" ? renderHomeView(client) : renderCategoryView(selected);
      const newMRow = menuRow(selected);
      const newComponents = [newCard, newMRow];
      if (lRow) newComponents.push(lRow);

      await i.update({
        components: newComponents,
        flags: flags(false)
      });
    });

    collector.on("end", async () => {
      try {
        const expiredCard = renderHomeView(client);
        const expiredMRow = menuRow("home", true);
        const expiredComponents = [expiredCard, expiredMRow];
        if (lRow) expiredComponents.push(lRow);
        await interaction.editReply({ components: expiredComponents, flags: flags(false) });
      } catch {}
    });
  },

  async prefixExecute(message, args, client) {
    const card = renderHomeView(client);
    const mRow = menuRow("home");
    const lRow = linkRow();

    const components = [card, mRow];
    if (lRow) components.push(lRow);

    const reply = await message.reply({
      components,
      flags: flags(false)
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 120_000
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== message.author.id) {
        return i.reply(
          noticePayload({
            title: "Interaction Unavailable",
            description: "Please run `help` yourself to navigate.",
            tone: "warning"
          }, true)
        );
      }

      const selected = i.values[0];
      const newCard = selected === "home" ? renderHomeView(client) : renderCategoryView(selected);
      const newMRow = menuRow(selected);
      const newComponents = [newCard, newMRow];
      if (lRow) newComponents.push(lRow);

      await i.update({
        components: newComponents,
        flags: flags(false)
      });
    });
  }
};
