const lastErrorTime = new Map();
const ERROR_THROTTLE_MS = 60000;

module.exports = {
  name: "error",
  run: async (client, name, error) => {
    const errorKey = `${name}_${error.code || error.message}`;
    const now = Date.now();
    const lastTime = lastErrorTime.get(errorKey) || 0;

    if (error.code === 'ETIMEDOUT' || error.message?.includes('ETIMEDOUT')) {
      if (now - lastTime < ERROR_THROTTLE_MS) {
        return;
      }
      lastErrorTime.set(errorKey, now);
      client.logger.log(`[AudioEngine] Node "${name}" connection timeout (will retry automatically)`, "warn");
      return;
    }

    client.logger.log(`[AudioEngine] Node "${name}" error: ${error?.message || error}`, "error");

    const AudioFailoverManager = require("../../utils/lavalinkFailover");
    const { getAudioStatusMonitor } = require("../../utils/lavalinkStatusMonitor");

    if (error && error.message && (error.message.includes('Session not found') || error.message.includes('429') || error.message.includes('ECONNREFUSED'))) {
      client.logger.log(`[AudioEngine] Critical error on node "${name}", triggering mid-song failover for affected players...`, "warn");
      const monitor = getAudioStatusMonitor() || client.audioStatusMonitor || client.lavalinkStatusMonitor;
      if (monitor) {
        monitor.handleNodeDown(name, error.message || "Node Error").catch(() => {});
      }
      AudioFailoverManager.failoverAllPlayersOnNode(client, name, error.message || "Node Error").catch(() => {});
    }
  },
};
