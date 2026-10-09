const config = require("../src/config.js");
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const GUILD_ID = "1523598777573970011";
const FFMPEG_PATH = "C:\\Users\\91808\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0.1-full_build\\bin\\ffmpeg.exe";

const rest = new REST({ version: "10" }).setToken(config.token);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildEmojisAndStickers
  ]
});

function generateSnowflake(offset = 0) {
  const epoch = 1420070400000n;
  const now = BigInt(Date.now() + offset) - epoch;
  return ((now << 22n) + 1n).toString();
}

async function uploadStickers(guild) {
  console.log("\n=== 1. UPLOADING STICKERS ===");
  const existingStickers = await guild.stickers.fetch();
  console.log(`Current stickers count: ${existingStickers.size}`);

  const stickerDefs = [
    {
      name: "together_headphones",
      file: "headphones.png",
      tags: "headphones, music, listen",
      description: "TOGETHER Studio Headphones sticker"
    },
    {
      name: "together_fire",
      file: "fire.png",
      tags: "fire, lit, banger",
      description: "This song is straight fire!"
    },
    {
      name: "together_dance",
      file: "dance.png",
      tags: "dance, party, groove",
      description: "Time to dance with TOGETHER"
    },
    {
      name: "together_play",
      file: "play.png",
      tags: "play, start, music",
      description: "Press play on TOGETHER"
    }
  ];

  for (const def of stickerDefs) {
    if (existingStickers.some(s => s.name === def.name)) {
      console.log(`- Sticker "${def.name}" already exists, skipping.`);
      continue;
    }

    try {
      const srcPath = path.join(__dirname, "..", "assets", "emojis", def.file);
      if (!fs.existsSync(srcPath)) {
        console.warn(`File not found: ${srcPath}`);
        continue;
      }

      const canvas = createCanvas(320, 320);
      const ctx = canvas.getContext("2d");
      const img = await loadImage(srcPath);

      // Draw cleanly centered inside 320x320
      ctx.drawImage(img, 20, 20, 280, 280);
      const buffer = canvas.toBuffer("image/png");

      const created = await guild.stickers.create({
        file: buffer,
        name: def.name,
        tags: def.tags,
        description: def.description
      });
      console.log(`+ Created sticker: "${created.name}" (${created.id})`);
    } catch (err) {
      console.error(`x Error creating sticker "${def.name}":`, err.message);
    }
  }
}

async function uploadSoundboards() {
  console.log("\n=== 2. UPLOADING SOUNDBOARDS ===");
  try {
    const existingSounds = await rest.get(Routes.guildSoundboardSounds(GUILD_ID));
    const items = existingSounds.items || existingSounds || [];
    console.log(`Current soundboard sounds count: ${items.length}`);

    const soundDefs = [
      {
        name: "DJ Airhorn",
        emoji_name: "📢",
        filter: "sine=f=466.16:d=0.25,volume=2",
        // Multi-pitch airhorn
        ffmpegGen: `"${FFMPEG_PATH}" -y -f lavfi -i "sine=frequency=466.16:duration=0.15" -f lavfi -i "sine=frequency=466.16:duration=0.15" -f lavfi -i "sine=frequency=466.16:duration=0.3" -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1,volume=2,afade=t=out:st=0.5:d=0.1" -c:a libmp3lame -b:a 128k`
      },
      {
        name: "808 Bass Drop",
        emoji_name: "🔊",
        ffmpegGen: `"${FFMPEG_PATH}" -y -f lavfi -i "sine=frequency=150:duration=1.2" -af "asetrate=44100*0.5,aresample=44100,volume=2.5,afade=t=out:st=1.5:d=0.9" -c:a libmp3lame -b:a 128k`
      },
      {
        name: "Vinyl Scratch",
        emoji_name: "💿",
        ffmpegGen: `"${FFMPEG_PATH}" -y -f lavfi -i "anoisesrc=d=0.35:c=pink:r=44100:a=0.8" -af "bandpass=f=2500:w=1200,volume=3,afade=t=out:st=0.25:d=0.1" -c:a libmp3lame -b:a 128k`
      },
      {
        name: "Victory Chime",
        emoji_name: "✨",
        ffmpegGen: `"${FFMPEG_PATH}" -y -f lavfi -i "sine=frequency=1046.5:duration=0.2" -f lavfi -i "sine=frequency=1318.51:duration=0.2" -f lavfi -i "sine=frequency=1567.98:duration=0.5" -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1,volume=1.5,afade=t=out:st=0.6:d=0.3" -c:a libmp3lame -b:a 128k`
      },
      {
        name: "Bubble Pop",
        emoji_name: "🫧",
        ffmpegGen: `"${FFMPEG_PATH}" -y -f lavfi -i "sine=frequency=950:duration=0.15" -af "volume=2,afade=t=out:st=0.08:d=0.07" -c:a libmp3lame -b:a 128k`
      },
      {
        name: "Party Claps",
        emoji_name: "👏",
        ffmpegGen: `"${FFMPEG_PATH}" -y -f lavfi -i "anoisesrc=d=0.8:c=white:r=44100:a=0.9" -af "bandpass=f=1800:w=1500,volume=2.2,afade=t=out:st=0.5:d=0.3" -c:a libmp3lame -b:a 128k`
      }
    ];

    const tempDir = path.join(__dirname, "temp_audio");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    for (let i = 0; i < soundDefs.length; i++) {
      const def = soundDefs[i];
      if (items.some(s => s.name === def.name)) {
        console.log(`- Sound "${def.name}" already exists, skipping.`);
        continue;
      }

      const outFile = path.join(tempDir, `sound_${i}.mp3`);
      const fullCmd = `${def.ffmpegGen} "${outFile}"`;
      try {
        execSync(fullCmd, { stdio: "ignore" });
        const audioBuffer = fs.readFileSync(outFile);
        const dataUri = `data:audio/mp3;base64,${audioBuffer.toString("base64")}`;

        const created = await rest.post(Routes.guildSoundboardSounds(GUILD_ID), {
          body: {
            name: def.name,
            sound: dataUri,
            volume: 1,
            emoji_name: def.emoji_name
          }
        });
        console.log(`+ Created soundboard sound: "${created.name}" (${created.sound_id}) [${def.emoji_name}]`);
      } catch (err) {
        console.error(`x Error creating sound "${def.name}":`, err.message);
      } finally {
        if (fs.existsSync(outFile)) fs.unlinkSync(outFile);
      }
    }

    if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
  } catch (err) {
    console.error("x Error in soundboard process:", err.message);
  }
}

