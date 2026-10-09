const fs = require("node:fs");
const path = require("node:path");
const { createCanvas, Path2D } = require("@napi-rs/canvas");

const OUTPUT_DIR = path.resolve(__dirname, "../assets/emojis");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const SIZE = 128;
const RED = "#FF1E38";
const WHITE = "#FFFFFF";
const BLACK = "#0B0C10";
const GRAY = "#9599A6";
const DARK_GRAY = "#272930";
const GOLD = "#FFD200";
const SPOTIFY_GREEN = "#1ED760";
const SAAVN_TEAL = "#1ECCB0";
const YT_RED = "#FF0000";
const APPLE_RED = "#FA243C";

function newCanvas() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, SIZE, SIZE);
  return { canvas, ctx };
}

function saveEmoji(canvas, filename) {
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, canvas.encodeSync("png"));
}

// 1. check.png - Vibrant Green Brutalist Checkmark with hard drop shadow
{
  const { canvas, ctx } = newCanvas();

  // Hard black drop shadow
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 26;
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";
  ctx.beginPath();
  ctx.moveTo(22 + 5, 64 + 5);
  ctx.lineTo(50 + 5, 92 + 5);
  ctx.lineTo(106 + 5, 28 + 5);
  ctx.stroke();

  // Thick black border
  ctx.beginPath();
  ctx.moveTo(22, 64);
  ctx.lineTo(50, 92);
  ctx.lineTo(106, 28);
  ctx.stroke();

  // Vibrant Green core
  ctx.strokeStyle = SPOTIFY_GREEN;
  ctx.lineWidth = 14;
  ctx.stroke();

  // Brutalist white corner glint on the short bar tip
  ctx.fillStyle = WHITE;
  ctx.fillRect(16, 58, 6, 6);

  saveEmoji(canvas, "check.png");
}

// 2. cross.png
{
  const { canvas, ctx } = newCanvas();
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 24;
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(28, 28); ctx.lineTo(100, 100);
  ctx.moveTo(100, 28); ctx.lineTo(28, 100);
  ctx.stroke();

  ctx.strokeStyle = RED;
  ctx.lineWidth = 14;
  ctx.stroke();

  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.moveTo(64, 52); ctx.lineTo(76, 64); ctx.lineTo(64, 76); ctx.lineTo(52, 64);
  ctx.closePath(); ctx.fill();
  saveEmoji(canvas, "cross.png");
}

// 3. info.png - Clean circular Information badge
{
  const { canvas, ctx } = newCanvas();
  const cx = 64, cy = 64;

  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(cx, cy, 54, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#1E2A38";
  ctx.beginPath(); ctx.arc(cx, cy, 48, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = RED;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, 44, 0, Math.PI * 2); ctx.stroke();

  ctx.fillStyle = WHITE;
  ctx.fillRect(56, 30, 16, 16);

  ctx.fillRect(56, 52, 16, 36);
  ctx.fillRect(48, 52, 16, 8);
  ctx.fillRect(44, 80, 40, 8);
  saveEmoji(canvas, "info.png");
}

// 4. warn.png
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(64, 10);
  ctx.lineTo(122, 112);
  ctx.lineTo(6, 112);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#FFCC00";
  ctx.beginPath();
  ctx.moveTo(64, 18);
  ctx.lineTo(114, 106);
  ctx.lineTo(14, 106);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = BLACK;
  ctx.fillRect(58, 44, 12, 34);
  ctx.fillRect(58, 86, 12, 12);

  ctx.fillStyle = RED;
  ctx.fillRect(60, 46, 8, 30);
  ctx.fillRect(60, 88, 8, 8);
  saveEmoji(canvas, "warn.png");
}

// 5. star.png - Classic 5-pointed Brutalist Star with Drop Shadow
{
  const { canvas, ctx } = newCanvas();
  const cx = 62, cy = 60;

  function drawStarPath(targetCtx, ox, oy, outerR, innerR) {
    targetCtx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerA = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const innerA = outerA + Math.PI / 5;
      const px = ox + Math.cos(outerA) * outerR;
      const py = oy + Math.sin(outerA) * outerR;
      const qx = ox + Math.cos(innerA) * innerR;
      const qy = oy + Math.sin(innerA) * innerR;
      if (i === 0) targetCtx.moveTo(px, py);
      else targetCtx.lineTo(px, py);
      targetCtx.lineTo(qx, qy);
    }
    targetCtx.closePath();
  }

  // Hard black drop shadow
  ctx.fillStyle = BLACK;
  drawStarPath(ctx, cx + 5, cy + 5, 50, 23);
  ctx.fill();

  // Black thick border
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 14;
  ctx.lineJoin = "miter";
  drawStarPath(ctx, cx, cy, 50, 23);
  ctx.stroke();

  // Golden yellow body
  ctx.fillStyle = GOLD;
  drawStarPath(ctx, cx, cy, 50, 23);
  ctx.fill();

  // Clean facet shading: right side slightly deeper gold
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 50);
  ctx.lineTo(cx, cy + 50);
  ctx.lineTo(cx + 60, cy + 50);
  ctx.lineTo(cx + 60, cy - 50);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  drawStarPath(ctx, cx, cy, 50, 23);
  ctx.fill();
  ctx.restore();

  // Crisp top-left highlight point
  ctx.fillStyle = "#FFF9A6";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 42);
  ctx.lineTo(cx, cy - 18);
  ctx.lineTo(cx - 10, cy - 12);
  ctx.closePath();
  ctx.fill();

  saveEmoji(canvas, "star.png");
}

