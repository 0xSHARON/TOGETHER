const fs = require("node:fs");
const path = require("node:path");
const { createCanvas } = require("@napi-rs/canvas");

const WIDTH = 1024;
const HEIGHT = 342;

const OUTPUT_ONLINE = path.resolve(__dirname, "../assets/lavalink-online.png");
const OUTPUT_OFFLINE = path.resolve(__dirname, "../assets/lavalink-offline.png");

function drawDiagonalStripes(ctx, x, y, w, h, step = 8, stripeW = 4, color = "#FF1E38") {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = stripeW;
  for (let i = -h; i < w + h; i += step) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + h, y + h);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBarcode(ctx, x, y, w, h, color = "#6C7282") {
  ctx.save();
  ctx.fillStyle = color;
  let curX = x;
  const pattern = [2, 1, 3, 1, 1, 4, 1, 2, 3, 1, 2, 1, 4, 1, 1, 3, 2];
  let i = 0;
  while (curX < x + w && i < 40) {
    const barW = pattern[i % pattern.length];
    const space = (pattern[(i + 2) % pattern.length] % 2) + 1.2;
    if (curX + barW <= x + w) {
      ctx.fillRect(curX, y, barW, h);
    }
    curX += barW + space;
    i++;
  }
  ctx.restore();
}

