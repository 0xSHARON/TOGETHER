const { createCanvas, loadImage } = require("@napi-rs/canvas");

const WIDTH = 1200;
const HEIGHT = 675;

// Color Palette for Neo-Brutalist Theme V2
const C = {
  bg: "#060709",
  cardBg: "#0C0E14",
  panelBg: "#11141D",
  panelLight: "#171B26",
  borderDark: "#1F2330",
  borderMid: "#32384A",
  borderLight: "#485068",
  white: "#FFFFFF",
  grayLight: "#E1E4EE",
  grayMid: "#8E95AA",
  grayDark: "#4D5366",
  accentRed: "#FF1744",
  accentCyan: "#00E5FF",
  gold: "#FFD000",
  goldDark: "#C49B00",
  goldGlow: "rgba(255, 208, 0, 0.15)",
  silver: "#DCE1ED",
  silverDark: "#858C9F",
  bronze: "#FFA154",
  bronzeDark: "#B85C19",
};

// Emoji fonts declaration for native Unicode and nickname emoji support
const EMOJI_FALLBACK = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

// Safe Avatar Fetcher with 2-second timeout
async function loadAvatarSafe(url) {
  if (!url) return null;
  try {
    const fetchPromise = loadImage(url);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 2000),
    );
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch {
    return null;
  }
}

