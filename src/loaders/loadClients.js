const fs = require("fs");
const path = require("path");
const { safeEventHandler } = require("../utils/safeEvent");

module.exports = (client) => {
  const eventsRoot = path.join(__dirname, "../events");
  let totalEvents  = 0;

  // Load only client-level event directories (exclude Node and Players which have dedicated loaders)
  const subDirs = fs.readdirSync(eventsRoot).filter((d) =>
    fs.statSync(path.join(eventsRoot, d)).isDirectory() && !["Node", "Players"].includes(d)
  );

  for (const dir of subDirs) {
    const dirPath = path.join(eventsRoot, dir);
    const files   = fs.readdirSync(dirPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      try {
        const event    = require(path.join(dirPath, file));
        const register = event.once ? "once" : "on";
        client[register](event.name, safeEventHandler(client, dir, event));
        totalEvents++;
      } catch (err) {
        client.logger?.log(`[Loader] Failed to load event ${dir}/${file}: ${err.message}`, "error");
      }
    }
  }

  client.logger.log(`Events Loaded: ${totalEvents}`, "event");
};
