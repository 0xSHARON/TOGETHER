/**
 * generate_help_banners.js
 * Generates brutalist-grunge banners for each help category.
 * Style: heavy grunge texture, paint splatters, two-line giant title,
 *        slash icon, wireframe globe, barcode, diagonal stripes — matching
 *        the reference image provided by the user.
 *
 * Run: node scripts/generate_help_banners.js
 */

"use strict";

const { createCanvas, loadImage } = require("@napi-rs/canvas");
const path = require("path");
const fs = require("fs");

const ASSETS_DIR = path.resolve(__dirname, "../assets");
const OUT_DIR = path.resolve(ASSETS_DIR, "banners");
fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── Canvas size (wide widescreen) ────────────────────────────────────────
const W = 1100;
const H = 280;

// ─── Palette ───────────────────────────────────────────────────────────────
const C = {
  bg: "#0A0B0E",
  panel: "#0D0F13",
  panelLight: "#12141B",
  border: "#272930",
  borderMid: "#383B44",
  red: "#FF1E38",
  white: "#E8EAF0",
  mid: "#9598A0",
  dim: "#6B6F7A",
  dimmer: "#4D5058",
  dark: "#1C1E26",
};

// ─── Category definitions ──────────────────────────────────────────────────
const CATEGORIES = [
  {
    key: "home",
    line1: "TOGETHER",
    line2: "COMMANDS",
    subtitle: "LIST OF TOGETHER BOT COMMANDS",
    tag: "MODULE // OVERVIEW",
    accentColor: C.red,
    rightCol: ["MUSIC", "PEOPLE", "COMMUNITY", "TOGETHER"],
  },
  {
    key: "Music",
    line1: "TOGETHER",
    line2: "MUSIC",
    subtitle: "PLAYBACK & QUEUE CONTROLS",
    tag: "MODULE // MUSIC",
    accentColor: C.red,
    rightCol: ["PLAY", "QUEUE", "SKIP", "LOOP"],
  },
  {
    key: "Filters",
    line1: "TOGETHER",
    line2: "FILTERS",
    subtitle: "AUDIO EFFECTS & EQUALIZER",
    tag: "MODULE // FILTERS",
    accentColor: "#FF6B1E",
    rightCol: ["BASS", "TREBLE", "EQ", "FX"],
  },
  {
    key: "Config",
    line1: "TOGETHER",
    line2: "CONFIG",
    subtitle: "SERVER SETUP & PREFERENCES",
    tag: "MODULE // CONFIG",
    accentColor: "#1E9EFF",
    rightCol: ["PREFIX", "SETUP", "ROLES", "PERMS"],
  },
  {
    key: "Information",
    line1: "TOGETHER",
    line2: "INFO",
    subtitle: "BOT STATUS & USEFUL LINKS",
    tag: "MODULE // INFO",
    accentColor: "#1ED760",
    rightCol: ["STATUS", "PING", "STATS", "HELP"],
  },
  {
    key: "Favourite",
    line1: "TOGETHER",
    line2: "FAVOURITES",
    subtitle: "YOUR LIKED SONGS & PLAYLISTS",
    tag: "MODULE // FAVOURITES",
    accentColor: "#FF1E7A",
    rightCol: ["LIKED", "SAVED", "LISTS", "STARS"],
  },
  {
    key: "Utility",
    line1: "TOGETHER",
    line2: "UTILITY",
    subtitle: "MEMBER & SERVER UTILITIES",
    tag: "MODULE // UTILITY",
    accentColor: "#9B59FF",
    rightCol: ["TOOLS", "MEMBER", "SERVER", "MISC"],
  },
];

// ─── Drawing helpers ───────────────────────────────────────────────────────

/** Heavy grunge / noise texture over the whole canvas */
function drawGrungeTexture(ctx, w, h, seed = 0) {
  ctx.save();
  // Random dust dots
  ctx.fillStyle = "rgba(255,255,255,0.018)";
  for (let i = 0; i < 200; i++) {
    const rx = ((i * 197 + seed * 31) % w);
    const ry = ((i * 131 + seed * 17) % h);
    ctx.fillRect(rx, ry, (i % 3) + 1, (i % 2) + 1);
  }
  // Horizontal scratch lines
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const y = ((i * 47 + seed * 13) % h);
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(w, y + (i % 3) - 1);
    ctx.stroke();
  }
  // Vertical crack lines
  ctx.strokeStyle = "rgba(255,255,255,0.025)";
  for (let i = 0; i < 4; i++) {
    const x = ((i * 271 + seed * 53) % w);
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x + (i % 5) - 2, h);
    ctx.stroke();
  }
  ctx.restore();
}

