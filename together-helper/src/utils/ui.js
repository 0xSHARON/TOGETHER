const {
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const COLORS = Object.freeze({
  neutral: 0x3F4652,
  info: 0x5865F2,
  success: 0x35C47C,
  warning: 0xF0B232,
  danger: 0xED4245,
  brand: 0xFF1E38,
  purple: 0x8E24AA,
});

const flags = (ephemeral = false) =>
  MessageFlags.IsComponentsV2 | (ephemeral ? MessageFlags.Ephemeral : 0);

function text(content) {
  return new TextDisplayBuilder().setContent(String(content || ""));
}

function separator() {
  return new SeparatorBuilder().setDivider(true);
}

function container(color = null) {
  const component = new ContainerBuilder();
  if (typeof color === "string" && color.startsWith("#")) {
    color = parseInt(color.replace("#", ""), 16);
  }
  return Number.isInteger(color) ? component.setAccentColor(color) : component;
}

/**
 * Standard notification card in Components V2 format
 */
function notice({ title, description, emoji = "ℹ️", tone = "info" }) {
  const accent = COLORS[tone] || COLORS.info;
  const card = container(accent).addTextDisplayComponents(
    text(`### ${emoji} ${title}`)
  );

  if (description) {
    card.addSeparatorComponents(separator());
    card.addTextDisplayComponents(text(description));
  }
  return card;
}

/**
 * Wraps notice card into a sendable Discord interaction payload
 */
function noticePayload(options, ephemeral = false) {
  return {
    components: [notice(options)],
    flags: flags(ephemeral)
  };
}

/**
 * Creates a rich styled Components V2 Card
 */
function createCard({ title, subtitle, description, fields = [], accentColor = COLORS.brand, actions = null }) {
  const card = container(accentColor);

  let headerText = `## ${title}`;
  if (subtitle) headerText += `\n*${subtitle}*`;
  card.addTextDisplayComponents(text(headerText));

  if (description) {
    card.addSeparatorComponents(separator());
    card.addTextDisplayComponents(text(description));
  }

  if (fields && fields.length > 0) {
    card.addSeparatorComponents(separator());
    const fieldContent = fields
      .map((f) => `**${f.name}**\n${f.value}`)
      .join("\n\n");
    card.addTextDisplayComponents(text(fieldContent));
  }

  if (actions && Array.isArray(actions) && actions.length > 0) {
    card.addSeparatorComponents(separator());
    card.addActionRowComponents(...actions);
  }

  return card;
}

module.exports = {
  COLORS,
  container,
  flags,
  notice,
  noticePayload,
  createCard,
  separator,
  text
};