async function setupOnboarding() {
  console.log("\n=== 3. CONFIGURING GUILD ONBOARDING ===");

  const roleMap = {
    musicLover: "1557614711330177104",      // 🎵 Music Lover
    radioListener: "1557614715566555186",   // 📻 24/7 Listener
    dj: "1557614703453147226",              // 🎧 DJ
    stageSpeaker: "1557614707953893376",    // 🎙️ Stage Speaker
    supporter: "1537603712380440659",       // 💖 Supporter
    announcements: "1557614713213550725",   // 🔔 Announcements Ping
    bugHunter: "1537603674778378252"        // 🐛 Bug Hunter
  };

  const defaultChannels = [
    "1557555353040846898", // rules
    "1523598779121406004", // general
    "1524235256339890327", // vote
    "1553388689164472340", // ・bot-commands
    "1553388704544989306", // ・bot-guide
    "1553388717409050734", // ・features
    "1553388734152712314"  // ・setup-guide
  ];

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
            role_ids: [roleMap.musicLover],
            channel_ids: []
          },
          {
            id: generateSnowflake(102),
            title: "24/7 Radio & Lo-Fi Streams",
            description: "Endless relaxing lo-fi, synthwave, and radio streams",
            emoji: { name: "📻" },
            role_ids: [roleMap.radioListener],
            channel_ids: []
          },
          {
            id: generateSnowflake(103),
            title: "DJ & Voice Host",
            description: "Queue tracks, adjust volume, and apply audio effects",
            emoji: { name: "🎧" },
            role_ids: [roleMap.dj],
            channel_ids: []
          },
          {
            id: generateSnowflake(104),
            title: "Stage Channel Speaker",
            description: "Participate and speak in TOGETHER live stage channels",
            emoji: { name: "🎙️" },
            role_ids: [roleMap.stageSpeaker],
            channel_ids: []
          },
          {
            id: generateSnowflake(105),
            title: "Community Supporter & Fan",
            description: "Support bot development, suggest features & feedback",
            emoji: { name: "💖" },
            role_ids: [roleMap.supporter],
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
            role_ids: [roleMap.announcements],
            channel_ids: []
          },
          {
            id: generateSnowflake(202),
            title: "Beta Testing & Bug Hunting",
            description: "Help test new commands and find bugs early",
            emoji: { name: "🐛" },
            role_ids: [roleMap.bugHunter],
            channel_ids: []
          }
        ],
        single_select: false,
        required: false,
        in_onboarding: true,
        type: 0
      }
    ],
    default_channel_ids: defaultChannels,
    enabled: true,
    mode: 0
  };

  try {
    const updated = await rest.put(Routes.guildOnboarding(GUILD_ID), {
      body: onboardingPayload
    });
    console.log(`+ Onboarding configured and ENABLED successfully!`);
    console.log(`  - Enabled: ${updated.enabled}`);
    console.log(`  - Prompts Count: ${updated.prompts.length}`);
    console.log(`  - Default Channels: ${updated.default_channel_ids.length}`);
  } catch (err) {
    console.error("x Error setting up onboarding:", err.message, err.rawError);
  }
}

async function run() {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    console.log(`Connected to Guild: ${guild.name} (${guild.id})`);

    await uploadStickers(guild);
    await uploadSoundboards();
    await setupOnboarding();

    console.log("\n=== PART 2 ALL TASKS FINISHED! ===");
  } catch (err) {
    console.error("Fatal error:", err);
  } finally {
    process.exit(0);
  }
}

client.login(config.token);
client.once("clientReady", run);
