const AudioFailoverManager = require("../../utils/lavalinkFailover");
const { getAudioStatusMonitor } = require("../../utils/lavalinkStatusMonitor");

module.exports = {
  name: "disconnect",
  run: async (client, name, players, moved) => {
    client.logger.log(`[AudioEngine] Node "${name}" disconnected. Checking players for mid-song recovery...`, "warn");

    const monitor = getAudioStatusMonitor() || client.audioStatusMonitor || client.lavalinkStatusMonitor;
    if (monitor) {
      await monitor.handleNodeDown(name, "Node Disconnected");
    }

    if (moved) return;

    try {
      await AudioFailoverManager.failoverAllPlayersOnNode(client, name, "Node Disconnected");
    } catch (err) {
      client.logger.log(`[FAILOVER ERROR] Failover failed on node "${name}" disconnect: ${err.message}`, "error");
    }
  },
};
