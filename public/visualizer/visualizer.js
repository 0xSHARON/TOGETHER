/**
 * visualizer.js  —  TOGETHER 3D BRUTALIST AUDIO STAGE & ACTIVITY
 * Features:
 * - 4 Selectable 3D Visual Modes: Monolith, Cyber Tunnel, Equalizer Metropolis, Quantum Vortex
 * - 5 Cyberpunk / Brutalist Themes: Crimson, Cyber Yellow, Acid Lime, Midnight Purple, OLED Monochrome
 * - Live Slide-Out Queue Drawer with Real-Time SSE Sync & Audio Durations
 * - Interactive Deck: Play, Pause, Skip, Previous, Scrubber Seek, Loop Toggle, Autoplay Toggle
 * - DPR mobile clamping (60fps target on mobile, desktop & Discord Activity)
 * - Three.js OrbitControls with camera reset & damping
 */

// ── 0. WebGL Detection & Fallback Check ────────────────────────
function checkWebGLSupport() {
  try {
    const testCanvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

const loadingOverlay = document.getElementById("loading-overlay");
const loadingBar     = document.getElementById("loading-progress");
if (loadingBar) loadingBar.style.width = "100%";
if (loadingOverlay) {
  setTimeout(() => {
    loadingOverlay.classList.add("hidden");
    setTimeout(() => {
      loadingOverlay.style.display = "none";
    }, 150);
  }, 40);
}

const hasWebGL = checkWebGLSupport();
if (!hasWebGL) {
  const fallback = document.getElementById("webgl-fallback");
  if (fallback) fallback.style.display = "flex";
}

// ── 1. Global State & URL Parameters (Discord Activity Ready) ─
const urlParams = new URLSearchParams(window.location.search);
let rawTarget =
  urlParams.get("guild") ||
  urlParams.get("guild_id") ||
  urlParams.get("channel_id") ||
  urlParams.get("channel") ||
  "default";

let activeTargetId = String(rawTarget).trim().replace(/\/+$/, "");

const isInsideDiscord =
  window.parent !== window ||
  urlParams.has("frame_id") ||
  urlParams.has("instance_id") ||
  urlParams.has("platform") ||
  Boolean(window.ReactNativeWebView) ||
  window.location.hostname.includes("discordsays.com");

if (isInsideDiscord) {
  const modeTag = document.getElementById("mode-tag");
  if (modeTag) modeTag.innerText = "[ DISCORD ACTIVITY // SYNCED ]";
  document.body.classList.add("in-discord-activity");
}

let discordSdk = null;
async function setupDiscordSdk() {
  if (window.DiscordEmbeddedAppSdk && typeof window.DiscordEmbeddedAppSdk.DiscordSDK === "function") {
    try {
      discordSdk = new window.DiscordEmbeddedAppSdk.DiscordSDK("863496211667484676");
      await discordSdk.ready();
      console.log("[Discord SDK] Official Handshake Ready!");
      if (discordSdk.guildId && discordSdk.guildId !== "null") {
        activeTargetId = discordSdk.guildId;
      } else if (discordSdk.channelId && discordSdk.channelId !== "null") {
        activeTargetId = discordSdk.channelId;
      }
      initSSE();
      syncPlayerSnapshot();
    } catch (e) {
      console.warn("[Discord SDK] Handshake not active or running outside Discord:", e);
    }
  }
}
setupDiscordSdk();

let playerState = {
  title: "Waiting for music...",
  author: "Join a voice channel and use /play",
  thumbnail: "logo.png?v=2",
  position: 0,
  duration: 0,
  paused: true,
  playing: false,
  loop: "none",
  autoplay: false,
  volume: 80,
  queue: [],
  queueLength: 0,
  lastUpdate: Date.now(),
};

// ── 2. Neo-Brutalist Color Themes ──────────────────────────────
const THEMES = [
  {
    key: "TOGETHER_CRIMSON",
    name: "TOGETHER CRIMSON",
    primary: 0xff0033,       // Crimson Red
    secondary: 0xffffff,     // Stark White
    background: 0x06070a,    // Void Black
    fogColor: 0x06070a,
  },
  {
    key: "CYBER_BRUTAL",
    name: "CYBER BRUTAL",
    primary: 0xfacc15,       // Cyber Yellow
    secondary: 0x6366f1,     // Electric Indigo
    background: 0x090a0f,
    fogColor: 0x090a0f,
  },
  {
    key: "ACID_INDUSTRIAL",
    name: "ACID INDUSTRIAL",
    primary: 0xa3e635,       // Acid Lime
    secondary: 0xf97316,     // Hazard Orange
    background: 0x101510,
    fogColor: 0x101510,
  },
  {
    key: "MIDNIGHT_PURPLE",
    name: "MIDNIGHT PURPLE",
    primary: 0xa855f7,       // Neon Violet
    secondary: 0x06b6d4,     // Cyber Cyan
    background: 0x090611,
    fogColor: 0x090611,
  },
  {
    key: "OLED_MONOCHROME",
    name: "OLED MONOCHROME",
    primary: 0xffffff,       // Pure White
    secondary: 0x94a3b8,     // Polished Silver
    background: 0x000000,    // Pure OLED Black
    fogColor: 0x000000,
  },
];
let currentThemeIdx = 0;

// ── 3. Three.js Scene, Camera & Optimized Renderer ────────────
const canvas   = document.getElementById("stage-canvas");
const scene    = new THREE.Scene();
scene.background = new THREE.Color(THEMES[0].background);
scene.fog        = new THREE.FogExp2(THEMES[0].fogColor, 0.022);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const INITIAL_CAMERA_POS = new THREE.Vector3(0, 18, 42);
camera.position.copy(INITIAL_CAMERA_POS);
camera.lookAt(0, 5, 0);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));

