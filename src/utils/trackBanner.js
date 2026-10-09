const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { artworkUrl, cleanAuthorName } = require("./presentation");
const { convertTime } = require("./convert");

const WIDTH = 1_000;
const HEIGHT = 250;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function drawFourPointStar(ctx, cx, cy, outerR, innerR, color = "#FF1E38") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
    const halfAngle = angle + Math.PI / 4;
    ctx.lineTo(cx + Math.cos(halfAngle) * innerR, cy + Math.sin(halfAngle) * innerR);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawWireframeGlobe(ctx, cx, cy, r) {
  ctx.save();
  ctx.strokeStyle = "#4D5058";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.4, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy + r);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.45, r, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawDiagonalStripes(ctx, x, y, w, h, step = 7, stripeW = 3, color = "#4A4D55") {
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

function drawBarcode(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "#E1E3E6";
  let curX = x;
  const pattern = [2, 1, 3, 1, 1, 4, 1, 2, 3, 1, 2, 1, 4, 1, 1, 3, 2];
  let i = 0;
  while (curX < x + w && i < 35) {
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

function drawEqualizer(ctx, x, y, w, h, bars = 14, seed = 3, accentColor = "#FF1E38") {
  ctx.save();
  const barW = Math.max(2, Math.floor(w / (bars * 1.5)));
  const gap = Math.max(1, Math.floor(barW * 0.5));
  for (let i = 0; i < bars; i++) {
    const pseudo = Math.sin(i * 1.4 + seed) * 0.45 + 0.55;
    const barH = Math.max(3, Math.floor(pseudo * h));
    const bx = x + i * (barW + gap);
    const by = y + h - barH;

    ctx.fillStyle = i % 4 === 0 ? accentColor : (i % 2 === 0 ? "#8E929D" : "#4A4D55");
    ctx.fillRect(bx, by, barW, barH);
  }
  ctx.restore();
}

function fitText(ctx, input, maxWidth) {
  const value = String(input || "Unknown").replace(/\s+/g, " ").trim();
  if (ctx.measureText(value).width <= maxWidth) return value;

  let chars = Array.from(value);
  while (chars.length > 1 && ctx.measureText(`${chars.join("")}…`).width > maxWidth) {
    chars.pop();
  }
  return `${chars.join("").trimEnd()}…`;
}

const artworkCache = new Map();
const ARTWORK_CACHE_LIMIT = 60;

async function fetchArtwork(url) {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Unsupported artwork URL.");

  const cacheKey = parsed.href;
  if (artworkCache.has(cacheKey)) {
    try {
      return await loadImage(artworkCache.get(cacheKey));
    } catch {
      artworkCache.delete(cacheKey);
    }
  }

  const response = await fetch(parsed, { signal: AbortSignal.timeout(3_500) });
  if (!response.ok) throw new Error(`Artwork request failed with ${response.status}.`);

  const declaredSize = Number(response.headers.get("content-length") || 0);
  if (declaredSize > MAX_IMAGE_BYTES) throw new Error("Artwork exceeds the size limit.");
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error("Artwork exceeds the size limit.");

  if (artworkCache.size >= ARTWORK_CACHE_LIMIT) {
    const firstKey = artworkCache.keys().next().value;
    artworkCache.delete(firstKey);
  }
  artworkCache.set(cacheKey, buffer);

  return loadImage(buffer);
}

async function renderTrackBanner(artwork, track = {}) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const accentColor = "#FF1E38";

  // 1. BASE BACKGROUND (Concrete / Dark Grunge Noir)
  ctx.fillStyle = "#0A0B0E";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Subtle dark gradient
  const bgGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bgGrad.addColorStop(0, "rgba(22, 24, 30, 0.55)");
  bgGrad.addColorStop(0.5, "rgba(10, 11, 14, 0.2)");
  bgGrad.addColorStop(1, "rgba(5, 6, 8, 0.7)");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Procedural grunge crease lines
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 48);
  ctx.lineTo(WIDTH, 52);
  ctx.moveTo(250, 0);
  ctx.lineTo(245, HEIGHT);
  ctx.moveTo(0, 230);
  ctx.lineTo(WIDTH, 226);
  ctx.stroke();

  // Subtle dust / texture
  ctx.fillStyle = "rgba(255, 255, 255, 0.015)";
  for (let i = 0; i < 30; i++) {
    const rx = (i * 197) % WIDTH;
    const ry = (i * 131) % HEIGHT;
    ctx.fillRect(rx, ry, (i % 4) + 1, (i % 3) + 1);
  }
  ctx.restore();

  // ========================================================
  // 2. LEFT PANEL: ALBUM ARTWORK IN BRUTALIST FRAME
  // ========================================================
  const frameX = 25;
  const frameY = 22;
  const frameSize = 206;

  // Frame background & border
  ctx.fillStyle = "#0E0F13";
  ctx.fillRect(frameX, frameY, frameSize, frameSize);

  ctx.strokeStyle = "#2B2D35";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(frameX, frameY, frameSize, frameSize);

  // Draw Artwork
  if (artwork) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(frameX + 2, frameY + 2, frameSize - 4, frameSize - 34);
    ctx.clip();

    ctx.filter = "grayscale(30%) contrast(115%) brightness(95%)";
    const scale = Math.max((frameSize - 4) / artwork.width, (frameSize - 34) / artwork.height);
    const sw = (frameSize - 4) / scale;
    const sh = (frameSize - 34) / scale;
    const sx = (artwork.width - sw) / 2;
    const sy = (artwork.height - sh) / 2;
    ctx.drawImage(artwork, sx, sy, sw, sh, frameX + 2, frameY + 2, frameSize - 4, frameSize - 34);
    ctx.restore();
  } else {
    // Stylized brutalist vinyl placeholder when artwork is unavailable or slow
    ctx.save();
    ctx.beginPath();
    ctx.rect(frameX + 2, frameY + 2, frameSize - 4, frameSize - 34);
    ctx.clip();

    const acx = frameX + (frameSize / 2);
    const acy = frameY + ((frameSize - 34) / 2);

    // Dark grooves
    ctx.fillStyle = "#111317";
    ctx.beginPath();
    ctx.arc(acx, acy, 66, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#252830";
    ctx.lineWidth = 1.4;
    for (let r = 56; r >= 26; r -= 10) {
      ctx.beginPath();
      ctx.arc(acx, acy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Vinyl red center label
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(acx, acy, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0A0B0E";
    ctx.beginPath();
    ctx.arc(acx, acy, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Artistic Crimson Paint Splatter across top-right of artwork
  ctx.save();
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(frameX + frameSize - 65, frameY);
  ctx.lineTo(frameX + frameSize, frameY);
  ctx.lineTo(frameX + frameSize, frameY + 55);
  ctx.lineTo(frameX + frameSize - 35, frameY + 38);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.arc(frameX + frameSize - 75, frameY + 12, 4, 0, Math.PI * 2);
  ctx.arc(frameX + frameSize - 20, frameY + 70, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Vertical Japanese Typography: 音楽でつながる
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 11px 'MS Gothic', 'Yu Gothic', sans-serif";
  const jpChars = ["音", "楽", "で", "つ", "な", "が", "る"];
  for (let j = 0; j < jpChars.length; j++) {
    ctx.fillText(jpChars[j], frameX + 8, frameY + 24 + j * 16);
  }
  ctx.fillStyle = accentColor;
  ctx.fillRect(frameX + 9, frameY + 24 + jpChars.length * 16 + 2, 8, 8);
  ctx.restore();

  // Bottom Technical Box inside artwork frame: Barcode & Label
  const bottomBarY = frameY + frameSize - 28;
  ctx.strokeStyle = "#25272F";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(frameX, bottomBarY);
  ctx.lineTo(frameX + frameSize, bottomBarY);
  ctx.stroke();

  drawBarcode(ctx, frameX + 8, bottomBarY + 6, 85, 16);

  ctx.fillStyle = "#6B6F7A";
  ctx.font = "700 8px Consolas, monospace";
  ctx.fillText("TRACK.AUDIO", frameX + 102, bottomBarY + 17);

  drawFourPointStar(ctx, frameX + frameSize - 14, bottomBarY + 14, 6, 2, "#C0C4CC");

  // ========================================================
  // 3. RIGHT CONTENT AREA: HEADER
  // ========================================================
  const contentX = 256;

  // Boxed tag: NOW PLAYING
  ctx.strokeStyle = "#383B44";
  ctx.fillStyle = "#121317";
  ctx.lineWidth = 1;
  ctx.fillRect(contentX, 22, 110, 22);
  ctx.strokeRect(contentX, 22, 110, 22);
  ctx.fillStyle = "#DCDFE6";
  ctx.font = "700 10px Consolas, monospace";
  ctx.fillText("NOW PLAYING", contentX + 14, 36);

  // Wireframe Globe
  drawWireframeGlobe(ctx, 395, 33, 14);

  // Box [ PEOPLE / MUSIC / TOGETHER ]
  ctx.strokeStyle = "#2B2D35";
  ctx.strokeRect(425, 23, 120, 20);
  ctx.fillStyle = "#8E929D";
  ctx.font = "700 8px Bahnschrift, Consolas, monospace";
  ctx.fillText("PEOPLE / MUSIC / TOGETHER", 430, 36);

  // + + + + Crosshairs
  ctx.fillStyle = "#6B6F7A";
  ctx.font = "700 12px Consolas, monospace";
  ctx.fillText("+  +  +  +", 565, 36);

  // Top-Right Slogan & Caution Stripes
  ctx.fillStyle = "#6B6F7A";
  ctx.font = "700 9px Consolas, monospace";
  ctx.textAlign = "right";
  ctx.fillText("TOGETHER.LIVE", 915, 36);
  ctx.textAlign = "left";

  drawDiagonalStripes(ctx, 930, 22, 45, 22, 5, 2, "#4A4D55");

  // ========================================================
  // 4. TITLE & ARTIST SECTION
  // ========================================================
  const titleText = track.title || "Side To Side";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = '900 32px Bahnschrift, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  const fittedTitle = fitText(ctx, titleText, 660);
  ctx.fillText(fittedTitle, contentX, 86);

  const titleW = ctx.measureText(fittedTitle).width;
  drawFourPointStar(ctx, contentX + titleW + 18, 76, 9, 3, accentColor);

  // Artist / Author
  const authorText = cleanAuthorName(track.author || "Unknown Artist");
  ctx.fillStyle = "#9598A0";
  ctx.font = "700 12px Consolas, monospace";
  ctx.fillText("ARTIST", contentX, 118);

  ctx.fillStyle = "#E4E7ED";
  ctx.font = '700 18px Bahnschrift, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  ctx.fillText(fitText(ctx, authorText, 600), contentX + 60, 118);

  // Thin separator rule
  ctx.strokeStyle = "#1E2027";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(contentX, 134);
  ctx.lineTo(WIDTH - 25, 134);
  ctx.stroke();

  // ========================================================
  // 5. BOTTOM TECHNICAL BENTO BOXES
  // ========================================================
  const bentoY = 146;
  const bentoH = 68;

  // Box 1: DURATION
  const box1W = 160;
  ctx.fillStyle = "#0E0F13";
  ctx.strokeStyle = "#272930";
  ctx.fillRect(contentX, bentoY, box1W, bentoH);
  ctx.strokeRect(contentX, bentoY, box1W, bentoH);

  ctx.fillStyle = "#6B6F7A";
  ctx.font = "700 9px Consolas, monospace";
  ctx.fillText("DURATION", contentX + 14, bentoY + 20);

  const durationStr = track.length ? convertTime(track.length) : "03:47";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 20px Bahnschrift, Arial, sans-serif";
  ctx.fillText(durationStr, contentX + 14, bentoY + 48);

  // Box 2: REQUESTER
  const box2X = contentX + box1W + 14;
  const box2W = 210;
  ctx.fillStyle = "#0E0F13";
  ctx.strokeStyle = "#272930";
  ctx.fillRect(box2X, bentoY, box2W, bentoH);
  ctx.strokeRect(box2X, bentoY, box2W, bentoH);

  ctx.fillStyle = "#6B6F7A";
  ctx.font = "700 9px Consolas, monospace";
  ctx.fillText("REQUESTED BY", box2X + 14, bentoY + 20);

  const reqUser = track.requester;
  let reqName = reqUser?.username || reqUser?.tag || reqUser?.displayName || (typeof reqUser === "string" ? reqUser : "Listener");
  if (!reqName || typeof reqName !== "string") reqName = "Listener";
  reqName = reqName.trim();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = '800 17px Bahnschrift, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  ctx.fillText(fitText(ctx, `@${reqName.toUpperCase()}`, 180), box2X + 14, bentoY + 48);

  // Box 3: AUDIO EQUALIZER SPECTRUM
  const box3X = box2X + box2W + 14;
  const box3W = WIDTH - 25 - box3X;
  ctx.fillStyle = "#0E0F13";
  ctx.strokeStyle = "#272930";
  ctx.fillRect(box3X, bentoY, box3W, bentoH);
  ctx.strokeRect(box3X, bentoY, box3W, bentoH);

  ctx.fillStyle = "#6B6F7A";
  ctx.font = "700 9px Consolas, monospace";
  ctx.fillText("AUDIO SPECTRUM", box3X + 14, bentoY + 20);

  drawEqualizer(ctx, box3X + 14, bentoY + 28, box3W - 28, 28, 18, 4, accentColor);

  // ========================================================
  // 6. FOOTER LINE
  // ========================================================
  const footerY = 236;
  ctx.fillStyle = "#4D5058";
  ctx.font = "700 9px Consolas, monospace";
  ctx.fillText("TOGETHER / A MUSIC COMMUNITY", contentX, footerY);

  // 3 Interlocking Circles ⚬⚬⚬
  ctx.strokeStyle = "#3A3D46";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(contentX + 195, footerY - 3, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(contentX + 202, footerY - 3, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(contentX + 209, footerY - 3, 5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#4D5058";
  ctx.font = "700 9px Consolas, monospace";
  ctx.textAlign = "right";
  ctx.fillText("MUSIC NEVER SOUNDS THE SAME ALONE.", WIDTH - 25, footerY);
  ctx.textAlign = "left";

  return canvas.encode("png");
}

async function createTrackBanner(track) {
  const url = track?.thumbnail || track?.artworkUrl || artworkUrl(track);
  let artwork = null;

  if (url) {
    try {
      artwork = await fetchArtwork(url);
    } catch {
      // Gracefully fall back to stylized vinyl placeholder without aborting or throwing
      artwork = null;
    }
  }

  return renderTrackBanner(artwork, track);
}

module.exports = { createTrackBanner, renderTrackBanner };
