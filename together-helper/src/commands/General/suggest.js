const {
  ApplicationCommandOptionType,
  PermissionsBitField,
  EmbedBuilder
} = require("discord.js");
const { SuggestionConfig } = require("../../schema");
const config = require("../../config");
const { container, flags, noticePayload, separator, text, COLORS } = require("../../utils/ui");
const { dispatchLogThread } = require("../../utils/webhooks");

module.exports = {
  name: "suggest",
  description: "Submit a feature idea or suggestion for community review",
  category: "General",
  slashOptions: [
    {
      name: "idea",
      type: ApplicationCommandOptionType.String,
      description: "Describe your suggestion or feature idea in detail",
      required: true
    }
  ],

  async slashExecute(interaction, client) {
    const idea = interaction.options.getString("idea");

    const cfg = await SuggestionConfig.findOne({ guildId: interaction.guild.id });
    const targetChannel = cfg?.channelId
      ? interaction.guild.channels.cache.get(cfg.channelId)
      : interaction.guild.channels.cache.find(c => c.name.includes("suggest"));

    if (!targetChannel) {
      return interaction.reply(
        noticePayload({
          title: "Channel Not Configured",
          description: "Suggestions channel has not been designated yet. An admin can run `/setchannel type:suggestions #channel`.",
          emoji: "⚠️",
          tone: "warning"
        }, true)
      );
    }

    const card = container(COLORS.accent)
      .addTextDisplayComponents(text(`### 💡 Community Suggestion`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `**Submitter:** ${interaction.user.toString()} (\`${interaction.user.id}\`)\n` +
          `**Status:** ⏳ *Pending Community Review*\n\n` +
          `**Idea / Proposal:**\n> ${idea}`
        )
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`*Vote using the reactions below to show support!*`));

    const msg = await targetChannel.send({
      components: [card],
      flags: flags(false)
    });

    await msg.react("👍").catch(() => {});
    await msg.react("👎").catch(() => {});

    const sugLog = new EmbedBuilder()
      .setColor("#00E676")
      .setAuthor({
        name: `${interaction.user.tag} (${interaction.user.id})`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTitle("💡 Suggestion Submitted")
      .setDescription(`• **Author:** ${interaction.user.toString()}\n• **Channel:** <#${targetChannel.id}>\n• **Idea:**\n> ${idea}`)
      .setTimestamp();
    dispatchLogThread(client, "suggestions", sugLog);

    return interaction.reply(
      noticePayload({
        title: "Suggestion Posted",
        description: `Your suggestion was dispatched to <#${targetChannel.id}> for voting!`,
        emoji: "✅",
        tone: "success"
      }, true)
    );
  },

  async prefixExecute(message, args, client) {
    const idea = args.join(" ");
    if (!idea) {
      return message.reply(
        noticePayload({
          title: "Missing Suggestion Content",
          description: "Usage: `-suggest <describe your idea>`",
          emoji: "⚠️",
          tone: "warning"
        }, false)
      );
    }

    const cfg = await SuggestionConfig.findOne({ guildId: message.guild.id });
    const targetChannel = cfg?.channelId
      ? message.guild.channels.cache.get(cfg.channelId)
      : message.guild.channels.cache.find(c => c.name.includes("suggest"));

    if (!targetChannel) {
      return message.reply(
        noticePayload({
          title: "Channel Not Configured",
          description: "Suggestions channel has not been designated yet. An admin can run `/setchannel type:suggestions #channel`.",
          emoji: "⚠️",
          tone: "warning"
        }, false)
      );
    }

    const card = container(COLORS.accent)
      .addTextDisplayComponents(text(`### 💡 Community Suggestion`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `**Submitter:** ${message.author.toString()} (\`${message.author.id}\`)\n` +
          `**Status:** ⏳ *Pending Community Review*\n\n` +
          `**Idea / Proposal:**\n> ${idea}`
        )
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`*Vote using the reactions below to show support!*`));

    const msg = await targetChannel.send({
      components: [card],
      flags: flags(false)
    });

    await msg.react("👍").catch(() => {});
    await msg.react("👎").catch(() => {});

    return message.reply(
      noticePayload({
        title: "Suggestion Posted",
        description: `Your suggestion was dispatched to <#${targetChannel.id}> for voting!`,
        emoji: "✅",
        tone: "success"
      }, false)
    );
  }
};