// 6. dot.png - Clean circular Bullet Pin / Slider bead
{
  const { canvas, ctx } = newCanvas();
  const cx = 64, cy = 64;

  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(cx, cy, 38, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = RED;
  ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.beginPath(); ctx.arc(cx - 8, cy - 8, 10, 0, Math.PI * 2); ctx.fill();
  saveEmoji(canvas, "dot.png");
}

// 7. loading.png - Rotating spinner capsules
{
  const { canvas, ctx } = newCanvas();
  const cx = 64, cy = 64, r = 44;
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const x1 = cx + Math.cos(angle) * (r - 16);
    const y1 = cy + Math.sin(angle) * (r - 16);
    const x2 = cx + Math.cos(angle) * r;
    const y2 = cy + Math.sin(angle) * r;

    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

    ctx.strokeStyle = i === 0 ? RED : (i < 4 ? WHITE : GRAY);
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  saveEmoji(canvas, "loading.png");
}

// 8. pause.png
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.fillRect(24, 18, 34, 92);
  ctx.fillRect(70, 18, 34, 92);

  ctx.fillStyle = WHITE;
  ctx.fillRect(28, 22, 26, 84);
  ctx.fillRect(74, 22, 26, 84);

  ctx.fillStyle = RED;
  ctx.fillRect(28, 22, 26, 18);
  saveEmoji(canvas, "pause.png");
}

// 9. play.png
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(28, 14);
  ctx.lineTo(114, 64);
  ctx.lineTo(28, 114);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.moveTo(34, 22);
  ctx.lineTo(106, 64);
  ctx.lineTo(34, 106);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.moveTo(34, 22);
  ctx.lineTo(62, 38);
  ctx.lineTo(34, 54);
  ctx.closePath();
  ctx.fill();
  saveEmoji(canvas, "play.png");
}

// 10. stop.png
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.fillRect(20, 20, 88, 88);

  ctx.fillStyle = WHITE;
  ctx.fillRect(26, 26, 76, 76);

  ctx.fillStyle = RED;
  ctx.fillRect(72, 26, 30, 30);
  saveEmoji(canvas, "stop.png");
}

// 11. voldown.png - Speaker with bold Minus sign & shadow
{
  const { canvas, ctx } = newCanvas();

  function drawSpeaker(ox, oy) {
    ctx.beginPath();
    ctx.moveTo(14 + ox, 44 + oy);
    ctx.lineTo(36 + ox, 44 + oy);
    ctx.lineTo(60 + ox, 22 + oy);
    ctx.lineTo(60 + ox, 106 + oy);
    ctx.lineTo(36 + ox, 84 + oy);
    ctx.lineTo(14 + ox, 84 + oy);
    ctx.closePath();
  }

  // Shadow
  ctx.fillStyle = BLACK;
  drawSpeaker(5, 5); ctx.fill();

  // Border & Body
  ctx.strokeStyle = BLACK; ctx.lineWidth = 14; ctx.lineJoin = "miter";
  drawSpeaker(0, 0); ctx.stroke();
  ctx.fillStyle = WHITE; drawSpeaker(0, 0); ctx.fill();
  ctx.fillStyle = RED; ctx.fillRect(14, 44, 8, 40);

  // Bold Minus sign
  const mx = 78, my = 56, mw = 36, mh = 16;
  ctx.fillStyle = BLACK;
  ctx.fillRect(mx + 4, my + 4, mw, mh);
  ctx.fillRect(mx - 2, my - 2, mw + 4, mh + 4);
  ctx.fillStyle = RED;
  ctx.fillRect(mx, my, mw, mh);

  saveEmoji(canvas, "voldown.png");
}

// 12. volup.png - Speaker with bold Plus sign & shadow
{
  const { canvas, ctx } = newCanvas();

  function drawSpeaker(ox, oy) {
    ctx.beginPath();
    ctx.moveTo(14 + ox, 44 + oy);
    ctx.lineTo(36 + ox, 44 + oy);
    ctx.lineTo(60 + ox, 22 + oy);
    ctx.lineTo(60 + ox, 106 + oy);
    ctx.lineTo(36 + ox, 84 + oy);
    ctx.lineTo(14 + ox, 84 + oy);
    ctx.closePath();
  }

  // Shadow
  ctx.fillStyle = BLACK;
  drawSpeaker(5, 5); ctx.fill();

  // Border & Body
  ctx.strokeStyle = BLACK; ctx.lineWidth = 14; ctx.lineJoin = "miter";
  drawSpeaker(0, 0); ctx.stroke();
  ctx.fillStyle = WHITE; drawSpeaker(0, 0); ctx.fill();
  ctx.fillStyle = RED; ctx.fillRect(14, 44, 8, 40);

  // Bold Plus sign
  const px = 76, py = 44, pw = 38, ph = 38, thick = 14;
  ctx.fillStyle = BLACK;
  ctx.fillRect(px + (pw - thick) / 2 + 4, py + 4, thick, ph);
  ctx.fillRect(px + 4, py + (ph - thick) / 2 + 4, pw, thick);

  ctx.fillRect(px + (pw - thick) / 2 - 2, py - 2, thick + 4, ph + 4);
  ctx.fillRect(px - 2, py + (ph - thick) / 2 - 2, pw + 4, thick + 4);

  ctx.fillStyle = SPOTIFY_GREEN;
  ctx.fillRect(px + (pw - thick) / 2, py, thick, ph);
  ctx.fillRect(px, py + (ph - thick) / 2, pw, thick);

  saveEmoji(canvas, "volup.png");
}

// 13. skip.png
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(20, 20); ctx.lineTo(78, 64); ctx.lineTo(20, 108);
  ctx.closePath(); ctx.fill();
  ctx.fillRect(78, 20, 24, 88);

  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.moveTo(26, 26); ctx.lineTo(74, 64); ctx.lineTo(26, 102);
  ctx.closePath(); ctx.fill();
  ctx.fillRect(82, 26, 16, 76);

  ctx.fillStyle = RED;
  ctx.fillRect(82, 26, 16, 18);
  saveEmoji(canvas, "skip.png");
}

// 14. previous.png
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.fillRect(24, 20, 24, 88);
  ctx.beginPath();
  ctx.moveTo(106, 20); ctx.lineTo(48, 64); ctx.lineTo(106, 108);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.fillRect(28, 26, 16, 76);
  ctx.beginPath();
  ctx.moveTo(100, 26); ctx.lineTo(52, 64); ctx.lineTo(100, 102);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = RED;
  ctx.fillRect(28, 26, 16, 18);
  saveEmoji(canvas, "previous.png");
}

