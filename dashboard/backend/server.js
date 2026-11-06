const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const config = require("./config");
const { initMongo } = require("./services/dbService");

// Route handlers
const authRoutes = require("./routes/auth");
const guildRoutes = require("./routes/guilds");
const playerRoutes = require("./routes/player");
const configRoutes = require("./routes/config");
const xpRoutes = require("./routes/xp");
const ownerRoutes = require("./routes/owner");

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: [config.frontendUrl, "http://localhost:5173"],
    credentials: true
  }
});

app.set("io", io);

// Middleware
app.use(cors({
  origin: [config.frontendUrl, "http://localhost:5173"],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: "Too many requests. Please slow down." }
});
app.use("/api/", apiLimiter);

// Connect to existing MongoDB
initMongo();

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/guilds", guildRoutes);
app.use("/api/player", playerRoutes);
app.use("/api/config", configRoutes);
app.use("/api/xp", xpRoutes);
app.use("/api/owner", ownerRoutes);

// Public Bot Metadata Endpoint
app.get("/api/overview", async (req, res) => {
  const botBridge = require("./services/botBridge");
  const botInfo = await botBridge.getBotInfo();
  const sessions = await botBridge.getActiveSessions();
  res.json({
    bot: botInfo?.bot || {},
    activePlayers: sessions.length,
    activeSessions: sessions
  });
});

// Socket.IO Guild Room Synchronization
io.use((socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) return next();

  try {
    const match = cookieHeader.match(/together_token=([^;]+)/);
    if (match && match[1]) {
      const decoded = jwt.verify(match[1], config.jwtSecret);
      socket.user = decoded;
    }
  } catch {}
  next();
});

io.on("connection", (socket) => {
  socket.on("joinGuild", (guildId) => {
    if (!guildId) return;
    socket.join(`guild:${guildId}`);
  });

  socket.on("leaveGuild", (guildId) => {
    if (!guildId) return;
    socket.leave(`guild:${guildId}`);
  });
});

// Boot Server
server.listen(config.port, () => {
  console.log(`[TOGETHER Dashboard Backend] Neo-Brutalist API running on http://127.0.0.1:${config.port}`);
});

