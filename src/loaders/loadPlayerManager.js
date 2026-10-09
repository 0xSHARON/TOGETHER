const NativePlayerManager = require("../structures/NativePlayerManager");

module.exports = function loadPlayerManager(client) {
  const manager = new NativePlayerManager(client);
  client.manager = manager;

  client.logger?.log("[AudioEngine] Native TOGETHER Audio Engine initialized", "ready");
  return manager;
};