// 15. shuffle.png - Crossed arrows
{
  const { canvas, ctx } = newCanvas();
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 18;
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(20, 36); ctx.lineTo(52, 36); ctx.lineTo(78, 90); ctx.lineTo(102, 90);
  ctx.moveTo(20, 90); ctx.lineTo(52, 90); ctx.lineTo(60, 72);
  ctx.moveTo(70, 54); ctx.lineTo(78, 36); ctx.lineTo(102, 36);
  ctx.stroke();

  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(20, 36); ctx.lineTo(52, 36); ctx.lineTo(78, 90); ctx.lineTo(102, 90);
  ctx.moveTo(20, 90); ctx.lineTo(52, 90); ctx.lineTo(60, 72);
  ctx.moveTo(70, 54); ctx.lineTo(78, 36); ctx.lineTo(102, 36);
  ctx.stroke();

  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(94, 18); ctx.lineTo(122, 36); ctx.lineTo(94, 54); ctx.closePath(); ctx.fill();
  ctx.moveTo(94, 72); ctx.lineTo(122, 90); ctx.lineTo(94, 108); ctx.closePath(); ctx.fill();

  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.moveTo(96, 24); ctx.lineTo(116, 36); ctx.lineTo(96, 48); ctx.closePath(); ctx.fill();
  ctx.moveTo(96, 78); ctx.lineTo(116, 90); ctx.lineTo(96, 102); ctx.closePath(); ctx.fill();
  saveEmoji(canvas, "shuffle.png");
}

// 16. loop.png - Circular loop arrows
{
  const { canvas, ctx } = newCanvas();
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 18;
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(34, 52); ctx.lineTo(34, 34); ctx.lineTo(94, 34); ctx.lineTo(94, 60);
  ctx.moveTo(94, 76); ctx.lineTo(94, 94); ctx.lineTo(34, 94); ctx.lineTo(34, 68);
  ctx.stroke();

  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 10;
  ctx.stroke();

  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(18, 52); ctx.lineTo(34, 74); ctx.lineTo(50, 52); ctx.closePath(); ctx.fill();
  ctx.moveTo(78, 76); ctx.lineTo(94, 54); ctx.lineTo(110, 76); ctx.closePath(); ctx.fill();

  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.moveTo(22, 52); ctx.lineTo(34, 68); ctx.lineTo(46, 52); ctx.closePath(); ctx.fill();
  ctx.moveTo(82, 76); ctx.lineTo(94, 60); ctx.lineTo(106, 76); ctx.closePath(); ctx.fill();
  saveEmoji(canvas, "loop.png");
}

// 17. autoplay.png - Circular Flow with Centered Play Triangle
{
  const { canvas, ctx } = newCanvas();
  const cx = 64, cy = 64;

  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, 42, -Math.PI * 0.7, Math.PI * 0.9);
  ctx.stroke();

  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, 42, -Math.PI * 0.7, Math.PI * 0.9);
  ctx.stroke();

  const endAngle = -Math.PI * 0.7;
  const ax = cx + Math.cos(endAngle) * 42;
  const ay = cy + Math.sin(endAngle) * 42;

  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(ax - 6, ay - 18);
  ctx.lineTo(ax + 16, ay);
  ctx.lineTo(ax - 10, ay + 14);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.moveTo(ax - 3, ay - 12);
  ctx.lineTo(ax + 12, ay);
  ctx.lineTo(ax - 6, ay + 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(54, 44); ctx.lineTo(84, 64); ctx.lineTo(54, 84);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.moveTo(56, 48); ctx.lineTo(80, 64); ctx.lineTo(56, 80);
  ctx.closePath(); ctx.fill();
  saveEmoji(canvas, "autoplay.png");
}