// ── 4. Interactive OrbitControls & Mouse Parallax ─────────────
let controls = null;
if (typeof THREE.OrbitControls !== "undefined") {
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.04;
  controls.minDistance   = 14;
  controls.maxDistance   = 90;
  controls.target.set(0, 5, 0);
}

let mouseX = 0;
let mouseY = 0;
window.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ── 5. Brutalist Dynamic Lighting ─────────────────────────────
const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
dirLight.position.set(20, 40, 20);
scene.add(dirLight);

const primaryLight = new THREE.PointLight(THEMES[0].primary, 3.5, 75);
primaryLight.position.set(0, 16, 0);
scene.add(primaryLight);

const rimLight = new THREE.PointLight(THEMES[0].secondary, 2.5, 60);
rimLight.position.set(-25, 12, -20);
scene.add(rimLight);

// ── 6. 3D Visual Geometries (4 Distinct Visual Modes) ─────────
const VISUAL_MODES = [
  { id: "monolith", name: "MONOLITH" },
  { id: "tunnel", name: "CYBER TUNNEL" },
  { id: "metropolis", name: "METROPOLIS" },
  { id: "vortex", name: "QUANTUM VORTEX" }
];
let currentModeIdx = 0;

// (A) MODE 0: BRUTALIST MONOLITH & ARENA
const monolithGroup = new THREE.Group();
const monolithGeom = new THREE.CylinderGeometry(2.8, 4.4, 11, 6);
const monolithMat  = new THREE.MeshStandardMaterial({
  color: 0x0c0e14,
  roughness: 0.35,
  metalness: 0.85,
});
const monolithMesh = new THREE.Mesh(monolithGeom, monolithMat);
monolithMesh.position.y = 5.5;
monolithGroup.add(monolithMesh);

const monolithEdgesGeom = new THREE.EdgesGeometry(monolithGeom);
const monolithEdgesMat  = new THREE.LineBasicMaterial({
  color: THEMES[0].primary,
  linewidth: 2,
});
const monolithEdges = new THREE.LineSegments(monolithEdgesGeom, monolithEdgesMat);
monolithMesh.add(monolithEdges);

const coreGeom = new THREE.OctahedronGeometry(2.2, 0);
const coreMat  = new THREE.MeshStandardMaterial({
  color: 0x11131a,
  roughness: 0.2,
  metalness: 0.9,
  emissive: THEMES[0].primary,
  emissiveIntensity: 0.4,
});
const coreMesh = new THREE.Mesh(coreGeom, coreMat);
coreMesh.position.y = 14;
monolithGroup.add(coreMesh);

const coreEdgesGeom = new THREE.EdgesGeometry(coreGeom);
const coreEdgesMat  = new THREE.LineBasicMaterial({ color: THEMES[0].secondary });
const coreEdges = new THREE.LineSegments(coreEdgesGeom, coreEdgesMat);
coreMesh.add(coreEdges);
scene.add(monolithGroup);

const ARENA_BARS_COUNT = 48;
const arenaTowers = [];
const arenaEdges  = [];
const arenaGroup  = new THREE.Group();
const ARENA_RADIUS = 18;

const towerBoxGeom = new THREE.BoxGeometry(1.2, 1, 1.2);
towerBoxGeom.translate(0, 0.5, 0);
const towerEdgesGeom = new THREE.EdgesGeometry(towerBoxGeom);

for (let i = 0; i < ARENA_BARS_COUNT; i++) {
  const angle = (i / ARENA_BARS_COUNT) * Math.PI * 2;
  const towerMat = new THREE.MeshStandardMaterial({
    color: 0x0c0e14,
    roughness: 0.4,
    metalness: 0.7,
    emissive: THEMES[0].primary,
    emissiveIntensity: 0.2,
  });
  const towerMesh = new THREE.Mesh(towerBoxGeom, towerMat);
  towerMesh.position.x = Math.cos(angle) * ARENA_RADIUS;
  towerMesh.position.z = Math.sin(angle) * ARENA_RADIUS;
  towerMesh.rotation.y = -angle;

  const lineMat = new THREE.LineBasicMaterial({ color: THEMES[0].primary });
  const towerLine = new THREE.LineSegments(towerEdgesGeom, lineMat);
  towerMesh.add(towerLine);

  arenaTowers.push(towerMesh);
  arenaEdges.push(towerLine);
  arenaGroup.add(towerMesh);
}
scene.add(arenaGroup);

