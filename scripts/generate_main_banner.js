/**
 * generate_main_banner.js
 * Brutalist-themed version of the original "TOGETHER COMMANDS" banner.
 * Layout mirrors the original: logo panel left + title/subtitle right,
 * same wide horizontal card proportions.
 *
 * Run: node scripts/generate_main_banner.js
 */

"use strict";

const { createCanvas, loadImage } = require("@napi-rs/canvas");
const path = require("path");
const fs = require("fs");

const ASSETS = path.resolve(__dirname, "../assets");
const OUT = path.resolve(ASSETS, "banner.png");

// ── Canvas — same proportions as original (≈ 860 × 175) ──────────────────
const W = 900;
const H = 180;

// ── Brutalist palette ─────────────────────────────────────────────────────
const C = {
  bg: "#0A0B0E",
  panel: "#0E0F14",
  panelAlt: "#12141B",
  border: "#272930",
  borderBright: "#3A3D48",
  red: "#FF1E38",
  white: "#E8EAF0",
  mid: "#9598A0",
  dim: "#6B6F7A",
  dimmer: "#4D5058",
};

// ── Helpers ───────────────────────────────────────────────────────────────
function rect(ctx, x, y, w, h, fill, stroke, lw = 1) {
  if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.strokeRect(x, y, w, h); }
}

function line(ctx, x1, y1, x2, y2, color, lw = 1) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.restore();
}

function diagonalStripes(ctx, x, y, w, h, step = 7, sw = 2, color = "#3A3D48") {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = sw;
  for (let i = -h; i < w + h; i += step) {
    ctx.beginPath(); ctx.moveTo(x + i, y); ctx.lineTo(x + i + h, y + h); ctx.stroke();
  }
  ctx.restore();
}

function barcode(ctx, x, y, w, h, color = C.dim) {
  ctx.save(); ctx.fillStyle = color;
  const pat = [2, 1, 3, 1, 1, 4, 1, 2, 3, 1, 2, 1, 4, 1, 1, 3, 2];
  let cx = x, i = 0;
  while (cx < x + w && i < 40) {
    const bw = pat[i % pat.length];
    const sp = (pat[(i + 2) % pat.length] % 2) + 1.2;
    if (cx + bw <= x + w) ctx.fillRect(cx, y, bw, h);
    cx += bw + sp; i++;
  }
  ctx.restore();
}

function star4(ctx, cx, cy, outerR, innerR, color = C.red) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
    ctx.lineTo(cx + Math.cos(a + Math.PI / 4) * innerR, cy + Math.sin(a + Math.PI / 4) * innerR);
  }
  ctx.closePath(); ctx.fill(); ctx.restore();
}

function crosshair(ctx, cx, cy, size = 8, color = C.dimmer) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - size, cy); ctx.lineTo(cx + size, cy);
  ctx.moveTo(cx, cy - size); ctx.lineTo(cx, cy + size);
  ctx.stroke(); ctx.restore();
}

function globe(ctx, cx, cy, r) {
  ctx.save(); ctx.strokeStyle = C.dim; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.38, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.38, r, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function grunge(ctx, w, h) {
  ctx.save();
  // Noise dots
  ctx.fillStyle = "rgba(255,255,255,0.02)";
  for (let i = 0; i < 160; i++) {
    ctx.fillRect((i * 197) % w, (i * 131) % h, (i % 3) + 1, (i % 2) + 1);
  }
  // Crease lines
  ctx.strokeStyle = "rgba(255,255,255,0.03)"; ctx.lineWidth = 1;
  [[0, 38, w, 42], [0, h - 22, w, h - 18], [210, 0, 206, h]].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  });
  ctx.restore();
}

