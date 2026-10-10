const { getAudioStatusMonitor, getLavalinkStatusMonitor } = require("../../utils/lavalinkStatusMonitor");

module.exports = {
  name: "ready",
  run: async (client, name) => {
    const nodeName = typeof name === "string" ? name : name?.name || "Native-TOGETHER";
    client.logger.log(`[AudioEngine] Node "${nodeName}" connected and ready.`, "ready");
    const monitor = getAudioStatusMonitor?.() || getLavalinkStatusMonitor?.() || client.audioStatusMonitor || client.lavalinkStatusMonitor;
    if (monitor) {
      await monitor.handleNodeReady(nodeName);
    }
  },
};
