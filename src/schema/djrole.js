const mongoose = require("mongoose");

const djRoleSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  roleId: { type: String, required: true },
  mode: { type: Boolean, default: true }, // true = DJ mode enabled
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("djroles", djRoleSchema);