// ── Main render ───────────────────────────────────────────────────────────
async function main() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Load brutalist logo
  const logoPath = path.resolve(ASSETS, "logo.png");
  let logo = null;
  if (fs.existsSync(logoPath)) {
    logo = await loadImage(logoPath);
  }

  // ── 1. Background ──────────────────────────────────────────────────────
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "rgba(20,22,28,0.65)");
  grad.addColorStop(0.5, "rgba(10,11,14,0.1)");
  grad.addColorStop(1, "rgba(4,5,7,0.8)");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

  // Fine grid
  ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.018)"; ctx.lineWidth = 1;
  for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
  for (let gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
  ctx.restore();

  grunge(ctx, W, H);

  // ── 2. Hard left accent bar ────────────────────────────────────────────
  ctx.fillStyle = C.red; ctx.fillRect(0, 0, 5, H);

  // ── 3. Logo panel (left) ──────────────────────────────────────────────
  const LP_X = 14;
  const LP_Y = 12;
  const LP_S = H - 24; // square

  // Panel bg + heavy red border (mimics original's card edge)
  rect(ctx, LP_X, LP_Y, LP_S, LP_S, C.panel, C.red, 3);
  // Inner inset
  rect(ctx, LP_X + 5, LP_Y + 5, LP_S - 10, LP_S - 10, null, C.border, 1);

  // Corner crosshairs
  crosshair(ctx, LP_X + 12, LP_Y + 12, 7, C.dim);
  crosshair(ctx, LP_X + LP_S - 12, LP_Y + LP_S - 12, 7, C.dim);

  // Red corner slash accent (top-right of logo panel)
  ctx.save();
  ctx.beginPath(); ctx.rect(LP_X, LP_Y, LP_S, LP_S); ctx.clip();
  ctx.fillStyle = C.red;
  ctx.beginPath();
  ctx.moveTo(LP_X + LP_S - 42, LP_Y);
  ctx.lineTo(LP_X + LP_S, LP_Y);
  ctx.lineTo(LP_X + LP_S, LP_Y + 36);
  ctx.lineTo(LP_X + LP_S - 20, LP_Y + 20);
  ctx.closePath(); ctx.fill();
  // Splatter dot
  ctx.beginPath(); ctx.arc(LP_X + LP_S - 52, LP_Y + 10, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Draw logo — use offscreen canvas to strip white background
  if (logo) {
    // 1. Render logo onto offscreen at full res
    const offW = logo.width, offH = logo.height;
    const off = createCanvas(offW, offH);
    const offCtx = off.getContext("2d");
    offCtx.drawImage(logo, 0, 0);

    // 2. Get pixel data and zero alpha wherever pixel is near-white
    const imgData = offCtx.getImageData(0, 0, offW, offH);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      // threshold: treat pixels lighter than #E0E0E0 as background
      if (r > 220 && g > 220 && b > 220) {
        // blend: the lighter the pixel, the more transparent
        const brightness = (r + g + b) / 3;
        d[i + 3] = Math.max(0, Math.round((255 - brightness) * 2.5));
      }
    }
    offCtx.putImageData(imgData, 0, 0);

    // 3. Draw masked logo onto main canvas inside panel
    const pad = 8;
    const drawX = LP_X + pad;
    const drawY = LP_Y + pad;
    const drawW = LP_S - pad * 2;
    const drawH = LP_S - pad * 2 - 18; // leave room for barcode strip

    ctx.save();
    ctx.beginPath();
    ctx.rect(LP_X + 4, LP_Y + 4, LP_S - 8, LP_S - 8);
    ctx.clip();
    ctx.drawImage(off, 0, 0, offW, offH, drawX, drawY, drawW, drawH);
    ctx.restore();
  }

  // Barcode strip at bottom of logo panel
  const BC_Y = LP_Y + LP_S - 22;
  line(ctx, LP_X, BC_Y, LP_X + LP_S, BC_Y, C.border);
  barcode(ctx, LP_X + 6, BC_Y + 4, 80, 12, "rgba(255,255,255,0.3)");
  ctx.fillStyle = C.dimmer; ctx.font = "700 7px Consolas, monospace";
  ctx.fillText("TOGETHER", LP_X + 93, BC_Y + 13);

  // ── 4. Slash icon — full height of logo panel ──────────────────────────
  const SI_X = LP_X + LP_S + 12;
  const SI_Y = LP_Y;
  const SI_W = 58;
  const SI_H = LP_S;

  rect(ctx, SI_X, SI_Y, SI_W, SI_H, C.panelAlt, C.borderBright, 2);
  diagonalStripes(ctx, SI_X + 2, SI_Y + 2, SI_W - 4, SI_H - 4, 7, 1.5, "rgba(255,255,255,0.04)");

  // Heavy white slash — centered
  ctx.save();
  ctx.strokeStyle = C.white; ctx.lineWidth = 12; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(SI_X + SI_W * 0.7, SI_Y + SI_H * 0.15);
  ctx.lineTo(SI_X + SI_W * 0.3, SI_Y + SI_H * 0.85);
  ctx.stroke();
  // Red dot accent top-right
  ctx.fillStyle = C.red;
  ctx.beginPath(); ctx.arc(SI_X + SI_W - 8, SI_Y + 8, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // ── 5. Title block ────────────────────────────────────────────────────
  const TX = SI_X + SI_W + 16;

  // Module tag
  rect(ctx, TX, LP_Y, 140, 18, C.panelAlt, C.borderBright, 1);
  ctx.fillStyle = C.mid; ctx.font = "700 8px Consolas, monospace";
  ctx.fillText("MODULE // TOGETHER", TX + 8, LP_Y + 12);

  // TOGETHER — white, large
  ctx.fillStyle = C.white;
  ctx.font = "900 40px Bahnschrift, 'Arial Black', sans-serif";
  ctx.fillText("TOGETHER", TX, LP_Y + 64);

  const tw = ctx.measureText("TOGETHER").width;
  star4(ctx, TX + tw + 14, LP_Y + 52, 10, 3.5, C.red);

  // COMMANDS — red, bold
  ctx.fillStyle = C.red;
  ctx.font = "900 38px Bahnschrift, 'Arial Black', sans-serif";
  ctx.fillText("COMMANDS", TX, LP_Y + 102);

  // Subtitle
  ctx.fillStyle = C.mid; ctx.font = "600 11px Consolas, monospace";
  ctx.fillText("LIST OF TOGETHER BOT COMMANDS", TX, LP_Y + 122);

  // Separator
  line(ctx, TX, LP_Y + 132, W - 120, LP_Y + 132, C.border);

  // Footer tag
  ctx.fillStyle = C.dimmer; ctx.font = "700 8px Consolas, monospace";
  ctx.fillText("TOGETHER / A MUSIC COMMUNITY", TX, H - 12);

  // +++ decorators
  ctx.fillStyle = C.dim; ctx.font = "700 12px Consolas, monospace";
  ctx.fillText("+  +  +", TX + ctx.measureText("TOGETHER / A MUSIC COMMUNITY").width + 16, H - 12);

  // ── 6. Right column (matching "List of Together bot commands" area) ────
  const RC_X = W - 104;
  const RC_W = 90;

  rect(ctx, RC_X, LP_Y, RC_W, LP_S, C.panel, C.border, 1);

  // Top accent stripe
  ctx.fillStyle = C.red; ctx.fillRect(RC_X + 2, LP_Y + 2, RC_W - 4, 5);

  // Words
  const words = ["MUSIC", "PEOPLE", "COMMUNITY", "TOGETHER"];
  words.forEach((w2, i) => {
    ctx.fillStyle = i === 0 ? C.white : C.dim;
    ctx.font = `${i === 0 ? "800" : "700"} 9px Consolas, monospace`;
    ctx.fillText(w2, RC_X + 8, LP_Y + 26 + i * 19);
    if (i < words.length - 1) {
      ctx.fillStyle = C.border;
      ctx.fillRect(RC_X + 8, LP_Y + 30 + i * 19, RC_W - 16, 1);
    }
  });

  // Globe
  globe(ctx, RC_X + RC_W / 2, LP_Y + LP_S - 26, 18);

  // Diagonal stripe block
  diagonalStripes(ctx, RC_X + 2, LP_Y + LP_S - 14, RC_W - 4, 10, 5, 1.5, "#4A4D55");

  // Star
  star4(ctx, RC_X + RC_W - 10, LP_Y + LP_S / 2, 6, 2, C.red);

  // ── 7. Caution stripe divider before right col ─────────────────────────
  diagonalStripes(ctx, RC_X - 12, LP_Y, 10, LP_S, 5, 1.5, "#3A3D48");
  line(ctx, RC_X - 12, LP_Y, RC_X - 12, LP_Y + LP_S, C.border);
  line(ctx, RC_X - 2, LP_Y, RC_X - 2, LP_Y + LP_S, C.border);

  // ── 8. Right hard edge bar ────────────────────────────────────────────
  ctx.fillStyle = "#1ED760"; ctx.fillRect(W - 5, 0, 5, H);

  // ── 9. Top-right: TOGETHER.DOCS label ────────────────────────────────
  ctx.fillStyle = C.dimmer; ctx.font = "700 8px Consolas, monospace";
  ctx.textAlign = "right"; ctx.fillText("TOGETHER.DOCS", RC_X - 18, LP_Y + 12);
  ctx.textAlign = "left";

  // ── Save ──────────────────────────────────────────────────────────────
  const buf = canvas.toBuffer("image/png");
  fs.writeFileSync(OUT, buf);
  console.log(`✓ banner.png written → ${OUT}`);
}

main().catch(err => { console.error(err); process.exit(1); });