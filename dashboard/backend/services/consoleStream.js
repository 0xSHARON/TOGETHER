/**
 * consoleStream.js — Intercepts Dashboard Backend stdout/stderr
 * and streams colorized log batches to Discord thread 🌐・dashboard-logs
 */

const botBridge = require("./botBridge");

let originalStdoutWrite = null;
let originalStderrWrite = null;
let logBuffer = [];
let flushTimer = null;
let isFlushing = false;

function cleanAnsi(text) {
  // Return clean text without breaking formatting
  return typeof text === "string" ? text : String(text || "");
}

function queueLog(line, isError = false) {
  if (isFlushing) return; // Prevent recursive loops when sending http request
  if (!line || typeof line !== "string") return;

  const trimmed = line.trim();
  if (!trimmed) return;

  // Filter out excessive internal noise
  if (trimmed.includes("/api/dashboard-log")) return;

  const time = new Date().toTimeString().split(" ")[0];
  const prefix = isError ? `\u001b[31m[DASH-ERR ${time}]\u001b[0m` : `\u001b[32m[DASH ${time}]\u001b[0m`;

  logBuffer.push(`${prefix} ${trimmed}`);

  // Auto flush if buffer exceeds 1200 characters
  const totalLength = logBuffer.reduce((acc, l) => acc + l.length, 0);
  if (totalLength >= 1200) {
    flushLogs();
  }
}

async function flushLogs() {
  if (isFlushing || logBuffer.length === 0) return;
  isFlushing = true;

  const batch = logBuffer.splice(0, logBuffer.length);
  const text = batch.join("\n");

  try {
    const hasError = text.includes("DASH-ERR") || text.includes("Error:") || text.includes("Exception");
    await botBridge.sendDashboardLog({
      event: "CONSOLE",
      isConsole: true,
      action: "Dashboard Backend Console Stream",
      details: text,
      color: hasError ? "#FF3366" : "#00E676"
    });
  } catch {
    // Non-blocking
  } finally {
    isFlushing = false;
  }
}

function initConsoleStream() {
  if (originalStdoutWrite) return; // Already initialized

  originalStdoutWrite = process.stdout.write.bind(process.stdout);
  originalStderrWrite = process.stderr.write.bind(process.stderr);

  process.stdout.write = function (chunk, encoding, callback) {
    try {
      queueLog(chunk.toString(encoding || "utf8"), false);
    } catch {}
    return originalStdoutWrite(chunk, encoding, callback);
  };

  process.stderr.write = function (chunk, encoding, callback) {
    try {
      queueLog(chunk.toString(encoding || "utf8"), true);
    } catch {}
    return originalStderrWrite(chunk, encoding, callback);
  };

  // Periodic flush every 4 seconds
  flushTimer = setInterval(flushLogs, 4000);
  if (flushTimer.unref) flushTimer.unref();

  console.log("[ConsoleStream] Dashboard backend console streaming initialized -> 🌐・dashboard-logs");
}

module.exports = {
  initConsoleStream,
  flushLogs
};