// 18. music.png - Double beamed eighth notes
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.ellipse(36, 92, 18, 14, -Math.PI / 6, 0, Math.PI * 2);
  ctx.ellipse(86, 80, 18, 14, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(42, 28, 16, 68);
  ctx.fillRect(92, 16, 16, 68);
  ctx.beginPath();
  ctx.moveTo(42, 28); ctx.lineTo(108, 16); ctx.lineTo(108, 42); ctx.lineTo(42, 54);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.ellipse(36, 92, 14, 10, -Math.PI / 6, 0, Math.PI * 2);
  ctx.ellipse(86, 80, 14, 10, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(46, 32, 9, 60);
  ctx.fillRect(96, 20, 9, 60);
  ctx.beginPath();
  ctx.moveTo(46, 32); ctx.lineTo(103, 20); ctx.lineTo(103, 38); ctx.lineTo(46, 50);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = RED;
  ctx.fillRect(46, 32, 16, 16);
  saveEmoji(canvas, "music.png");
}

// 19. config.png - Gear / Settings cog
{
  const { canvas, ctx } = newCanvas();
  const cx = 64, cy = 64;

  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(cx, cy, 42, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillRect(-10, -56, 20, 22);
    ctx.restore();
  }

  ctx.fillStyle = WHITE;
  ctx.beginPath(); ctx.arc(cx, cy, 38, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillRect(-7, -53, 14, 20);
    ctx.restore();
  }

  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = RED;
  ctx.fillRect(cx - 6, cy - 6, 12, 12);
  saveEmoji(canvas, "config.png");
}

// 20. utility.png - Neo-Brutalist Wrench
{
  const { canvas, ctx } = newCanvas();
  ctx.save();
  ctx.translate(64, 64);
  ctx.rotate(-Math.PI / 4);

  ctx.fillStyle = BLACK;
  ctx.fillRect(-12, -44, 24, 88);
  ctx.beginPath(); ctx.arc(0, -42, 24, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 42, 20, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.fillRect(-8, -40, 16, 80);
  ctx.beginPath(); ctx.arc(0, -42, 20, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 42, 16, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = BLACK;
  ctx.fillRect(-9, -64, 18, 26);

  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(0, 42, 8, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = RED;
  ctx.fillRect(-8, -14, 16, 28);

  ctx.restore();
  saveEmoji(canvas, "utility.png");
}

// 21. filters.png - Equalizer fader sliders
{
  const { canvas, ctx } = newCanvas();
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 12;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(32, 20); ctx.lineTo(32, 108);
  ctx.moveTo(64, 20); ctx.lineTo(64, 108);
  ctx.moveTo(96, 20); ctx.lineTo(96, 108);
  ctx.stroke();

  ctx.strokeStyle = DARK_GRAY;
  ctx.lineWidth = 6;
  ctx.stroke();

  function drawFader(x, y, isAccent) {
    ctx.fillStyle = BLACK;
    ctx.fillRect(x - 16, y - 12, 32, 24);

    ctx.fillStyle = isAccent ? RED : WHITE;
    ctx.fillRect(x - 13, y - 9, 26, 18);

    ctx.fillStyle = BLACK;
    ctx.fillRect(x - 9, y - 2, 18, 4);
  }

  drawFader(32, 76, false);
  drawFader(64, 38, true);
  drawFader(96, 56, false);
  saveEmoji(canvas, "filters.png");
}

// 22. home.png - Solid house with roof, chimney, door & window
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.fillRect(80, 18, 18, 30);
  ctx.beginPath();
  ctx.moveTo(64, 12);
  ctx.lineTo(118, 56);
  ctx.lineTo(102, 56);
  ctx.lineTo(102, 114);
  ctx.lineTo(26, 114);
  ctx.lineTo(26, 56);
  ctx.lineTo(10, 56);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.fillRect(82, 22, 14, 24);
  ctx.beginPath();
  ctx.moveTo(64, 18);
  ctx.lineTo(112, 58);
  ctx.lineTo(96, 58);
  ctx.lineTo(96, 108);
  ctx.lineTo(32, 108);
  ctx.lineTo(32, 58);
  ctx.lineTo(16, 58);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = RED;
  ctx.fillRect(52, 68, 24, 40);
  ctx.fillStyle = BLACK;
  ctx.fillRect(70, 86, 4, 6);

  ctx.fillStyle = BLACK;
  ctx.fillRect(36, 68, 12, 14);
  ctx.fillStyle = WHITE;
  ctx.fillRect(38, 70, 8, 10);
  saveEmoji(canvas, "home.png");
}

// 23. dance.png - Disco Mirror Ball with clean star sparkles
{
  const { canvas, ctx } = newCanvas();
  const cx = 64, cy = 66, r = 38;

  ctx.strokeStyle = BLACK; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(cx, 4); ctx.lineTo(cx, cy - r); ctx.stroke();
  ctx.strokeStyle = WHITE; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, 4); ctx.lineTo(cx, cy - r); ctx.stroke();

  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = DARK_GRAY;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  for (let y = cy - r; y <= cy + r; y += 11) {
    for (let x = cx - r; x <= cx + r; x += 11) {
      const isBright = (Math.floor((x + y) / 11)) % 2 === 0;
      const isRed = (x >= cx - 6 && x <= cx + 5 && y >= cy - 6 && y <= cy + 5);
      ctx.fillStyle = isRed ? RED : (isBright ? WHITE : GRAY);
      ctx.fillRect(x + 1, y + 1, 9, 9);
      ctx.strokeStyle = BLACK;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, 11, 11);
    }
  }
  ctx.restore();

  function drawSparkle(sx, sy, size, color) {
    ctx.fillStyle = BLACK;
    ctx.beginPath();
    ctx.moveTo(sx, sy - size - 3); ctx.lineTo(sx + 4, sy);
    ctx.lineTo(sx + size + 3, sy); ctx.lineTo(sx + 4, sy + 4);
    ctx.lineTo(sx, sy + size + 3); ctx.lineTo(sx - 4, sy + 4);
    ctx.lineTo(sx - size - 3, sy); ctx.lineTo(sx - 4, sy - 4);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(sx, sy - size); ctx.lineTo(sx + 2, sy);
    ctx.lineTo(sx + size, sy); ctx.lineTo(sx + 2, sy + 2);
    ctx.lineTo(sx, sy + size); ctx.lineTo(sx - 2, sy + 2);
    ctx.lineTo(sx - size, sy); ctx.lineTo(sx - 2, sy - 2);
    ctx.closePath(); ctx.fill();
  }

  drawSparkle(20, 36, 12, WHITE);
  drawSparkle(108, 40, 14, RED);
  drawSparkle(16, 96, 10, GOLD);
  drawSparkle(110, 96, 12, WHITE);
  saveEmoji(canvas, "dance.png");
}

// 24. youtube.png - Official YouTube: Red button with White Triangle
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.roundRect(10, 22, 108, 84, 24); ctx.fill();

  ctx.fillStyle = YT_RED;
  ctx.beginPath(); ctx.roundRect(14, 26, 100, 76, 20); ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.moveTo(52, 44);
  ctx.lineTo(86, 64);
  ctx.lineTo(52, 84);
  ctx.closePath();
  ctx.fill();
  saveEmoji(canvas, "youtube.png");
}

