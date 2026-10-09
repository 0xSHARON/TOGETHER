const { createCanvas } = require("@napi-rs/canvas");

const WIDTH = 1000;
const HEIGHT = 250;

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

function drawModuleIcon(ctx, cx, cy, type, accentColor = "#FF1E38") {
  ctx.save();
  ctx.strokeStyle = "#FFFFFF";
  ctx.fillStyle = "#FFFFFF";
  ctx.lineWidth = 2.5;

  switch (type) {
    case "cmd": {
      // Terminal prompt >_
      ctx.strokeStyle = "#A0A4AE";
      ctx.strokeRect(cx - 30, cy - 25, 60, 50);
      ctx.strokeStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 12);
      ctx.lineTo(cx - 8, cy);
      ctx.lineTo(cx - 20, cy + 12);
      ctx.stroke();

      ctx.fillStyle = accentColor;
      ctx.fillRect(cx - 2, cy + 8, 16, 4);
      break;
    }
    case "guide": {
      // Open book / handbook
      ctx.beginPath();
      ctx.moveTo(cx, cy - 15);
      ctx.lineTo(cx - 25, cy - 20);
      ctx.lineTo(cx - 25, cy + 15);
      ctx.lineTo(cx, cy + 20);
      ctx.lineTo(cx + 25, cy + 15);
      ctx.lineTo(cx + 25, cy - 20);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy - 15);
      ctx.lineTo(cx, cy + 20);
      ctx.stroke();

      ctx.fillStyle = accentColor;
      ctx.fillRect(cx - 18, cy - 8, 12, 2.5);
      ctx.fillRect(cx - 18, cy, 10, 2.5);
      ctx.fillRect(cx + 6, cy - 8, 12, 2.5);
      ctx.fillRect(cx + 6, cy, 10, 2.5);
      break;
    }
    case "features": {
      // Sparkle & Waves
      drawFourPointStar(ctx, cx - 10, cy - 5, 22, 6, "#FFFFFF");
      drawFourPointStar(ctx, cx + 18, cy - 15, 10, 3, accentColor);
      drawFourPointStar(ctx, cx + 15, cy + 15, 14, 4, "#A0A4AE");
      break;
    }
    case "setup": {
      // Gear / sliders
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.stroke();

      // Cog teeth
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4;
        const tx = cx + Math.cos(ang) * 23;
        const ty = cy + Math.sin(ang) * 23;
        ctx.fillStyle = i % 2 === 0 ? accentColor : "#A0A4AE";
        ctx.fillRect(tx - 3, ty - 3, 6, 6);
      }
      break;
    }
    case "status": {
      // Radar / Antenna pulse
      ctx.beginPath();
      ctx.arc(cx, cy, 24, Math.PI * 0.8, Math.PI * 0.2, true);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 15, Math.PI * 0.8, Math.PI * 0.2, true);
      ctx.stroke();

      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      // Tower base
      ctx.strokeStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(cx, cy + 6);
      ctx.lineTo(cx, cy + 26);
      ctx.moveTo(cx - 10, cy + 26);
      ctx.lineTo(cx + 10, cy + 26);
      ctx.stroke();
      break;
    }
    case "suggestions": {
      // Lightbulb / Idea
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 16, Math.PI * 0.75, Math.PI * 0.25, true);
      ctx.lineTo(cx + 8, cy + 12);
      ctx.lineTo(cx - 8, cy + 12);
      ctx.closePath();
      ctx.stroke();

      // Filament
      ctx.fillStyle = accentColor;
      ctx.fillRect(cx - 7, cy + 15, 14, 3);
      ctx.fillRect(cx - 4, cy + 20, 8, 3);

      // Rays
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 28);
      ctx.lineTo(cx, cy - 24);
      ctx.moveTo(cx - 22, cy - 16);
      ctx.lineTo(cx - 18, cy - 13);
      ctx.moveTo(cx + 22, cy - 16);
      ctx.lineTo(cx + 18, cy - 13);
      ctx.stroke();
      break;
    }
    case "bugs":
    default: {
      // Shield / Alert
      ctx.beginPath();
      ctx.moveTo(cx, cy - 22);
      ctx.lineTo(cx + 20, cy - 14);
      ctx.lineTo(cx + 18, cy + 8);
      ctx.lineTo(cx, cy + 24);
      ctx.lineTo(cx - 18, cy + 8);
      ctx.lineTo(cx - 20, cy - 14);
      ctx.closePath();
      ctx.stroke();

      // Exclamation mark
      ctx.fillStyle = accentColor;
      ctx.fillRect(cx - 2.5, cy - 10, 5, 12);
      ctx.beginPath();
      ctx.arc(cx, cy + 8, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

async function renderChannelBanner(options = {}) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const accentColor = options.accentColor || "#FF1E38";
  const title = options.title || "BOT COMMANDS";
  const subtitle = options.subtitle || "COMPLETE PLAYBACK CONTROLS & DIRECTORY";
  const moduleTag = options.moduleTag || "MODULE // 01";
  const jpText = options.jpText || ["指", "令", "体", "系"];
  const iconType = options.iconType || "cmd";
  const stat1Label = options.stat1Label || "ACCESS";
  const stat1Value = options.stat1Value || "PUBLIC";
  const stat2Label = options.stat2Label || "COMMANDS";
  const stat2Value = options.stat2Value || "PREFIX / SLASH";

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
  // 2. LEFT PANEL: BRUTALIST GRAPHIC FRAME
  // ========================================================
  const frameX = 25;
  const frameY = 22;
  const frameSize = 206;

  ctx.fillStyle = "#0E0F13";
  ctx.fillRect(frameX, frameY, frameSize, frameSize);

  ctx.strokeStyle = "#2B2D35";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(frameX, frameY, frameSize, frameSize);

  // Inner frame area
  ctx.fillStyle = "#12141B";
  ctx.fillRect(frameX + 2, frameY + 2, frameSize - 4, frameSize - 34);

  // Artistic Crimson Paint Splatter across top-right of left frame
  ctx.save();
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(frameX + frameSize - 75, frameY);
  ctx.lineTo(frameX + frameSize, frameY);
  ctx.lineTo(frameX + frameSize, frameY + 65);
  ctx.lineTo(frameX + frameSize - 40, frameY + 45);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.arc(frameX + frameSize - 85, frameY + 14, 5, 0, Math.PI * 2);
  ctx.arc(frameX + frameSize - 25, frameY + 80, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Draw Central Module Icon
  drawModuleIcon(ctx, frameX + frameSize / 2 + 10, frameY + 85, iconType, accentColor);

  // Vertical Japanese Typography
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 13px 'MS Gothic', 'Yu Gothic', sans-serif";
  for (let j = 0; j < jpText.length; j++) {
    ctx.fillText(jpText[j], frameX + 12, frameY + 32 + j * 20);
  }
  ctx.fillStyle = accentColor;
  ctx.fillRect(frameX + 13, frameY + 32 + jpText.length * 20 + 4, 10, 10);
  ctx.restore();

  // Bottom Technical Barcode Strip
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
  ctx.fillText("TOGETHER.HUB", frameX + 102, bottomBarY + 17);

  drawFourPointStar(ctx, frameX + frameSize - 14, bottomBarY + 14, 6, 2, "#C0C4CC");

  // ========================================================
  // 3. RIGHT CONTENT AREA: HEADER
  // ========================================================
  const contentX = 256;

  // Boxed tag: MODULE TAG
  ctx.strokeStyle = "#383B44";
  ctx.fillStyle = "#121317";
  ctx.lineWidth = 1;
  ctx.fillRect(contentX, 22, 115, 22);
  ctx.strokeRect(contentX, 22, 115, 22);
  ctx.fillStyle = "#DCDFE6";
  ctx.font = "700 10px Consolas, monospace";
  ctx.fillText(moduleTag, contentX + 14, 36);

  // Wireframe Globe
  drawWireframeGlobe(ctx, 400, 33, 14);

  // Box [ PEOPLE / MUSIC / TOGETHER ]
  ctx.strokeStyle = "#2B2D35";
  ctx.strokeRect(430, 23, 120, 20);
  ctx.fillStyle = "#8E929D";
  ctx.font = "700 8px Bahnschrift, Consolas, monospace";
  ctx.fillText("PEOPLE / MUSIC / TOGETHER", 435, 36);

  // + + + + Crosshairs
  ctx.fillStyle = "#6B6F7A";
  ctx.font = "700 12px Consolas, monospace";
  ctx.fillText("+  +  +  +", 570, 36);

  // Top-Right Slogan & Caution Stripes
  ctx.fillStyle = "#6B6F7A";
  ctx.font = "700 9px Consolas, monospace";
  ctx.textAlign = "right";
  ctx.fillText("TOGETHER.DOCS", 915, 36);
  ctx.textAlign = "left";

  drawDiagonalStripes(ctx, 930, 22, 45, 22, 5, 2, "#4A4D55");

  // ========================================================
  // 4. TITLE & SUBTITLE SECTION
  // ========================================================
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 34px Bahnschrift, Arial Black, sans-serif";
  ctx.fillText(title, contentX, 86);

  const titleW = ctx.measureText(title).width;
  drawFourPointStar(ctx, contentX + titleW + 18, 76, 10, 3.5, accentColor);

  ctx.fillStyle = "#9598A0";
  ctx.font = "600 12px Consolas, monospace";
  ctx.fillText(subtitle, contentX, 118);

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

  // Box 1
  const box1W = 175;
  ctx.fillStyle = "#0E0F13";
  ctx.strokeStyle = "#272930";
  ctx.fillRect(contentX, bentoY, box1W, bentoH);
  ctx.strokeRect(contentX, bentoY, box1W, bentoH);

  ctx.fillStyle = "#6B6F7A";
  ctx.font = "700 9px Consolas, monospace";
  ctx.fillText(stat1Label, contentX + 14, bentoY + 20);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 18px Bahnschrift, Arial, sans-serif";
  ctx.fillText(stat1Value, contentX + 14, bentoY + 48);

  // Box 2
  const box2X = contentX + box1W + 14;
  const box2W = 205;
  ctx.fillStyle = "#0E0F13";
  ctx.strokeStyle = "#272930";
  ctx.fillRect(box2X, bentoY, box2W, bentoH);
  ctx.strokeRect(box2X, bentoY, box2W, bentoH);

  ctx.fillStyle = "#6B6F7A";
  ctx.font = "700 9px Consolas, monospace";
  ctx.fillText(stat2Label, box2X + 14, bentoY + 20);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 18px Bahnschrift, Arial, sans-serif";
  ctx.fillText(stat2Value, box2X + 14, bentoY + 48);

  // Box 3: AUDIO EQUALIZER SPECTRUM
  const box3X = box2X + box2W + 14;
  const box3W = WIDTH - 25 - box3X;
  ctx.fillStyle = "#0E0F13";
  ctx.strokeStyle = "#272930";
  ctx.fillRect(box3X, bentoY, box3W, bentoH);
  ctx.strokeRect(box3X, bentoY, box3W, bentoH);

  ctx.fillStyle = "#6B6F7A";
  ctx.font = "700 9px Consolas, monospace";
  ctx.fillText("SIGNAL SPECTRUM", box3X + 14, bentoY + 20);

  drawEqualizer(ctx, box3X + 14, bentoY + 28, box3W - 28, 28, 18, 5, accentColor);

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

module.exports = { renderChannelBanner };
