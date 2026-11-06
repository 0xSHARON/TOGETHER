const {
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  TextDisplayBuilder,
} = require("discord.js");

const COLORS = Object.freeze({
  brand: 0xFF1E38,    // TOGETHER Red Accent
  accent: 0x00E676,   // Emerald Accent
  neutral: 0x2A2D34,
  info: 0x5865F2,
  success: 0x00E676,
  warning: 0xF0B232,
  danger: 0xED4245,
});

const flags = (ephemeral = false) => MessageFlags.IsComponentsV2 |
  (ephemeral ? MessageFlags.Ephemeral : 0);

function text(content) {
  return new TextDisplayBuilder().setContent(content);
}

function separator(divider = true) {
  return new SeparatorBuilder().setDivider(divider);
}

function container(color = null) {
  const component = new ContainerBuilder();
  return Number.isInteger(color) ? component.setAccentColor(color) : component;
}

function notice({ title, description, emoji = "ℹ️", tone = "info" }) {
  const card = container(COLORS[tone] || COLORS.info)
    .addTextDisplayComponents(text(`### ${emoji} ${title}`));

  if (description) {
    card.addSeparatorComponents(separator());
    card.addTextDisplayComponents(text(description));
  }
  return card;
}

function noticePayload(options, ephemeral = false) {
  return { components: [notice(options)], flags: flags(ephemeral) };
}

module.exports = {
  COLORS,
  container,
  flags,
  notice,
  noticePayload,
  separator,
  text
};
