const { getAudioStatusMonitor, getLavalinkStatusMonitor } = require("../../utils/lavalinkStatusMonitor");

module.exports = {
  name: "ready",
  run: async (client, name) => {
    client.logger.log(`[AudioEngine] Node "${name}" connected and ready.`, "ready");
    const monitor = getAudioStatusMonitor?.() || getLavalinkStatusMonitor?.() || client.audioStatusMonitor || client.lavalinkStatusMonitor;
    if (monitor) {
      await monitor.handleNodeReady(name);
    }
  },
};
