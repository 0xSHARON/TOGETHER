const fs = require("fs");
const path = require("path");
const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
} = require("discord.js");
const { container, flags, noticePayload, separator, text } = require("../../utils/ui");
const { isBotOwner } = require("../../utils/voterCheck");
const emoji = require("../../emojis");

const BANNER_FILE = path.resolve(__dirname, "../../../assets/banner.png");

/**
 * Returns { name, filePath } if assets/banner.png exists.
 */
function getBanner() {
  if (fs.existsSync(BANNER_FILE)) {
    return { name: "banner.png", filePath: BANNER_FILE };
  }
  return null;
}

function bannerFiles(banner) {
  return banner ? [new AttachmentBuilder(banner.filePath, { name: banner.name })] : [];
}

// In-memory cache to store generated guild invite links
const guildInviteCache = new Map();

/**
 * Retrieves an existing vanity URL, active invite, or creates a new instant invite.
 * @param {import("discord.js").Guild} guild
 * @returns {Promise<string|null>}
 */
async function getGuildInvite(guild, timeoutMs = 2000) {
  if (!guild) return null;

  // 1. Cached invite check
  if (guildInviteCache.has(guild.id)) {
    return guildInviteCache.get(guild.id);
  }

  // 2. Vanity URL check
  if (guild.vanityURLCode) {
    const vanity = `https://discord.gg/${guild.vanityURLCode}`;
    guildInviteCache.set(guild.id, vanity);
    return vanity;
  }

  const resolvePromise = async () => {
    // 3. Existing invites check
    try {
      const invites = await guild.invites?.fetch().catch(() => null);
      if (invites && invites.size > 0) {
        const active = invites.find((inv) => !inv.isExpired && inv.url) || invites.first();
        if (active && active.url) {
          guildInviteCache.set(guild.id, active.url);
          return active.url;
        }
      }
    } catch {}

    // 4. Create a new instant invite if bot has permission
    try {
      const me = guild.members?.me || (await guild.members?.fetchMe?.().catch(() => null));
      const channelList = guild.channels?.cache
        ? (Array.isArray(guild.channels.cache) ? guild.channels.cache : Array.from(guild.channels.cache.values()))
        : [];

      let channel = guild.systemChannel;
      if (!channel || (me && !channel.permissionsFor?.(me)?.has(PermissionFlagsBits.CreateInstantInvite))) {
        channel = channelList.find(
          (c) =>
            (typeof c.isTextBased === "function" ? c.isTextBased() : true) &&
            (!me || c.permissionsFor?.(me)?.has(PermissionFlagsBits.CreateInstantInvite)) &&
            typeof c.createInvite === "function"
        ) || channelList.find(
          (c) =>
            (!me || c.permissionsFor?.(me)?.has(PermissionFlagsBits.CreateInstantInvite)) &&
            typeof c.createInvite === "function"
        );
      }

      if (channel && typeof channel.createInvite === "function") {
        const invite = await channel.createInvite({
          maxAge: 0,
          maxUses: 0,
          reason: "Owner serverlist invite request",
        }).catch(() => null);

        if (invite && invite.url) {
          guildInviteCache.set(guild.id, invite.url);
          return invite.url;
        }
      }
    } catch {}

    return null;
  };

  if (!timeoutMs) return resolvePromise();
  const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs));
  return Promise.race([resolvePromise(), timeoutPromise]);
}

function getIcon(client, key, fallback = "") {
  return client?.emoji?.[key] || emoji?.[key] || fallback;
}

/**
 * Builds the Select Menu row matching help.js style.
 */
