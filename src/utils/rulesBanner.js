/**
 * rulesBanner.js  —  TOGETHER Community Neo-Brutalist Animated Rules Banner
 * Generates an ultra-premium Neo-Brutalist 900x300 animated GIF banner for the rules channel.
 * Powered by @napi-rs/canvas and gifenc.
 */

const { createCanvas, GlobalFonts } = require("@napi-rs/canvas");
const { GIFEncoder, quantize, applyPalette } = require("gifenc");
const path = require("path");
const fs   = require("fs");

const FONTS_DIR = path.resolve(__dirname, "../../assets/fonts");
const FONT_DEFS = [
  { file: "Geist-Bold.ttf",        family: "Geist",     weight: "bold"   },
  { file: "Geist-Regular.ttf",     family: "Geist",     weight: "normal" },
  { file: "GeistMono-Regular.ttf", family: "GeistMono", weight: "normal" },
];

let fontsRegistered = false;
function ensureFonts() {
  if (fontsRegistered) return;
  for (const { file, family } of FONT_DEFS) {
    const fp = path.join(FONTS_DIR, file);
    if (fs.existsSync(fp)) GlobalFonts.registerFromPath(fp, family);
  }
  fontsRegistered = true;
}

function roundRect(ctx, x, y, w, h, r = 0) {
  if (r <= 0) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBrutalistBox(ctx, x, y, w, h, {
  bgColor = "#141721",
  borderColor = "#FFFFFF",
  borderWidth = 3,
  shadowColor = "#000000",
  shadowOffset = 5,
} = {}) {
  if (shadowOffset > 0) {
    ctx.fillStyle = shadowColor;
    ctx.fillRect(x + shadowOffset, y + shadowOffset, w, h);
  }
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, w, h);

  if (borderWidth > 0 && borderColor) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth   = borderWidth;
    ctx.strokeRect(x, y, w, h);
  }
}

/**
 * Renders an animated Neo-Brutalist rules banner GIF.
 * @returns {Promise<Buffer>} GIF buffer
 */
