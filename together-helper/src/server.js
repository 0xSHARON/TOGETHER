const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { Ticket, TicketConfig, Warn, StickyMessage, WelcomeConfig, SuggestionConfig, BugReportConfig } = require("./schema");

function initHelperServer(client, port = process.env.PORT || 5090) {
  const app = express();
  app.set("trust proxy", true);

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  // 1. Live Bot & Community Diagnostics
  app.get("/api/stats", async (req, res) => {
    try {
      const [ticketsTotal, ticketsOpen, warnsTotal, stickyTotal] = await Promise.all([
        Ticket.countDocuments().catch(() => 0),
        Ticket.countDocuments({ status: "open" }).catch(() => 0),
        Warn.countDocuments().catch(() => 0),
        StickyMessage.countDocuments({ enabled: true }).catch(() => 0)
      ]);

      const totalMembers = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);

      res.json({
        status: "online",
        bot: {
          tag: client.user?.tag || "TOGETHER HELPER",
          id: client.user?.id,
          avatar: client.user?.displayAvatarURL({ dynamic: true }),
          ping: Math.max(0, Math.round(client.ws.ping || 0)),
          uptime: client.uptime || 0,
          guildsCount: client.guilds.cache.size,
          membersCount: totalMembers,
          commandsCount: client.commands?.size || 0
        },
        counts: {
          ticketsTotal,
          ticketsOpen,
          warnsTotal,
          stickyTotal
        },
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Tickets API
  app.get("/api/tickets", async (req, res) => {
    try {
      const tickets = await Ticket.find().sort({ createdAt: -1 }).limit(50).lean();
      res.json({ tickets });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Moderation Warnings API
  app.get("/api/warnings", async (req, res) => {
    try {
      const warnings = await Warn.find().sort({ createdAt: -1 }).limit(50).lean();
      res.json({ warnings });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Configuration API
  app.get("/api/config", async (req, res) => {
    try {
      const [welcomes, stickies, ticketConfigs] = await Promise.all([
        WelcomeConfig.find().limit(20).lean(),
        StickyMessage.find().limit(20).lean(),
        TicketConfig.find().limit(20).lean()
      ]);
      res.json({ welcomes, stickies, ticketConfigs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Serve React Dashboard SPA Build
  const distPath = path.join(__dirname, "../dashboard/dist");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    // SPA fallback handler
    app.use((req, res, next) => {
      if (req.method === "GET" && !req.path.startsWith("/api/")) {
        return res.sendFile(path.join(distPath, "index.html"));
      }
      next();
    });
  } else {
    app.get("/", (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>TOGETHER HELPER API</title>
          <style>
            body { background: #0A0D14; color: #ECEFF4; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #121722; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 32px 40px; text-align: center; max-width: 480px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
            h1 { margin: 0 0 8px; font-size: 24px; color: #FFF; font-weight: 700; letter-spacing: -0.5px; }
            p { color: #8F9BA8; font-size: 14px; line-height: 1.6; margin: 0 0 20px; }
            .badge { display: inline-block; background: rgba(0, 230, 118, 0.12); color: #00E676; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px; }
            a { color: #5865F2; text-decoration: none; font-weight: 500; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">API Active · Port ${port}</div>
            <h1>TOGETHER HELPER</h1>
            <p>Community, Moderation & Support Desk Microservice Engine.</p>
            <a href="/api/stats">View Live System JSON Stats →</a>
          </div>
        </body>
        </html>
      `);
    });
  }

  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`[Helper Server] Web dashboard & API listening on port ${port}`);
  });

  return { app, server };
}

module.exports = { initHelperServer };