function serverMenuRow(client, guilds, selectedGuildId = null, disabled = false) {
  const homeIcon = getIcon(client, "home", "🏠");
  const dotIcon = getIcon(client, "dot", "🔹");

  const defaultOption = {
    label: "Directory Overview",
    value: "overview",
    description: "Return to the full server list",
    default: selectedGuildId === null,
  };
  if (homeIcon) defaultOption.emoji = homeIcon;

  const options = [defaultOption];

  for (const guild of guilds) {
    const opt = {
      label: guild.name.slice(0, 50),
      value: guild.id,
      description: `ID: ${guild.id} · ${(guild.memberCount || 0).toLocaleString()} members`.slice(0, 100),
      default: guild.id === selectedGuildId,
    };
    if (dotIcon) opt.emoji = dotIcon;
    options.push(opt);
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId("serverlist:select")
    .setPlaceholder(disabled ? "Server menu expired — run serverlist again" : "Select a server to view details & invite...")
    .setDisabled(disabled)
    .addOptions(options);

  return new ActionRowBuilder().addComponents(menu);
}

/**
 * Builds the navigation button row matching help.js style.
 */
function navRow(client, page, pages, disabled = false) {
  const homeIcon = getIcon(client, "home", "🏠");
  const prevIcon = getIcon(client, "previous", "◀️");
  const nextIcon = getIcon(client, "skip", "▶️");
  const closeIcon = getIcon(client, "cross", "❌");

  const homeBtn = new ButtonBuilder()
    .setCustomId("serverlist:home")
    .setLabel("First")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(disabled || page === 0);
  if (homeIcon) homeBtn.setEmoji(homeIcon);

  const prevBtn = new ButtonBuilder()
    .setCustomId("serverlist:prev")
    .setLabel("Previous")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(disabled || page === 0);
  if (prevIcon) prevBtn.setEmoji(prevIcon);

  const nextBtn = new ButtonBuilder()
    .setCustomId("serverlist:next")
    .setLabel("Next")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(disabled || page >= pages - 1);
  if (nextIcon) nextBtn.setEmoji(nextIcon);

  const closeBtn = new ButtonBuilder()
    .setCustomId("serverlist:close")
    .setLabel("Close")
    .setStyle(ButtonStyle.Danger)
    .setDisabled(disabled);
  if (closeIcon) closeBtn.setEmoji(closeIcon);

  return new ActionRowBuilder().addComponents(homeBtn, prevBtn, nextBtn, closeBtn);
}

/**
 * Builds a single server card matching help.js aesthetic.
 */
function singleServerView(client, requester, guild, inviteUrl, currentGuilds = [], disabled = false) {
  const banner = getBanner();
  const card = container();

  if (banner) {
    card.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder()
          .setURL(`attachment://${banner.name}`)
          .setDescription("TOGETHER Server Card")
      )
    );
  }

  const requesterName = requester?.username || requester?.tag || "Owner";
  const createdTimestamp = guild.createdTimestamp ? Math.floor(guild.createdTimestamp / 1000) : null;
  const createdStr = createdTimestamp ? `<t:${createdTimestamp}:R>` : "Unknown";
  const channelCount = guild.channels?.cache?.size ?? "N/A";
  const warnIcon = getIcon(client, "warn", "⚠️");
  const inviteContent = inviteUrl
    ? `**Invite Link**  [Click to Join](${inviteUrl})\n**Direct URL**  \`${inviteUrl}\``
    : `${warnIcon} *Unable to generate invite (missing channel permissions).*`;

  card
    .addTextDisplayComponents(
      text(`## ${guild.name}\n-# Guild ID: \`${guild.id}\` · Owner ID: \`${guild.ownerId}\``)
    )
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(
      text(
        `**Members**  \`${(guild.memberCount || 0).toLocaleString()}\`   **Created**  ${createdStr}\n` +
        `**Owner**  <@${guild.ownerId}> (\`${guild.ownerId}\`)\n` +
        `**Channels**  \`${channelCount}\` channels`
      )
    )
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(text(inviteContent))
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(text(`-# Requested by ${requesterName} · developed by kajukatli.`));

  // If viewing from the directory list, include the select menu to quickly switch or go back
  if (currentGuilds.length > 0) {
    card.addActionRowComponents(serverMenuRow(client, currentGuilds, guild.id, disabled));
  }

  // Action buttons
  const buttons = [];
  if (inviteUrl) {
    const checkIcon = getIcon(client, "check", "🔗");
    const joinBtn = new ButtonBuilder()
      .setLabel(`Join ${guild.name.slice(0, 30)}`)
      .setStyle(ButtonStyle.Link)
      .setURL(inviteUrl);
    if (checkIcon) joinBtn.setEmoji(checkIcon);
    buttons.push(joinBtn);
  }

  if (currentGuilds.length > 0) {
    const prevIcon = getIcon(client, "previous", "◀️");
    const backBtn = new ButtonBuilder()
      .setCustomId("serverlist:back")
      .setLabel("Back to Directory")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled);
    if (prevIcon) backBtn.setEmoji(prevIcon);
    buttons.push(backBtn);
  }

  if (buttons.length > 0) {
    card.addActionRowComponents(new ActionRowBuilder().addComponents(buttons));
  }

  return { card, banner };
}