async function renderRulesBanner() {
  ensureFonts();

  const W = 900, H = 300;
  const FRAMES = 16;
  const gif = GIFEncoder();

  // 1. Pre-render static base
  const baseCanvas = createCanvas(W, H);
  const baseCtx = baseCanvas.getContext("2d");

  // Hard outer shadow
  baseCtx.fillStyle = "#000000";
  baseCtx.fillRect(8, 8, W - 8, H - 8);

  // Dark obsidian brutalist card background
  baseCtx.fillStyle = "#0c0e14";
  baseCtx.fillRect(0, 0, W - 8, H - 8);

  // Heavy stark 3.5px brutalist border
  baseCtx.strokeStyle = "#FFFFFF";
  baseCtx.lineWidth   = 3.5;
  baseCtx.strokeRect(0, 0, W - 8, H - 8);

  // Technical grid pattern
  baseCtx.save();
  baseCtx.strokeStyle = "rgba(255, 255, 255, 0.035)";
  baseCtx.lineWidth   = 1;
  for (let x = 0; x <= W; x += 32) {
    baseCtx.beginPath(); baseCtx.moveTo(x, 0); baseCtx.lineTo(x, H); baseCtx.stroke();
  }
  for (let y = 0; y <= H; y += 32) {
    baseCtx.beginPath(); baseCtx.moveTo(0, y); baseCtx.lineTo(W, y); baseCtx.stroke();
  }
  baseCtx.restore();

  // Top header stripe with technical markings
  baseCtx.fillStyle = "#141824";
  baseCtx.fillRect(3.5, 3.5, W - 15, 34);
  baseCtx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  baseCtx.lineWidth   = 1.5;
  baseCtx.beginPath();
  baseCtx.moveTo(3.5, 37.5);
  baseCtx.lineTo(W - 11.5, 37.5);
  baseCtx.stroke();

  // Monospace technical header
  baseCtx.font         = "bold 11px GeistMono, monospace";
  baseCtx.fillStyle    = "#f43f5e";
  baseCtx.textAlign    = "left";
  baseCtx.textBaseline = "middle";
  baseCtx.fillText("SEC.PROTOCOL // TOGETHER COMMUNITY RULES", 20, 20);

  // Left red brutalist security stripe
  baseCtx.fillStyle = "#f43f5e";
  baseCtx.fillRect(3.5, 37.5, 7, H - 45.5);

  // Category Tag Pill
  drawBrutalistBox(baseCtx, 36, 58, 230, 26, {
    bgColor: "#1f1d2b",
    borderColor: "#f43f5e",
    borderWidth: 1.5,
    shadowColor: "#000000",
    shadowOffset: 3,
  });
  baseCtx.font         = "bold 11px GeistMono, monospace";
  baseCtx.fillStyle    = "#fda4af";
  baseCtx.textAlign    = "center";
  baseCtx.textBaseline = "middle";
  baseCtx.fillText("✦ OFFICIAL CODE OF CONDUCT ✦", 36 + 115, 71);

  // Giant Main Title
  baseCtx.font         = "bold 44px Geist, sans-serif";
  baseCtx.fillStyle    = "#FFFFFF";
  baseCtx.textAlign    = "left";
  baseCtx.textBaseline = "alphabetic";
  baseCtx.fillText("SERVER RULES & GUIDELINES", 36, 136);

  // Subtitle
  baseCtx.font         = "normal 17px Geist, sans-serif";
  baseCtx.fillStyle    = "rgba(255, 255, 255, 0.65)";
  baseCtx.fillText("Adhere to all standards to maintain a safe and premier music space.", 36, 172);

  // Zero Tolerance Brutalist Badge
  const badgeTxt = "⚠  ZERO TOLERANCE PROTOCOL  //  ACTIVE MODERATION";
  baseCtx.font = "bold 12px GeistMono, monospace";
  const BW = baseCtx.measureText(badgeTxt).width + 24;
  const BH = 32;

  drawBrutalistBox(baseCtx, 36, 202, BW, BH, {
    bgColor: "#141721",
    borderColor: "#fbbf24",
    borderWidth: 2,
    shadowColor: "#000000",
    shadowOffset: 4,
  });
  baseCtx.fillStyle    = "#fef08a";
  baseCtx.textAlign    = "left";
  baseCtx.textBaseline = "middle";
  baseCtx.fillText(badgeTxt, 48, 202 + BH / 2);

  // Equalizer settings on right
  const BARS_COUNT = 14;
  const barWidth = 8;
  const barGap = 6;
  const visualizerX = W - (BARS_COUNT * (barWidth + barGap)) - 36;
  const visualizerY = 236;

  // Frame canvas
  const frameCanvas = createCanvas(W, H);
  const ctx = frameCanvas.getContext("2d");

  // 2. Render animated frames
  for (let f = 0; f < FRAMES; f++) {
    const progress = f / FRAMES;
    const angle    = progress * Math.PI * 2;

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(baseCanvas, 0, 0);

    // Dynamic scanning radar sweep beam
    const sweepX = 36 + ((f * 52) % (W - 100));
    const sweepGrad = ctx.createLinearGradient(sweepX, 0, sweepX + 80, 0);
    sweepGrad.addColorStop(0, "transparent");
    sweepGrad.addColorStop(0.5, "rgba(244, 63, 94, 0.08)");
    sweepGrad.addColorStop(1, "transparent");
    ctx.fillStyle = sweepGrad;
    ctx.fillRect(sweepX, 38, 80, H - 56);

    // Stepped Audio / Security VU Meter Bars
    ctx.save();
    for (let b = 0; b < BARS_COUNT; b++) {
      const bx = visualizerX + b * (barWidth + barGap);
      const waveFreq = (b / BARS_COUNT) * Math.PI * 2;
      const barHeight = 14 + Math.abs(Math.sin(angle * 2 + waveFreq)) * 58 + Math.cos(angle + b) * 12;
      const safeH = Math.max(8, Math.min(84, barHeight));
      const by = visualizerY - safeH;

      ctx.fillStyle = "#000000";
      ctx.fillRect(bx + 2, by + 2, barWidth, safeH);

      const barGrad = ctx.createLinearGradient(bx, by, bx, visualizerY);
      barGrad.addColorStop(0, "#f43f5e");
      barGrad.addColorStop(0.6, "#fbbf24");
      barGrad.addColorStop(1, "#4f46e5");

      ctx.fillStyle = barGrad;
      ctx.fillRect(bx, by, barWidth, safeH);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth   = 1;
      ctx.strokeRect(bx, by, barWidth, safeH);
    }
    ctx.restore();

    // LIVE Enforcement LED
    const ledAlpha = 0.5 + 0.5 * Math.sin(angle * 2);
    ctx.fillStyle = `rgba(239, 68, 68, ${ledAlpha})`;
    ctx.beginPath();
    ctx.arc(W - 146, 20, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font         = "bold 11px GeistMono, monospace";
    ctx.fillStyle    = "#fca5a5";
    ctx.textAlign    = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("ENFORCEMENT ACTIVE", W - 42, 20);

    // Hazard Stripes Animated Caution Strip on bottom edge
    const stripY = H - 18;
    const stripH = 9;
    const stripeW = 14;
    const stripeShift = (progress * stripeW * 2) % (stripeW * 2);

    ctx.save();
    ctx.beginPath();
    ctx.rect(3.5, stripY, W - 15, stripH);
    ctx.clip();

    ctx.fillStyle = "#111420";
    ctx.fillRect(3.5, stripY, W - 15, stripH);

    ctx.fillStyle = "#fbbf24";
    for (let sx = -stripeW * 2; sx < W + stripeW * 2; sx += stripeW * 2) {
      const rx = sx + stripeShift;
      ctx.beginPath();
      ctx.moveTo(rx, stripY + stripH);
      ctx.lineTo(rx + stripeW * 0.7, stripY + stripH);
      ctx.lineTo(rx + stripeW * 1.4, stripY);
      ctx.lineTo(rx + stripeW * 0.7, stripY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Quantize & add to GIF
    const { data } = ctx.getImageData(0, 0, W, H);
    const palette = quantize(data, 128);
    const index   = applyPalette(data, palette);
    gif.writeFrame(index, W, H, { palette, delay: 70 });
  }

  gif.finish();
  return Buffer.from(gif.bytes());
}

module.exports = { renderRulesBanner };
