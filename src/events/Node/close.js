const AudioFailoverManager = require("../../utils/lavalinkFailover");
const { getAudioStatusMonitor } = require("../../utils/lavalinkStatusMonitor");

module.exports = {
  name: "close",
  run: async (client, name, code, reason) => {
    if (code && code.toString().includes('ETIMEDOUT')) {
      return;
    }

    client.logger.log(
      `[AudioEngine] Node "${name}" closed (Code: ${code}, Reason: ${reason || "No reason"})`,
      "warn",
    );

    const monitor = getAudioStatusMonitor() || client.audioStatusMonitor || client.lavalinkStatusMonitor;
    if (monitor) {
      await monitor.handleNodeDown(name, `Closed (Code ${code || "Unknown"}: ${reason || "No reason"})`);
    }

    try {
      await AudioFailoverManager.failoverAllPlayersOnNode(
        client,
        name,
        `Node Closed (${code}: ${reason || "No reason"})`
      );
    } catch {}
  },
};
