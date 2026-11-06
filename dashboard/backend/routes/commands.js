const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

let cachedCommands = null;
let lastLoadedTime = 0;

const TOPGG_VOTE_URL = process.env.TOPGG_VOTE_URL || "https://top.gg/bot/863496211667484676/vote";

const dspFilters = [
  { name: "8D Audio", desc: "Spatial 360-degree rotating stereo immersion" },
  { name: "BassBoost", desc: "Low-end frequency amplification (+15dB punch)" },
  { name: "Deep Bass", desc: "Sub-woofer sub-bass resonance for hip-hop & EDM" },
  { name: "Treble Boost", desc: "High-frequency brightening for vocals and acoustic" },
  { name: "NightCore", desc: "High-tempo pitch elevation (+25% speed, +2 semitones)" },
  { name: "Daycore", desc: "Sub-pitch tempo decelerator (-15% speed)" },
  { name: "Slowed + Reverb", desc: "Atmospheric cathedral echo with slowed tempo" },
  { name: "Vaporwave", desc: "Nostalgic lo-fi vintage pitch-drift tape flutter" },
  { name: "Chipmunk", desc: "Extreme pitch shift with high vocal register" },
  { name: "Karaoke", desc: "Center channel phase cancellation to suppress lead vocals" },
  { name: "Soft", desc: "Low-pass smoothing filter to eliminate ear fatigue" },
  { name: "China", desc: "Traditional pentatonic harmonic frequency coloring" },
  { name: "Vibrato", desc: "Periodic pitch modulation vibrato wave effect" },
  { name: "Reset Filters", desc: "Restore standard studio lossless flat response" }
];

function loadAllCommands() {
  const commandsPath = path.join(__dirname, "../../../src/commands");
  if (!fs.existsSync(commandsPath)) {
    return [];
  }

  const allCmds = [];
  const dirs = fs.readdirSync(commandsPath);

  dirs.forEach((dir) => {
    // Exclude Owner directory completely from public commands
    if (dir.toLowerCase() === "owner") return;

    const dirPath = path.join(commandsPath, dir);
    if (!fs.statSync(dirPath).isDirectory()) return;

    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".js"));
    files.forEach((file) => {
      try {
        const filePath = path.join(dirPath, file);
        delete require.cache[require.resolve(filePath)];
        const cmd = require(filePath);

        // Double check owner flag
        if (cmd.owner === true || (cmd.category && cmd.category.toLowerCase() === "owner")) {
          return;
        }

        // Normalize category
        let category = cmd.category || dir;
        if (dir.toLowerCase() === "filters" || cmd.name === "filter") {
          category = "Filters";
        }

        allCmds.push({
          name: cmd.name,
          category: category,
          description: cmd.description || "No description provided.",
          aliases: Array.isArray(cmd.aliases) ? cmd.aliases : [],
          slashOptions: Array.isArray(cmd.slashOptions)
            ? cmd.slashOptions.map((opt) => ({
                name: opt.name,
                description: opt.description || "",
                required: !!opt.required,
                type: opt.type,
                choices: opt.choices || []
              }))
            : [],
          voterOnly: !!cmd.voterOnly,
          owner: false,
          userPerms: Array.isArray(cmd.userPerms) ? cmd.userPerms : [],
          botPerms: Array.isArray(cmd.botPerms) ? cmd.botPerms : [],
          inVoiceChannel: !!cmd.inVoiceChannel,
          sameVoiceChannel: !!cmd.sameVoiceChannel,
          cooldown: cmd.cooldown || 0,
          hasSlash: !!(cmd.slashExecute || cmd.slashOptions || cmd.options),
          hasPrefix: typeof cmd.execute === "function" || typeof cmd.run === "function"
        });
      } catch (err) {
        console.error(`[CommandsRoute] Failed to load ${dir}/${file}:`, err.message);
      }
    });
  });

  return allCmds.sort((a, b) => a.name.localeCompare(b.name));
}

// GET /api/commands
router.get("/", (req, res) => {
  const now = Date.now();
  // Cache for 60 seconds
  if (!cachedCommands || now - lastLoadedTime > 60000) {
    cachedCommands = loadAllCommands();
    lastLoadedTime = now;
  }

  // Calculate public command stats
  const total = cachedCommands.length;
  const slashCount = cachedCommands.filter((c) => c.hasSlash).length;
  const prefixCount = cachedCommands.filter((c) => c.hasPrefix).length;
  const voterOnlyCount = cachedCommands.filter((c) => c.voterOnly).length;

  const categoriesSet = new Set(cachedCommands.map((c) => c.category));
  const categories = Array.from(categoriesSet).sort();

  const byCategory = {};
  categories.forEach((cat) => {
    byCategory[cat] = cachedCommands.filter((c) => c.category === cat).length;
  });

  res.json({
    commands: cachedCommands,
    categories,
    dspFilters,
    topggVoteUrl: TOPGG_VOTE_URL,
    stats: {
      total,
      slashCount,
      prefixCount,
      voterOnlyCount,
      byCategory
    }
  });
});

module.exports = router;
