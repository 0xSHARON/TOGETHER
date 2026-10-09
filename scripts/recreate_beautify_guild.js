const config = require("../src/config.js");
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

const GUILD_ID = "1523598777573970011";
const OWNER_ID = "780345293237125152";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers
  ]
});

function generateSnowflake(offset = 0) {
  const epoch = 1420070400000n;
  const now = BigInt(Date.now() + offset) - epoch;
  return ((now << 22n) + 1n).toString();
}

async function run() {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    console.log(`Connected to Guild: "${guild.name}" (${guild.id})`);

    // ── STEP 1: CREATE REPLACEMENT ROLES FIRST ──
    console.log("\n>>> STEP 1: Creating Beautiful New Roles...");
    const roleDefs = [
      { key: "founder", name: "👑 ┃ Founder", color: 0xFF4B4B, hoist: true, mentionable: false, permissions: [PermissionFlagsBits.Administrator] },
      { key: "dev", name: "💻 ┃ Developer", color: 0x5865F2, hoist: true, mentionable: true },
      { key: "admin", name: "🛡️ ┃ Administrator", color: 0xFF9800, hoist: true, mentionable: true },
      { key: "mod", name: "👮 ┃ Moderator", color: 0x00E676, hoist: true, mentionable: true },
      { key: "support", name: "🤝 ┃ Support Staff", color: 0x00B0FF, hoist: true, mentionable: true },
      { key: "bot", name: "⚡ ┃ Bot Integration", color: 0x7289DA, hoist: true, mentionable: false },
      { key: "premium", name: "💎 ┃ Premium Supporter", color: 0xFF69B4, hoist: true, mentionable: false },
      { key: "voter", name: "⭐ ┃ Top.gg Voter", color: 0xFF3366, hoist: true, mentionable: false },
      { key: "vip", name: "🌟 ┃ VIP", color: 0xFFD700, hoist: true, mentionable: false },
      { key: "dj", name: "🎧 ┃ DJ", color: 0xFEE75C, hoist: true, mentionable: false },
      { key: "radio", name: "📻 ┃ 24/7 Listener", color: 0xFFA726, hoist: false, mentionable: false },
      { key: "speaker", name: "🎙️ ┃ Stage Speaker", color: 0xAB47BC, hoist: false, mentionable: false },
      { key: "lover", name: "🎵 ┃ Music Lover", color: 0x26A69A, hoist: false, mentionable: false },
      { key: "bughunter", name: "🐛 ┃ Bug Hunter", color: 0x26C6DA, hoist: false, mentionable: false },
      { key: "announcements", name: "🔔 ┃ Announcements Ping", color: 0x42A5F5, hoist: false, mentionable: true },
      { key: "events", name: "🎉 ┃ Events Ping", color: 0xEC407A, hoist: false, mentionable: true },
      { key: "member", name: "👥 ┃ Member", color: 0xB9BBBE, hoist: false, mentionable: false }
    ];

    const newRoles = {};
    for (const def of roleDefs) {
      const r = await guild.roles.create({
        name: def.name,
        color: def.color,
        hoist: def.hoist,
        mentionable: def.mentionable,
        permissions: def.permissions || [],
        reason: "TOGETHER Server Redesign"
      });
      newRoles[def.key] = r;
      console.log(`+ Created Role: ${r.name} (${r.id})`);
    }

    // Assign Founder role to Owner
    try {
      const ownerMember = await guild.members.fetch(OWNER_ID);
      if (ownerMember) {
        await ownerMember.roles.add(newRoles.founder);
        console.log(`+ Assigned 👑 ┃ Founder to ${ownerMember.user.username}`);
      }
    } catch (e) {
      console.warn("Could not assign owner role:", e.message);
    }

    // ── STEP 2: CREATE NEW CHANNELS & CATEGORIES ──
    console.log("\n>>> STEP 2: Creating Beautiful Categories and Channels...");

    // Category 1: INFORMATION
    const catInfo = await guild.channels.create({
      name: "✦ ━━━━ INFORMATION ━━━━ ✦",
      type: ChannelType.GuildCategory
    });

    const cRules = await guild.channels.create({
      name: "📜・rules-and-info",
      type: ChannelType.GuildText,
      parent: catInfo.id,
      topic: "Official TOGETHER community guidelines, rules, and server information."
    });

    const cAnnouncements = await guild.channels.create({
      name: "📢・announcements",
      type: ChannelType.GuildAnnouncement,
      parent: catInfo.id,
      topic: "Important announcements, updates, and releases for TOGETHER music bot."
    });

    const cEvents = await guild.channels.create({
      name: "🎉・giveaways-events",
      type: ChannelType.GuildText,
      parent: catInfo.id,
      topic: "Community giveaways, music contests, and special events."
    });

    const cVote = await guild.channels.create({
      name: "⭐・vote-together",
      type: ChannelType.GuildText,
      parent: catInfo.id,
      topic: "Vote for TOGETHER on Top.gg to unlock premium perks and voter roles!"
    });

    // Category 2: TOGETHER BOT
    const catBot = await guild.channels.create({
      name: "✦ ━━━━ TOGETHER BOT ━━━━ ✦",
      type: ChannelType.GuildCategory
    });

    const cCommands = await guild.channels.create({
      name: "🎵・bot-commands",
      type: ChannelType.GuildText,
      parent: catBot.id,
      topic: "Use /play, /queue, /filters and other TOGETHER bot commands here!"
    });

    const cGuide = await guild.channels.create({
      name: "📖・bot-guide",
      type: ChannelType.GuildText,
      parent: catBot.id,
      topic: "Quick-start guide, slash commands breakdown, and syntax tutorial."
    });

    const cFeatures = await guild.channels.create({
      name: "✨・features-showcase",
      type: ChannelType.GuildText,
      parent: catBot.id,
      topic: "Explore 24/7 radio, audio filters, custom playlists, and stage streaming."
    });

    const cSuggestions = await guild.channels.create({
      name: "💡・suggestions",
      type: ChannelType.GuildText,
      parent: catBot.id,
      topic: "Share your ideas, suggestions, and feedback for TOGETHER bot."
    });

    const cBugs = await guild.channels.create({
      name: "🐛・bug-reports",
      type: ChannelType.GuildText,
      parent: catBot.id,
      topic: "Report bugs, issues, or playback disruptions to our dev team."
    });

    const cStatus = await guild.channels.create({
      name: "📊・bot-status",
      type: ChannelType.GuildText,
      parent: catBot.id,
      topic: "Live status of Lavalink audio nodes and bot performance metrics."
    });

    // Category 3: COMMUNITY
    const catCommunity = await guild.channels.create({
      name: "✦ ━━━━ COMMUNITY ━━━━ ✦",
      type: ChannelType.GuildCategory
    });

    const cGeneral = await guild.channels.create({
      name: "💬・general-chat",
      type: ChannelType.GuildText,
      parent: catCommunity.id,
      topic: "Main community chat! Hang out, talk about music, and vibe together."
    });

    const cMedia = await guild.channels.create({
      name: "📸・media-and-clips",
      type: ChannelType.GuildText,
      parent: catCommunity.id,
      topic: "Share music clips, memes, artwork, and aesthetic setups."
    });

    const cBotSpam = await guild.channels.create({
      name: "🤖・bot-spam",
      type: ChannelType.GuildText,
      parent: catCommunity.id,
      topic: "Bot games, level checks, and fun miscellaneous bot commands."
    });

    const cPremium = await guild.channels.create({
      name: "💎・vip-lounge",
      type: ChannelType.GuildText,
      parent: catCommunity.id,
      topic: "Exclusive discussion lounge for TOGETHER Premium Supporters & Voters."
    });

    // Category 4: LIVE STAGE & MUSIC
    const catMusic = await guild.channels.create({
      name: "✦ ━━━━ LIVE MUSIC & STAGE ━━━━ ✦",
      type: ChannelType.GuildCategory
    });

    const cStage = await guild.channels.create({
      name: "🎭 ┃ TOGETHER LIVE STAGE",
      type: ChannelType.GuildStageVoice,
      parent: catMusic.id,
      topic: "Live community music sessions & DJ sets powered by TOGETHER."
    });

    const cLofi = await guild.channels.create({
      name: "📻 ┃ 24/7 Lo-Fi Lounge",
      type: ChannelType.GuildVoice,
      parent: catMusic.id,
      bitrate: 96000
    });

    const cListen1 = await guild.channels.create({
      name: "🎧 ┃ Listening Room #1",
      type: ChannelType.GuildVoice,
      parent: catMusic.id,
      bitrate: 96000
    });

    const cListen2 = await guild.channels.create({
      name: "🎧 ┃ Listening Room #2",
      type: ChannelType.GuildVoice,
      parent: catMusic.id,
      bitrate: 96000
    });

    const cDJRoom = await guild.channels.create({
      name: "🎶 ┃ DJ Session (Queue Only)",
      type: ChannelType.GuildVoice,
      parent: catMusic.id,
      bitrate: 96000
    });

    // Category 5: VOICE LOUNGES
    const catVC = await guild.channels.create({
      name: "✦ ━━━━ VOICE LOUNGES ━━━━ ✦",
      type: ChannelType.GuildCategory
    });

    const cVCGeneral = await guild.channels.create({
      name: "🔊 ┃ General Voice",
      type: ChannelType.GuildVoice,
      parent: catVC.id,
      bitrate: 64000
    });

    const cVCDuo = await guild.channels.create({
      name: "👥 ┃ Duo Lounge",
      type: ChannelType.GuildVoice,
      parent: catVC.id,
      userLimit: 2,
      bitrate: 64000
    });

    const cVCSquad = await guild.channels.create({
      name: "👥 ┃ Squad Lounge",
      type: ChannelType.GuildVoice,
      parent: catVC.id,
      userLimit: 4,
      bitrate: 64000
    });

    const cVCSilent = await guild.channels.create({
      name: "🌙 ┃ Silent Study & Vibe",
      type: ChannelType.GuildVoice,
      parent: catVC.id,
      bitrate: 64000
    });

    // Category 6: STAFF ONLY
    const catStaff = await guild.channels.create({
      name: "✦ ━━━━ STAFF HQ ━━━━ ✦",
      type: ChannelType.GuildCategory
    });

    const cStaffChat = await guild.channels.create({
      name: "🛡️・staff-chat",
      type: ChannelType.GuildText,
      parent: catStaff.id,
      topic: "Private coordination channel for Server Administrators and Moderators."
    });

    const cLogs = await guild.channels.create({
      name: "📋・system-logs",
      type: ChannelType.GuildText,
      parent: catStaff.id,
      topic: "Bot logs, error traces, and server audit alerts."
    });

    console.log("All new categories and channels created successfully!");

    // ── STEP 3: RE-LINK SERVER SETTINGS TO NEW CHANNELS ──
    console.log("\n>>> STEP 3: Linking Server Settings...");
    await guild.edit({
      rulesChannel: cRules.id,
      publicUpdatesChannel: cStaffChat.id,
      systemChannel: cGeneral.id,
      description: "Official Community & Support Server for TOGETHER — The Premier High-Fidelity Discord Music Bot with 24/7 & Stage Channel Support."
    });
    console.log("+ Server settings linked to new channels!");

    // ── STEP 4: DELETE OLD CHANNELS ──
    console.log("\n>>> STEP 4: Deleting Old Channels & Categories...");
    const newlyCreatedIds = new Set([
      catInfo.id, cRules.id, cAnnouncements.id, cEvents.id, cVote.id,
      catBot.id, cCommands.id, cGuide.id, cFeatures.id, cSuggestions.id, cBugs.id, cStatus.id,
      catCommunity.id, cGeneral.id, cMedia.id, cBotSpam.id, cPremium.id,
      catMusic.id, cStage.id, cLofi.id, cListen1.id, cListen2.id, cDJRoom.id,
      catVC.id, cVCGeneral.id, cVCDuo.id, cVCSquad.id, cVCSilent.id,
      catStaff.id, cStaffChat.id, cLogs.id
    ]);

    const allChannels = await guild.channels.fetch();
    for (const [id, ch] of allChannels) {
      if (!newlyCreatedIds.has(id)) {
        try {
          await ch.delete("Cleaning old channels for community overhaul");
          console.log(`- Deleted old channel: ${ch.name} (${id})`);
        } catch (e) {
          console.warn(`Could not delete channel ${ch.name}: ${e.message}`);
        }
      }
    }

    // ── STEP 5: DELETE OLD ROLES ──
    console.log("\n>>> STEP 5: Deleting Old Roles...");
    const newlyCreatedRoleIds = new Set(Object.values(newRoles).map(r => r.id));
    const allRoles = await guild.roles.fetch();
    for (const [id, r] of allRoles) {
      if (r.name === "@everyone" || r.managed || newlyCreatedRoleIds.has(id)) {
        continue;
      }
      try {
        await r.delete("Cleaning old roles for community overhaul");
        console.log(`- Deleted old role: ${r.name} (${id})`);
      } catch (e) {
        console.warn(`Could not delete role ${r.name}: ${e.message}`);
      }
    }

    // ── STEP 6: CONFIGURE COMPREHENSIVE PERMISSIONS ──
    console.log("\n>>> STEP 6: Setting Precise Channel Permissions...");
    const everyone = guild.roles.everyone;

    // Read only channels (Rules, Announcements, Events, Guide, Features, Status)
    const readOnlyChannels = [cRules, cAnnouncements, cEvents, cGuide, cFeatures, cStatus];
    for (const ch of readOnlyChannels) {
      await ch.permissionOverwrites.set([
        {
          id: everyone.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
          deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.CreatePublicThreads, PermissionFlagsBits.CreatePrivateThreads]
        },
        {
          id: newRoles.admin.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages]
        },
        {
          id: newRoles.founder.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages]
        }
      ]);
    }

    // Vote channel: Read only + Reactions
    await cVote.permissionOverwrites.set([
      {
        id: everyone.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AddReactions],
        deny: [PermissionFlagsBits.SendMessages]
      }
    ]);

    // Bot commands: Full commands for everyone
    await cCommands.permissionOverwrites.set([
      {
        id: everyone.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.UseApplicationCommands,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.AttachFiles
        ]
      }
    ]);

    // VIP Lounge: Premium & Voter only
    await cPremium.permissionOverwrites.set([
      {
        id: everyone.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: newRoles.premium.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
      },
      {
        id: newRoles.voter.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
      },
      {
        id: newRoles.vip.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
      },
      {
        id: newRoles.admin.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
      },
      {
        id: newRoles.founder.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
      }
    ]);

    // Staff category & channels: Admins & Mods only
    await catStaff.permissionOverwrites.set([
      {
        id: everyone.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: newRoles.founder.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
      },
      {
        id: newRoles.admin.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
      },
      {
        id: newRoles.mod.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
      },
      {
        id: newRoles.support.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
      }
    ]);

    // Stage Channel: Speak permission for DJ, Stage Speaker, and Staff
    await cStage.permissionOverwrites.set([
      {
        id: everyone.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.RequestToSpeak]
      },
      {
        id: newRoles.speaker.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
      },
      {
        id: newRoles.dj.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
      },
      {
        id: newRoles.mod.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.MuteMembers]
      },
      {
        id: newRoles.admin.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.MuteMembers]
      }
    ]);

    console.log("+ Permissions successfully applied across all channels!");

    // ── STEP 7: UPDATE DISCORD ONBOARDING ──
    console.log("\n>>> STEP 7: Updating Discord Onboarding with New Channels & Roles...");
    const { REST, Routes } = require("discord.js");
    const rest = new REST({ version: "10" }).setToken(config.token);

    const onboardingPayload = {
      prompts: [
        {
          id: generateSnowflake(100),
          title: "What brings you to the TOGETHER Community?",
          options: [
            {
              id: generateSnowflake(101),
              title: "High-Quality Music Vibes",
              description: "Listen to HD audio with 24/7 playback and audio filters",
              emoji: { name: "🎵" },
              role_ids: [newRoles.lover.id],
              channel_ids: []
            },
            {
              id: generateSnowflake(102),
              title: "24/7 Radio & Lo-Fi Streams",
              description: "Endless relaxing lo-fi, synthwave, and radio streams",
              emoji: { name: "📻" },
              role_ids: [newRoles.radio.id],
              channel_ids: []
            },
            {
              id: generateSnowflake(103),
              title: "DJ & Voice Host",
              description: "Queue tracks, adjust volume, and apply audio effects",
              emoji: { name: "🎧" },
              role_ids: [newRoles.dj.id],
              channel_ids: []
            },
            {
              id: generateSnowflake(104),
              title: "Stage Channel Speaker",
              description: "Participate and speak in TOGETHER live stage channels",
              emoji: { name: "🎙️" },
              role_ids: [newRoles.speaker.id],
              channel_ids: []
            },
            {
              id: generateSnowflake(105),
              title: "Community Supporter & Fan",
              description: "Support bot development, suggest features & feedback",
              emoji: { name: "💖" },
              role_ids: [newRoles.member.id],
              channel_ids: []
            }
          ],
          single_select: false,
          required: false,
          in_onboarding: true,
          type: 0
        },
        {
          id: generateSnowflake(200),
          title: "Which notifications would you like?",
          options: [
            {
              id: generateSnowflake(201),
              title: "Bot News & Announcements",
              description: "Get pinged for major releases, giveaways, and changelogs",
              emoji: { name: "🔔" },
              role_ids: [newRoles.announcements.id],
              channel_ids: []
            },
            {
              id: generateSnowflake(202),
              title: "Community Events & Giveaways",
              description: "Never miss special nitro giveaways and music events",
              emoji: { name: "🎉" },
              role_ids: [newRoles.events.id],
              channel_ids: []
            },
            {
              id: generateSnowflake(203),
              title: "Beta Testing & Bug Hunting",
              description: "Help test experimental commands and report issues",
              emoji: { name: "🐛" },
              role_ids: [newRoles.bughunter.id],
              channel_ids: []
            }
          ],
          single_select: false,
          required: false,
          in_onboarding: true,
          type: 0
        }
      ],
      default_channel_ids: [
        cRules.id,
        cAnnouncements.id,
        cVote.id,
        cCommands.id,
        cGuide.id,
        cFeatures.id,
        cGeneral.id
      ],
      enabled: true,
      mode: 0
    };

    await rest.put(Routes.guildOnboarding(GUILD_ID), { body: onboardingPayload });
    console.log("+ Onboarding successfully re-enabled with new channels!");

    // ── STEP 8: POST AESTHETIC EMBEDS IN INFO & GUIDE CHANNELS ──
    console.log("\n>>> STEP 8: Posting Aesthetic Information Embeds...");

    // 1. Rules Embed
    let rulesBannerBuffer = null;
    try {
      const { renderRulesBanner } = require("../src/utils/rulesBanner");
      rulesBannerBuffer = await renderRulesBanner();
    } catch (err) {
      console.log("Could not render rules banner:", err.message);
    }

    const rulesEmbed = new EmbedBuilder()
      .setColor(0xF43F5E)
      .setTitle("📜 TOGETHER COMMUNITY GUIDELINES & RULES")
      .setDescription("Welcome to the official community and support headquarters for **TOGETHER Music Bot**! Please read and follow our community rules to ensure an enjoyable experience for everyone.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      .addFields([
        {
          name: "✦ [ RULE 01 ] Mutual Respect & Civility",
          value: "> Treat all listeners, artists, and community members with dignity. Harassment, hate speech, toxicity, slurs, and personal attacks are strictly prohibited."
        },
        {
          name: "✦ [ RULE 02 ] Channel Organization",
          value: `> • Use <#${cCommands.id}> strictly for bot playback and music commands.\n> • Use <#${cGeneral.id}> for community conversations.\n> • Use <#${cBugs.id}> and <#${cSuggestions.id}> for bot support.`
        },
        {
          name: "✦ [ RULE 03 ] Voice & Stage Etiquette",
          value: "> • Do not ear-rape, scream, or disrupt active music sessions.\n> • Allow other users equal opportunity to queue songs unless hosting a designated DJ room."
        },
        {
          name: "✦ [ RULE 04 ] Zero Unsolicited Promotion & Spam",
          value: "> Unsolicited DM advertising, server invite links, phishing links, and copy-paste spam will result in an immediate ban."
        },
        {
          name: "✦ [ RULE 05 ] Follow Discord TOS",
          value: "> All members must abide by the official [Discord Terms of Service](https://discord.com/terms) and [Community Guidelines](https://discord.com/guidelines)."
        }
      ])
      .setFooter({ text: "TOGETHER Community Staff • Respect the Music", iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    const rulesMsgOptions = { embeds: [rulesEmbed] };
    if (rulesBannerBuffer) {
      rulesEmbed.setImage("attachment://rules.gif");
      rulesMsgOptions.files = [new AttachmentBuilder(rulesBannerBuffer, { name: "rules.gif" })];
    }
    await cRules.send(rulesMsgOptions);

    // 2. Bot Guide Embed
    const guideEmbed = new EmbedBuilder()
      .setColor(0x0A84FF)
      .setTitle("📖 TOGETHER MUSIC BOT — GETTING STARTED")
      .setDescription("**TOGETHER** is your premier high-fidelity Discord music bot featuring 24/7 playback, advanced audio filters, and seamless stage channel support.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      .addFields([
        {
          name: "🎵 Essential Playback Commands",
          value: "`/play <song/url>` — Play any track from YouTube, Spotify, Soundcloud, or Apple Music\n`/pause` & `/resume` — Pause or resume the player\n`/skip` — Vote or skip to the next track in queue\n`/stop` — Stop playback and clear the queue\n`/queue` — View upcoming songs in queue\n`/nowplaying` — Display currently playing track with dynamic progress bar"
        },
        {
          name: "🎛️ Audio Filters & Sound Enhancement",
          value: "`/filters bassboost` — Ultra-deep bass amplification\n`/filters nightcore` — High-tempo energetic pitch boost\n`/filters 8d` — Immersive 360° rotating audio experience\n`/filters vaporwave` — Slowed + reverb aesthetic sound\n`/filters clear` — Reset audio to crystal-clear flat EQ"
        },
        {
          name: "📻 24/7 Radio & Lo-Fi Lounge",
          value: "`/247` — Toggle 24/7 persistence so TOGETHER never leaves your voice channel!\n`/autoplay` — Automatically queue recommendations when your playlist ends"
        },
        {
          name: "🎭 Stage Channel Support",
          value: "Invite TOGETHER to your server's Stage Channel! TOGETHER automatically requests to speak and streams live concert-grade audio to all stage listeners."
        }
      ])
      .setFooter({ text: "Type /help in any server to see all 50+ commands", iconURL: client.user.displayAvatarURL() });

    await cGuide.send({ embeds: [guideEmbed] });

    // 3. Vote Embed
    const voteEmbed = new EmbedBuilder()
      .setColor(0xFF2D55)
      .setTitle("⭐ VOTE FOR TOGETHER ON TOP.GG")
      .setDescription("Help TOGETHER grow by voting every 12 hours on Top.gg! Every vote supports the bot and unlocks exclusive voter benefits.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      .addFields([
        {
          name: "🎁 Voter Perks & Rewards",
          value: "• **⭐ Top.gg Voter** hoisted role in this server\n• Access to the private **💎・vip-lounge** channel\n• Double volume boost limit (`/volume up to 200%`)\n• Priority audio buffering & server routing"
        },
        {
          name: "🔗 Direct Vote Link",
          value: "[👉 Click Here to Vote on Top.gg](https://top.gg/bot/1290199946800136192/vote)\n*Voting resets every 12 hours!*"
        }
      ])
      .setFooter({ text: "Thank you for supporting TOGETHER!", iconURL: client.user.displayAvatarURL() });

    await cVote.send({ embeds: [voteEmbed] });

    // 4. Features Showcase Embed
    const featuresEmbed = new EmbedBuilder()
      .setColor(0xFFD600)
      .setTitle("✨ TOGETHER — PREMIUM FEATURE SHOWCASE")
      .setDescription("Explore the cutting-edge features that set TOGETHER apart from all other Discord music bots.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      .addFields([
        {
          name: "⚡ Dedicated Lavalink Architecture",
          value: "Powered by high-capacity standalone Lavalink nodes with 0% stutter, Opus encoding, and lossless streaming."
        },
        {
          name: "📱 Clean Neo-Brutalist Player Controls",
          value: "Interactive buttons for Pause, Skip, Loop, Shuffle, and Volume directly below every track banner."
        },
        {
          name: "🌐 Multi-Platform Source Resolvers",
          value: "Instant URL recognition for Spotify Playlists & Albums, Apple Music, YouTube Music, Deezer, and SoundCloud."
        },
        {
          name: "💾 Custom Server Playlists",
          value: "Save your favorite tracks and load entire server party sets with `/playlist load`."
        }
      ])
      .setFooter({ text: "TOGETHER • High-Fidelity Sound", iconURL: client.user.displayAvatarURL() });

    await cFeatures.send({ embeds: [featuresEmbed] });

    console.log("\n=== COMPLETE SERVER OVERHAUL SUCCESSFUL! ===");
  } catch (err) {
    console.error("Fatal error during server overhaul:", err);
  } finally {
    process.exit(0);
  }
}

client.login(config.token);
client.once("clientReady", run);
