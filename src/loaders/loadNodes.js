const fs = require("fs");
const path = require("path");
const { safeEventHandler } = require("../utils/safeEvent");

module.exports = (client) => {
  const nodesPath = path.join(__dirname, "../events/Node");
  let totalEvents = 0;

  if (fs.existsSync(nodesPath) && client.manager?.shoukaku) {
    fs.readdirSync(nodesPath).forEach((file) => {
      const event = require(path.join(nodesPath, file));
      const register = event.once ? "once" : "on";
      client.manager.shoukaku[register](event.name, safeEventHandler(client, "Node", event));
      totalEvents++;
    });
  }

  client.logger.log(`Audio Engine Events Loaded: ${totalEvents}`, "event");
  
  // Signal ready immediately for the native engine
  if (client.manager?.shoukaku) {
    setTimeout(() => {
      client.manager.shoukaku.emit("ready", "Native-TOGETHER", false);
    }, 100);
  }
};
