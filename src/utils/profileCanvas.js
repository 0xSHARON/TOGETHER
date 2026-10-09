const { createCanvas, loadImage } = require("@napi-rs/canvas");

const WIDTH = 1200;
const HEIGHT = 675;

// Helper: 4-Point Star
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

// Helper: Wireframe Globe / Sphere
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
  ctx.ellipse(cx, cy, r, r * 0.42, 0, 0, Math.PI * 2);
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

// Helper: Diagonal Warning Stripes
function drawDiagonalStripes(ctx, x, y, w, h, step = 8, stripeW = 3.5, color = "#4A4D55") {
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

// Helper: Barcode Generator
function drawBarcode(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "#E1E3E6";
  let curX = x;
  const pattern = [2, 1, 3, 1, 1, 4, 1, 2, 3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 2, 4, 1, 3, 1, 2, 1, 1, 3, 2];
  let i = 0;
  while (curX < x + w && i < 60) {
    const barW = pattern[i % pattern.length];
    const space = (pattern[(i + 3) % pattern.length] % 2) + 1.2;
    if (curX + barW <= x + w) {
      ctx.fillRect(curX, y, barW, h);
    }
    curX += barW + space;
    i++;
  }
  ctx.restore();
}

// Helper: Audio Equalizer Spectrum Bars
function drawEqualizer(ctx, x, y, w, h, bars = 16, seed = 1, accentColor = "#FF1E38") {
  ctx.save();
  const barW = Math.max(2, Math.floor(w / (bars * 1.55)));
  const gap = Math.max(1, Math.floor(barW * 0.55));
  for (let i = 0; i < bars; i++) {
    const pseudo = Math.sin(i * 1.35 + seed) * 0.45 + 0.55;
    const barH = Math.max(3, Math.floor(pseudo * h));
    const bx = x + i * (barW + gap);
    const by = y + h - barH;

    ctx.fillStyle = i % 5 === 0 ? accentColor : (i % 2 === 0 ? "#72767E" : "#4A4D55");
    ctx.fillRect(bx, by, barW, barH);
  }
  ctx.restore();
}

// Helper: Draw Vector Headphone Icon
function drawHeadphonesIcon(ctx, cx, cy) {
  ctx.save();
  ctx.strokeStyle = "#FFFFFF";
  ctx.fillStyle = "#FFFFFF";
  ctx.lineWidth = 2.5;

  // Headband arch
  ctx.beginPath();
  ctx.arc(cx, cy - 2, 11, Math.PI, 0);
  ctx.stroke();

  // Left ear cup
  ctx.fillRect(cx - 13, cy - 4, 4, 12);
  // Right ear cup
  ctx.fillRect(cx + 9, cy - 4, 4, 12);

  // Cup padding
  ctx.fillStyle = "#A0A4AE";
  ctx.fillRect(cx - 15, cy - 2, 2, 8);
  ctx.fillRect(cx + 13, cy - 2, 2, 8);

  ctx.restore();
}

// Helper: Draw Vector Music Note Icon
function drawMusicNoteIcon(ctx, cx, cy) {
  ctx.save();
  ctx.fillStyle = "#FFFFFF";

  // Left note head
  ctx.beginPath();
  ctx.ellipse(cx - 6, cy + 6, 4, 3, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();

  // Right note head
  ctx.beginPath();
  ctx.ellipse(cx + 6, cy + 3, 4, 3, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();

  // Stems
  ctx.fillRect(cx - 3, cy - 8, 2, 14);
  ctx.fillRect(cx + 9, cy - 11, 2, 14);

  // Cross beam
  ctx.beginPath();
  ctx.moveTo(cx - 3, cy - 8);
  ctx.lineTo(cx + 11, cy - 11);
  ctx.lineTo(cx + 11, cy - 7);
  ctx.lineTo(cx - 3, cy - 4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Helper: Draw Vector Flame / Fire Icon
function drawFlameIcon(ctx, cx, cy, accentColor = "#FF1E38") {
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 12);
  ctx.bezierCurveTo(cx + 8, cy - 4, cx + 11, cy + 3, cx + 7, cy + 9);
  ctx.bezierCurveTo(cx + 3, cy + 13, cx - 7, cy + 13, cx - 8, cy + 7);
  ctx.bezierCurveTo(cx - 9, cy + 2, cx - 6, cy - 4, cx, cy - 12);
  ctx.fill();

  // Inner flame
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 3);
  ctx.bezierCurveTo(cx + 4, cy + 1, cx + 5, cy + 6, cx + 3, cy + 9);
  ctx.bezierCurveTo(cx + 1, cy + 11, cx - 4, cy + 11, cx - 4, cy + 7);
  ctx.bezierCurveTo(cx - 4, cy + 4, cx - 2, cy, cx, cy - 3);
  ctx.fill();

  ctx.restore();
}

// Helper: Draw Moon Phases (5 circles)
function drawMoonPhases(ctx, x, y, accentColor = "#FF1E38") {
  ctx.save();
  const radius = 6;
  const gap = 19;

  for (let i = 0; i < 5; i++) {
    const cy = y + i * gap;

    // Outer circle
    ctx.strokeStyle = "#6B6F7A";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    if (i === 0) {
      // 🌑 New Moon (empty with dark fill)
      ctx.fillStyle = "#16171B";
      ctx.fill();
    } else if (i === 1) {
      // 🌒 Crescent
      ctx.fillStyle = "#A0A4AE";
      ctx.beginPath();
      ctx.arc(x, cy, radius, -Math.PI / 2, Math.PI / 2, false);
      ctx.ellipse(x, cy, radius * 0.45, radius, 0, Math.PI / 2, -Math.PI / 2, true);
      ctx.fill();
    } else if (i === 2) {
      // 🌓 Half Moon
      ctx.fillStyle = "#D0D3DB";
      ctx.beginPath();
      ctx.arc(x, cy, radius, -Math.PI / 2, Math.PI / 2, false);
      ctx.closePath();
      ctx.fill();
    } else if (i === 3) {
      // 🌔 Gibbous
      ctx.fillStyle = "#E4E7EC";
      ctx.beginPath();
      ctx.arc(x, cy, radius, -Math.PI / 2, Math.PI / 2, false);
      ctx.ellipse(x, cy, radius * 0.5, radius, 0, Math.PI / 2, -Math.PI / 2, false);
      ctx.fill();
    } else if (i === 4) {
      // 🌕 Full Moon (solid white)
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(x, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}


const BADGE_REGISTRY = [
  { id: "crown", name: "Crown", desc: "Reach Level 5+ or 50+ songs", category: "Milestone" },
  { id: "vinyl", name: "Vinyl", desc: "Play your first track", category: "Starter" },
  { id: "wave", name: "Waveform", desc: "Listen for 1+ hours", category: "Listening" },
  { id: "star", name: "Anthem Star", desc: "Set a signature profile anthem", category: "Social" },
  { id: "planet", name: "Cosmic Planet", desc: "Maintain a 2+ day streak", category: "Streak" },
  { id: "bars", name: "Equalizer", desc: "Like at least 1 track", category: "Social" },
  { id: "bolt", name: "Thunderbolt", desc: "Reach Level 2+", category: "Milestone" },
  { id: "headphones", name: "Audiophile", desc: "Listen for 10+ hours", category: "Listening" },
  { id: "flame", name: "Hot Streak", desc: "Maintain a 7+ day streak", category: "Streak" },
  { id: "shield", name: "Guardian", desc: "Server veteran / Level 8+", category: "Special" },
  { id: "rocket", name: "Booster", desc: "Play 100+ songs", category: "Milestone" },
  { id: "diamond", name: "Diamond Ears", desc: "Listen for 50+ hours", category: "Listening" },
  { id: "moon", name: "Night Owl", desc: "Midnight listening sessions", category: "Special" },
  { id: "ghost", name: "Phantom", desc: "Play 500+ songs", category: "Milestone" },
  { id: "trophy", name: "Champion", desc: "Reach Level 10+ or Top 3", category: "Milestone" },
  { id: "satellite", name: "Orbital Link", desc: "Like 10+ tracks", category: "Social" },
  { id: "hourglass", name: "Time Traveler", desc: "Listen for 100+ hours", category: "Listening" },
  { id: "infinity", name: "Eternal Loop", desc: "Maintain a 30+ day streak", category: "Streak" },
  { id: "dna", name: "Sound DNA", desc: "Personalize profile accent color", category: "Custom" },
  { id: "microphone", name: "Voice Artist", desc: "Set a custom profile bio", category: "Custom" },
  { id: "compass", name: "Genre Explorer", desc: "Play 25+ diverse songs", category: "Milestone" },
  { id: "crystal", name: "Prism Crystal", desc: "Premium supporter / Level 20+", category: "Special" },
  { id: "eye", name: "Third Eye", desc: "Listen for 20+ hours or Level 15+", category: "Listening" },
  { id: "hexagon", name: "Cyber Hex", desc: "Like 5+ tracks", category: "Social" },
  { id: "skull", name: "Outage Survivor", desc: "Survive bot updates / Level 3+", category: "Special" },
  { id: "antenna", name: "Broadcaster", desc: "Listen for 5+ hours", category: "Listening" },
  { id: "gamepad", name: "Party Gamer", desc: "Maintain a 3+ day streak", category: "Streak" },
  { id: "leaf", name: "Ambient Zen", desc: "Listen for 2+ hours", category: "Listening" },
  { id: "crosshair", name: "DJ Precision", desc: "Play 10+ songs", category: "Milestone" },
  { id: "tape", name: "Vintage Tape", desc: "Play 300+ songs", category: "Milestone" },
];

const ALL_BADGE_TYPES = BADGE_REGISTRY.map(b => b.id);

// Helper: Draw Badge Icons — 30 unique neo-brutalist vector badges
function drawBadgeSlot(ctx, x, y, size, type, accentColor, isUnlocked) {
  if (accentColor === undefined) accentColor = "#FF1E38";
  ctx.save();
  ctx.fillStyle = isUnlocked ? "#111216" : "#0A0B0E";
  ctx.strokeStyle = isUnlocked ? "#2D3039" : "#1B1D24";
  ctx.lineWidth = 1;
  ctx.fillRect(x, y, size, size);
  ctx.strokeRect(x, y, size, size);
  const cx = x + size / 2;
  const cy = y + size / 2;
  if (!isUnlocked) {
    ctx.strokeStyle = "#323540"; ctx.fillStyle = "#1E2028"; ctx.lineWidth = 1.3;
    ctx.fillRect(cx-6, cy-2, 12, 10); ctx.strokeRect(cx-6, cy-2, 12, 10);
    ctx.beginPath(); ctx.arc(cx, cy-2, 4.5, Math.PI, 0); ctx.stroke();
    ctx.restore(); return;
  }
  const W = "#D0D3DB", A = accentColor;
  switch (type) {
    // 01 crown — Level 5+ or 50+ songs
    case "crown": {
      ctx.fillStyle=W; ctx.beginPath();
      ctx.moveTo(cx-15,cy+10); ctx.lineTo(cx-17,cy-8); ctx.lineTo(cx-7,cy+2);
      ctx.lineTo(cx,cy-12); ctx.lineTo(cx+7,cy+2); ctx.lineTo(cx+17,cy-8);
      ctx.lineTo(cx+15,cy+10); ctx.closePath(); ctx.fill();
      ctx.fillStyle=A; ctx.fillRect(cx-13,cy+11,26,3); break;
    }
    // 02 vinyl — first song played
    case "vinyl": {
      ctx.strokeStyle=W; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(cx,cy,17,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle="#4D5058"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(cx,cy,12,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx,cy,7,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle=A; ctx.beginPath(); ctx.arc(cx,cy,3,0,Math.PI*2); ctx.fill(); break;
    }
    // 03 wave — 1h+ listening
    case "wave": {
      const wB=[-14,-10,-6,-2,2,6,10,14], wH=[6,12,20,10,24,16,8,4];
      ctx.strokeStyle=W; ctx.lineWidth=2;
      for(let i=0;i<wB.length;i++){ctx.beginPath();ctx.moveTo(cx+wB[i],cy-wH[i]/2);ctx.lineTo(cx+wB[i],cy+wH[i]/2);ctx.stroke();}
      break;
    }
    // 04 star — anthem set
    case "star": {
      drawFourPointStar(ctx,cx,cy,18,5,W); drawFourPointStar(ctx,cx,cy,6,2,A); break;
    }
    // 05 planet — 2+ day streak
    case "planet": {
      ctx.save(); ctx.fillStyle=W; ctx.beginPath(); ctx.arc(cx,cy,10,0,Math.PI*2); ctx.fill();
      ctx.translate(cx,cy); ctx.rotate(-Math.PI/6);
      ctx.strokeStyle=A; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(0,0,22,6,0,0,Math.PI*2); ctx.stroke();
      ctx.restore(); break;
    }
    // 06 bars — liked 1+ song
    case "bars": {
      ctx.fillStyle=W; const bH=[8,14,22,16,26,12];
      for(let i=0;i<6;i++) ctx.fillRect(cx-18+i*6,cy+12-bH[i],4,bH[i]); break;
    }
    // 07 bolt — XP surge: leveled 3+ times in one day
    case "bolt": {
      ctx.fillStyle=A; ctx.beginPath();
      ctx.moveTo(cx+4,cy-14); ctx.lineTo(cx-6,cy+1); ctx.lineTo(cx+1,cy+1);
      ctx.lineTo(cx-4,cy+14); ctx.lineTo(cx+6,cy-1); ctx.lineTo(cx-1,cy-1);
      ctx.closePath(); ctx.fill(); break;
    }
    // 08 headphones — 10h+ listening
    case "headphones": {
      ctx.strokeStyle=W; ctx.lineWidth=2.5; ctx.lineCap="round";
      ctx.beginPath(); ctx.arc(cx,cy-4,12,Math.PI,0); ctx.stroke();
      ctx.fillStyle=W; ctx.fillRect(cx-14,cy-4,5,12); ctx.fillRect(cx+9,cy-4,5,12);
      ctx.fillStyle="#505460"; ctx.fillRect(cx-16,cy-2,3,8); ctx.fillRect(cx+13,cy-2,3,8); break;
    }
    // 09 flame — 7-day streak
    case "flame": {
      ctx.fillStyle=W; ctx.beginPath();
      ctx.moveTo(cx,cy-14); ctx.bezierCurveTo(cx+9,cy-4,cx+12,cy+3,cx+8,cy+10);
      ctx.bezierCurveTo(cx+4,cy+14,cx-8,cy+14,cx-9,cy+8);
      ctx.bezierCurveTo(cx-10,cy+2,cx-7,cy-4,cx,cy-14); ctx.fill();
      ctx.fillStyle=A; ctx.beginPath();
      ctx.moveTo(cx,cy-2); ctx.bezierCurveTo(cx+5,cy+2,cx+6,cy+7,cx+3,cy+10);
      ctx.bezierCurveTo(cx+1,cy+12,cx-5,cy+12,cx-5,cy+8);
      ctx.bezierCurveTo(cx-5,cy+4,cx-2,cy,cx,cy-2); ctx.fill(); break;
    }
    // 10 shield — OG member 180+ days
    case "shield": {
      ctx.fillStyle=W; ctx.beginPath();
      ctx.moveTo(cx,cy-16); ctx.lineTo(cx+14,cy-8); ctx.lineTo(cx+14,cy+4);
      ctx.quadraticCurveTo(cx+14,cy+16,cx,cy+18); ctx.quadraticCurveTo(cx-14,cy+16,cx-14,cy+4);
      ctx.lineTo(cx-14,cy-8); ctx.closePath(); ctx.fill();
      ctx.fillStyle=A; ctx.beginPath();
      ctx.moveTo(cx,cy-8); ctx.lineTo(cx+8,cy-3); ctx.lineTo(cx+8,cy+4);
      ctx.quadraticCurveTo(cx+8,cy+12,cx,cy+14); ctx.quadraticCurveTo(cx-8,cy+12,cx-8,cy+4);
      ctx.lineTo(cx-8,cy-3); ctx.closePath(); ctx.fill(); break;
    }
    // 11 rocket — 100+ songs queued lifetime
    case "rocket": {
      ctx.fillStyle=W; ctx.beginPath();
      ctx.moveTo(cx,cy-18); ctx.bezierCurveTo(cx+10,cy-8,cx+10,cy+2,cx+6,cy+8);
      ctx.lineTo(cx-6,cy+8); ctx.bezierCurveTo(cx-10,cy+2,cx-10,cy-8,cx,cy-18); ctx.fill();
      ctx.fillStyle=A; ctx.beginPath();
      ctx.moveTo(cx-6,cy+8); ctx.lineTo(cx-12,cy+16); ctx.lineTo(cx,cy+10);
      ctx.lineTo(cx+12,cy+16); ctx.lineTo(cx+6,cy+8); ctx.closePath(); ctx.fill();
      ctx.fillStyle="#0A0B0E"; ctx.beginPath(); ctx.arc(cx,cy-2,4,0,Math.PI*2); ctx.fill(); break;
    }
    // 12 diamond — top 5% hours
    case "diamond": {
      ctx.fillStyle=W; ctx.beginPath();
      ctx.moveTo(cx,cy-18); ctx.lineTo(cx+14,cy-4); ctx.lineTo(cx,cy+18); ctx.lineTo(cx-14,cy-4); ctx.closePath(); ctx.fill();
      ctx.fillStyle=A; ctx.beginPath();
      ctx.moveTo(cx,cy-18); ctx.lineTo(cx+14,cy-4); ctx.lineTo(cx,cy-4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle="#0A0B0E"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(cx-14,cy-4); ctx.lineTo(cx+14,cy-4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-14,cy-4); ctx.lineTo(cx,cy+18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+14,cy-4); ctx.lineTo(cx,cy+18); ctx.stroke(); break;
    }
    // 13 moon — night owl, after midnight 5+ times
    case "moon": {
      ctx.fillStyle=W; ctx.beginPath(); ctx.arc(cx+2,cy,14,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#111216"; ctx.beginPath(); ctx.arc(cx+10,cy-3,12,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=A;
      ctx.beginPath(); ctx.arc(cx+8,cy+10,2.5,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx-4,cy-10,1.5,0,Math.PI*2); ctx.fill(); break;
    }
    // 14 ghost — 500+ songs played
    case "ghost": {
      ctx.fillStyle=W; ctx.beginPath();
      ctx.arc(cx,cy-6,13,Math.PI,0,false); ctx.lineTo(cx+13,cy+12);
      ctx.quadraticCurveTo(cx+8,cy+7,cx+4,cy+13); ctx.quadraticCurveTo(cx,cy+8,cx-4,cy+13);
      ctx.quadraticCurveTo(cx-8,cy+7,cx-13,cy+12); ctx.closePath(); ctx.fill();
      ctx.fillStyle="#111216";
      ctx.beginPath(); ctx.arc(cx-5,cy-5,3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+5,cy-5,3,0,Math.PI*2); ctx.fill(); break;
    }
    // 15 trophy — leaderboard top 3
    case "trophy": {
      ctx.fillStyle=W; ctx.fillRect(cx-10,cy+8,20,4); ctx.fillRect(cx-4,cy+3,8,6);
      ctx.beginPath(); ctx.arc(cx,cy-5,13,Math.PI*0.15,Math.PI*0.85,false);
      ctx.lineTo(cx+9,cy+3); ctx.lineTo(cx-9,cy+3); ctx.closePath(); ctx.fill();
      ctx.fillStyle=A; ctx.fillRect(cx-13,cy+11,26,2);
      ctx.strokeStyle=W; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(cx+13,cy-8); ctx.bezierCurveTo(cx+20,cy-8,cx+20,cy+2,cx+14,cy+2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-13,cy-8); ctx.bezierCurveTo(cx-20,cy-8,cx-20,cy+2,cx-14,cy+2); ctx.stroke(); break;
    }
    // 16 satellite — shared/grabbed 10+ songs
    case "satellite": {
      ctx.fillStyle="#4D5058"; ctx.strokeStyle=W; ctx.lineWidth=1.5;
      ctx.fillRect(cx-3,cy-3,6,6); ctx.strokeRect(cx-3,cy-3,6,6);
      ctx.fillStyle=A; ctx.fillRect(cx-18,cy-2,12,4); ctx.fillRect(cx+6,cy-2,12,4);
      ctx.strokeStyle=W; ctx.beginPath(); ctx.moveTo(cx,cy-3); ctx.lineTo(cx+10,cy-12); ctx.stroke();
      ctx.fillStyle=A; ctx.beginPath(); ctx.arc(cx+10,cy-12,3,0,Math.PI*2); ctx.fill(); break;
    }
    // 17 hourglass — 200h+ listening
    case "hourglass": {
      ctx.fillStyle=W; ctx.beginPath();
      ctx.moveTo(cx-12,cy-17); ctx.lineTo(cx+12,cy-17); ctx.lineTo(cx,cy);
      ctx.lineTo(cx+12,cy+17); ctx.lineTo(cx-12,cy+17); ctx.lineTo(cx,cy); ctx.closePath(); ctx.fill();
      ctx.fillStyle=A; ctx.beginPath();
      ctx.moveTo(cx+12,cy+17); ctx.lineTo(cx-12,cy+17); ctx.lineTo(cx,cy+6); ctx.closePath(); ctx.fill();
      ctx.fillStyle="#0A0B0E"; ctx.fillRect(cx-12,cy-18,24,2); ctx.fillRect(cx-12,cy+16,24,2); break;
    }
    // 18 infinity — 365-day streak
    case "infinity": {
      ctx.strokeStyle=A; ctx.lineWidth=4; ctx.lineCap="round"; ctx.beginPath();
      ctx.moveTo(cx,cy); ctx.bezierCurveTo(cx-6,cy-12,cx-24,cy-12,cx-20,cy);
      ctx.bezierCurveTo(cx-16,cy+12,cx+6,cy+12,cx,cy);
      ctx.bezierCurveTo(cx-6,cy-12,cx+16,cy-12,cx+20,cy);
      ctx.bezierCurveTo(cx+24,cy+12,cx+6,cy+12,cx,cy); ctx.stroke(); break;
    }
    // 19 dna — used 10+ audio filters
    case "dna": {
      ctx.strokeStyle=W; ctx.lineWidth=2; ctx.lineCap="round";
      for(let i=0;i<7;i++){
        const t=(i/6)*Math.PI*2, lx=cx+Math.sin(t)*10, rx=cx-Math.sin(t)*10, yp=cy-18+i*6;
        ctx.beginPath(); ctx.moveTo(lx,yp); ctx.lineTo(rx,yp); ctx.stroke();
      }
      ctx.strokeStyle=A; ctx.lineWidth=1.5; ctx.beginPath();
      for(let i=0;i<=20;i++){const t=(i/20)*Math.PI*4-Math.PI,px=cx+Math.sin(t)*10,py=cy-18+i*1.8;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}
      ctx.stroke();
      ctx.strokeStyle="#505060"; ctx.beginPath();
      for(let i=0;i<=20;i++){const t=(i/20)*Math.PI*4,px=cx+Math.sin(t)*10,py=cy-18+i*1.8;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}
      ctx.stroke(); break;
    }
    // 20 microphone — queued 50+ songs in one session
    case "microphone": {
      ctx.fillStyle=W; ctx.beginPath(); ctx.arc(cx,cy-8,8,0,Math.PI*2); ctx.fill();
      ctx.fillRect(cx-3,cy,6,10);
      ctx.strokeStyle="#111216"; ctx.lineWidth=1;
      for(let r=0;r<3;r++){ctx.beginPath();ctx.moveTo(cx-6,cy-14+r*4);ctx.lineTo(cx+6,cy-14+r*4);ctx.stroke();}
      ctx.strokeStyle=A; ctx.lineWidth=2.5; ctx.lineCap="round";
      ctx.beginPath(); ctx.arc(cx,cy-8,14,Math.PI*0.1,Math.PI*0.9,false); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx,cy+10); ctx.lineTo(cx,cy+16); ctx.moveTo(cx-8,cy+16); ctx.lineTo(cx+8,cy+16); ctx.stroke(); break;
    }
    // 21 compass — explored 5+ sources/genres
    case "compass": {
      ctx.strokeStyle=W; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,cy,16,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle=A; ctx.beginPath(); ctx.moveTo(cx,cy-14); ctx.lineTo(cx-4,cy+2); ctx.lineTo(cx+4,cy+2); ctx.closePath(); ctx.fill();
      ctx.fillStyle="#505460"; ctx.beginPath(); ctx.moveTo(cx,cy+14); ctx.lineTo(cx-4,cy-2); ctx.lineTo(cx+4,cy-2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle="#505460"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx-14,cy); ctx.lineTo(cx+14,cy); ctx.stroke(); break;
    }
    // 22 crystal — premium supporter
    case "crystal": {
      ctx.fillStyle=W; ctx.beginPath();
      ctx.moveTo(cx,cy-18); ctx.lineTo(cx+10,cy-6); ctx.lineTo(cx+10,cy+8);
      ctx.lineTo(cx,cy+18); ctx.lineTo(cx-10,cy+8); ctx.lineTo(cx-10,cy-6); ctx.closePath(); ctx.fill();
      ctx.fillStyle=A; ctx.beginPath(); ctx.moveTo(cx,cy-18); ctx.lineTo(cx+10,cy-6); ctx.lineTo(cx-10,cy-6); ctx.closePath(); ctx.fill();
      ctx.strokeStyle="#0A0B0E"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(cx-10,cy-6); ctx.lineTo(cx+10,cy-6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx,cy-18); ctx.lineTo(cx,cy+18); ctx.stroke(); break;
    }
    // 23 eye — active listener 90+ days
    case "eye": {
      ctx.strokeStyle=W; ctx.lineWidth=2; ctx.beginPath();
      ctx.moveTo(cx-18,cy); ctx.quadraticCurveTo(cx,cy-14,cx+18,cy);
      ctx.quadraticCurveTo(cx,cy+14,cx-18,cy); ctx.closePath(); ctx.stroke();
      ctx.fillStyle=A; ctx.beginPath(); ctx.arc(cx,cy,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#0A0B0E"; ctx.beginPath(); ctx.arc(cx,cy,3.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=W; ctx.beginPath(); ctx.arc(cx+3,cy-3,1.5,0,Math.PI*2); ctx.fill(); break;
    }
    // 24 hexagon — invited a member
    case "hexagon": {
      ctx.strokeStyle=A; ctx.lineWidth=3; ctx.beginPath();
      for(let i=0;i<6;i++){const a=(Math.PI/3)*i-Math.PI/6;i===0?ctx.moveTo(cx+Math.cos(a)*16,cy+Math.sin(a)*16):ctx.lineTo(cx+Math.cos(a)*16,cy+Math.sin(a)*16);}
      ctx.closePath(); ctx.stroke();
      ctx.fillStyle=W; ctx.beginPath();
      for(let i=0;i<6;i++){const a=(Math.PI/3)*i-Math.PI/6;i===0?ctx.moveTo(cx+Math.cos(a)*9,cy+Math.sin(a)*9):ctx.lineTo(cx+Math.cos(a)*9,cy+Math.sin(a)*9);}
      ctx.closePath(); ctx.fill(); break;
    }
    // 25 skull — survived bot outage, legacy user
    case "skull": {
      ctx.fillStyle=W; ctx.beginPath(); ctx.arc(cx,cy-4,14,Math.PI,0); ctx.fill();
      ctx.fillRect(cx-10,cy-4,20,10);
      ctx.fillStyle="#0A0B0E";
      ctx.beginPath(); ctx.arc(cx-5,cy-7,4,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+5,cy-7,4,0,Math.PI*2); ctx.fill();
      ctx.fillRect(cx-7,cy+3,4,7); ctx.fillRect(cx-2,cy+3,4,7); ctx.fillRect(cx+3,cy+3,4,7);
      ctx.fillStyle=W; ctx.fillRect(cx-8,cy+2,16,2); break;
    }
    // 26 antenna — 24/7 radio mode 10h+
    case "antenna": {
      ctx.strokeStyle=W; ctx.lineWidth=2; ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(cx,cy+16); ctx.lineTo(cx,cy-16); ctx.stroke();
      for(let i=0;i<3;i++){
        const r=6+i*5; ctx.strokeStyle=i===0?A:W; ctx.lineWidth=1.5-i*0.3;
        ctx.beginPath(); ctx.arc(cx,cy,r,-Math.PI*0.8,-Math.PI*0.2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI*0.2,Math.PI*0.8); ctx.stroke();
      } break;
    }
    // 27 gamepad — joined 3+ party sessions
    case "gamepad": {
      ctx.fillStyle=W; ctx.beginPath(); ctx.ellipse(cx,cy,17,11,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#111216"; ctx.fillRect(cx-12,cy-2,6,2); ctx.fillRect(cx-10,cy-4,2,6);
      ctx.fillStyle="#0A0B0E"; ctx.beginPath(); ctx.ellipse(cx,cy+6,5,3,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=A; ctx.beginPath(); ctx.arc(cx+8,cy-2,2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=W; ctx.beginPath(); ctx.arc(cx+12,cy,2,0,Math.PI*2); ctx.fill(); break;
    }
    // 28 leaf — 5h+ lofi/ambient
    case "leaf": {
      ctx.fillStyle=W; ctx.beginPath();
      ctx.moveTo(cx,cy+16); ctx.bezierCurveTo(cx-20,cy+4,cx-18,cy-14,cx,cy-16);
      ctx.bezierCurveTo(cx+18,cy-14,cx+20,cy+4,cx,cy+16); ctx.fill();
      ctx.strokeStyle=A; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(cx,cy+16); ctx.lineTo(cx,cy-16); ctx.stroke();
      for(let i=-1;i<=1;i+=0.5){
        ctx.beginPath(); ctx.moveTo(cx,cy+i*7); ctx.lineTo(cx+8,cy+i*7-4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx,cy+i*7); ctx.lineTo(cx-8,cy+i*7-4); ctx.stroke();
      } break;
    }
    // 29 crosshair — used seek/forward/rewind 20+ times
    case "crosshair": {
      ctx.strokeStyle=W; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(cx,cy,14,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx,cy,7,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle=A; ctx.lineWidth=2; ctx.beginPath();
      ctx.moveTo(cx-22,cy); ctx.lineTo(cx-16,cy); ctx.moveTo(cx+16,cy); ctx.lineTo(cx+22,cy);
      ctx.moveTo(cx,cy-22); ctx.lineTo(cx,cy-16); ctx.moveTo(cx,cy+16); ctx.lineTo(cx,cy+22); ctx.stroke();
      ctx.fillStyle=A; ctx.beginPath(); ctx.arc(cx,cy,2.5,0,Math.PI*2); ctx.fill(); break;
    }
    // 30 tape — liked a track from before 1991
    case "tape": {
      ctx.fillStyle=W; ctx.beginPath(); ctx.roundRect(cx-18,cy-12,36,24,3); ctx.fill();
      ctx.fillStyle="#111216";
      ctx.beginPath(); ctx.arc(cx-7,cy,6,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+7,cy,6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=W;
      ctx.beginPath(); ctx.arc(cx-7,cy,2.5,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+7,cy,2.5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#505460"; ctx.lineWidth=1.2; ctx.beginPath();
      ctx.moveTo(cx-13,cy-12); ctx.lineTo(cx-13,cy-6);
      ctx.arc(cx-7,cy-6,6,Math.PI,0,false); ctx.arc(cx+7,cy-6,6,Math.PI,0,false);
      ctx.lineTo(cx+13,cy-12); ctx.stroke();
      ctx.strokeStyle=A; ctx.lineWidth=1; ctx.strokeRect(cx-18,cy-12,36,24); break;
    }
    default: {
      ctx.fillStyle=W; const bH=[8,14,22,16,26,12];
      for(let i=0;i<6;i++) ctx.fillRect(cx-18+i*6,cy+12-bH[i],4,bH[i]);
    }
  }
  ctx.restore();
}

// Main Render Function
async function renderProfileCanvas(user, profile = {}) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const accentColor = profile.accentColor || "#FF1E38";
  const bio = profile.bio ? profile.bio.trim() : "No bio set yet.";
  const level = Number.isFinite(profile.level) ? profile.level : 1;
  const xp = Number.isFinite(profile.xp) ? profile.xp : 0;
  const maxXP = Number.isFinite(profile.maxXP) && profile.maxXP > 0 ? profile.maxXP : 100;
  const listeningHours = profile.listeningHours !== undefined ? String(profile.listeningHours) : "0h";
  const songsPlayed = profile.songsPlayed !== undefined ? String(profile.songsPlayed) : "0";
  const streak = profile.streak !== undefined ? String(profile.streak) : "0 days";
  const badges = Array.isArray(profile.badges) ? profile.badges : [];

  // 1. BASE BACKGROUND (Concrete / Grunge Charcoal Noir)
  ctx.fillStyle = "#0A0B0E";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Subtle dark gradient sheen
  const bgGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bgGrad.addColorStop(0, "rgba(22, 24, 30, 0.45)");
  bgGrad.addColorStop(0.5, "rgba(10, 11, 14, 0.2)");
  bgGrad.addColorStop(1, "rgba(5, 6, 8, 0.7)");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Procedural grunge distress / crease lines
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 100);
  ctx.lineTo(WIDTH, 115);
  ctx.moveTo(390, 0);
  ctx.lineTo(385, HEIGHT);
  ctx.moveTo(0, 615);
  ctx.lineTo(WIDTH, 610);
  ctx.stroke();

  // Subtle tape / folded corners effect
  ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
  for (let i = 0; i < 40; i++) {
    const rx = (i * 137) % WIDTH;
    const ry = (i * 241) % HEIGHT;
    ctx.fillRect(rx, ry, (i % 5) + 1, (i % 3) + 1);
  }
  ctx.restore();

  // ========================================================
  // 2. TOP HEADER
  // ========================================================
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 52px Bahnschrift, Arial Black, sans-serif";
  ctx.fillText("TOGETHER", 40, 72);

  ctx.fillStyle = "#7E828C";
  ctx.font = "700 13px Bahnschrift, Arial, sans-serif";
  ctx.fillText("M U S I C   B R I N G S   U S   C L O S E R", 42, 94);

  // Wireframe Globe in center header
  drawWireframeGlobe(ctx, 420, 65, 24);

  // Box [ PEOPLE / MUSIC / TOGETHER ]
  ctx.strokeStyle = "#383B44";
  ctx.lineWidth = 1;
  ctx.strokeRect(475, 45, 110, 42);
  ctx.fillStyle = "#8E929D";
  ctx.font = "700 9px Bahnschrift, monospace";
  ctx.fillText("PEOPLE", 512, 57);
  ctx.fillText("MUSIC", 515, 68);
  ctx.fillText("TOGETHER", 506, 79);

  // + + + + Crosshairs
  ctx.fillStyle = "#6B6F7A";
  ctx.font = "700 15px Consolas, monospace";
  ctx.fillText("+   +   +   +", 635, 69);

  // Top-Right Metadata
  ctx.fillStyle = "#8E929D";
  ctx.font = "600 11px Bahnschrift, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("SAME VIBES", 1080, 56);
  ctx.fillText("DIFFERENT PEOPLE", 1080, 70);
  ctx.fillText("ONE COMMUNITY", 1080, 84);
  ctx.textAlign = "left";

  // Hazard diagonal stripes in top-right corner
  drawDiagonalStripes(ctx, 1105, 46, 55, 40, 6, 2.5, "#4F535D");

  // ========================================================
  // 3. LEFT PANEL: AVATAR / POSTER FRAME
  // ========================================================
  const frameX = 40;
  const frameY = 118;
  const frameW = 330;
  const frameH = 475;

  ctx.fillStyle = "#0E0F13";
  ctx.fillRect(frameX, frameY, frameW, frameH);

  // Double brutalist border
  ctx.strokeStyle = "#2B2D35";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(frameX, frameY, frameW, frameH);

  // Artistic Crimson Red Splatter / Splash behind avatar head
  ctx.save();
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(frameX + 60, frameY + 70);
  ctx.lineTo(frameX + 280, frameY + 45);
  ctx.lineTo(frameX + 310, frameY + 160);
  ctx.lineTo(frameX + 270, frameY + 230);
  ctx.lineTo(frameX + 210, frameY + 180);
  ctx.lineTo(frameX + 160, frameY + 220);
  ctx.lineTo(frameX + 80, frameY + 160);
  ctx.closePath();
  ctx.fill();

  // Red splatter droplets
  ctx.beginPath();
  ctx.arc(frameX + 45, frameY + 48, 7, 0, Math.PI * 2);
  ctx.arc(frameX + 295, frameY + 38, 5, 0, Math.PI * 2);
  ctx.arc(frameX + 315, frameY + 190, 6, 0, Math.PI * 2);
  ctx.arc(frameX + 130, frameY + 245, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Load User Avatar
  let avatarLoaded = false;
  if (user && typeof user.displayAvatarURL === "function") {
    try {
      const avatarUrl = user.displayAvatarURL({ extension: "png", size: 512 });
      const avatarImg = await loadImage(avatarUrl);

      ctx.save();
      ctx.beginPath();
      ctx.rect(frameX + 2, frameY + 2, frameW - 4, frameH - 65);
      ctx.clip();

      ctx.filter = "grayscale(100%) contrast(125%) brightness(92%)";
      const scale = Math.max(frameW / avatarImg.width, (frameH - 65) / avatarImg.height);
      const sw = frameW / scale;
      const sh = (frameH - 65) / scale;
      const sx = (avatarImg.width - sw) / 2;
      const sy = (avatarImg.height - sh) / 2;
      ctx.drawImage(avatarImg, sx, sy, sw, sh, frameX, frameY, frameW, frameH - 65);
      ctx.restore();
      avatarLoaded = true;
    } catch (e) {
      avatarLoaded = false;
    }
  }

  if (!avatarLoaded) {
    // Stylized Anime / Listener silhouette fallback
    ctx.save();
    ctx.beginPath();
    ctx.rect(frameX + 2, frameY + 2, frameW - 4, frameH - 65);
    ctx.clip();

    ctx.fillStyle = "#131418";
    ctx.fillRect(frameX, frameY, frameW, frameH - 65);

    // Dark moody body silhouette
    ctx.fillStyle = "#1E2027";
    ctx.beginPath();
    ctx.arc(frameX + frameW / 2 + 15, frameY + 175, 65, 0, Math.PI * 2);
    ctx.fill();

    // Hoodie & shoulders
    ctx.beginPath();
    ctx.moveTo(frameX + 30, frameY + frameH - 65);
    ctx.lineTo(frameX + frameW / 2 + 10, frameY + 225);
    ctx.lineTo(frameX + frameW - 20, frameY + frameH - 65);
    ctx.closePath();
    ctx.fill();

    // Headphone arch on silhouette
    ctx.strokeStyle = "#5A5E6B";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(frameX + frameW / 2 + 15, frameY + 170, 52, Math.PI * 0.85, Math.PI * 0.15, true);
    ctx.stroke();

    // Headphone ear cup with star
    ctx.fillStyle = "#2D3039";
    ctx.beginPath();
    ctx.arc(frameX + frameW / 2 - 25, frameY + 175, 20, 0, Math.PI * 2);
    ctx.fill();
    drawFourPointStar(ctx, frameX + frameW / 2 - 25, frameY + 175, 10, 3, "#E4E7ED");

    ctx.restore();
  }

  // Vertical Japanese Typography: 音楽でつながる
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 17px 'MS Gothic', 'Yu Gothic', sans-serif";
  const jpChars = ["音", "楽", "で", "つ", "な", "が", "る"];
  for (let j = 0; j < jpChars.length; j++) {
    ctx.fillText(jpChars[j], frameX + 16, frameY + 75 + j * 24);
  }
  ctx.fillStyle = accentColor;
  ctx.fillRect(frameX + 17, frameY + 75 + jpChars.length * 24 + 4, 13, 13);
  ctx.restore();

  // Bottom Technical Box inside avatar frame: Barcode & Label
  const bottomBarY = frameY + frameH - 52;
  ctx.strokeStyle = "#25272F";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(frameX, bottomBarY);
  ctx.lineTo(frameX + frameW, bottomBarY);
  ctx.stroke();

  drawBarcode(ctx, frameX + 14, bottomBarY + 12, 130, 24);

  ctx.fillStyle = "#6B6F7A";
  ctx.font = "700 9px Consolas, monospace";
  ctx.fillText("TOGETHER.USER", frameX + 155, bottomBarY + 27);

  drawFourPointStar(ctx, frameX + frameW - 24, bottomBarY + 24, 9, 3, "#C0C4CC");

  // ========================================================
  // 4. IDENTITY & LEVEL SECTION
  // ========================================================
  const infoX = 405;

  // Tag: USER PROFILE
  ctx.strokeStyle = "#383B44";
  ctx.fillStyle = "#121317";
  ctx.lineWidth = 1;
  ctx.fillRect(infoX, 122, 130, 25);
  ctx.strokeRect(infoX, 122, 130, 25);
  ctx.fillStyle = "#DCDFE6";
  ctx.font = "700 11px Consolas, monospace";
  ctx.fillText("USER PROFILE", infoX + 16, 139);

  // Huge User Name (Emoji-safe)
  const rawName = user?.displayName || user?.username || "LISTENER";
  const cleanName = Array.from(rawName).slice(0, 14).join("").toUpperCase();
  ctx.fillStyle = "#FFFFFF";

  let nameFontSize = 46;
  ctx.font = `900 ${nameFontSize}px Bahnschrift, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  while (ctx.measureText(cleanName).width > 360 && nameFontSize > 22) {
    nameFontSize -= 3;
    ctx.font = `900 ${nameFontSize}px Bahnschrift, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  }
  ctx.fillText(cleanName, infoX, 200);

  // Red 4-Point Star next to name
  const nameWidth = ctx.measureText(cleanName).width;
  drawFourPointStar(ctx, infoX + nameWidth + 24, 185, 12, 4, accentColor);

  // Handle Box: @USERNAME
  const rawHandle = user?.username || "USER";
  const handleTag = `@${Array.from(rawHandle).slice(0, 16).join("").toUpperCase()}`;
  ctx.fillStyle = "#131418";
  ctx.strokeStyle = "#2C2E36";
  ctx.fillRect(infoX, 216, 140, 24);
  ctx.strokeRect(infoX, 216, 140, 24);
  ctx.fillStyle = "#9598A0";
  ctx.font = '700 11px Consolas, "Segoe UI Emoji", "Apple Color Emoji", monospace';
  ctx.fillText(handleTag, infoX + 12, 232);

  // LEVEL BOX (x: 810, y: 122)
  const lvlX = 810;
  const lvlY = 122;
  const lvlW = 135;
  const lvlH = 118;

  ctx.fillStyle = "#0E0F13";
  ctx.strokeStyle = "#2B2D35";
  ctx.fillRect(lvlX, lvlY, lvlW, lvlH);
  ctx.strokeRect(lvlX, lvlY, lvlW, lvlH);

  ctx.fillStyle = "#727680";
  ctx.font = "700 11px Bahnschrift, sans-serif";
  ctx.fillText("LEVEL", lvlX + 16, lvlY + 22);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 48px Bahnschrift, Arial Black, sans-serif";
  ctx.fillText(String(level), lvlX + 16, lvlY + 70);

  // Red XP Progress Bar
  const xpBarW = lvlW - 32;
  const xpBarH = 6;
  ctx.fillStyle = "#25272F";
  ctx.fillRect(lvlX + 16, lvlY + 84, xpBarW, xpBarH);

  const fillRatio = Math.min(1, Math.max(0, xp / maxXP));
  if (fillRatio > 0) {
    ctx.fillStyle = accentColor;
    ctx.fillRect(lvlX + 16, lvlY + 84, Math.max(4, xpBarW * fillRatio), xpBarH);
  }

  ctx.fillStyle = "#7E828C";
  ctx.font = "600 9px Consolas, monospace";
  ctx.fillText(`${xp.toLocaleString()} / ${maxXP.toLocaleString()} XP`, lvlX + 16, lvlY + 104);

  // Moon Phases Column beside Level Box
  const moonX = 970;
  drawMoonPhases(ctx, moonX, lvlY + 22, accentColor);

  // Planet ring wireframe right edge
  drawWireframeGlobe(ctx, 1070, lvlY + 58, 36);

  // ========================================================
  // 5. BIO BOX
  // ========================================================
  const bioX = infoX;
  const bioY = 260;
  const bioW = 540;
  const bioH = 92;

  ctx.fillStyle = "#0E0F13";
  ctx.strokeStyle = "#272930";
  ctx.fillRect(bioX, bioY, bioW, bioH);
  ctx.strokeRect(bioX, bioY, bioW, bioH);

  // "BIO" Tag
  ctx.strokeStyle = "#383B44";
  ctx.fillStyle = "#121317";
  ctx.fillRect(bioX, bioY, 52, 20);
  ctx.strokeRect(bioX, bioY, 52, 20);
  ctx.fillStyle = "#D0D3DB";
  ctx.font = "700 10px Consolas, monospace";
  ctx.fillText("BIO", bioX + 16, bioY + 14);

  // Vector Double Quote marks
  ctx.fillStyle = "#4D5058";
  ctx.beginPath();
  ctx.arc(bioX + 22, bioY + 44, 4, 0, Math.PI * 2);
  ctx.arc(bioX + 31, bioY + 44, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bioX + 22, bioY + 44);
  ctx.lineTo(bioX + 18, bioY + 53);
  ctx.lineTo(bioX + 23, bioY + 48);
  ctx.moveTo(bioX + 31, bioY + 44);
  ctx.lineTo(bioX + 27, bioY + 53);
  ctx.lineTo(bioX + 32, bioY + 48);
  ctx.fill();

  // Bio Text lines (Emoji-safe)
  ctx.fillStyle = "#D0D3DB";
  ctx.font = '500 13px Consolas, "Segoe UI Emoji", "Apple Color Emoji", monospace';
  const bioLines = bio.split("\n");
  const bioLine1 = Array.from(bioLines[0] || "No bio set yet.").slice(0, 48).join("");
  ctx.fillText(bioLine1, bioX + 46, bioY + 44);
  if (bioLines[1]) {
    const bioLine2 = Array.from(bioLines[1]).slice(0, 48).join("");
    ctx.fillText(bioLine2, bioX + 46, bioY + 66);
  } else if (!profile.bio && profile.anthem?.title) {
    ctx.fillStyle = "#8E929D";
    ctx.font = '500 12px Consolas, "Segoe UI Emoji", monospace';
    ctx.fillText(`Anthem: ${Array.from(profile.anthem.title).slice(0, 42).join("")}`, bioX + 46, bioY + 66);
  }

  // Red Heart Doodle on right edge
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  const hx = bioX + bioW - 40;
  const hy = bioY + 48;
  ctx.moveTo(hx, hy + 5);
  ctx.bezierCurveTo(hx - 8, hy - 8, hx - 16, hy + 8, hx, hy + 18);
  ctx.bezierCurveTo(hx + 16, hy + 8, hx + 8, hy - 8, hx, hy + 5);
  ctx.stroke();

  // ========================================================
  // 6. THREE BENTO STAT BOXES (with Vector Icons)
  // ========================================================
  const statsY = 368;
  const statBoxW = 168;
  const statBoxH = 112;
  const statGap = 18;

  // Box 1: Listening Hours
  const b1X = infoX;
  ctx.fillStyle = "#0E0F13";
  ctx.strokeStyle = "#272930";
  ctx.fillRect(b1X, statsY, statBoxW, statBoxH);
  ctx.strokeRect(b1X, statsY, statBoxW, statBoxH);

  drawHeadphonesIcon(ctx, b1X + 26, statsY + 30);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 24px Bahnschrift, sans-serif";
  ctx.fillText(String(listeningHours), b1X + 48, statsY + 33);

  ctx.fillStyle = "#727680";
  ctx.font = "700 9px Consolas, monospace";
  ctx.fillText("LISTENING HOURS", b1X + 48, statsY + 47);

  drawEqualizer(ctx, b1X + 12, statsY + 68, statBoxW - 24, 30, 14, 2, accentColor);

  // Box 2: Songs Played
  const b2X = b1X + statBoxW + statGap;
  ctx.fillStyle = "#0E0F13";
  ctx.strokeStyle = "#272930";
  ctx.fillRect(b2X, statsY, statBoxW, statBoxH);
  ctx.strokeRect(b2X, statsY, statBoxW, statBoxH);

  drawMusicNoteIcon(ctx, b2X + 26, statsY + 28);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 24px Bahnschrift, sans-serif";
  ctx.fillText(String(songsPlayed), b2X + 48, statsY + 33);

  ctx.fillStyle = "#727680";
  ctx.font = "700 9px Consolas, monospace";
  ctx.fillText("SONGS PLAYED", b2X + 48, statsY + 47);

  drawEqualizer(ctx, b2X + 12, statsY + 68, statBoxW - 24, 30, 14, 5, accentColor);

  // Box 3: Streak / Community Days
  const b3X = b2X + statBoxW + statGap;
  ctx.fillStyle = "#0E0F13";
  ctx.strokeStyle = "#272930";
  ctx.fillRect(b3X, statsY, statBoxW, statBoxH);
  ctx.strokeRect(b3X, statsY, statBoxW, statBoxH);

  drawFlameIcon(ctx, b3X + 26, statsY + 30, accentColor);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 24px Bahnschrift, sans-serif";
  ctx.fillText(String(streak), b3X + 48, statsY + 33);

  ctx.fillStyle = "#727680";
  ctx.font = "700 9px Consolas, monospace";
  ctx.fillText("LISTENING STREAK", b3X + 48, statsY + 47);

  drawEqualizer(ctx, b3X + 12, statsY + 68, statBoxW - 24, 30, 14, 8, accentColor);

  // ========================================================
  // 7. BADGES SHELF (Neo-Brutalist Grid — Unlocked First)
  // ========================================================
  const badgeY = 496;

  // Filter unlocked badges from the user's profile
  const userUnlocked = ALL_BADGE_TYPES.filter(b => badges.includes(b));
  const otherBadges = ALL_BADGE_TYPES.filter(b => !badges.includes(b));
  // Display up to 18 badge slots (2 rows of 9)
  const displayBadges = [...userUnlocked, ...otherBadges].slice(0, 18);

  const badgeTagText = `BADGES [${userUnlocked.length}/${ALL_BADGE_TYPES.length}]`;
  ctx.strokeStyle = "#383B44";
  ctx.fillStyle = "#121317";
  ctx.fillRect(infoX, badgeY, 110, 20);
  ctx.strokeRect(infoX, badgeY, 110, 20);
  ctx.fillStyle = userUnlocked.length > 0 ? accentColor : "#D0D3DB";
  ctx.font = "700 10px Consolas, monospace";
  ctx.fillText(badgeTagText, infoX + 10, badgeY + 14);

  const slotSize = 46;
  const slotGapX = 13;
  const slotGapY = 8;
  const row1Y = badgeY + 26;
  const row2Y = row1Y + slotSize + slotGapY;

  for (let s = 0; s < displayBadges.length; s++) {
    const col = s % 9;
    const row = Math.floor(s / 9);
    const sx = infoX + col * (slotSize + slotGapX);
    const sy = row === 0 ? row1Y : row2Y;
    const type = displayBadges[s];
    const isUnlocked = badges.includes(type);
    drawBadgeSlot(ctx, sx, sy, slotSize, type, accentColor, isUnlocked);
  }

  // ========================================================
  // 8. RIGHT POSTER PANEL ("TOGETHER")
  // ========================================================
  const pX = 965;
  const pY = 260;
  const pW = 195;
  const pH = 330;

  ctx.fillStyle = "#0B0C10";
  ctx.strokeStyle = "#272930";
  ctx.fillRect(pX, pY, pW, pH);
  ctx.strokeRect(pX, pY, pW, pH);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 16px Bahnschrift, sans-serif";
  ctx.fillText("TOGETHER", pX + 16, pY + 28);
  drawFourPointStar(ctx, pX + 115, pY + 22, 6, 2, accentColor);

  ctx.fillStyle = "#6B6F7A";
  ctx.font = "700 8px Consolas, monospace";
  ctx.fillText("PEOPLE", pX + 140, pY + 20);
  ctx.fillText("MUSIC", pX + 140, pY + 29);
  ctx.fillText("TOGETHER", pX + 140, pY + 38);

  ctx.save();
  ctx.beginPath();
  ctx.rect(pX + 8, pY + 48, pW - 16, pH - 56);
  ctx.clip();

  const pGrad = ctx.createLinearGradient(pX, pY + 48, pX, pY + pH);
  pGrad.addColorStop(0, "#191B22");
  pGrad.addColorStop(1, "#0A0B0E");
  ctx.fillStyle = pGrad;
  ctx.fillRect(pX + 8, pY + 48, pW - 16, pH - 56);

  ctx.fillStyle = "#2D3039";
  ctx.beginPath();
  ctx.arc(pX + pW / 2, pY + 160, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(pX + 35, pY + pH);
  ctx.lineTo(pX + pW / 2, pY + 175);
  ctx.lineTo(pX + pW - 35, pY + pH);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  for (let c = 0; c < 80; c++) {
    const cx = pX + 10 + (c * 23) % (pW - 20);
    const cy = pY + 220 + (c * 17) % (pH - 230);
    ctx.fillRect(cx, cy, 2, 2);
  }

  ctx.fillStyle = "#E4E7ED";
  ctx.font = "900 20px Bahnschrift, Arial Black, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("GOOD", pX + pW / 2, pY + 215);
  ctx.fillText("MUSIC", pX + pW / 2, pY + 238);
  ctx.fillText("BETTER", pX + pW / 2, pY + 261);
  ctx.fillText("PEOPLE", pX + pW / 2, pY + 284);
  ctx.textAlign = "left";
  ctx.restore();

  // ========================================================
  // 9. FOOTER BAR
  // ========================================================
  const footerY = 642;

  ctx.fillStyle = "#6B6F7A";
  ctx.font = "700 11px Consolas, monospace";
  ctx.fillText("TOGETHER", 42, footerY);
  ctx.fillText("A MUSIC COMMUNITY", 42, footerY + 14);

  // 3 Interlocking Circles ⚬⚬⚬
  ctx.strokeStyle = "#4D5058";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(175, footerY + 5, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(185, footerY + 5, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(195, footerY + 5, 8, 0, Math.PI * 2);
  ctx.stroke();

  // Caution diagonal stripes in footer (cleanly spaced)
  drawDiagonalStripes(ctx, 770, footerY - 5, 60, 20, 5, 2, "#4D5058");

  ctx.fillStyle = "#6B6F7A";
  ctx.font = "700 11px Consolas, monospace";
  ctx.textAlign = "right";
  ctx.fillText("MUSIC NEVER SOUNDS THE SAME ALONE.", WIDTH - 42, footerY + 7);
  ctx.textAlign = "left";

  return canvas.encode("png");
}

module.exports = { renderProfileCanvas, BADGE_REGISTRY, ALL_BADGE_TYPES, drawBadgeSlot };
