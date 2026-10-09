module.exports = {
  name: "playerEmpty",
  run: async (client, player) => {
    console.log(`Queue empty in guild: ${player.guildId}`);
    try {
      const { attemptAutoplay } = require("../../utils/playerUtils");
      await attemptAutoplay(client, player);
    } catch (e) {
      client.logger?.log(`[Autoplay] playerEmpty hook error: ${e.message}`, "error");
    }
    if (!player.queue?.current && !player.playing) {
      const { syncVoiceChannelStatus } = require("../../utils/voiceChannelStatus");
      await syncVoiceChannelStatus(client, player, { state: "idle" });

      try {
        const { EmbedBuilder } = require("discord.js");
        const { sendWebhook } = require("../../utils/webhooks");
        const guild = client.guilds.cache.get(player.guildId);

        client.logger?.log(
          `[PLAYER] Session ended / empty for guild "${guild?.name || player.guildId}"`,
          "event"
        );

        const embed = new EmbedBuilder()
          .setColor("#ED4245")
          .setAuthor({
            name: `${client.user?.username || "TOGETHER"} • Player Lifecycle`,
            iconURL: client.user?.displayAvatarURL({ dynamic: true }),
          })
          .setTitle("⏹️ Music Player Stopped")
          .setThumbnail(guild?.iconURL({ dynamic: true }) || client.user?.displayAvatarURL({ dynamic: true }))
          .setDescription(
            `**${client.emoji?.cross || "🔴"} Voice Player Inactive / Empty**\n\n` +
            `**${client.emoji?.dot || "•"} Server:** \`${guild?.name || "Unknown"} | ${player.guildId}\`\n` +
            `**${client.emoji?.dot || "•"} Voice Channel:** <#${player.voiceId}>\n` +
            `**${client.emoji?.dot || "•"} Status:** \`Queue finished • Idle timeout\`\n` +
            `**${client.emoji?.dot || "•"} Active Sessions:** \`${Math.max(0, (client.manager?.players?.size || 1) - 1)}\`\n` +
            `**${client.emoji?.dot || "•"} Ended At:** <t:${Math.floor(Date.now() / 1000)}:F> (<t:${Math.floor(Date.now() / 1000)}:R>)`
          )
          .setFooter({
            text: `${client.user?.username || "TOGETHER"} • Player Session Logger`,
            iconURL: client.user?.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        await sendWebhook(client, "player_delete", { embeds: [embed] }).catch(() => {});
      } catch {}
    }
  },
};