const polyhedraGroup = new THREE.Group();
const polyhedraItems = [];
const POLY_COUNT     = 10;

for (let i = 0; i < POLY_COUNT; i++) {
  const geomType = i % 3;
  let polyGeom;
  if (geomType === 0) polyGeom = new THREE.IcosahedronGeometry(1.3, 0);
  else if (geomType === 1) polyGeom = new THREE.OctahedronGeometry(1.4, 0);
  else polyGeom = new THREE.TetrahedronGeometry(1.5, 0);

  const polyMat = new THREE.MeshStandardMaterial({
    color: 0x0b0d12,
    roughness: 0.3,
    metalness: 0.8,
  });
  const polyMesh = new THREE.Mesh(polyGeom, polyMat);
  const pEdgeGeom = new THREE.EdgesGeometry(polyGeom);
  const pEdgeMat  = new THREE.LineBasicMaterial({
    color: i % 2 === 0 ? THEMES[0].primary : THEMES[0].secondary,
  });
  const pEdges = new THREE.LineSegments(pEdgeGeom, pEdgeMat);
  polyMesh.add(pEdges);

  const orbitRadius = 10 + (i * 2.2);
  const orbitSpeed  = (0.2 + (i * 0.05)) * (i % 2 === 0 ? 1 : -1);
  const orbitAngle  = (i / POLY_COUNT) * Math.PI * 2;
  const orbitHeight = 6 + (i * 1.5);

  polyMesh.position.set(
    Math.cos(orbitAngle) * orbitRadius,
    orbitHeight,
    Math.sin(orbitAngle) * orbitRadius
  );

  polyhedraItems.push({
    mesh: polyMesh,
    edgeMat: pEdgeMat,
    radius: orbitRadius,
    speed: orbitSpeed,
    angle: orbitAngle,
    rotX: (Math.random() - 0.5) * 1.5,
    rotY: (Math.random() - 0.5) * 1.5,
  });
  polyhedraGroup.add(polyMesh);
}
scene.add(polyhedraGroup);

// (B) MODE 1: CYBER MATRIX TUNNEL
const tunnelGroup = new THREE.Group();
const TUNNEL_RINGS_COUNT = 30;
const tunnelRings = [];

for (let i = 0; i < TUNNEL_RINGS_COUNT; i++) {
  const ringGeom = new THREE.TorusGeometry(8 + (i % 3) * 1.2, 0.22, 6, 8);
  const ringMat  = new THREE.MeshStandardMaterial({
    color: 0x050608,
    emissive: i % 2 === 0 ? THEMES[0].primary : THEMES[0].secondary,
    emissiveIntensity: 0.35,
    roughness: 0.3,
    metalness: 0.8
  });
  const ringMesh = new THREE.Mesh(ringGeom, ringMat);
  ringMesh.position.z = -i * 5 + 10;
  const ringEdgesGeom = new THREE.EdgesGeometry(ringGeom);
  const ringEdgesMat = new THREE.LineBasicMaterial({ color: THEMES[0].primary });
  const ringEdges = new THREE.LineSegments(ringEdgesGeom, ringEdgesMat);
  ringMesh.add(ringEdges);

  tunnelGroup.add(ringMesh);
  tunnelRings.push({ mesh: ringMesh, baseZ: ringMesh.position.z, edgeMat: ringEdgesMat, meshMat: ringMat });
}
tunnelGroup.visible = false;
scene.add(tunnelGroup);

// (C) MODE 2: EQUALIZER METROPOLIS (8x8 City Grid = 64 Skyscrapers)
const metropolisGroup = new THREE.Group();
const METRO_COLS = 8;
const METRO_ROWS = 8;
const metroBuildings = [];
const bldgBoxGeom = new THREE.BoxGeometry(2.4, 1, 2.4);
bldgBoxGeom.translate(0, 0.5, 0);
const bldgEdgesGeom = new THREE.EdgesGeometry(bldgBoxGeom);

for (let r = 0; r < METRO_ROWS; r++) {
  for (let c = 0; c < METRO_COLS; c++) {
    const bMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c12,
      roughness: 0.4,
      metalness: 0.8,
      emissive: (r + c) % 2 === 0 ? THEMES[0].primary : THEMES[0].secondary,
      emissiveIntensity: 0.25,
    });
    const bMesh = new THREE.Mesh(bldgBoxGeom, bMat);
    bMesh.position.x = (c - METRO_COLS / 2 + 0.5) * 3.8;
    bMesh.position.z = (r - METRO_ROWS / 2 + 0.5) * 3.8;

    const bEdgeMat = new THREE.LineBasicMaterial({ color: THEMES[0].primary });
    const bEdges = new THREE.LineSegments(bldgEdgesGeom, bEdgeMat);
    bMesh.add(bEdges);

    metropolisGroup.add(bMesh);
    metroBuildings.push({ mesh: bMesh, mat: bMat, edgeMat: bEdgeMat, row: r, col: c });
  }
}
metropolisGroup.visible = false;
scene.add(metropolisGroup);

