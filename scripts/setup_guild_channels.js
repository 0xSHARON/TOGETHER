const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const path = require("path");
const fs = require("fs");
const config = require("../src/config");
const { renderChannelBanner } = require("../src/utils/channelBanner");
const { syncApplicationEmojis } = require("../src/utils/applicationEmojis");

const GUILD_ID = process.env.COMMUNITY_GUILD_ID || config.links?.guild || "1523598777573970011";
const BANNER_PATH = path.resolve(__dirname, "../assets/banner.png");
const BOT_COLOR = config.color || "#3F4652";
const FOOTER_TEXT = config.footerText || "TOGETHER • Sound that brings us closer";

// ─── NEW CHANNEL ID MAP (after recreate_beautify_guild overhaul) ───
const CHANNEL_IDS = {
  // INFORMATION
  rules:           "1557555353040846898",
  announcements:   "1557621615708340285",
  events:          "1557621618052698163",
  vote:            "1557621620376469505",
  // TOGETHER BOT HUB
  botCommands:     "1557621633643188246",
  botGuide:        "1557621636398587985",
  features:        "1557621642958610482",
  suggestions:     "1557621646532149268",
  bugReports:      "1557621649728077844",
  botStatus:       "1557621651854589982",
  // COMMUNITY
  general:         "1557621655944171633",
  media:           "1557621658242785280",
  botSpam:         "1557621660344000514",
  vipLounge:       "1557621663938383932",
  // LIVE MUSIC & STAGE
  stage:           "1557621672121733131",
  lofi:            "1557621677884440676",
  listening1:      "1557621680082518088",
  listening2:      "1557621683215405106",
  djSession:       "1557621686353006723",
  // STAFF HQ
  discordUpdates:  "1557555353040846901",
  staffChat:       "1557621710210207824",
  systemLogs:      "1557621712948830388",
  // CATEGORIES
  catInformation:  "1557621606489006161",
  catBotHub:       "1557621630287740941",
  catCommunity:    "1557621653884768306",
  catMusic:        "1557621668002664469",
  catVoice:        "1557621689271980083",
  catStaff:        "1557621707215216660",
};

/**
 * Dynamically loads and parses all public commands directly from src/commands
 */
function loadAllPublicCommands() {
  const commandsRoot = path.resolve(__dirname, "../src/commands");
  const categories = ["Music", "Favourite", "Filters", "Information", "Utility", "Config"];
  const map = new Map();

  for (const cat of categories) {
    map.set(cat, []);
    const dir = path.join(commandsRoot, cat);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".js"));
    for (const file of files) {
      try {
        const cmd = require(path.join(dir, file));
        if (cmd && cmd.name && !cmd.owner && cmd.category !== "Owner") {
          map.get(cat).push(cmd);
        }
      } catch (e) {
        console.error(`Failed to load command ${file}:`, e.message);
      }
    }

    map.get(cat).sort((a, b) => a.name.localeCompare(b.name));
  }

  return map;
}

function formatCmd(cmd, E, prefix = ".") {
  const hasSlash = Boolean(cmd.slashExecute || cmd.slashOptions);
  const slashBadge = hasSlash ? ` ${E.dot} \`/${cmd.name}\`` : "";
  const usage = cmd.usage ? ` \`${cmd.usage}\`` : "";
  const aliasesBadge =
    cmd.aliases && cmd.aliases.filter(Boolean).length > 0
      ? ` *(aliases: \`${cmd.aliases.filter(Boolean).join("`, `")}\`)*`
      : "";

  return `${E.dot} **\`${prefix}${cmd.name}\`${usage}**${slashBadge}\n> ${cmd.description || "No description provided."}${aliasesBadge}`;
}