function renderBanner(isOnline) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // 1. Base dark brutalist obsidian background
  ctx.fillStyle = "#0A0B0E";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 2. Subtle technical grid
  ctx.strokeStyle = "#141720";
  ctx.lineWidth = 1;
  const gridSize = 24;
  for (let x = 0; x <= WIDTH; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke();
  }
  for (let y = 0; y <= HEIGHT; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke();
  }

  // Crosshairs at grid corners
  ctx.fillStyle = "#323748";
  ctx.font = "700 12px monospace";
  ctx.fillText("+", 20, 26);
  ctx.fillText("+", WIDTH - 28, 26);
  ctx.fillText("+", 20, HEIGHT - 18);
  ctx.fillText("+", WIDTH - 28, HEIGHT - 18);

  // Outer framing boundary
  ctx.strokeStyle = "#232634";
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, WIDTH - 32, HEIGHT - 32);

  // Corner brackets
  ctx.strokeStyle = isOnline ? "#1ED760" : "#FF1E38";
  ctx.lineWidth = 3;
  // Top-left
  ctx.beginPath(); ctx.moveTo(16, 36); ctx.lineTo(16, 16); ctx.lineTo(36, 16); ctx.stroke();
  // Top-right
  ctx.beginPath(); ctx.moveTo(WIDTH - 36, 16); ctx.lineTo(WIDTH - 16, 16); ctx.lineTo(WIDTH - 16, 36); ctx.stroke();
  // Bottom-left
  ctx.beginPath(); ctx.moveTo(16, HEIGHT - 36); ctx.lineTo(16, HEIGHT - 16); ctx.lineTo(36, HEIGHT - 16); ctx.stroke();
  // Bottom-right
  ctx.beginPath(); ctx.moveTo(WIDTH - 36, HEIGHT - 16); ctx.lineTo(WIDTH - 16, HEIGHT - 16); ctx.lineTo(WIDTH - 16, HEIGHT - 36); ctx.stroke();

  // ==========================================
  // LEFT PANEL: Core Node Hub (x: 36, y: 36, w: 250, h: 270)
  // ==========================================
  const lx = 36, ly = 36, lw = 250, lh = 270;

  // Hard black shadow
  ctx.fillStyle = "#000000";
  ctx.fillRect(lx + 6, ly + 6, lw, lh);

  // Card Body
  ctx.fillStyle = "#111319";
  ctx.fillRect(lx, ly, lw, lh);

  // Card Border
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.strokeRect(lx, ly, lw, lh);

  // Card Header bar
  ctx.fillStyle = "#181B24";
  ctx.fillRect(lx, ly, lw, 36);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.strokeRect(lx, ly, lw, 36);

  // Header text
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 12px Bahnschrift, Arial Black, sans-serif";
  ctx.fillText("AUDIO ENGINE // 01", lx + 14, ly + 23);

  // Header status dot
  ctx.fillStyle = isOnline ? "#1ED760" : "#FF1E38";
  ctx.beginPath(); ctx.arc(lx + lw - 20, ly + 18, 5, 0, Math.PI * 2); ctx.fill();

  // Visual Graphic inside Left Card (Audio Core / Server Rack)
  const cx = lx + lw / 2;
  const cy = ly + 140;

  // Outer Tech Radar Rings
  ctx.strokeStyle = isOnline ? "#1C3627" : "#361C20";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, 64, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = isOnline ? "#234C34" : "#4C2329";
  ctx.beginPath(); ctx.arc(cx, cy, 48, 0, Math.PI * 2); ctx.stroke();

  // Cross lines
  ctx.strokeStyle = "#252936";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 72, cy); ctx.lineTo(cx + 72, cy);
  ctx.moveTo(cx, cy - 72); ctx.lineTo(cx + 72, cy);
  ctx.stroke();

  // Center Server Core Badge
  ctx.fillStyle = "#0B0C10";
  ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = isOnline ? "#1ED760" : "#FF1E38";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.stroke();

  if (isOnline) {
    // Online: Sound Waves / Audio Node Pulse
    ctx.strokeStyle = "#1ED760";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    // 3 Equalizer Bars inside core
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(cx - 14, cy - 8, 6, 16);
    ctx.fillRect(cx - 3, cy - 16, 6, 32);
    ctx.fillRect(cx + 8, cy - 10, 6, 20);

    // Green pulse rings
    ctx.strokeStyle = "#00F076";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 22, -Math.PI * 0.4, Math.PI * 0.4); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 22, Math.PI * 0.6, Math.PI * 1.4); ctx.stroke();
  } else {
    // Offline: Alert Warning Icon & Disconnect Symbol
    ctx.fillStyle = "#FF1E38";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 18);
    ctx.lineTo(cx + 18, cy + 14);
    ctx.lineTo(cx - 18, cy + 14);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#000000";
    ctx.fillRect(cx - 2, cy - 7, 4, 11);
    ctx.fillRect(cx - 2, cy + 8, 4, 3);
  }

  // Mini Graphic Equalizer at bottom of left panel
  const eqY = ly + lh - 42;
  const eqH = 24;
  const eqW = lw - 28;
  const bars = 16;
  const barW = Math.floor(eqW / (bars * 1.5));
  const gap = Math.floor(barW * 0.5);

  for (let i = 0; i < bars; i++) {
    const pseudo = isOnline
      ? (Math.sin(i * 1.2 + 2) * 0.4 + 0.6)
      : (i % 4 === 0 ? 0.2 : 0.08); // flatlined if offline
    const bHeight = Math.max(3, Math.floor(pseudo * eqH));
    const bx = lx + 14 + i * (barW + gap);
    const by = eqY + eqH - bHeight;

    ctx.fillStyle = isOnline
      ? (i % 3 === 0 ? "#1ED760" : (i % 2 === 0 ? "#FFFFFF" : "#384152"))
      : (i % 4 === 0 ? "#FF1E38" : "#282B36");
    ctx.fillRect(bx, by, barW, bHeight);
  }

  // ==========================================
  // CENTER SECTION: Branding & Information (x: 314, y: 40)
  // ==========================================
  const mx = 314;

  // Top Tag / Breadcrumb
  ctx.fillStyle = "#161922";
  ctx.fillRect(mx, 42, 230, 26);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, 42, 230, 26);

  ctx.fillStyle = isOnline ? "#1ED760" : "#FF1E38";
  ctx.fillRect(mx + 8, 49, 10, 10);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 11px Consolas, monospace";
  ctx.fillText("TOGETHER // NATIVE CORE", mx + 26, 59);

  // Main Header: TOGETHER (White)
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 44px Bahnschrift, Arial Black, sans-serif";
  ctx.fillText("TOGETHER", mx, 114);

  // Main Subheader: AUDIO STATUS
  // Drop shadow
  ctx.fillStyle = "#000000";
  ctx.fillText("AUDIO STATUS", mx + 3, 167);

  // Gradient / Solid color
  ctx.fillStyle = isOnline ? "#1ED760" : "#FF1E38";
  ctx.fillText("AUDIO STATUS", mx, 164);

  // Description copy
  ctx.fillStyle = "#959BAE";
  ctx.font = "500 15px Bahnschrift, 'Segoe UI', sans-serif";
  ctx.fillText("Check the live native audio engine and voice pipeline status", mx, 198);
  ctx.fillText("High-throughput native stream resolution & dispatch engine", mx, 198 + 22);

  // Technical Metadata Badges
  const badgeY = 244;
  function drawTechPill(bx, text, accent) {
    ctx.fillStyle = "#12141C";
    const pw = ctx.measureText(text).width + 20;
    ctx.fillRect(bx, badgeY, pw, 26);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, badgeY, pw, 26);

    ctx.fillStyle = accent || "#757B8E";
    ctx.fillRect(bx, badgeY, 3, 26);

    ctx.fillStyle = "#D6DAE4";
    ctx.font = "700 11px Consolas, monospace";
    ctx.fillText(text, bx + 10, badgeY + 17);
    return pw + 10;
  }

  let curBadgeX = mx;
  curBadgeX += drawTechPill(curBadgeX, "CLUSTER: SHARD-0", "#FFFFFF");
  curBadgeX += drawTechPill(curBadgeX, "ENGINE: NATIVE", "#757B8E");
  curBadgeX += drawTechPill(curBadgeX, isOnline ? "SYS: OPERATIONAL" : "SYS: DISCONNECTED", isOnline ? "#1ED760" : "#FF1E38");

  // Barcode decoration
  drawBarcode(ctx, mx, 282, 130, 16, "#383D4E");
  ctx.fillStyle = "#5E6476";
  ctx.font = "700 10px monospace";
  ctx.fillText("AUDIO.NODE.SYS // 2026", mx + 142, 294);

  // ==========================================
  // RIGHT SECTION: Status Card (x: 742, y: 36, w: 246, h: 270)
  // ==========================================
  const rx = 742, ry = 36, rw = 246, rh = 270;

  // Hard black shadow
  ctx.fillStyle = "#000000";
  ctx.fillRect(rx + 6, ry + 6, rw, rh);

  // Status Card Body
  ctx.fillStyle = isOnline ? "#0D1813" : "#1A0C0E";
  ctx.fillRect(rx, ry, rw, rh);

  // Card Border
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.strokeRect(rx, ry, rw, rh);

  // Top Hazard / Status Stripe Header (height 14)
  if (isOnline) {
    drawDiagonalStripes(ctx, rx, ry, rw, 14, 10, 4, "#1ED760");
  } else {
    drawDiagonalStripes(ctx, rx, ry, rw, 14, 10, 4, "#FF1E38");
  }

  // Status Icon & Main Status Label
  const statusCenterX = rx + rw / 2;

  // Pulsing Dot / Beacon
  const beaconY = ry + 70;
  ctx.fillStyle = isOnline ? "rgba(30, 215, 96, 0.2)" : "rgba(255, 30, 56, 0.2)";
  ctx.beginPath(); ctx.arc(statusCenterX, beaconY, 28, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#000000";
  ctx.beginPath(); ctx.arc(statusCenterX, beaconY, 18, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = isOnline ? "#1ED760" : "#FF1E38";
  ctx.beginPath(); ctx.arc(statusCenterX, beaconY, 13, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath(); ctx.arc(statusCenterX - 3, beaconY - 3, 4, 0, Math.PI * 2); ctx.fill();

  // Status Big Word
  ctx.font = "900 36px Bahnschrift, Arial Black, sans-serif";
  ctx.textAlign = "center";

  // Black shadow
  ctx.fillStyle = "#000000";
  ctx.fillText(isOnline ? "ONLINE" : "OFFLINE", statusCenterX + 2, ry + 144);

  ctx.fillStyle = isOnline ? "#00F076" : "#FF1E38";
  ctx.fillText(isOnline ? "ONLINE" : "OFFLINE", statusCenterX, ry + 142);

  // Sub-badge Box: "Engine Connected" or "Engine Disconnected"
  const boxW = rw - 36;
  const boxH = 34;
  const boxX = rx + 18;
  const boxY = ry + 162;

  ctx.fillStyle = "#000000";
  ctx.fillRect(boxX, boxY, boxW, boxH);

  ctx.fillStyle = isOnline ? "#13251D" : "#2A1215";
  ctx.fillRect(boxX + 1, boxY + 1, boxW - 2, boxH - 2);

  ctx.strokeStyle = isOnline ? "#1ED760" : "#FF1E38";
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  ctx.fillStyle = isOnline ? "#C4FFD5" : "#FFD0D5";
  ctx.font = "800 12px Bahnschrift, Arial Black, sans-serif";
  ctx.fillText(isOnline ? "ENGINE CONNECTED" : "ENGINE DISCONNECTED", statusCenterX, boxY + 22);

  // Status Details list
  ctx.font = "600 11px Consolas, monospace";
  ctx.textAlign = "left";
  const detailX = rx + 26;
  const detailY1 = ry + 220;
  const detailY2 = ry + 240;

  if (isOnline) {
    ctx.fillStyle = "#1ED760";
    ctx.fillText("●", detailX, detailY1);
    ctx.fillStyle = "#D2D6E0";
    ctx.fillText(" ENGINE ONLINE", detailX + 12, detailY1);

    ctx.fillStyle = "#1ED760";
    ctx.fillText("●", detailX, detailY2);
    ctx.fillStyle = "#D2D6E0";
    ctx.fillText(" 100% OPERATIONAL", detailX + 12, detailY2);
  } else {
    ctx.fillStyle = "#FF1E38";
    ctx.fillText("▲", detailX, detailY1);
    ctx.fillStyle = "#D2D6E0";
    ctx.fillText(" ENGINE OFFLINE", detailX + 12, detailY1);

    ctx.fillStyle = "#FF1E38";
    ctx.fillText("▲", detailX, detailY2);
    ctx.fillStyle = "#D2D6E0";
    ctx.fillText(" STANDBY AUTO-RETRY", detailX + 12, detailY2);
  }

  // Reset textAlign
  ctx.textAlign = "left";

  return canvas.encodeSync("png");
}

fs.writeFileSync(OUTPUT_ONLINE, renderBanner(true));
console.log("Generated:", OUTPUT_ONLINE);

fs.writeFileSync(OUTPUT_OFFLINE, renderBanner(false));
console.log("Generated:", OUTPUT_OFFLINE);