/** Paint splatter polygon — irregular blob */
function drawSplatter(ctx, cx, cy, r, color, points = 9, seed = 1) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const jitter = 0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + seed));
    const px = cx + Math.cos(angle) * r * jitter;
    const py = cy + Math.sin(angle) * r * jitter;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  // Small satellite dots
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + seed;
    const dist = r * (1.2 + 0.3 * Math.abs(Math.sin(k + seed)));
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist, r * 0.08 + k * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawDiagonalStripes(ctx, x, y, w, h, step = 7, sw = 2, color = C.border) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = sw;
  for (let i = -h; i < w + h; i += step) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + h, y + h);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBarcode(ctx, x, y, w, h, color = C.dim) {
  ctx.save();
  ctx.fillStyle = color;
  const pattern = [2, 1, 3, 1, 1, 4, 1, 2, 3, 1, 2, 1, 4, 1, 1, 3, 2];
  let curX = x;
  let i = 0;
  while (curX < x + w && i < 40) {
    const barW = pattern[i % pattern.length];
    const space = (pattern[(i + 2) % pattern.length] % 2) + 1.2;
    if (curX + barW <= x + w) ctx.fillRect(curX, y, barW, h);
    curX += barW + space;
    i++;
  }
  ctx.restore();
}

function drawFourPointStar(ctx, cx, cy, outerR, innerR, color = C.red) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
    const ha = a + Math.PI / 4;
    ctx.lineTo(cx + Math.cos(ha) * innerR, cy + Math.sin(ha) * innerR);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawWireframeGlobe(ctx, cx, cy, r) {
  ctx.save();
  ctx.strokeStyle = C.dim;
  ctx.lineWidth = 1;
  // Outer circle
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  // Equator
  ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
  // Wide ellipse
  ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.38, 0, 0, Math.PI * 2); ctx.stroke();
  // Vertical meridian
  ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
  // Narrow ellipse
  ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.4, r, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

/** Slash icon inside a bordered square — replicates the "/" box from ref image */
function drawSlashIcon(ctx, x, y, size, accent) {
  ctx.save();

  // Outer square fill + heavy border
  ctx.fillStyle = C.panelLight;
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = C.borderMid;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, size, size);

  // Diagonal stripe fill inside box
  drawDiagonalStripes(ctx, x + 3, y + 3, size - 6, size - 6, 8, 2, "rgba(255,255,255,0.04)");

  // Heavy white forward-slash
  ctx.strokeStyle = C.white;
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.68, y + size * 0.14);
  ctx.lineTo(x + size * 0.32, y + size * 0.86);
  ctx.stroke();

  // Accent dot top-right of slash box
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x + size - 10, y + 10, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function crosshair(ctx, cx, cy, size = 10, color = C.dimmer) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - size, cy); ctx.lineTo(cx + size, cy);
  ctx.moveTo(cx, cy - size); ctx.lineTo(cx, cy + size);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// ─── Core render ──────────────────────────────────────────────────────────
