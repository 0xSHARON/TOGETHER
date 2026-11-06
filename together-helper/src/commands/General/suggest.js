const {
  ApplicationCommandOptionType,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");
const { SuggestionConfig } = require("../../schema");
const config = require("../../config");
const { container, flags, noticePayload, separator, text } = require("../../utils/ui");
const { dispatchLogThread } = require("../../utils/webhooks");
const emoji = require("../../emojis");

module.exports = {
  name: "suggest",
  description: "Submit a feature idea or suggestion for community review",
  category: "General",
  slashOptions: [
    {
      name: "idea",
      type: ApplicationCommandOptionType.String,
      description: "Describe your suggestion or feature idea in detail",
      required: true,
    },
  ],

  async slashExecute(interaction, client) {
    const idea = interaction.options.getString("idea");

    const cfg = await SuggestionConfig.findOne({ guildId: interaction.guild.id });
    const targetChannel = cfg?.channelId
      ? interaction.guild.channels.cache.get(cfg.channelId)
      : interaction.guild.channels.cache.find((c) => c.name.includes("suggest"));

    if (!targetChannel) {
      return interaction.reply(
        noticePayload({
          title: "Channel Not Configured",
          description: "Suggestions channel has not been designated yet. An admin can run `/setchannel type:suggestions #channel`.",
          emoji: emoji.warn,
          tone: "warning",
        }, true),
      );
    }

    const card = container()
      .addTextDisplayComponents(text(`## 💡 Community Suggestion\n-# Submitted by ${interaction.user.tag}`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`>>> ${idea}`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `**Status**     \`⏳ Pending Community Review\`\n` +
          `**Author ID**  \`${interaction.user.id}\``,
        ),
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`-# Vote using the reactions below to show your support!`));

    const msg = await targetChannel.send({
      components: [card],
      flags: flags(false),
    });

    await msg.react("👍").catch(() => {});
    await msg.react("👎").catch(() => {});

    const sugLog = new EmbedBuilder()
      .setColor("#00E676")
      .setAuthor({
        name: `${interaction.user.tag} (${interaction.user.id})`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTitle("💡 Suggestion Submitted")
      .setDescription(`• **Author:** ${interaction.user.toString()}\n• **Channel:** <#${targetChannel.id}>\n• **Idea:**\n> ${idea}`)
      .setTimestamp();
    dispatchLogThread(client, "suggestions", sugLog);

    return interaction.reply(
      noticePayload({
        title: "Suggestion Posted",
        description: `Your suggestion was dispatched to <#${targetChannel.id}> for voting!`,
        emoji: emoji.check,
        tone: "success",
      }, true),
    );
  },

  async prefixExecute(message, args, client) {
    const idea = args.join(" ");
    if (!idea) {
      return message.reply(
        noticePayload({
          title: "Missing Suggestion Content",
          description: "Usage: `-suggest <describe your idea>`",
          emoji: emoji.warn,
          tone: "warning",
        }, false),
      );
    }

    const cfg = await SuggestionConfig.findOne({ guildId: message.guild.id });
    const targetChannel = cfg?.channelId
      ? message.guild.channels.cache.get(cfg.channelId)
      : message.guild.channels.cache.find((c) => c.name.includes("suggest"));

    if (!targetChannel) {
      return message.reply(
        noticePayload({
          title: "Channel Not Configured",
          description: "Suggestions channel has not been designated yet. An admin can run `/setchannel type:suggestions #channel`.",
          emoji: emoji.warn,
          tone: "warning",
        }, false),
      );
    }

    const card = container()
      .addTextDisplayComponents(text(`## 💡 Community Suggestion\n-# Submitted by ${message.author.tag}`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`>>> ${idea}`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `**Status**     \`⏳ Pending Community Review\`\n` +
          `**Author ID**  \`${message.author.id}\``,
        ),
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`-# Vote using the reactions below to show your support!`));

    const msg = await targetChannel.send({
      components: [card],
      flags: flags(false),
    });

    await msg.react("👍").catch(() => {});
    await msg.react("👎").catch(() => {});

    const sugLog = new EmbedBuilder()
      .setColor("#00E676")
      .setAuthor({
        name: `${message.author.tag} (${message.author.id})`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTitle("💡 Suggestion Submitted")
      .setDescription(`• **Author:** ${message.author.toString()}\n• **Channel:** <#${targetChannel.id}>\n• **Idea:**\n> ${idea}`)
      .setTimestamp();
    dispatchLogThread(client, "suggestions", sugLog);

    return message.reply(
      noticePayload({
        title: "Suggestion Posted",
        description: `Your suggestion was dispatched to <#${targetChannel.id}> for voting!`,
        emoji: emoji.check,
        tone: "success",
      }, false),
    );
  },
};
