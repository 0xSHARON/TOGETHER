async function main() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const cx = W / 2;
  const cy = H / 2;

  // Background
  const bg = ctx.createRadialGradient(cx, cy, 10, cx, cy, 150);
  bg.addColorStop(0, "#0B1220");
  bg.addColorStop(0.55, "#081421");
  bg.addColorStop(1, "#050812");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Outer ring
  ctx.save();
  ctx.shadowColor = RARE;
  ctx.shadowBlur = 28;
  ctx.strokeStyle = RARE;
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.arc(cx, cy, 108, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  // Inner border
  ctx.strokeStyle = hex2rgba(RARE, 0.35);
  ctx.lineWidth = 1.4;

  ctx.beginPath();
  ctx.arc(cx, cy, 92, 0, Math.PI * 2);
  ctx.stroke();

  // Compass ticks
  const ticks = [
    { angle: -Math.PI / 2, r0: 66, r1: 76, primary: true },
    { angle: -Math.PI / 4, r0: 68, r1: 74, primary: false },
    { angle: 0, r0: 66, r1: 76, primary: true },
    { angle: Math.PI / 4, r0: 68, r1: 74, primary: false },
    { angle: Math.PI / 2, r0: 66, r1: 76, primary: true },
    { angle: 3 * Math.PI / 4, r0: 68, r1: 74, primary: false },
    { angle: Math.PI, r0: 66, r1: 76, primary: true },
    { angle: -3 * Math.PI / 4, r0: 68, r1: 74, primary: false }
  ];

  for (const t of ticks) {
    const x0 = cx + Math.cos(t.angle) * t.r0;
    const y0 = cy + Math.sin(t.angle) * t.r0;

    const x1 = cx + Math.cos(t.angle) * t.r1;
    const y1 = cy + Math.sin(t.angle) * t.r1;

    ctx.strokeStyle = t.primary
      ? RARE
      : hex2rgba(RARE, 0.6);

    ctx.lineWidth = t.primary ? 3 : 1.6;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  // Compass emoji
  ctx.save();

  ctx.font = `88px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.shadowColor = RARE;
  ctx.shadowBlur = 22;

  ctx.fillStyle = "#FFFFFF";

  ctx.fillText("🧭", cx, cy + 2);

  ctx.restore();

  // Center dot
  ctx.fillStyle = RARE;

  ctx.beginPath();
  ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
  ctx.fill();

  // Bottom banner
  const bannerY = H - 34;
  const bannerW = 200;
  const bannerH = 22;

  fillRR(
    ctx,
    (W - bannerW) / 2,
    bannerY,
    bannerW,
    bannerH,
    6,
    hex2rgba(RARE, 0.16),
    hex2rgba(RARE, 0.6),
    1
  );

  ctx.save();

  ctx.font = `bold 11px ${FONT}`;
  ctx.fillStyle = RARE;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(
    "GENRE EXPLORER",
    cx,
    bannerY + bannerH / 2 + 0.5
  );

  ctx.restore();

  // Rarity
  ctx.save();

  ctx.font = `bold 8px ${FONT}`;
  ctx.fillStyle = hex2rgba(RARE, 0.9);
  ctx.textAlign = "right";

  ctx.fillText("RARE", W - 12, 16);

  ctx.restore();

  // Output
  const out = path.resolve(
    __dirname,
    "../assets/emojis/vinyl_genre_explorer.png"
  );

  fs.mkdirSync(path.dirname(out), {
    recursive: true
  });

  // IMPORTANT: await encode()
  const buffer = await canvas.encode("png");

  fs.writeFileSync(out, buffer);

  console.log("");
  console.log("=================================");
  console.log("  BADGE GENERATED SUCCESSFULLY");
  console.log("=================================");
  console.log(`File: ${out}`);
  console.log(`Size: ${buffer.length} bytes`);
  console.log("");
}