// Format Seconds into "Xh Ym"
function formatTime(seconds) {
  const s = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// ----------------------------------------------------
// VECTOR DRAWING PRIMITIVES (NO EXTERNAL EMOJIS USED)
// ----------------------------------------------------

/**
 * Draws a sharp Neo-Brutalist Card with solid offset shadow & technical border
 */
function drawBrutalistCard(ctx, x, y, w, h, {
  bgColor = C.cardBg,
  borderColor = C.borderMid,
  borderWidth = 2,
  shadowColor = "#000000",
  shadowOffset = 6,
  cutCorner = false,
  glowColor = null,
} = {}) {
  // Glow effect if specified
  if (glowColor) {
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 24;
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  // Hard solid brutalist drop shadow (offset rectangle)
  if (shadowOffset > 0) {
    ctx.fillStyle = shadowColor;
    if (cutCorner) {
      drawCutRect(ctx, x + shadowOffset, y + shadowOffset, w, h, 14);
      ctx.fill();
    } else {
      ctx.fillRect(x + shadowOffset, y + shadowOffset, w, h);
    }
  }

  // Main card face
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;

  if (cutCorner) {
    drawCutRect(ctx, x, y, w, h, 14);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  }
}

/**
 * Path helper for chamfered (cut) top-right corner
 */
function drawCutRect(ctx, x, y, w, h, cut = 12) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w - cut, y);
  ctx.lineTo(x + w, y + cut);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

/**
 * Vector Crown for #01 Champion
 */
function drawVectorCrown(ctx, cx, cy, size, color = C.gold) {
  ctx.save();
  ctx.translate(cx, cy);

  const w = size;
  const h = size * 0.7;

  // Crown body
  ctx.beginPath();
  ctx.moveTo(-w / 2, h / 2);
  ctx.lineTo(-w / 2, -h / 4);
  ctx.lineTo(-w / 4, 0);
  ctx.lineTo(0, -h / 2);
  ctx.lineTo(w / 4, 0);
  ctx.lineTo(w / 2, -h / 4);
  ctx.lineTo(w / 2, h / 2);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#000000";
  ctx.stroke();

  // Crown base band
  ctx.fillStyle = "#000000";
  ctx.fillRect(-w / 2, h / 2 - 4, w, 4);

  // Jewels on points
  const jewels = [
    [-w / 2, -h / 4 - 2],
    [0, -h / 2 - 2],
    [w / 2, -h / 4 - 2],
  ];

  ctx.fillStyle = C.white;
  for (const [jx, jy] of jewels) {
    ctx.beginPath();
    ctx.arc(jx, jy, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Vector Medal Badge for #02 and #03
 */
function drawVectorMedal(ctx, cx, cy, size, rank, color) {
  ctx.save();
  ctx.translate(cx, cy);

  // Hexagonal medal coin
  const r = size / 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner ring
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
  ctx.fillStyle = "#12141D";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Rank text inside medal
  ctx.fillStyle = color;
  ctx.font = `900 ${Math.round(r * 0.8)}px Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(rank), 0, 1);

  ctx.restore();
}

/**
 * Vector Headphones Icon
 */
function drawVectorHeadphones(ctx, cx, cy, size, color = C.grayLight) {
  ctx.save();
  ctx.translate(cx, cy);
  const r = size / 2;

  // Headband arc
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.85, Math.PI, 0, false);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.stroke();

  // Left ear cup
  ctx.fillStyle = color;
  ctx.fillRect(-r * 0.95, -r * 0.1, r * 0.35, r * 0.75);

  // Right ear cup
  ctx.fillRect(r * 0.6, -r * 0.1, r * 0.35, r * 0.75);

  ctx.restore();
}

/**
 * Vector Flame / Fire Glyph
 */
function drawVectorFlame(ctx, cx, cy, size, color = C.accentRed) {
  ctx.save();
  ctx.translate(cx, cy);
  const s = size / 20;

  ctx.beginPath();
  ctx.moveTo(0, -9 * s);
  ctx.bezierCurveTo(4 * s, -4 * s, 8 * s, 1 * s, 8 * s, 6 * s);
  ctx.bezierCurveTo(8 * s, 11 * s, 4 * s, 13 * s, 0, 13 * s);
  ctx.bezierCurveTo(-4 * s, 13 * s, -8 * s, 11 * s, -8 * s, 6 * s);
  ctx.bezierCurveTo(-8 * s, 2 * s, -4 * s, -2 * s, 0, -9 * s);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();

  // Inner bright tongue
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(3 * s, 3 * s, 4 * s, 7 * s, 4 * s, 9 * s);
  ctx.bezierCurveTo(4 * s, 11 * s, 2 * s, 12 * s, 0, 12 * s);
  ctx.bezierCurveTo(-2 * s, 12 * s, -4 * s, 11 * s, -4 * s, 9 * s);
  ctx.bezierCurveTo(-4 * s, 5 * s, -2 * s, 3 * s, 0, 0);
  ctx.closePath();

  ctx.fillStyle = C.gold;
  ctx.fill();

  ctx.restore();
}

/**
 * Vector Clock Glyph for Time
 */
function drawVectorClock(ctx, cx, cy, size, color = C.accentCyan) {
  ctx.save();
  ctx.translate(cx, cy);
  const r = size / 2;

  // Clock dial
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Hands (3:00 / 90 deg)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -r * 0.55);
  ctx.moveTo(0, 0);
  ctx.lineTo(r * 0.45, 0);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.restore();
}

/**
 * Vector Lightning / XP Bolt
 */
function drawVectorLightning(ctx, cx, cy, size, color = C.gold) {
  ctx.save();
  ctx.translate(cx, cy);
  const s = size / 20;

  ctx.beginPath();
  ctx.moveTo(2 * s, -10 * s);
  ctx.lineTo(-6 * s, 1 * s);
  ctx.lineTo(0, 1 * s);
  ctx.lineTo(-2 * s, 10 * s);
  ctx.lineTo(6 * s, -1 * s);
  ctx.lineTo(0, -1 * s);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/**
 * Vector Barcode Generator
 */
function drawBarcode(ctx, x, y, width, height) {
  const bars = [2, 1, 3, 1, 4, 2, 1, 3, 2, 1, 1, 4, 2, 3, 1, 2, 1, 3, 1, 2, 4, 1, 2, 3];
  let curX = x;
  ctx.fillStyle = C.grayDark;
  for (let i = 0; i < bars.length && curX < x + width; i++) {
    const w = bars[i];
    if (i % 2 === 0) {
      ctx.fillRect(curX, y, Math.min(w, x + width - curX), height);
    }
    curX += w + 2;
  }
}

/**
 * Diagonal Caution / Cyber Stripes
 */
function drawDiagonalStripes(ctx, x, y, width, height, stripeWidth = 6, gap = 4, color = C.accentRed) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  ctx.strokeStyle = color;
  ctx.lineWidth = stripeWidth;
  const total = width + height;
  for (let i = -height; i < total; i += stripeWidth + gap) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + height, y + height);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Dynamic Audio Equalizer Bars
 */
function drawEqualizer(ctx, x, y, width, height, barCount = 10, seed = 1, barColor = C.accentRed) {
  const barWidth = Math.max(3, Math.floor((width - (barCount - 1) * 3) / barCount));
  for (let i = 0; i < barCount; i++) {
    const pseudoRand = Math.abs(Math.sin((i + 1) * 1.8 + seed * 2.3));
    const h = Math.max(4, Math.floor(height * (0.25 + pseudoRand * 0.75)));
    const bx = x + i * (barWidth + 3);
    const by = y + height - h;

    // Bar column
    ctx.fillStyle = barColor;
    ctx.fillRect(bx, by, barWidth, h);

    // Peak light dot
    ctx.fillStyle = C.white;
    ctx.fillRect(bx, Math.max(y, by - 3), barWidth, 1.5);
  }
}

/**
 * Circular Avatar with thick brutalist border
 */
function drawAvatar(ctx, img, cx, cy, radius, borderColor = C.borderMid, borderWidth = 3) {
  ctx.save();

  // Drop shadow
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(cx + 4, cy + 4, radius + borderWidth, 0, Math.PI * 2);
  ctx.fill();

  // Border ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius + borderWidth, 0, Math.PI * 2);
  ctx.fillStyle = borderColor;
  ctx.fill();

  // Clip avatar
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  if (img) {
    ctx.drawImage(img, cx - radius, cy - radius, radius * 2, radius * 2);
  } else {
    ctx.fillStyle = C.cardBg;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.fillStyle = C.grayDark;
    ctx.font = `900 ${Math.round(radius * 0.8)}px Consolas, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", cx, cy);
  }

  ctx.restore();
}

/**
 * Micro Dot Grid Background
 */
function drawDotMatrixGrid(ctx, w, h, spacing = 28) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  for (let x = spacing / 2; x < w; x += spacing) {
    for (let y = spacing / 2; y < h; y += spacing) {
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }
}

// ============================================================================
// PAGE 1: NEO-BRUTALIST PODIUM VIEW (TOP 3 EXCLUSIVE)
// ============================================================================
async function renderLeaderboardPodium(users = [], options = {}) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const totalPages = Math.max(1, Number(options.totalPages) || 1);
  const serverName = (options.serverName || "COMMUNITY").toUpperCase();

  // Top 3 users
  const first = users[0] || null;
  const second = users[1] || null;
  const third = users[2] || null;

  // Load avatars in parallel
  const [firstAvatar, secondAvatar, thirdAvatar] = await Promise.all([
    first ? loadAvatarSafe(first.avatarUrl) : null,
    second ? loadAvatarSafe(second.avatarUrl) : null,
    third ? loadAvatarSafe(third.avatarUrl) : null,
  ]);

  // 1. Base Canvas Background
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Micro Dot Grid
  drawDotMatrixGrid(ctx, WIDTH, HEIGHT, 32);

  // Outer Neo-Brutal Edge Frame
  ctx.strokeStyle = C.borderDark;
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, WIDTH - 32, HEIGHT - 32);

  // Accent Corner Markers
  const cornerSize = 18;
  ctx.fillStyle = C.accentRed;
  ctx.fillRect(16, 16, cornerSize, 3);
  ctx.fillRect(16, 16, 3, cornerSize);
  ctx.fillRect(WIDTH - 16 - cornerSize, 16, cornerSize, 3);
  ctx.fillRect(WIDTH - 19, 16, 3, cornerSize);
  ctx.fillRect(16, HEIGHT - 19, cornerSize, 3);
  ctx.fillRect(16, HEIGHT - 16 - cornerSize, 3, cornerSize);
  ctx.fillRect(WIDTH - 16 - cornerSize, HEIGHT - 19, cornerSize, 3);
  ctx.fillRect(WIDTH - 19, HEIGHT - 16 - cornerSize, 3, cornerSize);

  // 2. Top Header Bar
  const headerY = 32;

  // Server tag chip
  ctx.fillStyle = C.accentRed;
  ctx.fillRect(36, headerY, 6, 36);

  ctx.fillStyle = C.white;
  ctx.font = `900 24px Consolas, ${EMOJI_FALLBACK}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("AUDIO LEADERBOARD", 52, headerY);

  ctx.fillStyle = C.grayMid;
  ctx.font = `700 11px Consolas, monospace`;
  ctx.fillText(`// SERVER: ${serverName}  ●  VERIFIED METRICS`, 54, headerY + 26);

  // Header Center Strip (Hazard chevrons)
  drawDiagonalStripes(ctx, 480, headerY + 4, 180, 20, 6, 3, C.borderMid);

  // Header Right Metadata
  ctx.textAlign = "right";
  ctx.fillStyle = C.gold;
  ctx.font = `900 13px Consolas, monospace`;
  ctx.fillText("TOP 3 PODIUM // ELITE TIER", WIDTH - 42, headerY + 4);

  ctx.fillStyle = C.grayDark;
  ctx.font = `700 11px Consolas, monospace`;
  ctx.fillText(`PAGE 01 / ${String(totalPages).padStart(2, "0")}  [NEXT ▶ FOR #04+]`, WIDTH - 42, headerY + 24);
  ctx.textAlign = "left";

  // Dividing rule
  ctx.strokeStyle = C.borderDark;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(36, 82);
  ctx.lineTo(WIDTH - 36, 82);
  ctx.stroke();

  // 3. PODIUM CARDS CONFIGURATION
  // Left: #02 Silver | Center: #01 Gold (Elevated) | Right: #03 Bronze
  const podiums = [
    {
      user: second,
      avatar: secondAvatar,
      rank: 2,
      x: 48,
      y: 120,
      w: 320,
      h: 490,
      tierColor: C.silver,
      darkTierColor: C.silverDark,
      title: "SILVER CONTENDER",
      tag: "RANK #02",
      isChampion: false,
    },
    {
      user: first,
      avatar: firstAvatar,
      rank: 1,
      x: 396,
      y: 98,
      w: 408,
      h: 512,
      tierColor: C.gold,
      darkTierColor: C.goldDark,
      title: "AUDIO CHAMPION",
      tag: "RANK #01 // SUPREME",
      isChampion: true,
    },
    {
      user: third,
      avatar: thirdAvatar,
      rank: 3,
      x: 832,
      y: 132,
      w: 320,
      h: 478,
      tierColor: C.bronze,
      darkTierColor: C.bronzeDark,
      title: "BRONZE VANGUARD",
      tag: "RANK #03",
      isChampion: false,
    },
  ];

  // Draw each podium pedestal
  for (const pod of podiums) {
    const { user, avatar, rank, x, y, w, h, tierColor, title, tag, isChampion } = pod;

    // Card background
    drawBrutalistCard(ctx, x, y, w, h, {
      bgColor: isChampion ? "#0E1119" : C.cardBg,
      borderColor: isChampion ? tierColor : C.borderMid,
      borderWidth: isChampion ? 3 : 2,
      shadowColor: "#000000",
      shadowOffset: isChampion ? 8 : 6,
      cutCorner: true,
      glowColor: isChampion ? "rgba(255, 208, 0, 0.12)" : null,
    });

    // Top Header Banner inside Card
    ctx.fillStyle = isChampion ? tierColor : C.panelBg;
    ctx.fillRect(x + 2, y + 2, w - 4, 34);

    // Tag text in banner
    ctx.fillStyle = isChampion ? "#000000" : tierColor;
    ctx.font = `900 ${isChampion ? 13 : 12}px Consolas, monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`// ${tag}`, x + 16, y + 19);

    // Right icon inside banner
    if (isChampion) {
      drawVectorCrown(ctx, x + w - 28, y + 19, 22, "#000000");
    } else {
      drawVectorMedal(ctx, x + w - 24, y + 19, 20, rank, tierColor);
    }

    if (!user) {
      // Empty slot placeholder
      ctx.fillStyle = C.grayDark;
      ctx.font = `700 14px Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.fillText("VACANT POSITION", x + w / 2, y + h / 2);
      ctx.textAlign = "left";
      continue;
    }

    // Avatar presentation
    const avatarY = y + (isChampion ? 116 : 106);
    const avatarRadius = isChampion ? 52 : 44;
    drawAvatar(ctx, avatar, x + w / 2, avatarY, avatarRadius, tierColor, isChampion ? 4 : 3);

    // Level Badge Pill right under avatar
    const lvlW = 76;
    const lvlH = 22;
    const lvlX = x + (w - lvlW) / 2;
    const lvlY = avatarY + avatarRadius + 12;

    ctx.fillStyle = "#000000";
    ctx.fillRect(lvlX + 2, lvlY + 2, lvlW, lvlH);
    ctx.fillStyle = C.panelLight;
    ctx.strokeStyle = tierColor;
    ctx.lineWidth = 1.5;
    ctx.fillRect(lvlX, lvlY, lvlW, lvlH);
    ctx.strokeRect(lvlX, lvlY, lvlW, lvlH);

    drawVectorLightning(ctx, lvlX + 12, lvlY + lvlH / 2, 12, tierColor);

    ctx.fillStyle = C.white;
    ctx.font = `900 11px Consolas, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`LVL ${user.level}`, lvlX + 44, lvlY + lvlH / 2 + 1);

    // User Nickname with Unicode & Emoji preservation
    const nameY = lvlY + lvlH + 20;
    const rawName = user.name || user.username || `User_${user.userId.slice(-4)}`;
    const displayName = Array.from(rawName).slice(0, isChampion ? 16 : 13).join("");

    ctx.fillStyle = C.white;
    ctx.font = `900 ${isChampion ? 20 : 17}px "Segoe UI", ${EMOJI_FALLBACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayName, x + w / 2, nameY);

    // Subtitle / User Tag
    ctx.fillStyle = C.grayMid;
    ctx.font = `700 11px Consolas, monospace`;
    ctx.fillText(`@${Array.from(user.username || "").slice(0, 15).join("")}`, x + w / 2, nameY + 20);

    // Horizontal Separator
    ctx.strokeStyle = C.borderDark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 20, nameY + 36);
    ctx.lineTo(x + w - 20, nameY + 36);
    ctx.stroke();

    // Stats Grid inside Card
    const statsY = nameY + 48;
    const statRowH = isChampion ? 38 : 34;

    const stats = [
      {
        label: "TIME LISTENED",
        val: formatTime(user.listeningSeconds),
        icon: (cx, cy) => drawVectorClock(ctx, cx, cy, 14, C.accentCyan),
      },
      {
        label: "TRACKS PLAYED",
        val: `${user.songsPlayed.toLocaleString()} TRKS`,
        icon: (cx, cy) => drawVectorHeadphones(ctx, cx, cy, 14, C.grayLight),
      },
      {
        label: "STREAK",
        val: `${user.streak} DAYS`,
        icon: (cx, cy) => drawVectorFlame(ctx, cx, cy, 14, C.accentRed),
      },
    ];

    for (let si = 0; si < stats.length; si++) {
      const st = stats[si];
      const sy = statsY + si * statRowH;

      // Row background
      ctx.fillStyle = si % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.2)";
      ctx.fillRect(x + 16, sy, w - 32, statRowH - 4);

      // Icon
      st.icon(x + 32, sy + (statRowH - 4) / 2);

      // Label
      ctx.fillStyle = C.grayMid;
      ctx.font = `700 10px Consolas, monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(st.label, x + 46, sy + (statRowH - 4) / 2);

      // Value
      ctx.fillStyle = C.white;
      ctx.font = `900 ${isChampion ? 13 : 12}px Consolas, monospace`;
      ctx.textAlign = "right";
      ctx.fillText(st.val, x + w - 28, sy + (statRowH - 4) / 2);
    }

    // Dynamic Equalizer visualizer at bottom of card
    const eqY = y + h - (isChampion ? 48 : 42);
    const eqW = w - 48;
    drawEqualizer(ctx, x + 24, eqY, eqW, 18, isChampion ? 18 : 14, rank, isChampion ? C.gold : C.accentRed);
  }

  // 4. Bottom Footer Strip
  const footerY = 644;
  ctx.fillStyle = C.grayDark;
  ctx.font = `700 11px Consolas, monospace`;
  ctx.textAlign = "left";
  ctx.fillText("NEO-BRUTALIST AUDIO ENGINE V2", 42, footerY);

  drawBarcode(ctx, 300, footerY - 9, 120, 13);
  drawDiagonalStripes(ctx, 450, footerY - 9, 100, 13, 5, 2, C.borderMid);

  ctx.textAlign = "right";
  ctx.fillText("AUTOMATED LIVE SYNC // 100% REAL DATA", WIDTH - 42, footerY);
  ctx.textAlign = "left";

  return canvas.encode("png");
}

