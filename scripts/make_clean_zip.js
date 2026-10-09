const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const STAGING = path.join(ROOT, "_staging_bundle");
const ZIP_FILE = path.join(ROOT, "discord-music-bot.zip");

// Clean previous staging & zip
if (fs.existsSync(STAGING)) {
  fs.rmSync(STAGING, { recursive: true, force: true });
}
if (fs.existsSync(ZIP_FILE)) {
  fs.unlinkSync(ZIP_FILE);
}

fs.mkdirSync(STAGING, { recursive: true });

// Copy file helper
function copyFileSafe(srcRel) {
  const src = path.join(ROOT, srcRel);
  if (fs.existsSync(src)) {
    const dest = path.join(STAGING, srcRel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${srcRel}`);
  }
}

// Copy directory helper with filters
function copyDirRecursive(srcDir, destDir, excludeFilter) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullSrc = path.join(srcDir, entry.name);
    const fullDest = path.join(destDir, entry.name);

    if (excludeFilter && excludeFilter(entry.name, fullSrc)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirRecursive(fullSrc, fullDest, excludeFilter);
    } else {
      fs.copyFileSync(fullSrc, fullDest);
    }
  }
}

console.log("Preparing clean project bundle (only wanted production files)...");

// 1. Root files
const rootFiles = [
  "index.js",
  "run.js",
  "devrock.js",
  "package.json",
  "package-lock.json",
  "start-local.bat",
  "start.sh",
  "README.md",
  "STRUCTURE.md",
  "LICENSE.md",
  ".gitignore",
  ".env",
  ".env.example",
];

for (const file of rootFiles) {
  copyFileSafe(file);
}

// 2. Directories
// src/ - all files
console.log("Copying src/...");
copyDirRecursive(
  path.join(ROOT, "src"),
  path.join(STAGING, "src")
);

// assets/ - all assets
console.log("Copying assets/...");
copyDirRecursive(
  path.join(ROOT, "assets"),
  path.join(STAGING, "assets")
);

// test/ - all tests
console.log("Copying test/...");
copyDirRecursive(
  path.join(ROOT, "test"),
  path.join(STAGING, "test")
);

// scripts/ - only .js scripts, exclude test pngs
console.log("Copying scripts/...");
copyDirRecursive(
  path.join(ROOT, "scripts"),
  path.join(STAGING, "scripts"),
  (name) => name.endsWith(".png") || name.endsWith(".log") || name === "make_clean_zip.js"
);

console.log("\nCompressing to discord-music-bot.zip...");

// Use PowerShell Compress-Archive
const stagingContents = path.join(STAGING, "*");
const psCommand = `powershell -NoProfile -Command "Compress-Archive -Path '${stagingContents}' -DestinationPath '${ZIP_FILE}' -CompressionLevel Optimal -Force"`;

execSync(psCommand, { stdio: "inherit" });

// Remove staging folder
fs.rmSync(STAGING, { recursive: true, force: true });

// Check output size
if (fs.existsSync(ZIP_FILE)) {
  const stats = fs.statSync(ZIP_FILE);
  console.log(`\n✔ Successfully created: discord-music-bot.zip`);
  console.log(`✔ File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size.toLocaleString()} bytes)`);
} else {
  console.error("Failed to create zip file!");
  process.exit(1);
}
