const { prefix } = require("../../config.js");
const { ActivityType, REST, Routes, ChannelType } = require("discord.js");
const { syncApplicationEmojis } = require("../../utils/applicationEmojis");

module.exports = {
  name: "clientReady",
  run: async (client) => {
    const fs = require("fs");
    const path = require("path");
    const crypto = require("crypto");

    // Asynchronously sync emojis in background without blocking startup
    client.emojiReady = syncApplicationEmojis(client).catch((error) => {
      client.logger.log(`[Emoji sync] ${error.message}`, "error");
    });

    client.logger.log(`${client.user.username} is now online.`, "ready");
    client.logger.log(
      `Ready on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users`,
      "ready",
    );

    if (client.slashCommands.size > 0) {
      try {
        const commands = Array.from(client.slashCommands.values()).map((cmd) => {
          const commandData = {
            name: cmd.name,
            description: cmd.description,
            options: cmd.options || [],
          };

          if (cmd.owner) {
            commandData.default_member_permissions = "8";
            commandData.dm_permission = false;
          }

          return commandData;
        });

        const currentHash = crypto.createHash("md5").update(JSON.stringify(commands)).digest("hex");
        const cacheDir = path.join(__dirname, "../../../.cache");
        const hashFile = path.join(cacheDir, "commands_hash.txt");

        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }

        const savedHash = fs.existsSync(hashFile) ? fs.readFileSync(hashFile, "utf-8").trim() : "";

        if (savedHash === currentHash && !process.env.FORCE_DEPLOY) {
          client.logger.log(`[CMD] Slash commands verified from cache (${commands.length} global commands active).`, "cmd");
        } else {
          const rest = new REST({ version: "10" }).setToken(client.token);
          client.logger.log(`Deploying ${commands.length} slash commands...`, "cmd");

          // Deploy globally
          await rest.put(Routes.applicationCommands(client.user.id), {
            body: commands,
          });
          client.logger.log(`Successfully deployed ${commands.length} global slash commands.`, "cmd");

          fs.writeFileSync(hashFile, currentHash, "utf-8");
        }
      } catch (error) {
        console.error("Error deploying slash commands:", error);
      }
    } else {
      console.log("\nWARNING: No slash commands to deploy! client.slashCommands.size = 0\n");
    }

    client.user.setPresence({
      activities: [{
        name: "/help | 🎵 Music Bot",
        type: ActivityType.Competing,
      }],
      status: "online",
    });

    // Initialize Audio Live Status Monitor & Alerts
    try {
      const { initAudioStatus } = require("../../utils/lavalinkStatusMonitor");
      initAudioStatus(client);
    } catch (err) {
      client.logger?.log(`Failed to initialize AudioStatus: ${err.message}`, "warn");
    }

    // Initialize all log threads and real-time console streamer
    try {
      const { initAllLogThreads } = require("../../utils/webhooks");
      const consoleStreamer = require("../../utils/consoleStreamer");
      await initAllLogThreads(client);
      consoleStreamer.init(client);
    } catch (err) {
      client.logger?.log(`Failed to initialize Log Threads: ${err.message}`, "warn");
    }

    // Initialize Top.gg Vote System (notifies channel 1524235256339890327)
    try {
      const { initVoteSystem } = require("../../utils/voteNotifier");
      initVoteSystem(client);
    } catch (err) {
      client.logger?.log(`Failed to initialize Vote System: ${err.message}`, "warn");
    }

    // Initialize 3D Audio Visualizer & Stage Web Server
    try {
      const { startVisualizerServer } = require("../../utils/visualizerServer");
      const isClusterZero = !client.cluster || client.cluster.id === 0;
      if (isClusterZero) {
        startVisualizerServer(client);
      }
    } catch (err) {
      client.logger?.log(`Failed to initialize 3D Visualizer Server: ${err.message}`, "warn");
    }


    try {
      setTimeout(async () => {
        try {
          const TwoFourSeven = require("../../schema/247");
          const entries = await TwoFourSeven.find();
          if (!entries || entries.length === 0) {
            return;
          }

          const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

          for (const data of entries) {
            try {
              const text = client.channels.cache.get(data.TextId);
              const voice = client.channels.cache.get(data.VoiceId);
              if (!text || !voice) continue;

              const guild = voice.guild;
              const me = guild.members.cache.get(client.user.id);
              if (!me) continue;
              const isStage = voice.type === ChannelType.GuildStageVoice;
              const perms = voice.permissionsFor(me);
              const requiredPerms = isStage ? ["Connect"] : ["Connect", "Speak"];
              if (!perms || !perms.has(requiredPerms)) continue;

              let player = client.manager.players.get(data.Guild);
              if (!player) {
                try {
                  player = await client.manager.createPlayer({
                    guildId: data.Guild,
                    voiceId: data.VoiceId,
                    textId: data.TextId,
                    deaf: !isStage,
                    volume: 80,
                    shardId: guild.shardId ?? 0,
                  });
                  client.voiceHealthMonitor?.startMonitoring(player);
                  client.logger.log(
                    `Auto Reconnect (clientReady): joined ${voice.name} in ${guild.name}`,
                    "ready"
                  );
                } catch (e) {
                  client.logger.log(
                    `Auto Reconnect (clientReady) failed for guild ${data.Guild}: ${e.message || e}`,
                    "warn"
                  );
                }
                await sleep(300);
              }
            } catch {}
          }
        } catch {}
      }, 5000);
    } catch {}
  },
};

