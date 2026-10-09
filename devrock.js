process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('The ready event has been renamed to clientReady')) {
    return;
  }
});
const config = require("./src/config");
const { ClusterManager } = require("discord-hybrid-sharding");
const Logger = require("./src/utils/logger");

try {
  config.validate();
} catch (error) {
  Logger.log(error.message, "error");
  process.exit(1);
}

const manager = new ClusterManager("./index.js", {
  totalShards: "auto",
  shardsPerCluster: 1,
  mode: "process",
  token: config.token,
  respawn: true
});

manager.on("clusterCreate", (cluster) => {
  Logger.system(`Started Cluster #${cluster.id}`);
});

// TOGETHER ASCII Banner
console.log(`
\x1b[36m\x1b[1m  ████████╗ ██████╗  ██████╗ ███████╗████████╗██╗  ██╗███████╗██████╗ 
  ╚══██╔══╝██╔═══██╗██╔════╝ ██╔════╝╚══██╔══╝██║  ██║██╔════╝██╔══██╗
     ██║   ██║   ██║██║  ███╗█████╗     ██║   ███████║█████╗  ██████╔╝
     ██║   ██║   ██║██║   ██║██╔══╝     ██║   ██╔══██║██╔══╝  ██╔══██╗
     ██║   ╚██████╔╝╚██████╔╝███████╗   ██║   ██║  ██║███████╗██║  ██║
     ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝\x1b[0m
\x1b[90m  ──────────────────────────────────────────────────────────────────────\x1b[0m
\x1b[37m\x1b[1m  TOGETHER\x1b[0m \x1b[90m•\x1b[0m \x1b[36mSound that brings us closer\x1b[0m \x1b[90m// High-Fidelity Audio\x1b[0m
\x1b[90m  ──────────────────────────────────────────────────────────────────────\x1b[0m
`);
Logger.ready("System Initialized! Spawning Clusters...");

manager.spawn({ timeout: -1 });