// (D) MODE 3: QUANTUM VORTEX / BLACK HOLE
const vortexGroup = new THREE.Group();
const VORTEX_PARTICLE_COUNT = 50;
const vortexParticles = [];

// Event Horizon Core Sphere
const bhCoreGeom = new THREE.SphereGeometry(3.6, 24, 24);
const bhCoreMat = new THREE.MeshStandardMaterial({
  color: 0x000000,
  roughness: 0.9,
  metalness: 0.1,
  emissive: THEMES[0].primary,
  emissiveIntensity: 0.15,
});
const bhCoreMesh = new THREE.Mesh(bhCoreGeom, bhCoreMat);
bhCoreMesh.position.y = 8;
vortexGroup.add(bhCoreMesh);

// Accretion Disk Rings
const diskGeom1 = new THREE.RingGeometry(5.0, 14.0, 32);
const diskMat1  = new THREE.MeshBasicMaterial({
  color: THEMES[0].primary,
  side: THREE.DoubleSide,
  wireframe: true,
});
const diskMesh1 = new THREE.Mesh(diskGeom1, diskMat1);
diskMesh1.rotation.x = Math.PI / 2.3;
diskMesh1.position.y = 8;
vortexGroup.add(diskMesh1);

const diskGeom2 = new THREE.RingGeometry(6.5, 18.0, 24);
const diskMat2  = new THREE.MeshBasicMaterial({
  color: THEMES[0].secondary,
  side: THREE.DoubleSide,
  wireframe: true,
});
const diskMesh2 = new THREE.Mesh(diskGeom2, diskMat2);
diskMesh2.rotation.x = Math.PI / 2.1;
diskMesh2.rotation.y = Math.PI / 4;
diskMesh2.position.y = 8;
vortexGroup.add(diskMesh2);

for (let i = 0; i < VORTEX_PARTICLE_COUNT; i++) {
  const pGeom = new THREE.OctahedronGeometry(0.7, 0);
  const pMat  = new THREE.MeshStandardMaterial({
    color: 0x0a0c10,
    emissive: i % 2 === 0 ? THEMES[0].primary : THEMES[0].secondary,
    emissiveIntensity: 0.4,
  });
  const pMesh = new THREE.Mesh(pGeom, pMat);
  const pEdges = new THREE.LineSegments(new THREE.EdgesGeometry(pGeom), new THREE.LineBasicMaterial({ color: THEMES[0].primary }));
  pMesh.add(pEdges);

  const dist = 6 + (i * 0.4);
  const speed = 0.3 + (i * 0.02);
  const angle = (i / VORTEX_PARTICLE_COUNT) * Math.PI * 4;
  pMesh.position.set(Math.cos(angle) * dist, 8 + Math.sin(angle * 2) * 2.5, Math.sin(angle) * dist);

  vortexGroup.add(pMesh);
  vortexParticles.push({ mesh: pMesh, dist, speed, angle, edgeLine: pEdges });
}
vortexGroup.visible = false;
scene.add(vortexGroup);

// (E) Infinite Grid Floor
let gridFloor = new THREE.GridHelper(160, 64, THEMES[0].primary, 0x1f2433);
gridFloor.position.y = 0;
scene.add(gridFloor);

// ── 7. Simulated Frequency FFT Audio Reactive Engine ──────────
const audioBands = new Array(ARENA_BARS_COUNT).fill(1);
let beatPhase    = 0;