// ============================================================================
// PAGE 2+: NEO-BRUTALIST RANKED LIST VIEW (RANKS #04+)
// ============================================================================
async function renderLeaderboardRanks(users = [], page = 2, totalPages = 2, options = {}) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const serverName = (options.serverName || "COMMUNITY").toUpperCase();

  // Load avatars in parallel
  const avatars = await Promise.all(
    users.map((u) => (u ? loadAvatarSafe(u.avatarUrl) : null)),
  );

  // 1. Base Canvas Background
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Micro Dot Grid
  drawDotMatrixGrid(ctx, WIDTH, HEIGHT, 32);

  // Outer Neo-Brutal Frame
  ctx.strokeStyle = C.borderDark;
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, WIDTH - 32, HEIGHT - 32);

  // Corner Accents
  const cornerSize = 18;
  ctx.fillStyle = C.accentRed;
  ctx.fillRect(16, 16, cornerSize, 3);
  ctx.fillRect(16, 16, 3, cornerSize);
  ctx.fillRect(WIDTH - 16 - cornerSize, 16, cornerSize, 3);
  ctx.fillRect(WIDTH - 19, 16, 3, cornerSize);

  // 2. Header
  const headerY = 32;

  ctx.fillStyle = C.accentRed;
  ctx.fillRect(36, headerY, 6, 36);

  ctx.fillStyle = C.white;
  ctx.font = `900 24px Consolas, ${EMOJI_FALLBACK}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("LEADERBOARD DIRECTORY", 52, headerY);

  ctx.fillStyle = C.grayMid;
  ctx.font = `700 11px Consolas, monospace`;
  ctx.fillText(`// SERVER: ${serverName}  ●  PAGE ${String(page).padStart(2, "0")} OF ${String(totalPages).padStart(2, "0")}`, 54, headerY + 26);

  // Header Hazard Stripes
  drawDiagonalStripes(ctx, 510, headerY + 4, 180, 20, 6, 3, C.borderMid);

  ctx.textAlign = "right";
  ctx.fillStyle = C.accentCyan;
  ctx.font = `900 13px Consolas, monospace`;
  const startRank = 3 + (page - 2) * 7 + 1;
  const endRank = startRank + users.length - 1;
  ctx.fillText(`ACTIVE DIVISION // RANKS #${String(startRank).padStart(2, "0")} - #${String(endRank).padStart(2, "0")}`, WIDTH - 42, headerY + 4);

  ctx.fillStyle = C.grayDark;
  ctx.font = `700 11px Consolas, monospace`;
  ctx.fillText(`[◀ PREV] [NEXT ▶] FOR OTHER PAGES`, WIDTH - 42, headerY + 24);
  ctx.textAlign = "left";

  // Separator
  ctx.strokeStyle = C.borderDark;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(36, 82);
  ctx.lineTo(WIDTH - 36, 82);
  ctx.stroke();

  // 3. User Rows
  const rowStartX = 36;
  const rowStartY = 96;
  const rowWidth = WIDTH - 72;
  const rowHeight = 72;
  const rowGap = 6;

  for (let i = 0; i < 7; i++) {
    const user = users[i];
    const y = rowStartY + i * (rowHeight + rowGap);
    const avatar = avatars[i];
    const rankNum = startRank + i;

    if (!user) {
      // Empty row placeholder
      ctx.fillStyle = "rgba(18, 20, 28, 0.4)";
      ctx.fillRect(rowStartX, y, rowWidth, rowHeight);
      ctx.strokeStyle = C.borderDark;
      ctx.lineWidth = 1;
      ctx.strokeRect(rowStartX, y, rowWidth, rowHeight);
      continue;
    }

    // Row Card Face
    drawBrutalistCard(ctx, rowStartX, y, rowWidth, rowHeight, {
      bgColor: C.cardBg,
      borderColor: i === 0 ? C.borderLight : C.borderDark,
      borderWidth: 1.5,
      shadowColor: "#000000",
      shadowOffset: 3,
      cutCorner: false,
    });

    // Rank Number Block (Solid Brutalist Monospace Badge)
    const rankBoxW = 68;
    ctx.fillStyle = i === 0 ? C.accentRed : C.panelBg;
    ctx.fillRect(rowStartX, y, rankBoxW, rowHeight);

    ctx.strokeStyle = C.borderMid;
    ctx.lineWidth = 1;
    ctx.strokeRect(rowStartX, y, rankBoxW, rowHeight);

    ctx.fillStyle = i === 0 ? C.white : C.grayLight;
    ctx.font = `900 18px Consolas, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`#${String(rankNum).padStart(2, "0")}`, rowStartX + rankBoxW / 2, y + rowHeight / 2);

    // Avatar Frame
    const avX = rowStartX + rankBoxW + 34;
    const avY = y + rowHeight / 2;
    drawAvatar(ctx, avatar, avX, avY, 24, C.borderLight, 2);

    // Username & Unicode / Nickname Emoji Rendering
    const rawName = user.name || user.username || `User_${user.userId.slice(-4)}`;
    const displayName = Array.from(rawName).slice(0, 18).join("");

    ctx.fillStyle = C.white;
    ctx.font = `900 17px "Segoe UI", ${EMOJI_FALLBACK}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(displayName, avX + 38, y + 26);

    ctx.fillStyle = C.grayMid;
    ctx.font = `700 11px Consolas, monospace`;
    ctx.fillText(`@${Array.from(user.username || "").slice(0, 16).join("")}`, avX + 38, y + 48);

    // Level Tag Pill
    const tagX = rowStartX + 410;
    const tagY = y + 22;
    ctx.fillStyle = C.panelLight;
    ctx.strokeStyle = C.borderMid;
    ctx.lineWidth = 1;
    ctx.fillRect(tagX, tagY, 68, 26);
    ctx.strokeRect(tagX, tagY, 68, 26);

    drawVectorLightning(ctx, tagX + 12, tagY + 13, 11, C.gold);

    ctx.fillStyle = C.white;
    ctx.font = `900 11px Consolas, monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`LVL ${user.level}`, tagX + 42, tagY + 14);

    // Stats Section (Columns)
    // 1. Time Listened
    const timeX = rowStartX + 520;
    drawVectorClock(ctx, timeX + 8, y + 35, 14, C.accentCyan);

    ctx.fillStyle = C.grayMid;
    ctx.font = `700 9px Consolas, monospace`;
    ctx.textAlign = "left";
    ctx.fillText("TIME LISTENED", timeX + 22, y + 26);

    ctx.fillStyle = C.white;
    ctx.font = `900 13px Consolas, monospace`;
    ctx.fillText(formatTime(user.listeningSeconds), timeX + 22, y + 44);

    // 2. Tracks Played
    const tracksX = rowStartX + 670;
    drawVectorHeadphones(ctx, tracksX + 8, y + 35, 14, C.grayLight);

    ctx.fillStyle = C.grayMid;
    ctx.font = `700 9px Consolas, monospace`;
    ctx.fillText("TRACKS PLAYED", tracksX + 22, y + 26);

    ctx.fillStyle = C.white;
    ctx.font = `900 13px Consolas, monospace`;
    ctx.fillText(`${user.songsPlayed.toLocaleString()}`, tracksX + 22, y + 44);

    // 3. Streak
    const streakX = rowStartX + 820;
    drawVectorFlame(ctx, streakX + 8, y + 35, 14, C.accentRed);

    ctx.fillStyle = C.grayMid;
    ctx.font = `700 9px Consolas, monospace`;
    ctx.fillText("STREAK", streakX + 22, y + 26);

    ctx.fillStyle = C.white;
    ctx.font = `900 13px Consolas, monospace`;
    ctx.fillText(`${user.streak} DAYS`, streakX + 22, y + 44);

    // Mini Equalizer Visualizer at far right
    const eqX = rowStartX + rowWidth - 110;
    drawEqualizer(ctx, eqX, y + 24, 85, 24, 9, rankNum, i === 0 ? C.accentRed : C.borderLight);
  }

  // 4. Footer Bar
  const footerY = 644;
  ctx.fillStyle = C.grayDark;
  ctx.font = `700 11px Consolas, monospace`;
  ctx.textAlign = "left";
  ctx.fillText(`PAGE ${String(page).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}  // TOGETHER AUDIO NETWORK`, 42, footerY);

  drawDiagonalStripes(ctx, 360, footerY - 9, 120, 13, 5, 2, C.borderMid);
  drawBarcode(ctx, 510, footerY - 9, 110, 13);

  ctx.textAlign = "right";
  ctx.fillText("REAL-TIME PERSISTENT AUDIO DB", WIDTH - 42, footerY);
  ctx.textAlign = "left";

  return canvas.encode("png");
}

module.exports = {
  renderLeaderboardPodium,
  renderLeaderboardRanks,
  formatTime,
};