/**
 * Builds the paginated server directory card styled like help.js homeView.
 */
function directoryView(client, requester, sortedGuilds, page, pages, invites, disabled = false, prefix = ".") {
  const banner = getBanner();
  const card = container();

  if (banner) {
    card.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder()
          .setURL(`attachment://${banner.name}`)
          .setDescription("TOGETHER Server Directory")
      )
    );
  }

  const serversPerPage = 10;
  const start = page * serversPerPage;
  const currentGuilds = sortedGuilds.slice(start, start + serversPerPage);
  const totalMembers = sortedGuilds.reduce((acc, g) => acc + (g.memberCount || 0), 0);
  const requesterName = requester?.username || requester?.tag || "Owner";

  const entries = currentGuilds.map((guild, i) => {
    const inviteUrl = invites[i];
    const inviteBadge = inviteUrl ? `[Join Server ↗](${inviteUrl})` : `\`No Invite\``;
    const rankNum = (start + i + 1).toString().padStart(2, "0");
    return `**\`${rankNum}\` · ${guild.name}**\n` +
           `> ${emoji.dot} 🆔 \`${guild.id}\` · 👥 \`${(guild.memberCount || 0).toLocaleString()}\` members · ${inviteBadge}`;
  }).join("\n\n");

  card
    .addTextDisplayComponents(
      text(`## TOGETHER Server Directory\n-# ${sortedGuilds.length} servers · ${totalMembers.toLocaleString()} total members`)
    )
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(
      text(`**Servers**  \`${sortedGuilds.length}\`   **Total Members**  \`${totalMembers.toLocaleString()}\`   **Page**  \`${page + 1}/${pages}\``)
    )
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(text(entries || "*No servers to display.*"))
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(text(`-# Requested by ${requesterName} · Use \`${prefix}serverlist <id|name|#>\` for direct card`))
    .addActionRowComponents(serverMenuRow(client, currentGuilds, null, disabled));

  if (pages > 1) {
    card.addActionRowComponents(navRow(client, page, pages, disabled));
  }

  return { card, banner };
}

