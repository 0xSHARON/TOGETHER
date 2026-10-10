const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

let cachedYtDlp = null;
let cachedFfmpeg = null;

/**
 * Checks for cookie configuration to bypass YouTube bot detection/429
 * Supports cookies.txt in root or YTDLP_COOKIES env var.
 * @returns {string[]}
 */
function getCookiesArgs() {
  const cookiePath = process.env.YTDLP_COOKIES || path.join(process.cwd(), "cookies.txt");
  if (fs.existsSync(cookiePath)) {
    return ["--cookies", cookiePath];
  }
  return [];
}

/**
 * Ensures yt-dlp binary is available on Linux / Pterodactyl panels.
 * Automatically fetches the official standalone binary if missing.
 */
async function ensureYtDlpBinary() {
  // 1. If explicit path configured or binary exists, no action needed
  if (process.env.YTDLP_PATH && fs.existsSync(process.env.YTDLP_PATH)) {
    return process.env.YTDLP_PATH;
  }

  const binDir = path.join(process.cwd(), "bin");
  const binName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
  const targetPath = path.join(binDir, binName);

  if (fs.existsSync(targetPath)) {
    if (process.platform !== "win32") {
      try { fs.chmodSync(targetPath, 0o755); } catch {}
    }
    return targetPath;
  }

  // 2. Check if yt-dlp is in system PATH
  try {
    const testDirect = spawnSync("yt-dlp", ["--version"], { stdio: "ignore" });
    if (testDirect.status === 0) {
      return "yt-dlp";
    }
  } catch {}

  // 3. Check if python3/python has yt_dlp installed
  const pyList = process.platform === "win32" ? ["python", "py"] : ["python3", "python"];
  for (const py of pyList) {
    try {
      const res = spawnSync(py, ["-m", "yt_dlp", "--version"], { stdio: "ignore" });
      if (res.status === 0) return null; // Python runner will handle it
    } catch {}
  }

  // 4. In Linux / Pterodactyl environments without Python or yt-dlp:
  // Auto-download standalone Linux binary
  try {
    const axios = require("axios");
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }

    const downloadUrl = process.platform === "win32"
      ? "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
      : "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";

    console.log(`[SystemBinary] Auto-downloading standalone yt-dlp binary for Linux / Pterodactyl from GitHub...`);
    const response = await axios({
      method: "GET",
      url: downloadUrl,
      responseType: "stream",
      timeout: 30000,
    });

    const writer = fs.createWriteStream(targetPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    if (process.platform !== "win32") {
      fs.chmodSync(targetPath, 0o755);
    }

    console.log(`[SystemBinary] Successfully installed yt-dlp to: ${targetPath}`);
    cachedYtDlp = { cmd: targetPath, argsPrefix: [] };
    return targetPath;
  } catch (err) {
    console.warn(`[SystemBinary] Notice: Could not auto-download yt-dlp: ${err.message}`);
    return null;
  }
}

/**
 * Resolves the appropriate yt-dlp execution command across Linux (Pterodactyl), macOS, and Windows.
 * @returns {{ cmd: string, argsPrefix: string[] }}
 */
function getYtDlpRunner() {
  if (cachedYtDlp) return cachedYtDlp;

  // 1. Custom ENV override (ideal for Pterodactyl panel environments)
  if (process.env.YTDLP_PATH) {
    cachedYtDlp = { cmd: process.env.YTDLP_PATH, argsPrefix: [] };
    return cachedYtDlp;
  }

  // 2. Direct standalone yt-dlp binary (e.g. ./bin/yt-dlp or /home/container/bin/yt-dlp)
  const localBinary = process.platform === "win32" 
    ? path.join(process.cwd(), "bin", "yt-dlp.exe")
    : path.join(process.cwd(), "bin", "yt-dlp");

  if (fs.existsSync(localBinary)) {
    if (process.platform !== "win32") {
      try { fs.chmodSync(localBinary, 0o755); } catch {}
    }
    cachedYtDlp = { cmd: localBinary, argsPrefix: [] };
    return cachedYtDlp;
  }

  // 3. Test direct command in system PATH
  try {
    const testDirect = spawnSync("yt-dlp", ["--version"], { stdio: "ignore" });
    if (testDirect.status === 0) {
      cachedYtDlp = { cmd: "yt-dlp", argsPrefix: [] };
      return cachedYtDlp;
    }
  } catch {}

  // 4. Platform-specific Python detection
  const pythonCandidates = process.platform === "win32"
    ? ["python", "py", "C:\\Python314\\python.exe", "C:\\Python312\\python.exe", "C:\\Python311\\python.exe"]
    : ["python3", "python", "/usr/bin/python3", "/usr/local/bin/python3"];

  for (const py of pythonCandidates) {
    try {
      const res = spawnSync(py, ["-m", "yt_dlp", "--version"], { stdio: "ignore" });
      if (res.status === 0) {
        cachedYtDlp = { cmd: py, argsPrefix: ["-m", "yt_dlp"] };
        return cachedYtDlp;
      }
    } catch {}
  }

  // 5. Fallback defaults
  if (process.platform === "win32") {
    cachedYtDlp = { cmd: "python", argsPrefix: ["-m", "yt_dlp"] };
  } else {
    // Linux / Pterodactyl container default
    cachedYtDlp = { cmd: "python3", argsPrefix: ["-m", "yt_dlp"] };
  }

  return cachedYtDlp;
}

/**
 * Resolves the ffmpeg command across platforms.
 * Uses @ffmpeg-installer/ffmpeg as built-in zero-config provider.
 * @returns {string}
 */
function getFfmpegPath() {
  if (cachedFfmpeg) return cachedFfmpeg;

  // 1. User env override
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    cachedFfmpeg = process.env.FFMPEG_PATH;
    return cachedFfmpeg;
  }

  // 2. System ffmpeg from PATH (modern Debian/Ubuntu/Windows ffmpeg with TLS 1.3)
  try {
    const testDirect = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
    if (testDirect.status === 0) {
      cachedFfmpeg = "ffmpeg";
      return cachedFfmpeg;
    }
  } catch {}

  // 3. Common Linux / Pterodactyl system binary paths
  const commonLinuxPaths = [
    "/usr/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
    path.join(process.cwd(), "bin", "ffmpeg"),
  ];
  for (const p of commonLinuxPaths) {
    if (fs.existsSync(p)) {
      cachedFfmpeg = p;
      return cachedFfmpeg;
    }
  }

  // 4. Bundled fallback (@ffmpeg-installer/ffmpeg)
  try {
    const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
    if (ffmpegInstaller && ffmpegInstaller.path && fs.existsSync(ffmpegInstaller.path)) {
      cachedFfmpeg = ffmpegInstaller.path;
      return cachedFfmpeg;
    }
  } catch {}

  cachedFfmpeg = "ffmpeg";
  return cachedFfmpeg;
}

module.exports = {
  getYtDlpRunner,
  getFfmpegPath,
  getCookiesArgs,
  ensureYtDlpBinary,
};