function updateAudioVisualization(delta) {
  const isPlaying = playerState.playing && !playerState.paused;
  beatPhase += delta * (isPlaying ? 4.5 : 0.8);

  const bassIntensity = isPlaying
    ? (Math.sin(beatPhase * 2) > 0.5 ? 1.6 : 1.0) + Math.random() * 0.3
    : 0.5;

  primaryLight.intensity = isPlaying ? 2.5 + bassIntensity * 2.2 : 1.0;

  // 1. Monolith Mode Animation
  if (monolithGroup.visible) {
    for (let i = 0; i < ARENA_BARS_COUNT; i++) {
      if (isPlaying) {
        const freqSpread = (i / ARENA_BARS_COUNT) * Math.PI * 3;
        const wave = Math.abs(Math.sin(beatPhase * 1.8 + freqSpread));
        const targetHeight = 1.0 + wave * 16.0 + Math.cos(beatPhase * 0.9 + i) * 3.0;
        audioBands[i] += (targetHeight - audioBands[i]) * 0.3;
      } else {
        audioBands[i] += (0.8 - audioBands[i]) * 0.1;
      }
      arenaTowers[i].scale.y = Math.max(0.2, audioBands[i]);
    }
    arenaGroup.rotation.y += delta * (isPlaying ? 0.25 : 0.05);
    monolithGroup.rotation.y -= delta * (isPlaying ? 0.3 : 0.08);

    coreMesh.rotation.x += delta * (isPlaying ? 1.8 : 0.4);
    coreMesh.rotation.y += delta * (isPlaying ? 2.2 : 0.5);
    coreMesh.position.y = 14 + Math.sin(beatPhase * 1.2) * (isPlaying ? 1.2 : 0.3);
    coreMesh.material.emissiveIntensity = isPlaying ? 0.5 + bassIntensity * 0.5 : 0.2;

    polyhedraItems.forEach((item) => {
      item.angle += delta * item.speed * (isPlaying ? 1.5 : 0.5);
      item.mesh.position.x = Math.cos(item.angle) * item.radius;
      item.mesh.position.z = Math.sin(item.angle) * item.radius;
      item.mesh.rotation.x += delta * item.rotX * (isPlaying ? 2.0 : 0.8);
      item.mesh.rotation.y += delta * item.rotY * (isPlaying ? 2.0 : 0.8);
    });
  }

  // 2. Cyber Tunnel Mode Animation
  if (tunnelGroup.visible) {
    tunnelRings.forEach((r, idx) => {
      r.mesh.position.z += delta * (isPlaying ? (22 + bassIntensity * 8) : 6);
      if (r.mesh.position.z > 25) {
        r.mesh.position.z = -125;
      }
      r.mesh.rotation.z += delta * (idx % 2 === 0 ? 0.4 : -0.4);
      const pulseScale = 1.0 + (isPlaying ? Math.sin(beatPhase + idx * 0.3) * 0.18 : 0);
      r.mesh.scale.set(pulseScale, pulseScale, 1);
    });
  }

  // 3. Metropolis Mode Animation
  if (metropolisGroup.visible) {
    metroBuildings.forEach((b, idx) => {
      if (isPlaying) {
        const wave = Math.abs(Math.sin(beatPhase * 1.5 + (b.row + b.col) * 0.6));
        const bHeight = 1.0 + wave * 14.0 + Math.sin(beatPhase * 0.8 + idx) * 3.0;
        b.mesh.scale.y += (bHeight - b.mesh.scale.y) * 0.25;
      } else {
        b.mesh.scale.y += (1.5 - b.mesh.scale.y) * 0.1;
      }
    });
    metropolisGroup.rotation.y += delta * (isPlaying ? 0.12 : 0.03);
  }

  // 4. Quantum Vortex Mode Animation
  if (vortexGroup.visible) {
    diskMesh1.rotation.z += delta * (isPlaying ? 1.2 : 0.3);
    diskMesh2.rotation.z -= delta * (isPlaying ? 0.8 : 0.2);
    const pulseRadius = 1.0 + (isPlaying ? Math.sin(beatPhase * 2.2) * 0.2 : 0);
    bhCoreMesh.scale.set(pulseRadius, pulseRadius, pulseRadius);

    vortexParticles.forEach((p) => {
      p.angle += delta * p.speed * (isPlaying ? 2.0 : 0.6);
      p.mesh.position.x = Math.cos(p.angle) * p.dist;
      p.mesh.position.z = Math.sin(p.angle) * p.dist;
      p.mesh.position.y = 8 + Math.sin(p.angle * 3) * 3.0;
      p.mesh.rotation.x += delta * 1.5;
    });
  }

  // UI Stepped VU Meter animation
  for (let v = 1; v <= 6; v++) {
    const el = document.getElementById(`vu-${v}`);
    if (el) {
      const active = isPlaying && (Math.random() * 6 >= (6 - v));
      el.className = `vu-step ${active ? "active" : ""}`;
      el.style.height = active ? `${8 + Math.floor(Math.random() * 20)}px` : "6px";
    }
  }
}

// ── 8. Render Loop & FPS Counter ──────────────────────────────
let lastFrameTime = performance.now();
let frameCount    = 0;
let lastFpsCheck  = performance.now();
const fpsDisplay  = document.getElementById("fps-text");

function animate() {
  requestAnimationFrame(animate);

  const now   = performance.now();
  const delta = Math.min((now - lastFrameTime) / 1000, 0.1);
  lastFrameTime = now;

  frameCount++;
  if (now - lastFpsCheck >= 1000) {
    if (fpsDisplay) fpsDisplay.innerText = frameCount;
    frameCount   = 0;
    lastFpsCheck = now;
  }

  if (controls) {
    if (!controls.state || controls.state === -1) {
      controls.target.x += (mouseX * 2 - controls.target.x) * 0.02;
    }
    controls.update();
  }

  updateAudioVisualization(delta);
  updateLocalPlaybackPosition(delta);

  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

// ── 9. Responsive Resizing ────────────────────────────────────
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
});

// ── 10. Scrubber & Timeline Synchronization ───────────────────
function updateLocalPlaybackPosition(delta) {
  if (playerState.playing && !playerState.paused && playerState.duration > 0) {
    playerState.position = Math.min(playerState.duration, playerState.position + delta * 1000);
    renderScrubber();
  }
}

