const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  musicSource: {
    type: String,
    enum: ['ytsearch', 'ytmsearch', 'spsearch', 'scsearch', 'dzsearch', 'jssearch'],
    default: 'ytmsearch'
  },
  bio: { type: String, default: "" },
  accentColor: { type: String, default: "#FF1E38" },
  songsPlayed: { type: Number, default: 0 },
  listeningSeconds: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: null },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  anthem: {
    title: { type: String, default: "" },
    artist: { type: String, default: "" },
    uri: { type: String, default: "" },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userPreferencesSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);