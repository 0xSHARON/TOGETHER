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

// Auto-start TOGETHER Helper Bot alongside Music Bot
const path = require("path");
const fs = require("fs");
const { fork } = require("child_process");

function startTogetherHelper() {
  const helperScript = path.join(__dirname, "together-helper", "src", "index.js");
  if (!fs.existsSync(helperScript) || process.env.DISABLE_HELPER === "true") return;

  Logger.system("Launching TOGETHER Helper Bot alongside Music Bot...");

  const helperProcess = fork(helperScript, [], {
    cwd: path.join(__dirname, "together-helper"),
    env: { ...process.env },
    stdio: "inherit"
  });

  helperProcess.on("exit", (code, signal) => {
    if (signal === "SIGTERM" || signal === "SIGINT") return;
    Logger.warn(`TOGETHER Helper Bot exited (code: ${code}). Auto-restarting in 5s...`);
    setTimeout(startTogetherHelper, 5000);
  });

  process.on("exit", () => {
    try { helperProcess.kill(); } catch {}
  });
}

startTogetherHelper();

manager.spawn({ timeout: -1 });
