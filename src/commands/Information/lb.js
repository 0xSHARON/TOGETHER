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
  cooldown: 3,
  description: "Display the music leaderboard showing top listeners and rankings.",
  args: false,
  usage: "[page | server | global]",
  userPerms: [],
  botPerms: ["AttachFiles", "EmbedLinks"],

  slashOptions: [
    {
      name: "scope",
      description: "Leaderboard scope: Server or Global",
      type: 3, // STRING
      required: false,
      choices: [
        { name: "🏰 Server Standings", value: "server" },
        { name: "🌐 Global Standings", value: "global" },
      ],
    },
    {
      name: "page",
      description: "Page number to view (Page 1 = Top 3 Podium)",
      type: 4, // INTEGER
      required: false,
    },
  ],

  async slashExecute(interaction, client) {
    const scope = interaction.options.getString("scope") || "server";
    const page = interaction.options.getInteger("page") || 1;
    await interaction.deferReply();
    return this.sendLeaderboard(interaction, client, page, interaction.user.id, null, scope);
  },

  async execute(message, args, client, prefix) {
    let requestedPage = 1;
    let scope = "server";

    for (const arg of args) {
      const lower = arg.toLowerCase();
      if (lower === "server" || lower === "guild" || lower === "local") {
        scope = "server";
      } else if (lower === "global" || lower === "all" || lower === "bot") {
        scope = "global";
      } else {
        const num = parseInt(arg, 10);
        if (!isNaN(num) && num > 0) {
          requestedPage = num;
        }
      }
    }

    const loadCard = container().addTextDisplayComponents(
      text(`**${emoji.load || "⏳"} Rendering brutalist music leaderboard...**`),
    );
    const loadMsg = await message
      .reply({
        components: [loadCard],
        flags: flags(),
      })
      .catch(() => null);

    return this.sendLeaderboard(loadMsg || message, client, requestedPage, message.author.id, message, scope);
  },

  async sendLeaderboard(target, client, requestedPage = 1, viewerId, originalMessage, scope = "server") {
    try {
      const botId = client?.user?.id;
      const targetGuild = target.guild || originalMessage?.guild;

      // If scope is server but executed in DMs, fallback to global
      const effectiveScope = targetGuild ? scope : "global";

      // 1. Fetch top users sorted by XP, then songs played, then listening duration
      const queryFilter = botId ? { userId: { $ne: botId } } : {};
      const rawDocs = await UserPreferences.find(queryFilter)
        .sort({ xp: -1, songsPlayed: -1, listeningSeconds: -1 })
        .limit(200)
        .lean();

      // Filter active users and strictly exclude any bot ID
      let docs = rawDocs.filter((d) => 
        d.userId !== botId && 
        (Number(d.songsPlayed) > 0 || Number(d.xp) > 0 || Number(d.listeningSeconds) > 0)
      );

      // Server scope filtering
      if (effectiveScope === "server" && targetGuild) {
        // Pre-fetch guild members cache or check membership
        docs = docs.filter((d) => {
          return targetGuild.members.cache.has(d.userId);
        });
      }

      // If no server activity yet, fallback to global with a notice or empty state
      let isServerEmpty = false;
      if (docs.length === 0) {
        if (effectiveScope === "server") {
          isServerEmpty = true;
          // Fallback to rawDocs for rendering or empty list
          docs = [];
        } else {
          docs = rawDocs.filter((d) => d.userId !== botId);
        }
      }

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

      // 4. Resolve Discord User profiles in parallel with full nickname support
      const resolvedUsers = (
        await Promise.all(
          targetDocs.map(async (doc) => {
            let discordUser = null;
            try {
              discordUser =
                client.users.cache.get(doc.userId) ||
                (await client.users.fetch(doc.userId).catch(() => null));
            } catch {}

            // Strictly filter out bot accounts
            if (discordUser?.bot || doc.userId === botId) return null;

            const member = targetGuild?.members?.cache?.get(doc.userId);
            const displayName = member?.displayName || discordUser?.displayName || discordUser?.username || `User_${doc.userId.slice(-4)}`;

            return {
              userId: doc.userId,
              name: displayName,
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
        )
      ).filter(Boolean);

      // 5. Generate Neo-Brutalist Canvas Banner
      const serverTitle = effectiveScope === "server" && targetGuild
        ? targetGuild.name
        : "GLOBAL COMMUNITY";

      let canvasBuffer;
      if (page === 1) {
        canvasBuffer = await renderLeaderboardPodium(resolvedUsers, {
          totalPages,
          serverName: serverTitle,
        });
      } else {
        canvasBuffer = await renderLeaderboardRanks(resolvedUsers, page, totalPages, {
          serverName: serverTitle,
        });
      }

      const fileName = `leaderboard-${effectiveScope}-p${page}-${Date.now()}.png`;
      const attachment = new AttachmentBuilder(canvasBuffer, { name: fileName });

      // 6. Build Discord Message Components V2
      const card = container();

      // Media Gallery for Canvas Banner
      card.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setURL(`attachment://${fileName}`)
            .setDescription(`Music Leaderboard [${effectiveScope.toUpperCase()}] Page ${page} of ${totalPages}`),
        ),
      );

      // Text Display with custom brutalist styling
      let textContent = "";
      if (isServerEmpty) {
        textContent = `## ${emoji.trophy || "🏆"} ${serverTitle} // Podium\n*No members in this server have earned music XP yet. Play music with TOGETHER to claim #1!*`;
      } else if (page === 1) {
        const p1 = resolvedUsers[0]
          ? `${emoji.medal1 || "🥇"} **#1:** \`${resolvedUsers[0].name}\` — ${emoji.level || "⚡"} LVL \`${resolvedUsers[0].level}\` · ${emoji.sparkles || "✨"} \`${(resolvedUsers[0].xp || 0).toLocaleString()} XP\` · ${emoji.headphones || "🎧"} \`${resolvedUsers[0].songsPlayed} tracks\``
          : `${emoji.medal1 || "🥇"} **#1:** *Open Challenger (Play music to claim)*`;
        const p2 = resolvedUsers[1]
          ? `${emoji.medal2 || "🥈"} **#2:** \`${resolvedUsers[1].name}\` — ${emoji.level || "⚡"} LVL \`${resolvedUsers[1].level}\` · ${emoji.sparkles || "✨"} \`${(resolvedUsers[1].xp || 0).toLocaleString()} XP\` · ${emoji.headphones || "🎧"} \`${resolvedUsers[1].songsPlayed} tracks\``
          : `${emoji.medal2 || "🥈"} **#2:** *Open Challenger*`;
        const p3 = resolvedUsers[2]
          ? `${emoji.medal3 || "🥉"} **#3:** \`${resolvedUsers[2].name}\` — ${emoji.level || "⚡"} LVL \`${resolvedUsers[2].level}\` · ${emoji.sparkles || "✨"} \`${(resolvedUsers[2].xp || 0).toLocaleString()} XP\` · ${emoji.headphones || "🎧"} \`${resolvedUsers[2].songsPlayed} tracks\``
          : `${emoji.medal3 || "🥉"} **#3:** *Open Challenger*`;

        textContent = `## ${emoji.trophy || "🏆"} Top Music Listeners // ${effectiveScope === "server" ? "Server Podium" : "Global Podium"}\n${p1}\n${p2}\n${p3}`;
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
            `-# ${emoji.rank || "👤"} **Your Standing (${effectiveScope.toUpperCase()}):** Rank \`#${myRank}\` · ${emoji.level || "⚡"} LVL \`${myDoc?.level || 1}\` · ${emoji.sparkles || "✨"} \`${(myDoc?.xp || 0).toLocaleString()} XP\` · ${emoji.headphones || "🎧"} \`${myDoc?.songsPlayed || 0} tracks\`${myStreak}`,
          ),
        );
      } else {
        card.addTextDisplayComponents(
          text(`-# ${emoji.rank || "👤"} **Your Standing (${effectiveScope.toUpperCase()}):** *Unranked (Play songs to climb the leaderboard!)*`),
        );
      }

      // 7. Navigation Action Row 1: Pagination
      const navRow = new ActionRowBuilder();

      navRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`lb_prev_${page}_${viewerId || "0"}_${effectiveScope}`)
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
          .setCustomId(`lb_next_${page}_${viewerId || "0"}_${effectiveScope}`)
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
          navRow.addComponents(
            new ButtonBuilder()
              .setCustomId(`lb_jump_${myPage}_${viewerId}_${effectiveScope}`)
              .setLabel("My Rank")
              .setEmoji(emoji.star || "🎯")
              .setStyle(ButtonStyle.Success),
          );
        }
      }

      card.addActionRowComponents(navRow);

      // 8. Scope Toggle Action Row (Server vs Global)
      if (targetGuild) {
        const scopeRow = new ActionRowBuilder();
        scopeRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`lb_scope_server_${viewerId || "0"}`)
            .setLabel("🏰 Server Leaderboard")
            .setStyle(effectiveScope === "server" ? ButtonStyle.Success : ButtonStyle.Secondary)
            .setDisabled(effectiveScope === "server"),
          new ButtonBuilder()
            .setCustomId(`lb_scope_global_${viewerId || "0"}`)
            .setLabel("🌐 Global Leaderboard")
            .setStyle(effectiveScope === "global" ? ButtonStyle.Success : ButtonStyle.Secondary)
            .setDisabled(effectiveScope === "global"),
        );
        card.addActionRowComponents(scopeRow);
      }

      // 9. Dispatch response payload safely
      const editPayload = {
        components: [card],
        files: [attachment],
      };

      const newMsgPayload = {
        components: [card],
        files: [attachment],
        flags: flags(),
      };

      if (target.isCommand?.() || target.editReply) {
        return await target.editReply(editPayload);
      } else if (target.edit && typeof target.edit === "function") {
        return await target.edit(editPayload).catch(async () => {
          if (originalMessage?.channel?.send) {
            return await originalMessage.channel.send(newMsgPayload);
          }
        });
      } else if (target.channel?.send) {
        return await target.channel.send(newMsgPayload);
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
    const action = parts[1]; // "prev", "next", "jump", "scope"
    
    let targetPage = 1;
    let targetScope = "server";

    if (action === "scope") {
      targetScope = parts[2] || "server";
      targetPage = 1;
    } else {
      const currentPage = parseInt(parts[2], 10) || 1;
      targetScope = parts[4] || "server";

      if (action === "prev") targetPage = Math.max(1, currentPage - 1);
      else if (action === "next") targetPage = currentPage + 1;
      else if (action === "jump") targetPage = currentPage;
    }

    await interaction.deferUpdate().catch(() => {});

    return this.sendLeaderboard(interaction, client, targetPage, interaction.user.id, null, targetScope);
  },
};