function formatTimecode(ms) {
  if (!ms || ms < 0 || isNaN(ms)) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const minutes  = Math.floor(totalSec / 60);
  const seconds  = totalSec % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function renderScrubber() {
  const currentText = document.getElementById("time-current");
  const totalText   = document.getElementById("time-total");
  const timeBadge   = document.getElementById("time-badge");
  const fill        = document.getElementById("scrubber-fill");

  const curFormatted = formatTimecode(playerState.position);
  const totFormatted = formatTimecode(playerState.duration);

  if (currentText) currentText.innerText = curFormatted;
  if (totalText)   totalText.innerText   = totFormatted;
  if (timeBadge)   timeBadge.innerText   = `${curFormatted} / ${totFormatted}`;

  if (fill) {
    const pct = playerState.duration > 0
      ? Math.min(100, Math.max(0, (playerState.position / playerState.duration) * 100))
      : 0;
    fill.style.width = `${pct}%`;
  }
}

// ── 11. Escape HTML Helper ────────────────────────────────────
function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ── 12. Upcoming Queue Drawer Rendering ───────────────────────
function renderQueue(queue = [], queueLength = 0) {
  const countBadge = document.getElementById("queue-count-badge");
  const btnBadge   = document.getElementById("queue-btn-label");
  const listEl     = document.getElementById("queue-track-list");

  const total = queueLength || queue.length || 0;
  if (countBadge) countBadge.innerText = `${total} ${total === 1 ? "SONG" : "SONGS"}`;
  if (btnBadge)   btnBadge.innerText   = `QUEUE (${total})`;

  if (!listEl) return;
  if (!queue || queue.length === 0) {
    listEl.innerHTML = `
      <div class="queue-empty-state">
        <p class="mono-code">// QUEUE IS CURRENTLY EMPTY</p>
        <span class="queue-empty-hint">Use /play in Discord to queue tracks</span>
      </div>
    `;
    return;
  }

  listEl.innerHTML = queue.map((track) => {
    const dur = formatTimecode(track.duration);
    const thumb = track.thumbnail || "logo.png?v=2";
    return `
      <div class="queue-track-item">
        <span class="queue-item-idx">#${track.index}</span>
        <img class="queue-item-thumb" src="${thumb}" onerror="this.src='logo.png?v=2'" alt="Thumb">
        <div class="queue-item-meta">
          <div class="queue-item-title" title="${escapeHtml(track.title)}">${escapeHtml(track.title)}</div>
          <div class="queue-item-sub">
            <span>${escapeHtml(track.author)}</span>
            <span class="mono-code">${dur}</span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ── 13. State Applicator ──────────────────────────────────────
function applyPlayerState(data) {
  if (!data) return;

  const previousPlaying = playerState.playing && !playerState.paused;
  const previousTitle   = playerState.title;

  playerState.title         = data.title || playerState.title;
  playerState.author        = data.author || playerState.author;
  playerState.thumbnail     = data.thumbnail || playerState.thumbnail;
  playerState.duration      = Number(data.duration) || 0;
  playerState.paused        = Boolean(data.paused);
  playerState.playing       = Boolean(data.playing);
  playerState.loop          = data.loop || "none";
  playerState.autoplay      = Boolean(data.autoplay);
  playerState.volume        = typeof data.volume === "number" ? data.volume : 80;
  playerState.transitioning = Boolean(data.transitioning);
  playerState.queue         = Array.isArray(data.queue) ? data.queue : [];
  playerState.queueLength   = typeof data.queueLength === "number" ? data.queueLength : (data.queue?.length || 0);

  if (typeof data.position === "number") {
    if (Math.abs(playerState.position - data.position) > 1200 || !previousPlaying) {
      playerState.position = data.position;
    }
  }

  const titleEl    = document.getElementById("deck-title");
  const artistEl   = document.getElementById("deck-artist");
  const deckGuild  = document.getElementById("deck-guild-badge");
  const deckArt    = document.getElementById("deck-artwork");
  const fallbackArt = document.getElementById("fallback-art");

  if (titleEl)   titleEl.innerText  = playerState.title;
  if (artistEl)  artistEl.innerText = playerState.author;
  if (deckGuild && data.guildName) deckGuild.innerText = `[ ${data.guildName.toUpperCase()} ]`;

  if (data.thumbnail && data.title !== previousTitle) {
    let rawThumb = data.thumbnail;
    if (rawThumb.startsWith("http://")) {
      rawThumb = rawThumb.replace(/^http:\/\//, "https://");
    }

    const setResilientImage = (imgEl) => {
      if (!imgEl) return;
      let failCount = 0;
      imgEl.onerror = function() {
        failCount++;
        if (failCount === 1 && this.src.includes("maxresdefault.jpg")) {
          this.src = this.src.replace("maxresdefault.jpg", "hqdefault.jpg");
        } else if (failCount === 2 && this.src.includes("hqdefault.jpg")) {
          this.src = this.src.replace("hqdefault.jpg", "mqdefault.jpg");
        } else if (failCount <= 3 && !this.src.includes("/api/thumbnail")) {
          this.src = `/api/thumbnail?url=${encodeURIComponent(rawThumb)}`;
        } else if (!this.src.includes("logo.png")) {
          this.src = "logo.png?v=2";
        }
      };
      imgEl.src = rawThumb;
    };

    setResilientImage(deckArt);
    setResilientImage(fallbackArt);
  }

  const playIcon   = document.getElementById("btn-play-icon");
  const streamText = document.getElementById("player-state-text");
  const isPlaying  = playerState.playing && !playerState.paused;

  if (playIcon) playIcon.innerText = isPlaying ? "⏸" : "▶";
  if (streamText) {
    if (playerState.transitioning) {
      streamText.innerText = "LOADING";
      streamText.className = "metric-val mono";
    } else if (isPlaying) {
      streamText.innerText = "STREAMING";
      streamText.className = "metric-val mono green";
    } else if (playerState.playing && playerState.paused) {
      streamText.innerText = "PAUSED";
      streamText.className = "metric-val mono";
    } else {
      streamText.innerText = "IDLE";
      streamText.className = "metric-val mono";
    }
  }

  const bLoop = document.getElementById("badge-loop");
  const bAuto = document.getElementById("badge-autoplay");
  if (bLoop) {
    const loopVal = (playerState.loop || "off").toUpperCase();
    bLoop.innerText = `LOOP: ${loopVal}`;
    bLoop.className = `status-pill interactive-pill ${playerState.loop && playerState.loop !== "none" ? "active" : ""}`;
  }
  if (bAuto) {
    bAuto.innerText = `AUTO: ${playerState.autoplay ? "ON" : "OFF"}`;
    bAuto.className = `status-pill interactive-pill ${playerState.autoplay ? "active" : ""}`;
  }

  renderScrubber();
  renderQueue(playerState.queue, playerState.queueLength);
}

// ── 14. SSE Live Feed & Polling Fallback ──────────────────────
let activeEventSource = null;

function initSSE() {
  if (activeEventSource) {
    activeEventSource.close();
    activeEventSource = null;
  }

  const sseUrl = `/api/stream/${encodeURIComponent(activeTargetId)}`;

  try {
    activeEventSource = new EventSource(sseUrl);
    activeEventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        applyPlayerState(data);
      } catch {}
    };
    activeEventSource.onerror = () => {
      if (activeEventSource) activeEventSource.close();
      activeEventSource = null;
      startPollingFallback();
    };
  } catch {
    startPollingFallback();
  }
}

let pollingInterval = null;
function startPollingFallback() {
  if (pollingInterval) return;
  pollingInterval = setInterval(syncPlayerSnapshot, 1500);
}

async function syncPlayerSnapshot() {
  try {
    const res = await fetch(`/api/player/${encodeURIComponent(activeTargetId)}`);
    if (res.ok) {
      const data = await res.json();
      applyPlayerState(data);
    }
  } catch (err) {
    console.error("Player sync error:", err);
  }
}

// ── 15. Interactive Controls & API Calls ───────────────────────
async function sendControlCommand(action, extra = {}) {
  try {
    await fetch(`/api/player/${encodeURIComponent(activeTargetId)}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    setTimeout(syncPlayerSnapshot, 120);
  } catch (err) {
    console.error("Control command error:", err);
  }
}

document.getElementById("btn-play-pause")?.addEventListener("click", () => {
  const action = playerState.paused ? "resume" : "pause";
  sendControlCommand(action);
});

document.getElementById("btn-next")?.addEventListener("click", () => {
  playerState.transitioning = true;
  const deckTitle = document.getElementById("deck-title");
  const streamText = document.getElementById("player-state-text");
  if (deckTitle) deckTitle.innerText = "Skipping track...";
  if (streamText) {
    streamText.innerText = "SKIPPING";
    streamText.className = "metric-val mono";
  }
  sendControlCommand("skip");
});

document.getElementById("btn-prev")?.addEventListener("click", () => {
  playerState.transitioning = true;
  const deckTitle = document.getElementById("deck-title");
  const streamText = document.getElementById("player-state-text");
  if (deckTitle) deckTitle.innerText = "Loading previous track...";
  if (streamText) {
    streamText.innerText = "LOADING";
    streamText.className = "metric-val mono";
  }
  sendControlCommand("previous");
});

document.getElementById("badge-loop")?.addEventListener("click", () => {
  sendControlCommand("loop");
});

document.getElementById("badge-autoplay")?.addEventListener("click", () => {
  sendControlCommand("autoplay");
});

document.getElementById("scrubber-bar")?.addEventListener("click", (e) => {
  if (!playerState.duration) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const pct = Math.max(0, Math.min(1, clickX / rect.width));
  const newPos = Math.floor(pct * playerState.duration);
  playerState.position = newPos;
  renderScrubber();
  sendControlCommand("seek", { position: newPos });
});

document.getElementById("camera-reset-btn")?.addEventListener("click", () => {
  if (controls) {
    camera.position.copy(INITIAL_CAMERA_POS);
    controls.target.set(0, 5, 0);
    controls.update();
  }
});

document.getElementById("fullscreen-btn")?.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

// ── 16. Queue Drawer Toggle ───────────────────────────────────
const queueDrawer   = document.getElementById("queue-drawer");
const queueToggleBtn = document.getElementById("queue-toggle-btn");
const queueCloseBtn  = document.getElementById("queue-close-btn");

queueToggleBtn?.addEventListener("click", () => {
  if (queueDrawer) {
    queueDrawer.classList.toggle("open");
  }
});

queueCloseBtn?.addEventListener("click", () => {
  if (queueDrawer) {
    queueDrawer.classList.remove("open");
  }
});

// ── 17. 3D Visual Mode Switcher ───────────────────────────────
function setVisualMode(modeIdx) {
  currentModeIdx = modeIdx % VISUAL_MODES.length;
  const mode = VISUAL_MODES[currentModeIdx];

  const modeLabel = document.getElementById("mode-name");
  if (modeLabel) modeLabel.innerText = mode.name;

  // Toggle Visibility of Groups
  monolithGroup.visible   = (mode.id === "monolith");
  arenaGroup.visible      = (mode.id === "monolith");
  polyhedraGroup.visible  = (mode.id === "monolith");
  tunnelGroup.visible     = (mode.id === "tunnel");
  metropolisGroup.visible = (mode.id === "metropolis");
  vortexGroup.visible     = (mode.id === "vortex");

  // Adjust Camera for best viewing angle per mode
  if (controls) {
    if (mode.id === "tunnel") {
      camera.position.set(0, 0, 18);
      controls.target.set(0, 0, -40);
    } else if (mode.id === "metropolis") {
      camera.position.set(0, 24, 38);
      controls.target.set(0, 4, 0);
    } else if (mode.id === "vortex") {
      camera.position.set(0, 16, 36);
      controls.target.set(0, 8, 0);
    } else {
      camera.position.copy(INITIAL_CAMERA_POS);
      controls.target.set(0, 5, 0);
    }
    controls.update();
  }
}

document.getElementById("mode-btn")?.addEventListener("click", () => {
  setVisualMode(currentModeIdx + 1);
});

// ── 18. Theme Switcher: Cycle Brutalist Themes in 3D and DOM ──
function applyTheme(idx) {
  currentThemeIdx = idx % THEMES.length;
  const theme = THEMES[currentThemeIdx];

  document.documentElement.setAttribute("data-theme", theme.key);
  const themeLabel = document.getElementById("theme-name");
  if (themeLabel) themeLabel.innerText = theme.name;

  scene.background.setHex(theme.background);
  scene.fog.color.setHex(theme.fogColor);
  primaryLight.color.setHex(theme.primary);
  rimLight.color.setHex(theme.secondary);

  // Monolith Elements
  monolithEdgesMat.color.setHex(theme.primary);
  coreMat.emissive.setHex(theme.primary);
  coreEdgesMat.color.setHex(theme.secondary);

  arenaEdges.forEach((e) => e.material.color.setHex(theme.primary));
  arenaTowers.forEach((t) => t.material.emissive.setHex(theme.primary));
  polyhedraItems.forEach((p, i) => p.edgeMat.color.setHex(i % 2 === 0 ? theme.primary : theme.secondary));

  // Tunnel Elements
  tunnelRings.forEach((r, i) => {
    r.edgeMat.color.setHex(theme.primary);
    r.meshMat.emissive.setHex(i % 2 === 0 ? theme.primary : theme.secondary);
  });

  // Metropolis Elements
  metroBuildings.forEach((b, i) => {
    b.edgeMat.color.setHex(theme.primary);
    b.mat.emissive.setHex(i % 2 === 0 ? theme.primary : theme.secondary);
  });

  // Vortex Elements
  bhCoreMat.emissive.setHex(theme.primary);
  diskMat1.color.setHex(theme.primary);
  diskMat2.color.setHex(theme.secondary);
  vortexParticles.forEach((p, i) => {
    p.mesh.material.emissive.setHex(i % 2 === 0 ? theme.primary : theme.secondary);
    p.edgeLine.material.color.setHex(theme.primary);
  });

  // Grid Floor
  scene.remove(gridFloor);
  gridFloor = new THREE.GridHelper(160, 64, theme.primary, 0x1f2433);
  gridFloor.position.y = 0;
  scene.add(gridFloor);
}

document.getElementById("theme-btn")?.addEventListener("click", () => {
  applyTheme(currentThemeIdx + 1);
});

// Initialize Handshake & SSE
initSSE();
syncPlayerSnapshot();
setInterval(syncPlayerSnapshot, 6000);