module.exports = {
  name: "serverlist",
  category: "Owner",
  description: "List servers and generate instant invite links",
  aliases: ["sl", "servers", "serverinvite", "sinvite"],
  args: false,
  usage: "[server_id | server_name | list_number]",
  permission: [],
  owner: true,

  slashOptions: [
    {
      name: "server",
      description: "Server ID, name, or number to get invite link for",
      type: 3,
      required: false,
    },
  ],

  async slashExecute(interaction, client) {
    if (!isBotOwner(client, interaction.user.id)) {
      return interaction.reply(
        noticePayload({
          title: "Restricted Command",
          description: "This command is restricted to bot owners.",
          emoji: emoji.warn,
          tone: "danger",
        }, true)
      );
    }

    const serverQuery = interaction.options.getString("server");
    const interactionWrapper = {
      guild: interaction.guild,
      channel: interaction.channel,
      author: interaction.user,
      member: interaction.member,
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

    const args = serverQuery ? [serverQuery] : [];
    return this.execute(interactionWrapper, args, client, client.prefix);
  },

  async execute(message, args, client, prefix = ".") {
    if (!isBotOwner(client, message.author.id)) {
      return;
    }

    const sortedGuilds = Array.from(client.guilds.cache.values()).sort(
      (a, b) => (b.memberCount || 0) - (a.memberCount || 0)
    );

    if (sortedGuilds.length === 0) {
      return message.reply(
        noticePayload({
          title: "No Servers Found",
          description: "The bot is not currently present in any servers.",
          emoji: emoji.info,
          tone: "info",
        })
      );
    }

    // Direct single-server query if an argument was provided
    if (args && args.length > 0) {
      const query = args.join(" ").trim();
      let targetGuild = null;

      // 1. By exact ID
      targetGuild = client.guilds.cache.get(query);

      // 2. By list number (1-based index)
      if (!targetGuild && /^\d+$/.test(query)) {
        const index = parseInt(query, 10) - 1;
        if (index >= 0 && index < sortedGuilds.length) {
          targetGuild = sortedGuilds[index];
        }
      }

      // 3. By server name match
      if (!targetGuild) {
        targetGuild = sortedGuilds.find(
          (g) => g.name.toLowerCase() === query.toLowerCase()
        ) || sortedGuilds.find(
          (g) => g.name.toLowerCase().includes(query.toLowerCase())
        );
      }

      if (targetGuild) {
        const invite = await getGuildInvite(targetGuild);
        const { card, banner } = singleServerView(client, message.author, targetGuild, invite);
        return message.reply({
          components: [card],
          files: bannerFiles(banner),
          flags: flags(),
        });
      } else {
        return message.reply(
          noticePayload({
            title: "Server Not Found",
            description: `Could not find any server matching \`${query}\`.`,
            emoji: emoji.warn,
            tone: "warning",
          })
        );
      }
    }

    // Paginated server list with invite links
    const serversPerPage = 10;
    const pages = Math.ceil(sortedGuilds.length / serversPerPage);
    let currentPage = 0;
    let viewingGuild = null;

    const getCurrentGuilds = (page) => {
      const start = page * serversPerPage;
      return sortedGuilds.slice(start, start + serversPerPage);
    };

    const getPagePayload = async (page, disabled = false) => {
      const currentGuilds = getCurrentGuilds(page);
      const invites = await Promise.all(
        currentGuilds.map((g) => getGuildInvite(g))
      );
      const { card, banner } = directoryView(client, message.author, sortedGuilds, page, pages, invites, disabled, prefix);
      return {
        components: [card],
        files: bannerFiles(banner),
        flags: flags(),
      };
    };

    const getSingleServerPayload = async (guild, page, disabled = false) => {
      const invite = await getGuildInvite(guild);
      const currentGuilds = getCurrentGuilds(page);
      const { card, banner } = singleServerView(client, message.author, guild, invite, currentGuilds, disabled);
      return {
        components: [card],
        files: bannerFiles(banner),
        flags: flags(),
      };
    };

    const initialPayload = await getPagePayload(currentPage);
    const sentMessage = await message.reply(initialPayload);

    if (!sentMessage?.createMessageComponentCollector) {
      return sentMessage;
    }

    const collector = sentMessage.createMessageComponentCollector({
      filter: (i) => {
        if (i.user.id === message.author.id) return true;
        i.reply(
          noticePayload({
            title: "Access Restricted",
            description: "Only the command author can use these controls.",
            emoji: emoji.cross,
            tone: "danger",
          }, true)
        ).catch(() => {});
        return false;
      },
      time: 300_000,
      idle: 60_000,
    });

    collector.on("collect", async (interaction) => {
      try {
        if (interaction.customId === "serverlist:close") {
          collector.stop();
          return await interaction.message.delete().catch(() => {});
        }

        if (interaction.customId === "serverlist:select") {
          const selectedValue = interaction.values?.[0];
          if (selectedValue === "overview") {
            viewingGuild = null;
            const updatedPayload = await getPagePayload(currentPage);
            return await interaction.update({
              components: updatedPayload.components,
            });
          }

          const selectedGuild = client.guilds.cache.get(selectedValue);
          if (selectedGuild) {
            viewingGuild = selectedGuild;
            const updatedPayload = await getSingleServerPayload(selectedGuild, currentPage);
            return await interaction.update({
              components: updatedPayload.components,
            });
          }
        }

        if (interaction.customId === "serverlist:back") {
          viewingGuild = null;
          const updatedPayload = await getPagePayload(currentPage);
          return await interaction.update({
            components: updatedPayload.components,
          });
        }

        if (interaction.customId === "serverlist:home") {
          currentPage = 0;
          viewingGuild = null;
        } else if (interaction.customId === "serverlist:prev") {
          currentPage = Math.max(0, currentPage - 1);
          viewingGuild = null;
        } else if (interaction.customId === "serverlist:next") {
          currentPage = Math.min(pages - 1, currentPage + 1);
          viewingGuild = null;
        }

        const updatedPayload = await getPagePayload(currentPage);
        await interaction.update({
          components: updatedPayload.components,
        });
      } catch (err) {
        client.logger?.log(`[Serverlist collector error] ${err.message}`, "error");
      }
    });

    collector.on("end", async () => {
      try {
        if (viewingGuild) {
          const finalPayload = await getSingleServerPayload(viewingGuild, currentPage, true);
          sentMessage.edit({ components: finalPayload.components }).catch(() => {});
        } else {
          const finalPayload = await getPagePayload(currentPage, true);
          sentMessage.edit({ components: finalPayload.components }).catch(() => {});
        }
      } catch {}
    });

    return sentMessage;
  },
};
