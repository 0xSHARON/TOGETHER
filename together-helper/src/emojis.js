const emoji = {
  check: "✅",
  cross: "❌",
  info: "ℹ️",
  warn: "⚠️",
  load: "⏳",
  dot: "•",
  star: "⭐",
  lock: "🔒",
  home: "🏠",
  config: "⚙️",
  utility: "🛠️",
  music: "🎵",
  sparkles: "✨",
  headphones: "🎧",
  fire: "🔥"
};

// Inherit custom application emojis if loaded
try {
  const mainEmoji = require("../../src/emojis");
  for (const [k, v] of Object.entries(mainEmoji)) {
    if (v && typeof v === "string" && v.length > 0) {
      emoji[k] = v;
    }
  }
} catch {}

module.exports = emoji;
