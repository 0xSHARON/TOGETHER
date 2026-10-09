const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} = require("discord.js");
const { renderLeaderboardPodium, renderLeaderboardRanks } = require("../../utils/leaderboardCanvas");
const UserPreferences = require("../../schema/userpreferences");
const { container, flags, noticePayload, separator, text } = require("../../utils/ui");
const emoji = require("../../emojis");

module.exports = {
  name: "lb",
  category: "Information",
  aliases: ["leaderboard", "top", "rankings", "ranks"],
  cooldown: 5,
  description: "Display the brutalist music leaderboard showing top 3 and rankings.",
  args: false,
  usage: "[page]",
  userPerms: [],
  botPerms: ["AttachFiles", "EmbedLinks"],

  slashOptions: [
    {
      name: "page",
      description: "Page number to view (Page 1 = Top 3 Podium)",
      type: 4, // INTEGER
      required: false,
    },
  ],

  async slashExecute(interaction, client) {
    const page = interaction.options.getInteger("page") || 1;
    await interaction.deferReply();
    return this.sendLeaderboard(interaction, client, page, interaction.user.id);
  },

  async execute(message, args, client, prefix) {
    const requestedPage = parseInt(args[0], 10) || 1;

    const loadCard = container().addTextDisplayComponents(
      text(`**${emoji.load || "⏳"} Rendering brutalist music leaderboard...**`),
    );
    const loadMsg = await message
      .reply({
        components: [loadCard],
        flags: flags(),
      })
      .catch(() => null);

    return this.sendLeaderboard(loadMsg || message, client, requestedPage, message.author.id, message);
  },

  async sendLeaderboard(target, client, requestedPage = 1, viewerId, originalMessage) {
    try {
      // 1. Fetch top users sorted by XP, then songs played, then listening duration
      const rawDocs = await UserPreferences.find()
        .sort({ xp: -1, songsPlayed: -1, listeningSeconds: -1 })
        .limit(100);

      // Filter active users
      let docs = rawDocs.filter((d) => (d.songsPlayed > 0 || d.xp > 0 || d.listeningSeconds > 0));
      if (docs.length === 0) docs = rawDocs;

      // Pagination math:
      // Page 1: Ranks 1 to 3 (Podium)
      // Page 2+: Ranks 4 to 10 (7 items per page)
      const remaining = Math.max(0, docs.length - 3);
      const totalPages = Math.max(1, 1 + Math.ceil(remaining / 7));
      const page = Math.max(1, Math.min(totalPages, requestedPage));

      // 2. Identify viewer's rank
      let myRank = null;
      if (viewerId) {
        const idx = docs.findIndex((d) => d.userId === viewerId);
        if (idx !== -1) myRank = idx + 1;
      }

      // 3. Slice users for current page
      let targetDocs = [];
      if (page === 1) {
        targetDocs = docs.slice(0, 3);
      } else {
        const startIdx = 3 + (page - 2) * 7;
        targetDocs = docs.slice(startIdx, startIdx + 7);
      }

      // 4. Resolve Discord User profiles in parallel with full nickname emoji preservation
      const resolvedUsers = await Promise.all(
        targetDocs.map(async (doc) => {
          let discordUser = null;
          try {
            discordUser =
              client.users.cache.get(doc.userId) ||
              (await client.users.fetch(doc.userId).catch(() => null));
          } catch {}

          return {
            userId: doc.userId,
            name: discordUser?.displayName || discordUser?.username || `User_${doc.userId.slice(-4)}`,
            username: discordUser?.username || `user_${doc.userId.slice(-4)}`,
            avatarUrl: discordUser?.displayAvatarURL?.({ extension: "png", size: 256 }) || null,
            level: Math.max(1, Number(doc.level) || 1),
            xp: Math.max(0, Number(doc.xp) || 0),
            songsPlayed: Math.max(0, Number(doc.songsPlayed) || 0),
            listeningSeconds: Math.max(0, Number(doc.listeningSeconds) || 0),
            streak: Math.max(0, Number(doc.streak) || 0),
            anthem: doc.anthem,
          };
        }),
      );

      // 5. Generate Neo-Brutalist Canvas Banner
      const serverName = target.guild?.name || originalMessage?.guild?.name || "COMMUNITY";
      let canvasBuffer;
      if (page === 1) {
        canvasBuffer = await renderLeaderboardPodium(resolvedUsers, {
          totalPages,
          serverName,
        });
      } else {
        canvasBuffer = await renderLeaderboardRanks(resolvedUsers, page, totalPages, {
          serverName,
        });
      }

      const attachment = new AttachmentBuilder(canvasBuffer, { name: "leaderboard.png" });

      // 6. Build Discord Message Components V2 with bot brutalist custom emojis
      const card = container();

      // Media Gallery for Canvas Banner
      card.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setURL("attachment://leaderboard.png")
            .setDescription(`Music Leaderboard Page ${page} of ${totalPages}`),
        ),
      );

      // Text Display with bot custom brutalist emojis from assets/emojis
      let textContent = "";
      if (page === 1) {
        const p1 = resolvedUsers[0]
          ? `${emoji.medal1 || "🥇"} **#1:** \`${resolvedUsers[0].name}\` — ${emoji.level || "⚡"} LVL \`${resolvedUsers[0].level}\` · ${emoji.sparkles || "✨"} \`${(resolvedUsers[0].xp || 0).toLocaleString()} XP\` · ${emoji.headphones || "🎧"} \`${resolvedUsers[0].songsPlayed} tracks\``
          : `${emoji.medal1 || "🥇"} **#1:** *Open Challenger (Play music to claim)*`;
        const p2 = resolvedUsers[1]
          ? `${emoji.medal2 || "🥈"} **#2:** \`${resolvedUsers[1].name}\` — ${emoji.level || "⚡"} LVL \`${resolvedUsers[1].level}\` · ${emoji.sparkles || "✨"} \`${(resolvedUsers[1].xp || 0).toLocaleString()} XP\` · ${emoji.headphones || "🎧"} \`${resolvedUsers[1].songsPlayed} tracks\``
          : `${emoji.medal2 || "🥈"} **#2:** *Open Challenger*`;
        const p3 = resolvedUsers[2]
          ? `${emoji.medal3 || "🥉"} **#3:** \`${resolvedUsers[2].name}\` — ${emoji.level || "⚡"} LVL \`${resolvedUsers[2].level}\` · ${emoji.sparkles || "✨"} \`${(resolvedUsers[2].xp || 0).toLocaleString()} XP\` · ${emoji.headphones || "🎧"} \`${resolvedUsers[2].songsPlayed} tracks\``
          : `${emoji.medal3 || "🥉"} **#3:** *Open Challenger*`;

        textContent = `## ${emoji.trophy || "🏆"} Top Music Listeners // Podium\n${p1}\n${p2}\n${p3}`;
      } else {
        const startRank = 4 + (page - 2) * 7;
        const rankLines = resolvedUsers.map((u, i) => {
          const streakPart = u.streak > 0 ? ` · ${emoji.fire || "🔥"} \`${u.streak}d\`` : "";
          return `\`#${String(startRank + i).padStart(2, "0")}\` **${u.name}** — ${emoji.level || "⚡"} LVL \`${u.level}\` · ${emoji.sparkles || "✨"} \`${u.xp.toLocaleString()} XP\` · ${emoji.headphones || "🎧"} \`${u.songsPlayed} tracks\`${streakPart}`;
        });
        textContent = `## ${emoji.rank || "📊"} Leaderboard Standings (Page ${page}/${totalPages})\n${rankLines.length ? rankLines.join("\n") : "*No additional ranked listeners on this page.*"}`;
      }

      card.addTextDisplayComponents(text(textContent));
      card.addSeparatorComponents(separator());

      // Personal standing footer
      if (myRank) {
        const myDoc = docs[myRank - 1];
        const myStreak = myDoc?.streak > 0 ? ` · ${emoji.fire || "🔥"} \`${myDoc.streak}d streak\`` : "";
        card.addTextDisplayComponents(
          text(
            `-# ${emoji.rank || "👤"} **Your Standing:** Rank \`#${myRank}\` · ${emoji.level || "⚡"} LVL \`${myDoc?.level || 1}\` · ${emoji.sparkles || "✨"} \`${(myDoc?.xp || 0).toLocaleString()} XP\` · ${emoji.headphones || "🎧"} \`${myDoc?.songsPlayed || 0} tracks\`${myStreak}`,
          ),
        );
      } else {
        card.addTextDisplayComponents(
          text(`-# ${emoji.rank || "👤"} **Your Standing:** *Unranked (Play songs to climb the leaderboard!)*`),
        );
      }

      // 7. Navigation Action Row with custom bot emojis
      const row = new ActionRowBuilder();

      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`lb_prev_${page}_${viewerId || "0"}`)
          .setLabel("Prev")
          .setEmoji(emoji.previous || "◀")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page <= 1),
        new ButtonBuilder()
          .setCustomId(`lb_page_${page}`)
          .setLabel(`Page ${page} / ${totalPages}`)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`lb_next_${page}_${viewerId || "0"}`)
          .setLabel("Next")
          .setEmoji(emoji.skip || "▶")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page >= totalPages),
      );

      // Jump to My Rank shortcut
      if (myRank) {
        let myPage = 1;
        if (myRank > 3) {
          myPage = 2 + Math.floor((myRank - 4) / 7);
        }
        if (myPage !== page && myPage <= totalPages) {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`lb_jump_${myPage}_${viewerId}`)
              .setLabel("My Rank")
              .setEmoji(emoji.star || "🎯")
              .setStyle(ButtonStyle.Success),
          );
        }
      }

      card.addActionRowComponents(row);

      const responsePayload = {
        components: [card],
        files: [attachment],
        flags: flags(),
      };

      if (target.isCommand?.() || target.editReply) {
        return await target.editReply(responsePayload);
      } else if (target.edit && typeof target.edit === "function") {
        return await target.edit(responsePayload).catch(async () => {
          if (originalMessage?.channel?.send) {
            return await originalMessage.channel.send(responsePayload);
          }
        });
      } else if (target.channel?.send) {
        return await target.channel.send(responsePayload);
      }
    } catch (err) {
      console.error("[Leaderboard Command] Error:", err);
      const errNotice = noticePayload({
        title: "Leaderboard Error",
        description: `Failed to render leaderboard: ${err.message}`,
        emoji: emoji.cross || "❌",
        tone: "danger",
      });

      if (target.isCommand?.() || target.editReply) {
        return target.editReply(errNotice).catch(() => {});
      } else if (target.edit) {
        return target.edit(errNotice).catch(() => {});
      } else if (target.channel?.send) {
        return target.channel.send(errNotice).catch(() => {});
      }
    }
  },

  async componentsV2(interaction, client) {
    const parts = interaction.customId.split("_");
    const action = parts[1]; // "prev", "next", "jump"
    const currentPage = parseInt(parts[2], 10) || 1;

    let targetPage = currentPage;
    if (action === "prev") targetPage = Math.max(1, currentPage - 1);
    else if (action === "next") targetPage = currentPage + 1;
    else if (action === "jump") targetPage = currentPage;

    await interaction.deferUpdate();

    return this.sendLeaderboard(interaction, client, targetPage, interaction.user.id);
  },
};