async function purgeChannelMessages(channel) {
  try {
    const fetched = await channel.messages.fetch({ limit: 100 });
    if (fetched.size > 0) {
      console.log(`[#${channel.name}] Deleting ${fetched.size} old messages...`);
      for (const msg of fetched.values()) {
        await msg.delete().catch(() => {});
        await new Promise((r) => setTimeout(r, 150));
      }
    }
  } catch (e) {
    console.error(`[#${channel.name}] Purge error: ${e.message}`);
  }
}

async function renderSafeBanner(opts) {
  try {
    const buffer = await renderChannelBanner(opts);
    return [new AttachmentBuilder(buffer, { name: "banner.png" })];
  } catch {
    if (fs.existsSync(BANNER_PATH)) {
      return [new AttachmentBuilder(BANNER_PATH, { name: "banner.png" })];
    }
    return [];
  }
}

async function main() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
    ],
  });

  client.once("clientReady", async () => {
    console.log(`[SETUP] Logged in as ${client.user.tag}`);

    try {
      // Synchronize and load exclusively the custom assets from assets/emojis
      const E = await syncApplicationEmojis(client);
      console.log(`[SETUP] Application emojis ready from assets/emojis.`);

      const guild = await client.guilds.fetch(GUILD_ID);
      console.log(`[SETUP] Connected to guild: "${guild.name}" (${guild.id})`);

      const channels = await guild.channels.fetch();

      // Use the new beautified TOGETHER BOT category from recreate_beautify_guild overhaul
      let category = channels.get(CHANNEL_IDS.catBotHub);
      if (!category) {
        // Fallback: find by name pattern
        category = channels.find(
          (c) =>
            c &&
            c.type === ChannelType.GuildCategory &&
            (c.name.toLowerCase().includes("together bot") || c.name.toLowerCase().includes("bot hub"))
        );
      }
      if (!category) {
        category = await guild.channels.create({
          name: "✦ ━━━━ TOGETHER BOT ━━━━ ✦",
          type: ChannelType.GuildCategory,
          position: 1,
        });
        console.log(`[SETUP] Created new category: ${category.name}`);
      }

      const channelSpecs = [
        {
          id: CHANNEL_IDS.botCommands,
          name: "🎵・bot-commands",
          topic: `${E.music} Complete and accurate command list from src/commands for TOGETHER`,
          readOnly: true,
          handler: (ch) => postBotCommands(ch, client, E),
        },
        {
          id: CHANNEL_IDS.botGuide,
          name: "📖・bot-guide",
          topic: `${E.headphones} Quick start guide, button controls, and music tips for listeners`,
          readOnly: true,
          handler: (ch) => postBotGuide(ch, client, E),
        },
        {
          id: CHANNEL_IDS.features,
          name: "✨・features-showcase",
          topic: `${E.sparkles} Music features, supported streaming platforms, and sound filters`,
          readOnly: true,
          handler: (ch) => postFeatures(ch, client, E),
        },
        {
          id: null, // setup-guide is informational, post fresh if channel exists
          name: "📋・setup-guide",
          topic: `${E.config} Quick setup guide for server owners and administrators`,
          readOnly: true,
          handler: (ch) => postSetupGuide(ch, client, E),
        },
        {
          id: CHANNEL_IDS.botStatus,
          name: "📊・bot-status",
          topic: `${E.utility} Live bot availability, ping, and music system operational status`,
          readOnly: true,
          handler: (ch) => postStatus(ch, client, E),
        },
        {
          id: CHANNEL_IDS.suggestions,
          name: "💡・suggestions",
          topic: `${E.fire} Share your ideas and feature requests for the music bot`,
          readOnly: false,
          handler: (ch) => postSuggestions(ch, client, E),
        },
        {
          id: CHANNEL_IDS.bugReports,
          name: "🐛・bug-reports",
          topic: `${E.warn} Report playback bugs or audio issues to the team`,
          readOnly: false,
          handler: (ch) => postBugReports(ch, client, E),
        },
      ];

      for (const spec of channelSpecs) {
        // First try to resolve channel by known ID, then fall back to name search
        let ch = spec.id ? channels.get(spec.id) : null;

        if (!ch) {
          ch = channels.find(
            (c) =>
              c &&
              c.type === ChannelType.GuildText &&
              c.parent_id === category.id &&
              (c.name === spec.name ||
                c.name.replace(/^[🎵📖✨📋📊💡🐛\s・-]+/, "") === spec.name.replace(/^[🎵📖✨📋📊💡🐛\s・-]+/, ""))
          );
        }

        if (!ch) {
          const permissionOverwrites = [
            {
              id: guild.roles.everyone.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.AddReactions,
              ],
              deny: spec.readOnly
                ? [
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.CreatePublicThreads,
                    PermissionFlagsBits.CreatePrivateThreads,
                  ]
                : [],
            },
            {
              id: client.user.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
          ];

          ch = await guild.channels.create({
            name: spec.name,
            type: ChannelType.GuildText,
            parent: category.id,
            topic: spec.topic,
            permissionOverwrites,
          });
          console.log(`[SETUP] Created channel #${ch.name} (${ch.id})`);
        } else {
          console.log(`[SETUP] Found existing channel #${ch.name} (${ch.id}) — refreshing content.`);
        }

        // Purge existing messages & post clean accurate content with assets/emojis
        await purgeChannelMessages(ch);
        await spec.handler(ch);
        await new Promise((r) => setTimeout(r, 400));
      }

      console.log("[SETUP] All channels updated successfully using exclusively assets/emojis!");
    } catch (err) {
      console.error("[SETUP ERROR]", err);
    } finally {
      client.destroy();
    }
  });

  client.login(config.token);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. #・bot-commands (ACCURATE & COMPLETE DIRECTORY FROM src/commands)
