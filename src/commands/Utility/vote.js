const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  TextDisplayBuilder,
} = require("discord.js");

module.exports = {
  name: "vote",
  aliases: ["voted", "vo"],
  category: "Utility",
  description: "Check your Top.gg vote status and support the bot",
  args: false,
  usage: "[user]",
  userPerms: [],
  botPerms: ["EmbedLinks"],
  owner: false,
  slashOptions: [
    {
      name: "user",
      description: "User to check vote status for",
      type: 6,
      required: false,
    },
  ],

  async slashExecute(interaction, client) {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply().catch(() => {});
    }

    const interactionWrapper = {
      guild: interaction.guild,
      channel: interaction.channel,
      author: interaction.user,
      member: interaction.member,
      createdTimestamp: interaction.createdTimestamp,
      mentions: {
        users: interaction.options?.getUser("user")
          ? new Map([[interaction.options.getUser("user").id, interaction.options.getUser("user")]])
          : new Map(),
      },
      reply: async (options) => {
        if (interaction.deferred) {
          return await interaction.editReply(options);
        } else if (interaction.replied) {
          return await interaction.followUp(options);
        } else {
          return await interaction.reply(options);
        }
      },
    };

    const args = [];
    const targetUser = interaction.options?.getUser("user");
    if (targetUser) {
      args.push(targetUser.id);
    }

    const prefix = client.prefix;
    return this.execute(interactionWrapper, args, client, prefix);
  },

  async execute(message, args, client, prefix) {
    try {
      if (!client.votedUsers) {
        client.votedUsers = new Set();
      }

      // Allow owner/tester to toggle simulated vote for quick local testing
      const isOwner = client.config?.ownerID?.includes(message.author.id);
      if (args[0] && (args[0].toLowerCase() === "test" || args[0].toLowerCase() === "toggle") && isOwner) {
        const toggleUser = message.mentions?.users?.first() || message.author;
        if (client.votedUsers.has(toggleUser.id)) {
          client.votedUsers.delete(toggleUser.id);
        } else {
          client.votedUsers.add(toggleUser.id);
        }
        const stateNow = client.votedUsers.has(toggleUser.id);
        if (stateNow) {
          const { sendVoteNotification } = require("../../utils/voteNotifier");
          sendVoteNotification(client, toggleUser).catch(() => {});
        }
        const testDisplay = new TextDisplayBuilder()
          .setContent(`**${client.emoji?.info || "ℹ️"} [TEST] Vote status for ${toggleUser.username} set to: \`${stateNow ? "VOTED" : "NOT VOTED"}\` (Notification dispatched to <#${client.config?.voteChannelId || "1524235256339890327"}>)**`);
        const testContainer = new ContainerBuilder().addTextDisplayComponents(testDisplay);
        return message.reply({
          components: [testContainer],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      let targetUser = message.author;
      if (message.mentions?.users?.size > 0) {
        targetUser = Array.from(message.mentions.users.values())[0];
      } else if (args[0] && /^\d+$/.test(args[0])) {
        try {
          targetUser = await client.users.fetch(args[0]);
        } catch {
          targetUser = message.author;
        }
      }

      let hasVoted = client.votedUsers.has(targetUser.id);

      const topggToken = process.env.TOPGG_TOKEN || client.config?.topggToken || "";
      const botId = client.user?.id;

      if (!hasVoted && topggToken && botId) {
        try {
          const res = await fetch(`https://top.gg/api/bots/${botId}/check?userId=${targetUser.id}`, {
            headers: {
              Authorization: topggToken,
            },
            signal: AbortSignal.timeout(5000),
          });
          if (res.ok) {
            const data = await res.json();
            if (data && (data.voted === 1 || data.voted === true)) {
              hasVoted = true;
            }
          }
        } catch {
          // Gracefully fallback on network or API failures
        }
      }

      const voteURL = client.config?.links?.vote ||
        (client.user?.id ? `https://top.gg/bot/${client.user.id}/vote` : "https://top.gg");

      const voteRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Vote on Top.gg")
          .setStyle(ButtonStyle.Link)
          .setURL(voteURL)
      );

      const separator = new SeparatorBuilder();

      if (hasVoted) {
        if (!client.announcedVotes) client.announcedVotes = new Set();
        if (!client.announcedVotes.has(targetUser.id)) {
          client.announcedVotes.add(targetUser.id);
          const { sendVoteNotification } = require("../../utils/voteNotifier");
          sendVoteNotification(client, targetUser).catch(() => {});
        }

        const musicEmoji = client.emoji?.music || "🎵";
        const votedDisplay = new TextDisplayBuilder()
          .setContent(
            `### ${client.emoji?.check || "✅"} Thank you for voting!\n` +
            `> Your support keeps the music playing ${musicEmoji}\n\n` +
            `-# Top.gg vote refreshes every 12 hours.`
          );

        const container = new ContainerBuilder()
          .addTextDisplayComponents(votedDisplay)
          .addSeparatorComponents(separator)
          .addActionRowComponents(voteRow);

        return message.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      } else {
        const notVotedDisplay = new TextDisplayBuilder()
          .setContent(
            `### ${client.emoji?.warn || "⚠️"} You haven't voted yet!\n` +
            `> Click the button below to vote on Top.gg and support the bot.\n\n` +
            `-# Voting is free and directly helps us grow!`
          );

        const container = new ContainerBuilder()
          .addTextDisplayComponents(notVotedDisplay)
          .addSeparatorComponents(separator)
          .addActionRowComponents(voteRow);

        return message.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }
    } catch (error) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji?.cross || "❌"} Error: ${error.message}**`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorDisplay);

      return message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  },
};
