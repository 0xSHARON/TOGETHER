const path = require("path");
const mongoose = require("mongoose");
const config = require("../config");

// Load existing bot models from root schemas
const schemaDir = path.resolve(__dirname, "../../../src/schema");

const TwoFourSeven = require(path.join(schemaDir, "247.js"));
const UserPreferences = require(path.join(schemaDir, "userpreferences.js"));
const PlaylistLibrary = require(path.join(schemaDir, "playlist.js"));
const Liked = require(path.join(schemaDir, "liked.js"));
const Setup = require(path.join(schemaDir, "setup.js"));
const Prefix = require(path.join(schemaDir, "prefix.js"));
const Blacklist = require(path.join(schemaDir, "blacklist.js"));

let isConnected = false;

mongoose.set("bufferCommands", false);
mongoose.set("autoIndex", false);

async function initMongo() {
  if (isConnected || !config.mongoUri) return;
  try {
    await mongoose.connect(config.mongoUri, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 15000,
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log("[Dashboard DB] Connected to existing TOGETHER MongoDB successfully.");
  } catch (err) {
    console.error("[Dashboard DB Error]", err.message);
  }
}

module.exports = {
  initMongo,
  TwoFourSeven,
  UserPreferences,
  PlaylistLibrary,
  Liked,
  Setup,
  Prefix,
  Blacklist
};

