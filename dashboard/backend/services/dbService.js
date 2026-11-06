const path = require("path");
const config = require("../config");

// Ensure we load the EXACT same Mongoose instance that src/schema models are registered on
let mongoose;
try {
  const rootMongoosePath = path.resolve(__dirname, "../../../node_modules/mongoose");
  mongoose = require(rootMongoosePath);
} catch {
  mongoose = require("mongoose");
}

// Load existing bot models from root schemas
const schemaDir = path.resolve(__dirname, "../../../src/schema");

const TwoFourSeven = require(path.join(schemaDir, "247.js"));
const UserPreferences = require(path.join(schemaDir, "userpreferences.js"));
const PlaylistLibrary = require(path.join(schemaDir, "playlist.js"));
const Liked = require(path.join(schemaDir, "liked.js"));
const Setup = require(path.join(schemaDir, "setup.js"));
const Prefix = require(path.join(schemaDir, "prefix.js"));
const Blacklist = require(path.join(schemaDir, "blacklist.js"));
const DJRole = require(path.join(schemaDir, "djrole.js"));

mongoose.set("autoIndex", false);
mongoose.set("strictQuery", false);

let connectPromise = null;

mongoose.connection.on("connected", () => {
  console.log("[Dashboard DB] Connected to existing TOGETHER MongoDB successfully.");
});

mongoose.connection.on("error", (err) => {
  console.error("[Dashboard DB Error]", err.message);
  connectPromise = null;
});

mongoose.connection.on("disconnected", () => {
  console.warn("[Dashboard DB] Connection lost. Will reconnect on next query.");
  connectPromise = null;
});

async function initMongo() {
  if (mongoose.connection.readyState === 1) return true;
  if (!config.mongoUri) {
    console.warn("[Dashboard DB] Warning: MONGODB_URL is not configured.");
    return false;
  }
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    try {
      await mongoose.connect(config.mongoUri, {
        connectTimeoutMS: 15000,
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 5000,
        family: 4
      });
      return true;
    } catch (err) {
      console.error("[Dashboard DB Init Error]", err.message);
      connectPromise = null;
      return false;
    }
  })();

  return connectPromise;
}

async function ensureConnected() {
  if (mongoose.connection.readyState === 1) return true;
  return initMongo();
}

module.exports = {
  mongoose,
  initMongo,
  ensureConnected,
  TwoFourSeven,
  UserPreferences,
  PlaylistLibrary,
  Liked,
  Setup,
  Prefix,
  Blacklist,
  DJRole
};