// 25. spotify.png - Official Spotify: Green disc with 3 black sound waves
{
  const { canvas, ctx } = newCanvas();
  const cx = 64, cy = 64;

  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(cx, cy, 54, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = SPOTIFY_GREEN;
  ctx.beginPath(); ctx.arc(cx, cy, 48, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-10 * Math.PI / 180);

  ctx.strokeStyle = BLACK;
  ctx.lineCap = "round";

  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.arc(0, 68, 86, -Math.PI * 0.63, -Math.PI * 0.37);
  ctx.stroke();

  ctx.lineWidth = 9.5;
  ctx.beginPath();
  ctx.arc(0, 68, 70, -Math.PI * 0.62, -Math.PI * 0.38);
  ctx.stroke();

  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(0, 68, 54, -Math.PI * 0.61, -Math.PI * 0.39);
  ctx.stroke();

  ctx.restore();
  saveEmoji(canvas, "spotify.png");
}

// 26. ytmusic.png - Official YouTube Music: Red circle, white ring, white play triangle
{
  const { canvas, ctx } = newCanvas();
  const cx = 64, cy = 64;

  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(cx, cy, 54, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = YT_RED;
  ctx.beginPath(); ctx.arc(cx, cy, 48, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(cx, cy, 33, 0, Math.PI * 2); ctx.stroke();

  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.moveTo(56, 46);
  ctx.lineTo(80, 64);
  ctx.lineTo(56, 82);
  ctx.closePath();
  ctx.fill();
  saveEmoji(canvas, "ytmusic.png");
}

// 27. applemusic.png - Official Apple Music: Red-Pink squircle with authentic white double eighth note
{
  const { canvas, ctx } = newCanvas();

  // Shadow
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.roundRect(16 + 5, 16 + 5, 96, 96, 26);
  ctx.fill();

  // Black heavy border
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.roundRect(16, 16, 96, 96, 26);
  ctx.fill();

  // Apple Music Signature Red-Pink Body
  ctx.fillStyle = APPLE_RED;
  ctx.beginPath();
  ctx.roundRect(22, 22, 84, 84, 20);
  ctx.fill();

  // Note Geometry (Authentic Apple Music proportions)
  ctx.fillStyle = WHITE;

  // Left Notehead: tilted oval
  ctx.save();
  ctx.translate(45, 80);
  ctx.rotate(-Math.PI / 7);
  ctx.beginPath();
  ctx.ellipse(0, 0, 13.5, 9.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right Notehead: tilted oval
  ctx.save();
  ctx.translate(77, 70);
  ctx.rotate(-Math.PI / 7);
  ctx.beginPath();
  ctx.ellipse(0, 0, 13.5, 9.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Left Stem
  ctx.fillRect(52, 34, 7, 48);

  // Right Stem
  ctx.fillRect(84, 24, 7, 48);

  // Slanted Connecting Beam with rounded caps
  ctx.save();
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 11;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(55.5, 39);
  ctx.lineTo(87.5, 29);
  ctx.stroke();
  ctx.restore();

  saveEmoji(canvas, "applemusic.png");
}

// 28. deezer.png - Official Deezer Equalizer: Rainbow spectrum columns with black borders
{
  const { canvas, ctx } = newCanvas();
  const heights = [2, 4, 6, 4, 3];
  const barColors = ["#00C7F2", "#00D285", "#FFDE00", "#FF8700", "#FF1E38"];

  for (let c = 0; c < 5; c++) {
    const x = 18 + c * 19;
    const count = heights[c];
    for (let r = 0; r < count; r++) {
      const y = 96 - r * 14;
      ctx.fillStyle = BLACK;
      ctx.fillRect(x - 2, y - 2, 18, 14);

      ctx.fillStyle = barColors[c];
      ctx.fillRect(x, y, 14, 10);
    }
  }
  saveEmoji(canvas, "deezer.png");
}

// 29. jiosaavn.png - Official JioSaavn: Teal circle with authentic white logomark
{
  const { canvas, ctx } = newCanvas();
  const cx = 64, cy = 64;

  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(cx, cy, 54, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = SAAVN_TEAL;
  ctx.beginPath(); ctx.arc(cx, cy, 48, 0, Math.PI * 2); ctx.fill();

  const p1 = new Path2D("M13.8,25.1c-0.6-1-1.4-1.9-2.4-2.5s-2-1.1-3.2-1.4H8.2c-0.1,0-0.2,0-0.3,0.1c-0.1,0.1-0.1,0.2-0.1,0.3c0,0.1,0,0.2,0.1,0.2c1.3,1.9,3.3,3.3,5.5,3.9h0.1c0.1,0,0.1,0,0.2,0c0,0,0.1,0,0.1-0.1c0,0,0.1-0.1,0.1-0.1c0,0,0-0.1,0-0.2C13.9,25.2,13.9,25.1,13.8,25.1L13.8,25.1z");
  const p2 = new Path2D("M25.6,13.3c0,0,0-0.1,0-0.1c-0.5-1.8-1.5-3.4-2.9-4.6c-1.4-1.2-3-2.1-4.8-2.4h-0.1c-0.1,0-0.2,0-0.3,0.1c-0.1,0.1-0.1,0.2-0.1,0.3v0.1c0.9,5.5,0.3,11.1-1.7,16.3c0,0.1-0.1,0.1-0.1,0.2s-0.1,0.1-0.2,0.1c-0.1,0-0.1,0-0.2,0c0,0-0.1,0-0.1-0.1c0,0-0.1-0.1-0.1-0.1c0,0,0-0.1,0-0.2c0,0-0.1-0.7-0.1-1c-0.6-4.8-2-9.4-4.3-13.7c0-0.1-0.1-0.1-0.1-0.1c0,0-0.1-0.1-0.1-0.1s-0.1,0-0.2,0C10.1,8,10.1,8,10,8l0,0c-1.4,1.1-2.5,2.5-3.2,4.2c0,0.1,0,0.2,0,0.3c0,0.1,0.1,0.2,0.2,0.2c2.2,1.4,4,3.2,5.3,5.5c1.3,2.2,2,4.8,2.1,7.3c0,0.1,0,0.2,0.1,0.3c0.1,0.1,0.2,0.1,0.2,0.1c0.2,0,0.5,0.1,0.7,0.1c0.1,0,0.2,0,0.3-0.1c0.1-0.1,0.1-0.1,0.1-0.2c0.5-2.6,1.6-5.1,3.3-7.2c1.7-2.1,3.8-3.7,6.3-4.8c0.1,0,0.1-0.1,0.2-0.1C25.6,13.4,25.6,13.4,25.6,13.3z");
  const p3 = new Path2D("M24.7,20.9c0-0.1,0-0.2-0.1-0.3c-0.1-0.1-0.2-0.1-0.3-0.1h-0.1c-3.1,0.7-5.9,2.4-7.9,4.8c-0.1,0.1-0.1,0.2-0.1,0.3c0,0.1,0,0.2,0.1,0.3c0.1,0.1,0.2,0.1,0.3,0.1l0,0c1.6-0.1,3.2-0.6,4.6-1.4s2.6-2,3.4-3.4C24.7,21.1,24.7,21,24.7,20.9L24.7,20.9z");

  ctx.save();
  ctx.translate(16, 16);
  ctx.scale(3, 3);
  ctx.fillStyle = WHITE;
  ctx.fill(p1);
  ctx.fill(p2);
  ctx.fill(p3);
  ctx.restore();

  saveEmoji(canvas, "jiosaavn.png");
}

// 30. favourite.png - Brutalist Crimson Heart with facet highlight
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(64, 106);
  ctx.bezierCurveTo(18, 76, 8, 40, 28, 24);
  ctx.bezierCurveTo(48, 10, 64, 30, 64, 38);
  ctx.bezierCurveTo(64, 30, 80, 10, 100, 24);
  ctx.bezierCurveTo(120, 40, 110, 76, 64, 106);
  ctx.fill();

  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.moveTo(64, 98);
  ctx.bezierCurveTo(24, 70, 16, 42, 32, 28);
  ctx.bezierCurveTo(49, 16, 64, 34, 64, 42);
  ctx.bezierCurveTo(64, 34, 79, 16, 96, 28);
  ctx.bezierCurveTo(112, 42, 104, 70, 64, 98);
  ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.moveTo(36, 36);
  ctx.lineTo(52, 32);
  ctx.lineTo(48, 48);
  ctx.lineTo(32, 50);
  ctx.closePath();
  ctx.fill();
  saveEmoji(canvas, "favourite.png");
}

// 31. rank.png - Leaderboard Podium with #1, #2, #3
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.fillRect(14, 52, 34, 62);
  ctx.fillRect(47, 30, 34, 84);
  ctx.fillRect(80, 64, 34, 50);

  ctx.fillStyle = WHITE;
  ctx.fillRect(51, 34, 26, 76);
  ctx.fillStyle = GRAY;
  ctx.fillRect(18, 56, 26, 54);
  ctx.fillStyle = DARK_GRAY;
  ctx.fillRect(84, 68, 26, 42);

  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.moveTo(52, 28); ctx.lineTo(50, 16); ctx.lineTo(58, 22);
  ctx.lineTo(64, 12); ctx.lineTo(70, 22); ctx.lineTo(78, 16); ctx.lineTo(76, 28);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = BLACK;
  ctx.font = "900 20px Bahnschrift, Arial Black, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("1", 64, 60);
  ctx.fillText("2", 31, 80);
  ctx.fillStyle = WHITE;
  ctx.fillText("3", 97, 92);
  saveEmoji(canvas, "rank.png");
}

// 32. level.png - Level-Up Double Ascending Chevrons
{
  const { canvas, ctx } = newCanvas();

  function drawChevron(y, fillColor, isAccent) {
    ctx.fillStyle = BLACK;
    ctx.beginPath();
    ctx.moveTo(64, y);
    ctx.lineTo(110, y + 36);
    ctx.lineTo(94, y + 50);
    ctx.lineTo(64, y + 26);
    ctx.lineTo(34, y + 50);
    ctx.lineTo(18, y + 36);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(64, y + 6);
    ctx.lineTo(104, y + 36);
    ctx.lineTo(92, y + 46);
    ctx.lineTo(64, y + 24);
    ctx.lineTo(36, y + 46);
    ctx.lineTo(24, y + 36);
    ctx.closePath();
    ctx.fill();

    if (isAccent) {
      ctx.fillStyle = WHITE;
      ctx.fillRect(60, y + 10, 8, 12);
    }
  }

  drawChevron(16, WHITE, true);
  drawChevron(52, RED, false);
  saveEmoji(canvas, "level.png");
}

// 33. vinyl.png
{
  const { canvas, ctx } = newCanvas();
  const cx = 64, cy = 64;
  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(cx, cy, 54, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.beginPath(); ctx.arc(cx, cy, 50, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = DARK_GRAY;
  ctx.lineWidth = 2.5;
  for (let r = 42; r >= 26; r -= 6) {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  }

  ctx.fillStyle = RED;
  ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
  saveEmoji(canvas, "vinyl.png");
}

// 34. trophy.png - Solid Golden Trophy Cup
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(28, 20); ctx.lineTo(100, 20); ctx.lineTo(88, 70);
  ctx.bezierCurveTo(84, 84, 44, 84, 40, 70);
  ctx.closePath(); ctx.fill();
  ctx.fillRect(52, 70, 24, 24);
  ctx.fillRect(34, 90, 60, 24);
  ctx.strokeStyle = BLACK; ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(32, 44, 16, Math.PI * 0.5, Math.PI * 1.5);
  ctx.arc(96, 44, 16, Math.PI * 1.5, Math.PI * 0.5);
  ctx.stroke();

  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(34, 24); ctx.lineTo(94, 24); ctx.lineTo(84, 68);
  ctx.bezierCurveTo(80, 80, 48, 80, 44, 68);
  ctx.closePath(); ctx.fill();
  ctx.fillRect(58, 74, 12, 18);
  ctx.fillRect(40, 94, 48, 16);

  ctx.strokeStyle = GOLD; ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(32, 44, 16, Math.PI * 0.5, Math.PI * 1.5);
  ctx.arc(96, 44, 16, Math.PI * 1.5, Math.PI * 0.5);
  ctx.stroke();

  ctx.fillStyle = WHITE;
  ctx.fillRect(38, 28, 8, 36);

  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.arc(64, 46, 8, 0, Math.PI * 2); ctx.fill();
  saveEmoji(canvas, "trophy.png");
}

// 35. lock.png - Solid Closed Padlock
{
  const { canvas, ctx } = newCanvas();
  ctx.strokeStyle = BLACK; ctx.lineWidth = 18; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(40, 58);
  ctx.lineTo(40, 42);
  ctx.arc(64, 42, 24, Math.PI, 0);
  ctx.lineTo(88, 58);
  ctx.stroke();

  ctx.strokeStyle = WHITE; ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(40, 56);
  ctx.lineTo(40, 42);
  ctx.arc(64, 42, 24, Math.PI, 0);
  ctx.lineTo(88, 56);
  ctx.stroke();

  ctx.fillStyle = BLACK; ctx.fillRect(22, 52, 84, 64);
  ctx.fillStyle = WHITE; ctx.fillRect(26, 56, 76, 56);

  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(64, 76, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(60, 76, 8, 18);

  ctx.fillStyle = RED;
  ctx.beginPath(); ctx.arc(64, 76, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(62, 76, 4, 14);
  saveEmoji(canvas, "lock.png");
}

// 36. time.png - Clock face with white dial and hands
{
  const { canvas, ctx } = newCanvas();
  const cx = 64, cy = 64;
  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(cx, cy, 54, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.beginPath(); ctx.arc(cx, cy, 46, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = BLACK;
  ctx.fillRect(cx - 3, 22, 6, 10);
  ctx.fillRect(cx - 3, 96, 6, 10);
  ctx.fillRect(22, cy - 3, 10, 6);
  ctx.fillRect(96, cy - 3, 10, 6);

  ctx.strokeStyle = BLACK; ctx.lineWidth = 8; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 18, cy - 14); ctx.stroke();

  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 22, cy - 20); ctx.stroke();

  ctx.strokeStyle = RED; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + 24); ctx.stroke();

  ctx.fillStyle = RED;
  ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
  saveEmoji(canvas, "time.png");
}

// 37. crown.png - Solid Royal Crown with ruby jewels
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(16, 92); ctx.lineTo(12, 36); ctx.lineTo(40, 58);
  ctx.lineTo(64, 22); ctx.lineTo(88, 58); ctx.lineTo(116, 36); ctx.lineTo(112, 92);
  ctx.closePath(); ctx.fill();
  ctx.fillRect(14, 84, 100, 24);

  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(20, 88); ctx.lineTo(16, 42); ctx.lineTo(42, 62);
  ctx.lineTo(64, 30); ctx.lineTo(86, 62); ctx.lineTo(112, 42); ctx.lineTo(108, 88);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = RED;
  ctx.fillRect(18, 88, 92, 16);

  ctx.fillStyle = RED;
  ctx.beginPath(); ctx.arc(16, 38, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(64, 26, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(112, 38, 7, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.fillRect(32, 92, 8, 8);
  ctx.fillRect(60, 92, 8, 8);
  ctx.fillRect(88, 92, 8, 8);
  saveEmoji(canvas, "crown.png");
}

// 38. sparkles.png
{
  const { canvas, ctx } = newCanvas();
  function drawMiniStar(cx, cy, outerR, innerR, color) {
    ctx.fillStyle = BLACK;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      ctx.lineTo(cx + Math.cos(angle) * (outerR + 4), cy + Math.sin(angle) * (outerR + 4));
      const half = angle + Math.PI / 4;
      ctx.lineTo(cx + Math.cos(half) * (innerR + 3), cy + Math.sin(half) * (innerR + 3));
    }
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      const half = angle + Math.PI / 4;
      ctx.lineTo(cx + Math.cos(half) * innerR, cy + Math.sin(half) * innerR);
    }
    ctx.closePath(); ctx.fill();
  }

  drawMiniStar(52, 60, 42, 12, WHITE);
  drawMiniStar(96, 32, 22, 7, RED);
  drawMiniStar(92, 88, 16, 5, WHITE);
  saveEmoji(canvas, "sparkles.png");
}

// 39. diamond.png - Brilliant cut gemstone
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(34, 22); ctx.lineTo(94, 22); ctx.lineTo(118, 54);
  ctx.lineTo(64, 114); ctx.lineTo(10, 54); ctx.closePath(); ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.moveTo(38, 26); ctx.lineTo(90, 26); ctx.lineTo(112, 54);
  ctx.lineTo(64, 108); ctx.lineTo(16, 54); ctx.closePath(); ctx.fill();

  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(38, 26); ctx.lineTo(64, 108); ctx.lineTo(90, 26);
  ctx.moveTo(16, 54); ctx.lineTo(112, 54);
  ctx.moveTo(38, 26); ctx.lineTo(46, 54); ctx.lineTo(64, 108);
  ctx.moveTo(90, 26); ctx.lineTo(82, 54); ctx.lineTo(64, 108);
  ctx.stroke();

  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.moveTo(46, 54); ctx.lineTo(64, 26); ctx.lineTo(82, 54); ctx.lineTo(64, 86);
  ctx.closePath(); ctx.fill();
  saveEmoji(canvas, "diamond.png");
}

// 40. headphones.png
{
  const { canvas, ctx } = newCanvas();
  const cx = 64, cy = 64;

  ctx.strokeStyle = BLACK; ctx.lineWidth = 18; ctx.lineCap = "square";
  ctx.beginPath(); ctx.arc(cx, cy - 4, 38, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = BLACK;
  ctx.fillRect(10, 50, 30, 46);
  ctx.fillRect(88, 50, 30, 46);

  ctx.strokeStyle = WHITE; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.arc(cx, cy - 4, 38, Math.PI, 0); ctx.stroke();

  ctx.fillStyle = WHITE;
  ctx.fillRect(20, 54, 16, 38);
  ctx.fillRect(92, 54, 16, 38);

  ctx.fillStyle = RED;
  ctx.fillRect(14, 60, 6, 26);
  ctx.fillRect(108, 60, 6, 26);
  saveEmoji(canvas, "headphones.png");
}

// 41. medal1.png
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.moveTo(36, 16); ctx.lineTo(64, 52); ctx.lineTo(50, 52); ctx.lineTo(26, 16);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.moveTo(92, 16); ctx.lineTo(64, 52); ctx.lineTo(78, 52); ctx.lineTo(102, 16);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(64, 76, 36, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#FFD700";
  ctx.beginPath(); ctx.arc(64, 76, 32, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = BLACK;
  ctx.font = "900 34px Bahnschrift, Arial Black, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("1", 64, 88);
  saveEmoji(canvas, "medal1.png");
}

// 42. medal2.png
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.moveTo(36, 16); ctx.lineTo(64, 52); ctx.lineTo(50, 52); ctx.lineTo(26, 16);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.moveTo(92, 16); ctx.lineTo(64, 52); ctx.lineTo(78, 52); ctx.lineTo(102, 16);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(64, 76, 36, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#E0E3EB";
  ctx.beginPath(); ctx.arc(64, 76, 32, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = BLACK;
  ctx.font = "900 34px Bahnschrift, Arial Black, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("2", 64, 88);
  saveEmoji(canvas, "medal2.png");
}

// 43. medal3.png
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.moveTo(36, 16); ctx.lineTo(64, 52); ctx.lineTo(50, 52); ctx.lineTo(26, 16);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.moveTo(92, 16); ctx.lineTo(64, 52); ctx.lineTo(78, 52); ctx.lineTo(102, 16);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(64, 76, 36, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#CD7F32";
  ctx.beginPath(); ctx.arc(64, 76, 32, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = BLACK;
  ctx.font = "900 34px Bahnschrift, Arial Black, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("3", 64, 88);
  saveEmoji(canvas, "medal3.png");
}

// 44. fire.png
{
  const { canvas, ctx } = newCanvas();
  const cx = 64, cy = 64;
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 52);
  ctx.bezierCurveTo(cx + 40, cy - 16, cx + 50, cy + 18, cx + 32, cy + 42);
  ctx.bezierCurveTo(cx + 16, cy + 54, cx - 32, cy + 54, cx - 38, cy + 30);
  ctx.bezierCurveTo(cx - 42, cy + 6, cx - 30, cy - 18, cx, cy - 52);
  ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 48);
  ctx.bezierCurveTo(cx + 36, cy - 14, cx + 46, cy + 16, cx + 30, cy + 38);
  ctx.bezierCurveTo(cx + 14, cy + 50, cx - 28, cy + 50, cx - 34, cy + 28);
  ctx.bezierCurveTo(cx - 38, cy + 8, cx - 26, cy - 16, cx, cy - 48);
  ctx.fill();

  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 12);
  ctx.bezierCurveTo(cx + 18, cy + 6, cx + 20, cy + 26, cx + 12, cy + 38);
  ctx.bezierCurveTo(cx + 4, cy + 46, cx - 18, cy + 46, cx - 18, cy + 30);
  ctx.bezierCurveTo(cx - 18, cy + 18, cx - 10, cy + 4, cx, cy - 12);
  ctx.fill();
  saveEmoji(canvas, "fire.png");
}

// 45. mythic.png
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(64, 12); ctx.lineTo(108, 36); ctx.lineTo(108, 92);
  ctx.lineTo(64, 116); ctx.lineTo(20, 92); ctx.lineTo(20, 36);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.moveTo(64, 16); ctx.lineTo(104, 38); ctx.lineTo(104, 90);
  ctx.lineTo(64, 112); ctx.lineTo(24, 90); ctx.lineTo(24, 38);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.moveTo(64, 32); ctx.lineTo(88, 48); ctx.lineTo(88, 80);
  ctx.lineTo(64, 96); ctx.lineTo(40, 80); ctx.lineTo(40, 48);
  ctx.closePath(); ctx.fill();
  saveEmoji(canvas, "mythic.png");
}

// 46. legendary.png
{
  const { canvas, ctx } = newCanvas();
  const cx = 64, cy = 64;
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    ctx.lineTo(cx + Math.cos(angle) * 56, cy + Math.sin(angle) * 56);
    const half = angle + Math.PI / 8;
    ctx.lineTo(cx + Math.cos(half) * 36, cy + Math.sin(half) * 36);
  }
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = "#F5A623";
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    ctx.lineTo(cx + Math.cos(angle) * 52, cy + Math.sin(angle) * 52);
    const half = angle + Math.PI / 8;
    ctx.lineTo(cx + Math.cos(half) * 32, cy + Math.sin(half) * 32);
  }
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = RED;
  ctx.fillRect(cx - 6, cy - 6, 12, 12);
  saveEmoji(canvas, "legendary.png");
}

// 47. epic.png
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(64, 14); ctx.lineTo(112, 64); ctx.lineTo(64, 114); ctx.lineTo(16, 64);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = "#9B51E0";
  ctx.beginPath();
  ctx.moveTo(64, 18); ctx.lineTo(108, 64); ctx.lineTo(64, 110); ctx.lineTo(20, 64);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.fillRect(58, 38, 12, 52);
  ctx.fillRect(38, 58, 52, 12);
  saveEmoji(canvas, "epic.png");
}

// 48. rare.png
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(64, 16); ctx.lineTo(108, 36); ctx.lineTo(96, 88);
  ctx.lineTo(64, 112); ctx.lineTo(32, 88); ctx.lineTo(20, 36);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = "#2D9CDB";
  ctx.beginPath();
  ctx.moveTo(64, 20); ctx.lineTo(104, 38); ctx.lineTo(92, 86);
  ctx.lineTo(64, 108); ctx.lineTo(36, 86); ctx.lineTo(24, 38);
  ctx.closePath(); ctx.fill();

  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(42, 56); ctx.lineTo(64, 78); ctx.lineTo(86, 56);
  ctx.stroke();
  saveEmoji(canvas, "rare.png");
}

// 49. uncommon.png
{
  const { canvas, ctx } = newCanvas();
  ctx.fillStyle = BLACK;
  ctx.beginPath();
  ctx.moveTo(64, 24); ctx.lineTo(106, 58); ctx.lineTo(92, 74);
  ctx.lineTo(64, 48); ctx.lineTo(36, 74); ctx.lineTo(22, 58);
  ctx.closePath(); ctx.fill();
  ctx.moveTo(64, 54); ctx.lineTo(106, 88); ctx.lineTo(92, 104);
  ctx.lineTo(64, 78); ctx.lineTo(36, 104); ctx.lineTo(22, 88);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = "#27AE60";
  ctx.beginPath();
  ctx.moveTo(64, 28); ctx.lineTo(102, 60); ctx.lineTo(88, 72);
  ctx.lineTo(64, 52); ctx.lineTo(40, 72); ctx.lineTo(26, 60);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(64, 58); ctx.lineTo(102, 90); ctx.lineTo(88, 102);
  ctx.lineTo(64, 82); ctx.lineTo(40, 102); ctx.lineTo(26, 90);
  ctx.closePath(); ctx.fill();
  saveEmoji(canvas, "uncommon.png");
}

// 50. common.png
{
  const { canvas, ctx } = newCanvas();
  const cx = 64, cy = 64;
  ctx.fillStyle = BLACK;
  ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(cx, cy, 44, 0, Math.PI * 2); ctx.stroke();

  ctx.fillStyle = DARK_GRAY;
  ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.fillRect(cx - 7, cy - 7, 14, 14);
  saveEmoji(canvas, "common.png");
}

console.log("All 50 neo-brutalist transparent emojis generated successfully!");
