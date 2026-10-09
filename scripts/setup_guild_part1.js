const config = require("../src/config.js");
const { Client, GatewayIntentBits, PermissionFlagsBits, Colors } = require("discord.js");

const GUILD_ID = "1523598777573970011";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers
  ]
});

async function run() {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    console.log(`Connecting to guild: ${guild.name} (${guild.id})`);

    // ── 1. ROLES ──
    console.log("Checking and creating roles...");
    const existingRoles = await guild.roles.fetch();
    const roleDefinitions = [
      { name: "🎧 DJ", color: 0xFFD600, reason: "TOGETHER DJ Role", hoist: true },
      { name: "⭐ Top.gg Voter", color: 0xFF2D55, reason: "Voter Recognition Role", hoist: true },
      { name: "🎙️ Stage Speaker", color: 0xBF5AF2, reason: "Stage Channel Speaker Role", hoist: false },
      { name: "🎵 Music Lover", color: 0x2ECC71, reason: "Community Music Role", hoist: false },
      { name: "🔔 Announcements Ping", color: 0x0A84FF, reason: "Notifications Role", hoist: false },
      { name: "📻 24/7 Listener", color: 0xFF9F0A, reason: "Radio Listener Role", hoist: false }
    ];

    const createdRoles = {};
    for (const def of roleDefinitions) {
      let r = existingRoles.find(x => x.name === def.name);
      if (!r) {
        r = await guild.roles.create({
          name: def.name,
          color: def.color,
          hoist: def.hoist,
          reason: def.reason
        });
        console.log(`+ Created role: ${r.name} (${r.id})`);
      } else {
        console.log(`= Existing role: ${r.name} (${r.id})`);
      }
      createdRoles[def.name] = r;
    }

    // ── 2. SERVER SETTINGS ──
    console.log("Updating server settings...");
    try {
      await guild.edit({
        description: "Official Community & Support Server for TOGETHER — The Premier High-Fidelity Discord Music Bot with 24/7 & Stage Channel Support.",
        verificationLevel: 1, // LOW
        defaultMessageNotifications: 1, // ONLY_MENTIONS
        explicitContentFilter: 2, // ALL_MEMBERS
        systemChannel: "1523598779121406004", // general
        rulesChannel: "1557555353040846898", // rules
        publicUpdatesChannel: "1557555353040846901" // moderator-only
      });
      console.log("Server settings updated successfully!");
    } catch (err) {
      console.warn("Server settings edit note:", err.message);
    }

    // ── 3. BOT SERVER PROFILE ──
    console.log("Updating bot guild profile...");
    const me = await guild.members.fetchMe();
    if (me.nickname !== "TOGETHER") {
      try {
        await me.setNickname("TOGETHER");
        console.log("Bot nickname set to TOGETHER!");
      } catch (e) {
        console.warn("Nickname set note:", e.message);
      }
    }

    // ── 4. ACCESS & CHANNEL PERMISSIONS ──
    console.log("Updating channel permissions...");
    const channels = await guild.channels.fetch();

    // Rules channel: read only for @everyone
    const rulesChan = channels.get("1557555353040846898");
    if (rulesChan) {
      await rulesChan.permissionOverwrites.set([
        {
          id: guild.roles.everyone.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
          deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.CreatePublicThreads, PermissionFlagsBits.CreatePrivateThreads]
        }
      ]);
      console.log("Rules channel permissions configured!");
    }

    // Bot commands channel: full send + app commands for @everyone
    const cmdChan = channels.get("1553388689164472340");
    if (cmdChan) {
      await cmdChan.permissionOverwrites.set([
        {
          id: guild.roles.everyone.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.UseApplicationCommands,
            PermissionFlagsBits.EmbedLinks
          ]
        }
      ]);
      console.log("Bot commands channel permissions configured!");
    }

    // Vote channel: read-only for @everyone, reactions allowed
    const voteChan = channels.get("1524235256339890327");
    if (voteChan) {
      await voteChan.permissionOverwrites.set([
        {
          id: guild.roles.everyone.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AddReactions],
          deny: [PermissionFlagsBits.SendMessages]
        }
      ]);
      console.log("Vote channel permissions configured!");
    }

    // Moderator only channel: hidden from @everyone
    const modChan = channels.get("1557555353040846901");
    if (modChan) {
      const adminRole = existingRoles.find(r => r.name.includes("Admin"));
      const modRole = existingRoles.find(r => r.name.includes("Moderator"));
      const overwrites = [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel]
        }
      ];
      if (adminRole) overwrites.push({ id: adminRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
      if (modRole) overwrites.push({ id: modRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
      await modChan.permissionOverwrites.set(overwrites);
      console.log("Moderator-only channel permissions configured!");
    }

    // Stage Channel (1557555568300789821)
    const stageChan = channels.get("1557555568300789821");
    if (stageChan && stageChan.type === 13) {
      const speakerRole = createdRoles["🎙️ Stage Speaker"];
      const overwrites = [
        {
          id: guild.roles.everyone.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.RequestToSpeak]
        }
      ];
      if (speakerRole) {
        overwrites.push({ id: speakerRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] });
      }
      await stageChan.permissionOverwrites.set(overwrites);
      console.log("Stage channel permissions configured!");
    }

    console.log("PART 1 COMPLETE!");
  } catch (err) {
    console.error("Execution error in part 1:", err);
  } finally {
    process.exit(0);
  }
}

client.login(config.token);
client.once("clientReady", run);
