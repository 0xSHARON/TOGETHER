const {
  ApplicationCommandOptionType,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");
const { BugReportConfig } = require("../../schema");
const config = require("../../config");
const { container, flags, noticePayload, separator, text } = require("../../utils/ui");
const { dispatchLogThread } = require("../../utils/webhooks");
const emoji = require("../../emojis");

module.exports = {
  name: "bugreport",
  description: "Report an issue, error, or glitch to server staff",
  category: "General",
  slashOptions: [
    {
      name: "issue",
      type: ApplicationCommandOptionType.String,
      description: "Brief summary of the issue",
      required: true,
    },
    {
      name: "reproduce",
      type: ApplicationCommandOptionType.String,
      description: "Steps or command used when the bug happened",
      required: false,
    },
  ],

  async slashExecute(interaction, client) {
    const issue = interaction.options.getString("issue");
    const reproduce = interaction.options.getString("reproduce") || "No steps provided.";

    const cfg = await BugReportConfig.findOne({ guildId: interaction.guild.id });
    const targetChannel = cfg?.channelId
      ? interaction.guild.channels.cache.get(cfg.channelId)
      : interaction.guild.channels.cache.find((c) => c.name.includes("bug") || c.name.includes("report"));

    if (!targetChannel) {
      return interaction.reply(
        noticePayload({
          title: "Channel Not Configured",
          description: "Bug report channel has not been designated yet. An admin can run `/setchannel type:bugreports #channel`.",
          emoji: emoji.warn,
          tone: "warning",
        }, true),
      );
    }

    const card = container()
      .addTextDisplayComponents(text(`## 🐛 Bug Report Submitted\n-# Reported by ${interaction.user.tag}`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `**Reported Problem**\n> ${issue}\n\n` +
          `**Reproduction Steps**\n\`\`\`${reproduce}\`\`\``,
        ),
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `**Server Context**  \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)\n` +
          `**Reporter ID**     \`${interaction.user.id}\`\n` +
          `**Triage Status**   \`🔴 Pending Investigation\``,
        ),
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`-# TOGETHER Issue Tracker · Staff will inspect and verify`));

    await targetChannel.send({
      components: [card],
      flags: flags(false),
    });

    const bugLog = new EmbedBuilder()
      .setColor("#ED4245")
      .setAuthor({
        name: `${interaction.user.tag} (${interaction.user.id})`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setTitle("🐛 Bug Report Dispatched")
      .setDescription(`• **Reporter:** ${interaction.user.toString()}\n• **Channel:** <#${targetChannel.id}>\n• **Issue:**\n> ${issue}\n\n• **Steps:**\n\`\`\`${reproduce}\`\`\``)
      .setTimestamp();
    dispatchLogThread(client, "bugreports", bugLog);

    return interaction.reply(
      noticePayload({
        title: "Bug Report Dispatched",
        description: `Thank you! Your report has been dispatched to <#${targetChannel.id}> for review.`,
        emoji: emoji.check,
        tone: "success",
      }, true),
    );
  },

  async prefixExecute(message, args, client) {
    const issue = args.join(" ");
    if (!issue) {
      return message.reply(
        noticePayload({
          title: "Missing Bug Description",
          description: "Usage: `-bugreport <describe the issue>`",
          emoji: emoji.warn,
          tone: "warning",
        }, false),
      );
    }

    const cfg = await BugReportConfig.findOne({ guildId: message.guild.id });
    const targetChannel = cfg?.channelId
      ? message.guild.channels.cache.get(cfg.channelId)
      : message.guild.channels.cache.find((c) => c.name.includes("bug") || c.name.includes("report"));

    if (!targetChannel) {
      return message.reply(
        noticePayload({
          title: "Channel Not Configured",
          description: "Bug report channel has not been designated yet. An admin can run `/setchannel type:bugreports #channel`.",
          emoji: emoji.warn,
          tone: "warning",
        }, false),
      );
    }

    const card = container()
      .addTextDisplayComponents(text(`## 🐛 Bug Report Submitted\n-# Reported by ${message.author.tag}`))
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `**Reported Problem**\n> ${issue}\n\n` +
          `**Reproduction Steps**\n\`\`\`No steps provided.\`\`\``,
        ),
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `**Server Context**  \`${message.guild.name}\` (\`${message.guild.id}\`)\n` +
          `**Reporter ID**     \`${message.author.id}\`\n` +
          `**Triage Status**   \`🔴 Pending Investigation\``,
        ),
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`-# TOGETHER Issue Tracker · Staff will inspect and verify`));

    await targetChannel.send({
      components: [card],
      flags: flags(false),
    });

    return message.reply(
      noticePayload({
        title: "Bug Report Dispatched",
        description: `Thank you! Your report has been dispatched to <#${targetChannel.id}> for review.`,
        emoji: emoji.check,
        tone: "success",
      }, false),
    );
  },
};
