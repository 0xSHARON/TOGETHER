const { refreshNowPlayingMessage } = require("./playerStart");
const { syncVoiceChannelStatus } = require("../../utils/voiceChannelStatus");

module.exports = {
  name: "playerCreate",
  run: async (client, player) => {
    if (!player.data) player.data = new Map();
    if (!player.data.get("volumeUiHook")) {
      const setVolume = player.setVolume.bind(player);
      player.setVolume = async (volume) => {
        const result = await setVolume(volume);
        await refreshNowPlayingMessage(client, player);
        return result;
      };
      player.data.set("volumeUiHook", true);
    }

    const track = player.queue?.current;
    await syncVoiceChannelStatus(client, player, {
      track,
      state: track ? "playing" : "idle",
    });

    try {
      const { EmbedBuilder } = require("discord.js");
      const { sendWebhook } = require("../../utils/webhooks");
      const guild = client.guilds.cache.get(player.guildId);

      client.logger?.log(
        `[PLAYER] Session created for guild "${guild?.name || player.guildId}" (voice: ${player.voiceId}, text: ${player.textId}, node: ${player.node?.name || "Auto"})`,
        "event"
      );

      const embed = new EmbedBuilder()
        .setColor(client.color || "#35C47C")
        .setAuthor({
          name: `${client.user?.username || "TOGETHER"} • Player Lifecycle`,
          iconURL: client.user?.displayAvatarURL({ dynamic: true }),
        })
        .setTitle("🎵 Music Player Started")
        .setThumbnail(guild?.iconURL({ dynamic: true }) || client.user?.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `**${client.emoji?.check || "✅"} New Voice Player Initialized**\n\n` +
          `**${client.emoji?.dot || "•"} Server:** \`${guild?.name || "Unknown"} | ${player.guildId}\`\n` +
          `**${client.emoji?.dot || "•"} Voice Channel:** <#${player.voiceId}> (\`${player.voiceId}\`)\n` +
          `**${client.emoji?.dot || "•"} Text Channel:** <#${player.textId}> (\`${player.textId}\`)\n` +
          `**${client.emoji?.dot || "•"} Lavalink Node:** \`${player.node?.name || "Auto"}\`\n` +
          `**${client.emoji?.dot || "•"} Active Sessions:** \`${client.manager?.players?.size || 1}\`\n` +
          `**${client.emoji?.dot || "•"} Created At:** <t:${Math.floor(Date.now() / 1000)}:F> (<t:${Math.floor(Date.now() / 1000)}:R>)`
        )
        .setFooter({
          text: `${client.user?.username || "TOGETHER"} • Player Session Logger`,
          iconURL: client.user?.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp();

      await sendWebhook(client, "player_create", { embeds: [embed] }).catch(() => {});
    } catch {}
  },
};