async function renderHelpBanner(cat, logoImg) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  const acc = cat.accentColor;

  // ── 1. Background ────────────────────────────────────────────────────────
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // Gradient overlay
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "rgba(20,22,28,0.7)");
  grad.addColorStop(0.5, "rgba(10,11,14,0.15)");
  grad.addColorStop(1, "rgba(4,5,7,0.8)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Fine grid overlay
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.02)";
  ctx.lineWidth = 1;
  for (let gx = 0; gx < W; gx += 44) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
  }
  for (let gy = 0; gy < H; gy += 44) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  }
  ctx.restore();

  // Grunge texture
  drawGrungeTexture(ctx, W, H, cat.key.charCodeAt(0) || 0);

  // ── 2. Left logo panel ────────────────────────────────────────────────────
  const LP_X = 18;
  const LP_Y = 18;
  const LP_W = 244;
  const LP_H = H - 36;

  // Panel fill + border
  ctx.fillStyle = C.panel;
  ctx.fillRect(LP_X, LP_Y, LP_W, LP_H);

  ctx.strokeStyle = acc;
  ctx.lineWidth = 3;
  ctx.strokeRect(LP_X, LP_Y, LP_W, LP_H);

  // Inner inset border
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(LP_X + 5, LP_Y + 5, LP_W - 10, LP_H - 10);

  // Large red paint splatter — top-right corner of left panel
  ctx.save();
  ctx.beginPath();
  ctx.rect(LP_X, LP_Y, LP_W, LP_H);
  ctx.clip();
  drawSplatter(ctx, LP_X + LP_W - 44, LP_Y + 44, 55, acc, 11, 3);
  drawSplatter(ctx, LP_X + LP_W - 85, LP_Y + 18, 18, acc, 7, 7);
  // Small satellite dots
  ctx.fillStyle = acc;
  ctx.beginPath(); ctx.arc(LP_X + LP_W - 108, LP_Y + 62, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(LP_X + 30, LP_Y + 28, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Diagonal stripes — bottom strip inside panel
  drawDiagonalStripes(ctx, LP_X + 3, LP_Y + LP_H - 32, LP_W - 6, 24, 6, 2, "rgba(255,255,255,0.05)");
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(LP_X, LP_Y + LP_H - 32);
  ctx.lineTo(LP_X + LP_W, LP_Y + LP_H - 32);
  ctx.stroke();

  // Barcode inside panel — bottom
  drawBarcode(ctx, LP_X + 8, LP_Y + LP_H - 24, 110, 15, "rgba(255,255,255,0.35)");
  ctx.fillStyle = C.dimmer;
  ctx.font = "700 7px Consolas, monospace";
  ctx.fillText("TOGETHER.HUB", LP_X + 125, LP_Y + LP_H - 12);

  // Wireframe globe — bottom-right inside panel
  drawWireframeGlobe(ctx, LP_X + LP_W - 30, LP_Y + LP_H - 20, 18);

  // Corner crosshairs
  crosshair(ctx, LP_X + 14, LP_Y + 14, 8, C.dim);
  crosshair(ctx, LP_X + LP_W - 14, LP_Y + 14, 8, C.dim);

  // Logo image — centered and filling the panel
  if (logoImg) {
    ctx.save();
    // Clip to panel inner area
    ctx.beginPath();
    ctx.rect(LP_X + 3, LP_Y + 3, LP_W - 6, LP_H - 35);
    ctx.clip();
    // Draw logo filling the full panel width — logo.png is square
    const logoH = LP_H - 35;
    const logoW = logoH; // square logo
    const logoOffX = LP_X + (LP_W - logoW) / 2;
    const logoOffY = LP_Y + 3;
    ctx.drawImage(logoImg, 0, 0, logoImg.width, logoImg.height, logoOffX, logoOffY, logoW, logoH);
    ctx.restore();
  }

  // ── 3. Slash icon box ─────────────────────────────────────────────────────
  const SI_X = LP_X + LP_W + 18;
  const SI_Y = LP_Y + 12;
  const SI_SIZE = LP_H - 30;
  drawSlashIcon(ctx, SI_X, SI_Y, SI_SIZE, acc);

  // ── 4. Main title block ───────────────────────────────────────────────────
  const TX = SI_X + SI_SIZE + 22;
  const TY_LINE1 = LP_Y + 62;
  const TY_LINE2 = TY_LINE1 + 68;

  // Line 1: TOGETHER — white
  ctx.fillStyle = C.white;
  ctx.font = `900 ${cat.line2.length > 9 ? 52 : 60}px Bahnschrift, 'Arial Black', sans-serif`;
  ctx.fillText(cat.line1, TX, TY_LINE1);

  // Line 2: COMMANDS / category — accent red (or category color)
  ctx.fillStyle = acc;
  ctx.font = `900 ${cat.line2.length > 9 ? 50 : 58}px Bahnschrift, 'Arial Black', sans-serif`;
  ctx.fillText(cat.line2, TX, TY_LINE2);

  // Stars near title
  drawFourPointStar(ctx, TX + ctx.measureText(cat.line1).width + 20, TY_LINE1 - 12, 12, 4, acc);
  drawFourPointStar(ctx, TX + 10, TY_LINE2 + 16, 7, 2.5, C.dimmer);

  // Subtitle
  ctx.fillStyle = C.mid;
  ctx.font = "600 11px Consolas, monospace";
  ctx.fillText(cat.subtitle, TX, TY_LINE2 + 32);

  // Separator
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(TX, TY_LINE2 + 44);
  ctx.lineTo(W - 140, TY_LINE2 + 44);
  ctx.stroke();

  // Bottom detail: +++ markers
  ctx.fillStyle = C.dim;
  ctx.font = "700 13px Consolas, monospace";
  ctx.fillText("+  +  +", TX, TY_LINE2 + 62);

  // Tag box (top-left of content area)
  ctx.fillStyle = C.panelLight;
  ctx.strokeStyle = C.borderMid;
  ctx.lineWidth = 1;
  ctx.fillRect(TX, LP_Y, 160, 20);
  ctx.strokeRect(TX, LP_Y, 160, 20);
  ctx.fillStyle = C.mid;
  ctx.font = "700 9px Consolas, monospace";
  ctx.fillText(cat.tag, TX + 10, LP_Y + 13);

  // ── 5. Right column ──────────────────────────────────────────────────────
  const RC_X = W - 128;
  const RC_Y = LP_Y;
  const RC_W = 110;
  const RC_H = LP_H;

  ctx.fillStyle = C.panel;
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.fillRect(RC_X, RC_Y, RC_W, RC_H);
  ctx.strokeRect(RC_X, RC_Y, RC_W, RC_H);

  // Diagonal stripes fill — top strip
  drawDiagonalStripes(ctx, RC_X + 2, RC_Y + 2, RC_W - 4, 22, 6, 2, "rgba(255,255,255,0.05)");
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(RC_X, RC_Y + 24); ctx.lineTo(RC_X + RC_W, RC_Y + 24); ctx.stroke();

  // Right column text: MUSIC / PEOPLE / COMMUNITY / TOGETHER etc.
  cat.rightCol.forEach((word, i) => {
    ctx.fillStyle = i === 0 ? C.white : C.dim;
    ctx.font = `${i === 0 ? "800" : "700"} 10px Consolas, monospace`;
    ctx.fillText(word, RC_X + 10, RC_Y + 44 + i * 22);

    // Tiny accent dot
    if (i < cat.rightCol.length - 1) {
      ctx.fillStyle = C.border;
      ctx.fillRect(RC_X + 10, RC_Y + 50 + i * 22, RC_W - 20, 1);
    }
  });

  // Wireframe globe inside right column
  drawWireframeGlobe(ctx, RC_X + RC_W / 2, RC_Y + RC_H - 38, 24);

  // Barcode at bottom of right column
  drawBarcode(ctx, RC_X + 6, RC_Y + RC_H - 10, RC_W - 12, 8, acc + "88");

  // Accent red strip — top of right column
  ctx.fillStyle = acc;
  ctx.fillRect(RC_X + 2, RC_Y + 2, RC_W - 4, 6);

  // Star accent
  drawFourPointStar(ctx, RC_X + RC_W - 14, RC_Y + RC_H / 2, 7, 2.5, acc);

  // ── 6. Caution stripes strip — between content and right col ─────────────
  const CS_X = W - 140;
  const CS_W = 10;
  drawDiagonalStripes(ctx, CS_X, LP_Y, CS_W, LP_H, 5, 2, "#4A4D55");
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(CS_X, LP_Y, CS_W, LP_H);

  return canvas.toBuffer("image/png");
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  // Load original banner to extract the logo
  const logoPath = path.resolve(ASSETS_DIR, "logo.png");
  let logoImg = null;
  try {
    if (fs.existsSync(logoPath)) {
      logoImg = await loadImage(logoPath);
      console.log("✓ Loaded logo from assets/logo.png");
    } else {
      console.warn("⚠  assets/logo.png not found — panels will use placeholder");
    }
  } catch (e) {
    console.warn("⚠  Could not load logo image:", e.message);
  }

  for (const cat of CATEGORIES) {
    const buf = await renderHelpBanner(cat, logoImg);
    const outFile = path.join(OUT_DIR, `banner-${cat.key}.png`);
    fs.writeFileSync(outFile, buf);
    console.log(`✓ ${cat.key} banner → ${outFile}`);
  }

  // Also overwrite the root banner.png (used by help home)
  const homeCategory = CATEGORIES.find(c => c.key === "home");
  const homeBuf = await renderHelpBanner(homeCategory, logoImg);
  fs.writeFileSync(path.resolve(ASSETS_DIR, "banner.png"), homeBuf);
  console.log(`✓ Updated assets/banner.png (home)`);

  console.log("\n✅ All help banners generated!");
}

main().catch(err => {
  console.error("Banner generation failed:", err);
  process.exit(1);
});