// ─────────────────────────────────────────────────────────────────────────────
async function postBotCommands(channel, client, E) {
  const commandMap = loadAllPublicCommands();
  const totalPublicCommands = Array.from(commandMap.values()).reduce((sum, list) => sum + list.length, 0);

  const files = await renderSafeBanner({
    title: "BOT COMMANDS",
    subtitle: "COMPLETE ACCURATE USER PLAYBACK & UTILITY DIRECTORY",
    moduleTag: "MODULE // 01",
    jpText: ["指", "令", "体", "系"],
    iconType: "cmd",
    stat1Label: "COMMANDS",
    stat1Value: `${totalPublicCommands} TOTAL`,
    stat2Label: "ACCESS",
    stat2Value: "PUBLIC",
  });

  const prefix = config.prefix || ".";

  // Main Intro Embed
  const mainEmbed = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setAuthor({
      name: `${client.user.username} • Official Command Directory`,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle(`${E.music} Complete Command Directory (${totalPublicCommands} Commands)`)
    .setDescription(
      `Welcome to **${client.user.username}**! All commands are fully supported via **Prefix (\`${prefix}\`)** and **Slash Commands (\`/\`)**.\n\n` +
      `**Prefix:** \`${prefix}\`   ${E.dot}   **Slash:** \`/\`   ${E.dot}   **Total Commands:** \`${totalPublicCommands}\`\n\n` +
      `Browse the organized sections below for all playback, playlist, audio filter, and utility commands!`
    );

  if (files.length > 0) {
    mainEmbed.setImage("attachment://banner.png");
    await channel.send({ embeds: [mainEmbed], files });
  } else {
    await channel.send({ embeds: [mainEmbed] });
  }

  // 1. Music - Core Playback
  const musicList = commandMap.get("Music") || [];
  const coreMusicNames = [
    "play", "pause", "resume", "skip", "stop", "nowplaying",
    "queue", "volume", "seek", "loop", "autoplay", "shuffle"
  ];
  const coreMusicCmds = musicList.filter((c) => coreMusicNames.includes(c.name));
  const extMusicCmds = musicList.filter((c) => !coreMusicNames.includes(c.name));

  const musicCoreEmbed = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(`${E.play} Music — Core Playback & Queue (${coreMusicCmds.length})`)
    .setDescription(
      `> Use these commands while connected to a voice channel.\n\n` +
      coreMusicCmds.map((c) => formatCmd(c, E, prefix)).join("\n\n")
    );
  await channel.send({ embeds: [musicCoreEmbed] });
  await new Promise((r) => setTimeout(r, 200));

  // 2. Music - Extended Controls & History
  if (extMusicCmds.length > 0) {
    const musicExtEmbed = new EmbedBuilder()
      .setColor(BOT_COLOR)
      .setTitle(`${E.music} Music — Extended Controls & Queue Management (${extMusicCmds.length})`)
      .setDescription(
        extMusicCmds.map((c) => formatCmd(c, E, prefix)).join("\n\n")
      );
    await channel.send({ embeds: [musicExtEmbed] });
    await new Promise((r) => setTimeout(r, 200));
  }

  // 3. Favourite & Liked
  const favList = commandMap.get("Favourite") || [];
  if (favList.length > 0) {
    const favEmbed = new EmbedBuilder()
      .setColor("#EC4899")
      .setTitle(`${E.favourite} Liked Songs & Playlists (${favList.length})`)
      .setDescription(
        `> Bookmark your favorite songs and load your saved collections anytime.\n\n` +
        favList.map((c) => formatCmd(c, E, prefix)).join("\n\n")
      );
    await channel.send({ embeds: [favEmbed] });
    await new Promise((r) => setTimeout(r, 200));
  }

  // 4. Filters & Equalizers
  const filterList = commandMap.get("Filters") || [];
  if (filterList.length > 0) {
    const filterEmbed = new EmbedBuilder()
      .setColor("#A855F7")
      .setTitle(`${E.filters} Audio Filters & Sound Equalizers`)
      .setDescription(
        `> Enhance your listening experience with high-fidelity DSP filters.\n\n` +
        filterList.map((c) => formatCmd(c, E, prefix)).join("\n\n") +
        `\n\n**Available Filter Presets:**\n` +
        `${E.dot} \`8d\` — 360° Rotating Surround Sound\n` +
        `${E.dot} \`bassboost\` — Punchy Low-End Bass Amp\n` +
        `${E.dot} \`nightcore\` — High Pitch & Fast Tempo\n` +
        `${E.dot} \`vaporwave\` — Slowed & Reverb\n` +
        `${E.dot} \`pop\` / \`rock\` / \`soft\` / \`treblebass\` / \`electronic\`\n` +
        `${E.dot} \`clear\` — Reset all active audio filters`
      );
    await channel.send({ embeds: [filterEmbed] });
    await new Promise((r) => setTimeout(r, 200));
  }

  // 5. Information & Stats
  const infoList = commandMap.get("Information") || [];
  if (infoList.length > 0) {
    const infoEmbed = new EmbedBuilder()
      .setColor("#38BDF8")
      .setTitle(`${E.info} Information & Community (${infoList.length})`)
      .setDescription(
        infoList.map((c) => formatCmd(c, E, prefix)).join("\n\n")
      );
    await channel.send({ embeds: [infoEmbed] });
    await new Promise((r) => setTimeout(r, 200));
  }

  // 6. Utility & Configuration
  const utilList = commandMap.get("Utility") || [];
  const cfgList = commandMap.get("Config") || [];

  const utilAndConfigEmbed = new EmbedBuilder()
    .setColor("#10B981")
    .setTitle(`${E.utility} Utility & Server Configuration (${utilList.length + cfgList.length})`)
    .setDescription(
      `### ${E.utility} General Utilities\n` +
      utilList.map((c) => formatCmd(c, E, prefix)).join("\n\n") +
      `\n\n### ${E.config} Server Configuration\n` +
      cfgList.map((c) => formatCmd(c, E, prefix)).join("\n\n")
    )
    .setFooter({
      text: FOOTER_TEXT,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp();

  await channel.send({ embeds: [utilAndConfigEmbed] });
  console.log(`[#${channel.name}] Posted complete accurate command directory (${totalPublicCommands} commands).`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. #・bot-guide (USER-FOCUSED LISTENING GUIDE)
// ─────────────────────────────────────────────────────────────────────────────
async function postBotGuide(channel, client, E) {
  const files = await renderSafeBanner({
    title: "BOT GUIDE",
    subtitle: "LISTENER HANDBOOK & AUDIO CONTROLLER TIPS",
    moduleTag: "MODULE // 02",
    jpText: ["使", "用", "手", "引"],
    iconType: "guide",
    stat1Label: "GUIDE",
    stat1Value: "ESSENTIALS",
    stat2Label: "PLAYERS",
    stat2Value: "ACTIVE",
  });

  const prefix = config.prefix || ".";

  const guideEmbed = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setAuthor({
      name: `${client.user.username} • Listener Guide`,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle(`${E.sparkles} Quick Start: How to Play Music`)
    .setDescription(
      `Playing music with your friends is fast and easy. Follow these 3 simple steps:\n\n` +
      `### ${E.star} Step 1: Join a Voice Channel\n` +
      `Hop into any voice channel in this server.\n\n` +
      `### ${E.star} Step 2: Request Your Song\n` +
      `Type **\`${prefix}play <song name or link>\`** or use **\`/play\`**.\n` +
      `${E.dot} Examples:\n` +
      `> \`${prefix}play Starboy The Weeknd\`\n` +
      `> \`${prefix}play https://open.spotify.com/track/...\`\n` +
      `> \`${prefix}play https://music.youtube.com/watch?v=...\`\n\n` +
      `### ${E.star} Step 3: Enjoy & Control with Buttons\n` +
      `The bot will join your channel and show a live **Interactive Player Card** with buttons right below the message!`
    );

  if (files.length > 0) {
    guideEmbed.setImage("attachment://banner.png");
    await channel.send({ embeds: [guideEmbed], files });
  } else {
    await channel.send({ embeds: [guideEmbed] });
  }

  const playerCardEmbed = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle(`${E.headphones} Interactive Player Card Buttons`)
    .setDescription(
      `You don't need to type commands to control playback! Simply click the buttons:\n\n` +
      `${E.previous} **Previous** — Play the previous song in history.\n` +
      `${E.pause} / ${E.play} **Pause / Resume** — Pause or resume music.\n` +
      `${E.skip} **Skip** — Jump to the next track.\n` +
      `${E.stop} **Stop** — Stop the music and clear the queue.\n` +
      `${E.voldown} / ${E.volup} **Volume** — Turn volume down or up by 10%.\n` +
      `${E.shuffle} **Shuffle** — Shuffle the upcoming songs.\n` +
      `${E.loop} **Loop** — Loop current track or loop the whole queue.\n` +
      `${E.autoplay} **Autoplay** — Keep playing recommended songs when queue ends.\n` +
      `${E.favourite} **Like** — Save this song to your favorites (\`${prefix}showliked\`).`
    );

  const tipsEmbed = new EmbedBuilder()
    .setColor("#FBBF24")
    .setTitle(`${E.star} Useful Listening & Voting Tips`)
    .setDescription(
      `${E.dot} **Direct Streaming:** Paste links directly from **Spotify**, **Apple Music**, **Deezer**, or **YouTube**.\n` +
      `${E.dot} **Non-Stop Music:** Turn on **Autoplay** (\`${prefix}autoplay\`) so the music never stops even after your queue finishes.\n` +
      `${E.dot} **Vote for TOGETHER:** Use **\`${prefix}vote\`** or **\`/vote\`** on Top.gg every 12 hours to show support and get verified in the server!\n` +
      `${E.dot} **Audio Quality:** Set your Discord voice channel bitrate to **96kbps - 384kbps** for crystal-clear sound.`
    )
    .setFooter({
      text: FOOTER_TEXT,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp();

  await channel.send({ embeds: [playerCardEmbed] });
  await channel.send({ embeds: [tipsEmbed] });
  console.log(`[#${channel.name}] Posted user guide.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. #・features (USER-FACING HIGHLIGHTS)
// ─────────────────────────────────────────────────────────────────────────────
async function postFeatures(channel, client, E) {
  const files = await renderSafeBanner({
    title: "CORE FEATURES",
    subtitle: "HIGH-FIDELITY AUDIO, FILTERS & MULTI-PLATFORM",
    moduleTag: "MODULE // 03",
    jpText: ["機", "能", "一", "覧"],
    iconType: "features",
    stat1Label: "AUDIO",
    stat1Value: "320 KBPS",
    stat2Label: "NODES",
    stat2Value: "MULTI-REGION",
  });

  const featEmbed = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setAuthor({
      name: `${client.user.username} • Bot Features`,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle(`${E.sparkles} Music Features for Everyone`)
    .setDescription(
      `**${client.user.username}** delivers high-fidelity sound, instant response times, and an easy-to-use interface for everyone in your server.`
    );

  if (files.length > 0) {
    featEmbed.setImage("attachment://banner.png");
    await channel.send({ embeds: [featEmbed], files });
  } else {
    await channel.send({ embeds: [featEmbed] });
  }

  const listEmbed = new EmbedBuilder()
    .setColor("#38BDF8")
    .setTitle(`${E.headphones} What Makes ${client.user.username} Great`)
    .setDescription(
      `### ${E.music} Universal Music Platform Support\n` +
      `Stream from all your favorite services with instant link conversion:\n` +
      `${E.spotify} **Spotify** Playlists, Albums & Tracks\n` +
      `${E.applemusic} **Apple Music**\n` +
      `${E.deezer} **Deezer** Lossless\n` +
      `${E.ytmusic} **YouTube Music** & YouTube\n` +
      `${E.jiosaavn} **JioSaavn**\n\n` +
      `### ${E.filters} Real-Time Sound Equalizers\n` +
      `Transform your audio with 8D surround sound, deep bassboost, nightcore, and vaporwave.\n\n` +
      `### ${E.play} 24/7 Music Uptime\n` +
      `The bot can stay in your voice channel 24/7 with \`.247\` without disconnecting or pausing unexpectedly.\n\n` +
      `### ${E.headphones} Interactive Buttons & Clean UI\n` +
      `Control songs by simply clicking buttons under the track banner without having to memorize commands.\n\n` +
      `### ${E.favourite} Personal Liked Songs Library\n` +
      `Click the heart button on any song to save it, and play your saved library anytime with \`.playliked\`.\n\n` +
      `### ${E.star} Top.gg Community Votes\n` +
      `Support the bot by voting with \`.vote\` / \`/vote\` and get recognized in our dedicated vote announcements channel!`
    )
    .setFooter({
      text: FOOTER_TEXT,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp();

  await channel.send({ embeds: [listEmbed] });
  console.log(`[#${channel.name}] Posted features.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. #・setup-guide (SERVER ADMIN SETUP)
// ─────────────────────────────────────────────────────────────────────────────
async function postSetupGuide(channel, client, E) {
  const files = await renderSafeBanner({
    title: "SETUP GUIDE",
    subtitle: "SERVER INTEGRATION & VOICE CONFIGURATION",
    moduleTag: "MODULE // 04",
    jpText: ["初", "期", "設", "定"],
    iconType: "setup",
    stat1Label: "PERMS",
    stat1Value: "CONNECT/SPEAK",
    stat2Label: "DEFAULT",
    stat2Value: "24/7 READY",
  });

  const setupEmbed = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setAuthor({
      name: `${client.user.username} • Server Setup Guide`,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle(`${E.config} How to Setup ${client.user.username} in Your Server`)
    .setDescription(
      `Quick guide for server managers to configure 24/7 music lounges and permissions.`
    );

  if (files.length > 0) {
    setupEmbed.setImage("attachment://banner.png");
    await channel.send({ embeds: [setupEmbed], files });
  } else {
    await channel.send({ embeds: [setupEmbed] });
  }

  const stepsEmbed = new EmbedBuilder()
    .setColor("#35C47C")
    .setTitle(`${E.check} Quick Configuration Steps`)
    .setDescription(
      `### ${E.star} Step 1: Setting Up 24/7 Music Rooms\n` +
      `To keep the bot in a voice channel 24 hours a day without timing out:\n` +
      `1. Join the voice channel you want as the 24/7 room.\n` +
      `2. Type **\`.247\`** or **\`/247\`**.\n` +
      `3. The bot will stay connected permanently and reconnect automatically on restarts.\n\n` +
      `### ${E.star} Step 2: Changing the Command Prefix\n` +
      `If \`.\` conflicts with another bot, change it anytime with:\n` +
      `> **\`.setprefix <new_prefix>\`** (e.g. \`.setprefix !\` or \`.setprefix ?\`)\n\n` +
      `### ${E.star} Step 3: Setting Preferred Search Source\n` +
      `Customize the default audio lookup engine:\n` +
      `> **\`.source <ytmsearch|scsearch|spsearch>\`**\n\n` +
      `### ${E.star} Step 4: Muting the Bot in Certain Channels\n` +
      `To prevent bot commands from cluttering general chat:\n` +
      `> **\`.ignore add #channel\`**\n\n` +
      `### ${E.star} Step 5: Recommended Voice Channel Quality\n` +
      `Set your voice channel bitrate to **96kbps - 384kbps** (Edit Channel > Bitrate) for the best audio experience.`
    )
    .setFooter({
      text: FOOTER_TEXT,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp();

  await channel.send({ embeds: [stepsEmbed] });
  console.log(`[#${channel.name}] Posted setup guide.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. #・status (USER-FACING STATUS)
// ─────────────────────────────────────────────────────────────────────────────
async function postStatus(channel, client, E) {
  const files = await renderSafeBanner({
    title: "SYSTEM STATUS",
    subtitle: "LIVE TELEMETRY, GATEWAY PING & SYSTEM HEALTH",
    moduleTag: "MODULE // 05",
    jpText: ["稼", "働", "状", "況"],
    iconType: "status",
    stat1Label: "FLEET",
    stat1Value: "OPERATIONAL",
    stat2Label: "UPTIME",
    stat2Value: "99.9%",
  });

  const statusEmbed = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setAuthor({
      name: `${client.user.username} • System Status`,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle(`${E.check} Music Bot is Online & Operational`)
    .setDescription(
      `All music playback services are running normally with zero interruptions.\n\n` +
      `**Bot Status:** ${E.check} \`Online & Ready\`\n` +
      `**Response Latency (Ping):** ${E.utility} \`${Math.round(client.ws.ping || 42)} ms\`\n` +
      `**Music Playback Engine:** ${E.music} \`Operational (High Fidelity 320kbps)\`\n` +
      `**Supported Platforms:** ${E.spotify} Spotify, ${E.ytmusic} YouTube Music, ${E.applemusic} Apple Music, ${E.deezer} Deezer, ${E.jiosaavn} JioSaavn\n\n` +
      `Type **\`.ping\`** in any channel for live response time, or type **\`.play\`** to start listening!`
    )
    .setFooter({
      text: FOOTER_TEXT,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp();

  if (files.length > 0) {
    statusEmbed.setImage("attachment://banner.png");
    await channel.send({ embeds: [statusEmbed], files });
  } else {
    await channel.send({ embeds: [statusEmbed] });
  }

  console.log(`[#${channel.name}] Posted clean status.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. #・suggestions (COMMUNITY SUGGESTIONS)
// ─────────────────────────────────────────────────────────────────────────────
async function postSuggestions(channel, client, E) {
  const files = await renderSafeBanner({
    title: "SUGGESTIONS",
    subtitle: "COMMUNITY FEEDBACK & FEATURE REQUEST HUB",
    moduleTag: "MODULE // 06",
    jpText: ["提", "案", "受", "付"],
    iconType: "suggestions",
    stat1Label: "FEEDBACK",
    stat1Value: "OPEN",
    stat2Label: "COMMUNITY",
    stat2Value: "ACTIVE",
  });

  const suggestEmbed = new EmbedBuilder()
    .setColor("#FBBF24")
    .setAuthor({
      name: `${client.user.username} • Community Feedback`,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle(`${E.fire} Feature Requests & Suggestions`)
    .setDescription(
      `Have an idea to make **${client.user.username}** even better? Drop your thoughts here!\n\n` +
      `### ${E.dot} How to Share a Suggestion:\n` +
      `Post your suggestion directly in this channel following this simple format:\n\n` +
      `\`\`\`\n` +
      `[SUGGESTION TITLE]\n` +
      `What feature would you like to see?\n` +
      `How does it help listeners in the server?\n` +
      `\`\`\`\n\n` +
      `### ${E.star} Community Voting:\n` +
      `React to suggestions from other members:\n` +
      `${E.check} **Upvote** if you want to see this added!\n` +
      `${E.cross} **Downvote** if you prefer other features.`
    )
    .setFooter({
      text: FOOTER_TEXT,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp();

  if (files.length > 0) {
    suggestEmbed.setImage("attachment://banner.png");
    await channel.send({ embeds: [suggestEmbed], files });
  } else {
    await channel.send({ embeds: [suggestEmbed] });
  }

  console.log(`[#${channel.name}] Posted suggestions.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. #・bug-reports (ISSUE TRACKING)
// ─────────────────────────────────────────────────────────────────────────────
async function postBugReports(channel, client, E) {
  const files = await renderSafeBanner({
    title: "BUG REPORTS",
    subtitle: "AUDIO ISSUE TRACKING & INCIDENT LOGGING",
    moduleTag: "MODULE // 07",
    jpText: ["不", "具", "合", "報"],
    iconType: "bugs",
    stat1Label: "REPORTS",
    stat1Value: "MONITORED",
    stat2Label: "TRIAGE",
    stat2Value: "PRIORITY",
  });

  const bugEmbed = new EmbedBuilder()
    .setColor("#ED4245")
    .setAuthor({
      name: `${client.user.username} • Bug Reports & Support`,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle(`${E.warn} Report an Audio or Playback Issue`)
    .setDescription(
      `If a song fails to load or you encounter unexpected playback behavior, please report it here so we can fix it quickly.\n\n` +
      `### ${E.info} What to Include in Your Report:\n` +
      `Please provide details using this template:\n\n` +
      `\`\`\`\n` +
      `Command: (e.g. .play, /skip, .seek)\n` +
      `What happened: Brief description of the issue\n` +
      `Song Title / URL: The song link that had an issue\n` +
      `Error Message: Any text or error notice shown by the bot\n` +
      `\`\`\`\n\n` +
      `### ${E.warn} Quick Checks Before Reporting:\n` +
      `${E.dot} Ensure the bot has **Connect** and **Speak** permissions in your voice channel.\n` +
      `${E.dot} Check that you are not deafened in Discord.\n` +
      `${E.dot} For Spotify links, confirm the playlist or song is public.`
    )
    .setFooter({
      text: FOOTER_TEXT,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp();

  if (files.length > 0) {
    bugEmbed.setImage("attachment://banner.png");
    await channel.send({ embeds: [bugEmbed], files });
  } else {
    await channel.send({ embeds: [bugEmbed] });
  }

  console.log(`[#${channel.name}] Posted clean bug reports.`);
}

main();
