const path = require("path");

module.exports = {
  apps: [
    {
      name: "together-dashboard-api",
      script: "dashboard/backend/server.js",
      cwd: path.resolve(__dirname),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        DASHBOARD_PORT: "5080"
      }
    }
  ]
};

