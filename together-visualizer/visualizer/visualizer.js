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
  thumbnail: "/logo.png?v=2",
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

// ── 6. 3D Visual Geometries (50 Distinct Visual Modes) ────────
const BASE_VISUAL_MODES = [
  { id: "monolith", name: "MONOLITH", category: "Brutalist", icon: "🗿" },
  { id: "tunnel", name: "CYBER TUNNEL", category: "Cyberpunk", icon: "🌀" },
  { id: "metropolis", name: "METROPOLIS", category: "Brutalist", icon: "🏙️" },
  { id: "vortex", name: "QUANTUM VORTEX", category: "Quantum", icon: "🌌" },
  { id: "horizon", name: "NEON HORIZON", category: "Cyberpunk", icon: "🌅" },
  { id: "neural", name: "NEURAL MATRIX", category: "Cyberpunk", icon: "🧠" },
  { id: "supernova", name: "SUPERNOVA DISK", category: "Cosmic", icon: "💥" },
  { id: "astrolabe", name: "ASTROLABE", category: "Cosmic", icon: "🧭" },
  { id: "tesseract", name: "HYPERCUBE", category: "Geometry", icon: "🧊" },
  { id: "prism", name: "PRISM VOID", category: "Geometry", icon: "💎" },
];

const EXTRA_MODES = (typeof window !== "undefined" && Array.isArray(window.MODES_EXTRA))
  ? window.MODES_EXTRA
  : [];

const VISUAL_MODES = [...BASE_VISUAL_MODES, ...EXTRA_MODES];
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

// (E) MODE 4: NEON HORIZON (Synthwave Mountain Grid & Wireframe Sun)
const horizonGroup = new THREE.Group();
const HORIZON_W = 130;
const HORIZON_SEGS = 26;
const horizonPlaneGeom = new THREE.PlaneGeometry(HORIZON_W, HORIZON_W, HORIZON_SEGS, HORIZON_SEGS);
horizonPlaneGeom.rotateX(-Math.PI / 2);
const horizonMat = new THREE.MeshStandardMaterial({
  color: 0x05070c,
  wireframe: true,
  roughness: 0.8,
  metalness: 0.2,
  emissive: THEMES[0].primary,
  emissiveIntensity: 0.35,
});
const horizonMesh = new THREE.Mesh(horizonPlaneGeom, horizonMat);
horizonMesh.position.set(0, 0, 0);
horizonGroup.add(horizonMesh);

// Glowing Retro Wireframe Sun
const sunGeom = new THREE.SphereGeometry(15, 24, 16);
const sunMat = new THREE.MeshBasicMaterial({
  color: THEMES[0].primary,
  wireframe: true,
});
const sunMesh = new THREE.Mesh(sunGeom, sunMat);
sunMesh.position.set(0, 15, -60);
horizonGroup.add(sunMesh);
horizonGroup.visible = false;
scene.add(horizonGroup);

// (F) MODE 5: NEURAL MATRIX (Synaptic Network Graph)
const neuralGroup = new THREE.Group();
const NEURAL_NODES_COUNT = 44;
const neuralNodes = [];
const nodeGeom = new THREE.OctahedronGeometry(1.0, 0);
const nodeEdgeGeom = new THREE.EdgesGeometry(nodeGeom);

for (let i = 0; i < NEURAL_NODES_COUNT; i++) {
  const nMat = new THREE.MeshStandardMaterial({
    color: 0x090b12,
    emissive: i % 2 === 0 ? THEMES[0].primary : THEMES[0].secondary,
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.8,
  });
  const nMesh = new THREE.Mesh(nodeGeom, nMat);
  const nEdgeMat = new THREE.LineBasicMaterial({ color: THEMES[0].primary });
  const nEdge = new THREE.LineSegments(nodeEdgeGeom, nEdgeMat);
  nMesh.add(nEdge);

  const radius = 8 + Math.random() * 20;
  const theta = Math.random() * Math.PI * 2;
  const phi = (Math.random() - 0.5) * Math.PI;

  nMesh.position.set(
    radius * Math.cos(phi) * Math.cos(theta),
    9 + radius * Math.sin(phi) * 0.5,
    radius * Math.cos(phi) * Math.sin(theta)
  );

  neuralGroup.add(nMesh);
  neuralNodes.push({
    mesh: nMesh,
    basePos: nMesh.position.clone(),
    mat: nMat,
    edgeMat: nEdgeMat,
    speed: 0.5 + Math.random() * 0.8,
    phase: Math.random() * Math.PI * 2,
  });
}

// Synaptic Connecting Lines
const neuralLinesMat = new THREE.LineBasicMaterial({
  color: THEMES[0].secondary,
  transparent: true,
  opacity: 0.4,
});
const neuralLinesGeom = new THREE.BufferGeometry();
const neuralLinesMesh = new THREE.LineSegments(neuralLinesGeom, neuralLinesMat);
neuralGroup.add(neuralLinesMesh);
neuralGroup.visible = false;
scene.add(neuralGroup);

// (G) MODE 6: SUPERNOVA DISK (Pulsar Star & Cosmic Shockwaves)
const supernovaGroup = new THREE.Group();
const pulsarGeom = new THREE.SphereGeometry(3.6, 24, 24);
const pulsarMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: THEMES[0].primary,
  emissiveIntensity: 0.8,
  roughness: 0.1,
  metalness: 0.9,
});
const pulsarMesh = new THREE.Mesh(pulsarGeom, pulsarMat);
pulsarMesh.position.set(0, 9, 0);
supernovaGroup.add(pulsarMesh);

// Spiral Arms Particles
const SUPERNOVA_PARTICLES_COUNT = 72;
const supernovaParticles = [];
const shardGeom = new THREE.OctahedronGeometry(0.7, 0);

for (let i = 0; i < SUPERNOVA_PARTICLES_COUNT; i++) {
  const arm = i % 2;
  const angle = (i / SUPERNOVA_PARTICLES_COUNT) * Math.PI * 5 + (arm * Math.PI);
  const dist = 5 + (i / SUPERNOVA_PARTICLES_COUNT) * 25;
  const sMat = new THREE.MeshStandardMaterial({
    color: 0x090b10,
    emissive: arm === 0 ? THEMES[0].primary : THEMES[0].secondary,
    emissiveIntensity: 0.5,
  });
  const sMesh = new THREE.Mesh(shardGeom, sMat);
  sMesh.position.set(
    Math.cos(angle) * dist,
    9 + (Math.sin(angle * 3)) * 1.5,
    Math.sin(angle) * dist
  );
  supernovaGroup.add(sMesh);
  supernovaParticles.push({ mesh: sMesh, dist, angle, arm, speed: 0.5 + (i % 4) * 0.15, mat: sMat });
}

// Blast wave ring
const blastRingGeom = new THREE.RingGeometry(1.5, 2.2, 32);
const blastRingMat = new THREE.MeshBasicMaterial({
  color: THEMES[0].primary,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.7,
});
const blastRingMesh = new THREE.Mesh(blastRingGeom, blastRingMat);
blastRingMesh.rotation.x = Math.PI / 2;
blastRingMesh.position.set(0, 9, 0);
supernovaGroup.add(blastRingMesh);
let blastRingScale = 1.0;

supernovaGroup.visible = false;
scene.add(supernovaGroup);

// (H) MODE 7: ASTROLABE (Orbital Armillary Sphere & Celestial Beacons)
const astrolabeGroup = new THREE.Group();
const astrolabeRings = [];
const ASTROLABE_RINGS_DATA = [
  { radius: 13.0, tube: 0.24, rotAxis: 'x', speed: 0.7 },
  { radius: 10.5, tube: 0.22, rotAxis: 'y', speed: -0.9 },
  { radius: 8.0,  tube: 0.20, rotAxis: 'z', speed: 1.1 },
  { radius: 5.4,  tube: 0.18, rotAxis: 'xy', speed: -0.8 },
];

ASTROLABE_RINGS_DATA.forEach((data, idx) => {
  const ringGeom = new THREE.TorusGeometry(data.radius, data.tube, 8, 36);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x07090e,
    emissive: idx % 2 === 0 ? THEMES[0].primary : THEMES[0].secondary,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.85,
  });
  const ringMesh = new THREE.Mesh(ringGeom, ringMat);
  const ringEdgeMat = new THREE.LineBasicMaterial({
    color: idx % 2 === 0 ? THEMES[0].primary : THEMES[0].secondary,
  });
  const ringEdges = new THREE.LineSegments(new THREE.EdgesGeometry(ringGeom), ringEdgeMat);
  ringMesh.add(ringEdges);
  ringMesh.position.set(0, 9, 0);
  astrolabeGroup.add(ringMesh);
  astrolabeRings.push({ mesh: ringMesh, mat: ringMat, edgeMat: ringEdgeMat, ...data });
});

// Central Celestial Core
const astrolabeCoreGeom = new THREE.IcosahedronGeometry(2.4, 0);
const astrolabeCoreMat = new THREE.MeshStandardMaterial({
  color: 0x0b0d14,
  roughness: 0.2,
  metalness: 0.9,
  emissive: THEMES[0].primary,
  emissiveIntensity: 0.6,
});
const astrolabeCoreMesh = new THREE.Mesh(astrolabeCoreGeom, astrolabeCoreMat);
astrolabeCoreMesh.position.set(0, 9, 0);
const astrolabeCoreEdgeMat = new THREE.LineBasicMaterial({ color: THEMES[0].secondary });
const astrolabeCoreEdges = new THREE.LineSegments(new THREE.EdgesGeometry(astrolabeCoreGeom), astrolabeCoreEdgeMat);
astrolabeCoreMesh.add(astrolabeCoreEdges);
astrolabeGroup.add(astrolabeCoreMesh);

// Orbiting Celestial Diamond Beacons
const ASTROLABE_BEACONS_COUNT = 8;
const astrolabeBeacons = [];
const beaconGeom = new THREE.OctahedronGeometry(0.85, 0);
for (let i = 0; i < ASTROLABE_BEACONS_COUNT; i++) {
  const bMat = new THREE.MeshStandardMaterial({
    color: 0x0a0c12,
    emissive: i % 2 === 0 ? THEMES[0].primary : THEMES[0].secondary,
    emissiveIntensity: 0.5,
  });
  const bMesh = new THREE.Mesh(beaconGeom, bMat);
  const bEdgeMat = new THREE.LineBasicMaterial({ color: THEMES[0].primary });
  bMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(beaconGeom), bEdgeMat));
  astrolabeGroup.add(bMesh);
  astrolabeBeacons.push({
    mesh: bMesh,
    mat: bMat,
    edgeMat: bEdgeMat,
    radius: 14 + (i % 3) * 1.8,
    speed: (0.4 + (i % 4) * 0.15) * (i % 2 === 0 ? 1 : -1),
    angle: (i / ASTROLABE_BEACONS_COUNT) * Math.PI * 2,
    tilt: ((i - 4) / 4) * 0.6,
  });
}
astrolabeGroup.visible = false;
scene.add(astrolabeGroup);

// (I) MODE 8: HYPERCUBE / TESSERACT (4D Wireframe Projection)
const tesseractGroup = new THREE.Group();
tesseractGroup.position.set(0, 9, 0);

// Outer Cube (Box wireframe & solid transparent shell)
const outerBoxGeom = new THREE.BoxGeometry(13, 13, 13);
const outerBoxMat = new THREE.MeshStandardMaterial({
  color: 0x04060a,
  roughness: 0.3,
  metalness: 0.8,
  transparent: true,
  opacity: 0.25,
});
const outerBoxMesh = new THREE.Mesh(outerBoxGeom, outerBoxMat);
const outerBoxEdgeMat = new THREE.LineBasicMaterial({ color: THEMES[0].primary, linewidth: 2 });
const outerBoxEdges = new THREE.LineSegments(new THREE.EdgesGeometry(outerBoxGeom), outerBoxEdgeMat);
outerBoxMesh.add(outerBoxEdges);
tesseractGroup.add(outerBoxMesh);

// Inner Cube
const innerBoxGeom = new THREE.BoxGeometry(6.5, 6.5, 6.5);
const innerBoxMat = new THREE.MeshStandardMaterial({
  color: 0x060810,
  roughness: 0.2,
  metalness: 0.9,
  emissive: THEMES[0].secondary,
  emissiveIntensity: 0.3,
});
const innerBoxMesh = new THREE.Mesh(innerBoxGeom, innerBoxMat);
const innerBoxEdgeMat = new THREE.LineBasicMaterial({ color: THEMES[0].secondary, linewidth: 2 });
const innerBoxEdges = new THREE.LineSegments(new THREE.EdgesGeometry(innerBoxGeom), innerBoxEdgeMat);
innerBoxMesh.add(innerBoxEdges);
tesseractGroup.add(innerBoxMesh);

// 8 Hypercube Corner Connecting Strut Lines
const strutLinePositions = new Float32Array(8 * 2 * 3);
const strutLineGeom = new THREE.BufferGeometry();
strutLineGeom.setAttribute('position', new THREE.BufferAttribute(strutLinePositions, 3));
const strutLineMat = new THREE.LineBasicMaterial({
  color: THEMES[0].primary,
  transparent: true,
  opacity: 0.85,
});
const strutLinesMesh = new THREE.LineSegments(strutLineGeom, strutLineMat);
tesseractGroup.add(strutLinesMesh);

// 16 Vertex Node Spheres / Octahedrons
const tesseractNodes = [];
const tesseractNodeGeom = new THREE.OctahedronGeometry(0.55, 0);
for (let i = 0; i < 16; i++) {
  const nMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: i < 8 ? THEMES[0].primary : THEMES[0].secondary,
    emissiveIntensity: 0.8,
  });
  const nMesh = new THREE.Mesh(tesseractNodeGeom, nMat);
  tesseractGroup.add(nMesh);
  tesseractNodes.push({ mesh: nMesh, mat: nMat, isInner: i >= 8, index: i % 8 });
}

// Center Hyper-Singularity Core
const tesseractCoreGeom = new THREE.DodecahedronGeometry(1.8, 0);
const tesseractCoreMat = new THREE.MeshStandardMaterial({
  color: 0x080a12,
  emissive: THEMES[0].primary,
  emissiveIntensity: 0.7,
  roughness: 0.1,
  metalness: 0.9,
});
const tesseractCoreMesh = new THREE.Mesh(tesseractCoreGeom, tesseractCoreMat);
tesseractGroup.add(tesseractCoreMesh);

tesseractGroup.visible = false;
scene.add(tesseractGroup);

// (J) MODE 9: PRISM VOID (Faceted Crystal Obelisk & Laser Matrix)
const prismGroup = new THREE.Group();

// Central Obelisk / Hexagonal Prism Monolith
const prismGeom = new THREE.CylinderGeometry(1.2, 4.2, 17, 6);
const prismMat = new THREE.MeshStandardMaterial({
  color: 0x05070c,
  roughness: 0.15,
  metalness: 0.95,
  emissive: THEMES[0].primary,
  emissiveIntensity: 0.25,
});
const prismMesh = new THREE.Mesh(prismGeom, prismMat);
prismMesh.position.set(0, 8.5, 0);
const prismEdgeMat = new THREE.LineBasicMaterial({ color: THEMES[0].primary });
const prismEdges = new THREE.LineSegments(new THREE.EdgesGeometry(prismGeom), prismEdgeMat);
prismMesh.add(prismEdges);
prismGroup.add(prismMesh);

// Apex Levitation Crystal
const apexCrystalGeom = new THREE.OctahedronGeometry(1.8, 0);
const apexCrystalMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: THEMES[0].secondary,
  emissiveIntensity: 0.9,
  roughness: 0.1,
  metalness: 0.8,
});
const apexCrystalMesh = new THREE.Mesh(apexCrystalGeom, apexCrystalMat);
apexCrystalMesh.position.set(0, 18.5, 0);
const apexEdgeMat = new THREE.LineBasicMaterial({ color: THEMES[0].primary });
apexCrystalMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(apexCrystalGeom), apexEdgeMat));
prismGroup.add(apexCrystalMesh);

// 6 Laser Beams to Perimeter Anchor Pedestals
const PRISM_ANCHORS_COUNT = 6;
const prismAnchorMeshes = [];
const laserGeom = new THREE.BufferGeometry();
const laserPositions = new Float32Array(PRISM_ANCHORS_COUNT * 2 * 3);
laserGeom.setAttribute('position', new THREE.BufferAttribute(laserPositions, 3));
const laserMat = new THREE.LineBasicMaterial({
  color: THEMES[0].primary,
  transparent: true,
  opacity: 0.75,
});
const laserLines = new THREE.LineSegments(laserGeom, laserMat);
prismGroup.add(laserLines);

const anchorGeom = new THREE.CylinderGeometry(0.8, 1.3, 2.5, 6);
for (let i = 0; i < PRISM_ANCHORS_COUNT; i++) {
  const angle = (i / PRISM_ANCHORS_COUNT) * Math.PI * 2;
  const aDist = 18;
  const aMat = new THREE.MeshStandardMaterial({
    color: 0x080a12,
    emissive: THEMES[0].secondary,
    emissiveIntensity: 0.35,
    roughness: 0.3,
    metalness: 0.8,
  });
  const aMesh = new THREE.Mesh(anchorGeom, aMat);
  aMesh.position.set(Math.cos(angle) * aDist, 1.25, Math.sin(angle) * aDist);
  const aEdgeMat = new THREE.LineBasicMaterial({ color: THEMES[0].primary });
  aMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(anchorGeom), aEdgeMat));
  prismGroup.add(aMesh);
  prismAnchorMeshes.push({ mesh: aMesh, mat: aMat, edgeMat: aEdgeMat, angle, dist: aDist });
}

// Orbiting Floating Facets (Crystalline shards)
const PRISM_FACETS_COUNT = 16;
const prismFacets = [];
const facetGeom = new THREE.TetrahedronGeometry(1.0, 0);
for (let i = 0; i < PRISM_FACETS_COUNT; i++) {
  const fMat = new THREE.MeshStandardMaterial({
    color: 0x0a0c14,
    emissive: i % 2 === 0 ? THEMES[0].primary : THEMES[0].secondary,
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.9,
  });
  const fMesh = new THREE.Mesh(facetGeom, fMat);
  const fEdgeMat = new THREE.LineBasicMaterial({ color: THEMES[0].secondary });
  fMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(facetGeom), fEdgeMat));
  prismGroup.add(fMesh);
  prismFacets.push({
    mesh: fMesh,
    mat: fMat,
    edgeMat: fEdgeMat,
    radius: 7.5 + (i % 4) * 2.5,
    height: 4 + (i / PRISM_FACETS_COUNT) * 11,
    speed: (0.5 + (i % 3) * 0.2) * (i % 2 === 0 ? 1 : -1),
    angle: (i / PRISM_FACETS_COUNT) * Math.PI * 2,
  });
}

// Ascending Spark Void Particles
const PRISM_SPARKS_COUNT = 40;
const prismSparks = [];
const sparkGeom = new THREE.BoxGeometry(0.3, 0.9, 0.3);
for (let i = 0; i < PRISM_SPARKS_COUNT; i++) {
  const sMat = new THREE.MeshBasicMaterial({
    color: i % 2 === 0 ? THEMES[0].primary : THEMES[0].secondary,
    transparent: true,
    opacity: 0.8,
  });
  const sMesh = new THREE.Mesh(sparkGeom, sMat);
  const sRadius = 2 + Math.random() * 12;
  const sAngle = Math.random() * Math.PI * 2;
  sMesh.position.set(
    Math.cos(sAngle) * sRadius,
    Math.random() * 24,
    Math.sin(sAngle) * sRadius
  );
  prismGroup.add(sMesh);
  prismSparks.push({ mesh: sMesh, mat: sMat, speed: 4 + Math.random() * 7 });
}

prismGroup.visible = false;
scene.add(prismGroup);

// (E) Infinite Grid Floor
let gridFloor = new THREE.GridHelper(160, 64, THEMES[0].primary, 0x1f2433);
gridFloor.position.y = 0;
scene.add(gridFloor);

// Initialize 40 Additional Procedural Modes (50 Total Modes)
const extraModeHandles = [];
EXTRA_MODES.forEach((mode, idx) => {
  try {
    if (typeof mode.init === "function") {
      const handle = mode.init(scene, THEMES[0]);
      extraModeHandles.push(handle);
    } else {
      extraModeHandles.push(null);
    }
  } catch (err) {
    console.error(`[Visualizer] Failed to initialize mode ${mode.id || idx}:`, err);
    extraModeHandles.push(null);
  }
});

// ── 7. Frequency Reactive Audio Animation Engine ─────────────
const audioBands = new Array(ARENA_BARS_COUNT).fill(1);
let beatPhase    = 0;

function updateAudioVisualization(delta) {
  const isPlaying = playerState.playing && !playerState.paused;
  beatPhase += delta * (isPlaying ? 4.5 : 0.8);

  const effectiveBass = isPlaying
    ? (Math.sin(beatPhase * 2) > 0.4 ? 1.7 : 1.0) + Math.random() * 0.25
    : 0.4;

  primaryLight.intensity = isPlaying ? 2.5 + effectiveBass * 2.2 : 1.0;

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
    coreMesh.material.emissiveIntensity = isPlaying ? 0.5 + effectiveBass * 0.5 : 0.2;

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
      r.mesh.position.z += delta * (isPlaying ? (22 + effectiveBass * 8) : 6);
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

  // 5. Neon Horizon Mode Animation
  if (horizonGroup.visible) {
    const pos = horizonPlaneGeom.attributes.position;
    const time = beatPhase * 0.6;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const distFromCenter = Math.abs(u) / (HORIZON_W / 2);
      const wave = Math.sin(u * 0.15 + time) * Math.cos(pos.getZ(i) * 0.15 - time);
      const mHeight = (distFromCenter > 0.25 ? Math.pow(distFromCenter, 2.0) * 16 : 0);
      pos.setY(i, (wave * (isPlaying ? 3.0 : 1.0) + mHeight) * (1.0 + effectiveBass * 0.4));
    }
    pos.needsUpdate = true;
    sunMesh.rotation.y += delta * 0.2;
    const sunScale = 1.0 + (isPlaying ? Math.sin(beatPhase * 1.5) * 0.15 : 0);
    sunMesh.scale.set(sunScale, sunScale, sunScale);
  }

  // 6. Neural Matrix Mode Animation
  if (neuralGroup.visible) {
    neuralNodes.forEach((n) => {
      n.phase += delta * n.speed * (isPlaying ? 2.2 : 0.7);
      n.mesh.position.y = n.basePos.y + Math.sin(n.phase) * 1.8;
      const pScale = 1.0 + (isPlaying ? Math.sin(n.phase * 2) * 0.3 : 0);
      n.mesh.scale.set(pScale, pScale, pScale);
    });
    neuralGroup.rotation.y += delta * (isPlaying ? 0.15 : 0.04);

    const linePositions = [];
    for (let i = 0; i < neuralNodes.length; i++) {
      for (let j = i + 1; j < neuralNodes.length; j++) {
        const d = neuralNodes[i].mesh.position.distanceTo(neuralNodes[j].mesh.position);
        if (d < 12.0) {
          linePositions.push(
            neuralNodes[i].mesh.position.x, neuralNodes[i].mesh.position.y, neuralNodes[i].mesh.position.z,
            neuralNodes[j].mesh.position.x, neuralNodes[j].mesh.position.y, neuralNodes[j].mesh.position.z
          );
        }
      }
    }
    neuralLinesGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    neuralLinesMat.opacity = isPlaying ? 0.45 : 0.15;
  }

  // 7. Supernova Disk Mode Animation
  if (supernovaGroup.visible) {
    pulsarMesh.rotation.y += delta * (isPlaying ? 3.0 : 0.8);
    const pulsarScale = 1.0 + (isPlaying ? Math.sin(beatPhase * 3) * 0.25 : 0);
    pulsarMesh.scale.set(pulsarScale, pulsarScale, pulsarScale);
    pulsarMat.emissiveIntensity = isPlaying ? 0.7 + effectiveBass * 0.5 : 0.3;

    supernovaParticles.forEach((p) => {
      p.angle += delta * p.speed * (isPlaying ? 1.8 : 0.5);
      p.mesh.position.x = Math.cos(p.angle) * p.dist;
      p.mesh.position.z = Math.sin(p.angle) * p.dist;
      p.mesh.rotation.x += delta * 2.0;
    });
    supernovaGroup.rotation.y += delta * (isPlaying ? 0.2 : 0.05);

    blastRingScale += delta * (isPlaying ? 24.0 : 8.0);
    if (blastRingScale > 32.0) blastRingScale = 1.0;
    blastRingMesh.scale.set(blastRingScale, blastRingScale, 1.0);
    blastRingMat.opacity = Math.max(0, 0.8 - (blastRingScale / 32.0));
  }

  // 8. Astrolabe Mode Animation
  if (astrolabeGroup.visible) {
    astrolabeRings.forEach((r, idx) => {
      const rotDelta = delta * r.speed * (isPlaying ? 1.8 : 0.4);
      if (r.rotAxis === 'x') r.mesh.rotation.x += rotDelta;
      else if (r.rotAxis === 'y') r.mesh.rotation.y += rotDelta;
      else if (r.rotAxis === 'z') r.mesh.rotation.z += rotDelta;
      else {
        r.mesh.rotation.x += rotDelta * 0.7;
        r.mesh.rotation.y += rotDelta * 0.8;
      }
      const pScale = 1.0 + (isPlaying ? Math.sin(beatPhase * 2 + idx * 0.8) * 0.12 : 0);
      r.mesh.scale.set(pScale, pScale, pScale);
    });

    astrolabeCoreMesh.rotation.x += delta * (isPlaying ? 2.0 : 0.5);
    astrolabeCoreMesh.rotation.y += delta * (isPlaying ? 2.4 : 0.6);
    const corePulse = 1.0 + (isPlaying ? Math.sin(beatPhase * 2.5) * 0.25 : 0);
    astrolabeCoreMesh.scale.set(corePulse, corePulse, corePulse);
    astrolabeCoreMat.emissiveIntensity = isPlaying ? 0.6 + effectiveBass * 0.5 : 0.25;

    astrolabeBeacons.forEach((b) => {
      b.angle += delta * b.speed * (isPlaying ? 1.6 : 0.5);
      b.mesh.position.set(
        Math.cos(b.angle) * b.radius,
        9 + Math.sin(b.angle * 2) * 3.5 + Math.sin(b.tilt) * 2,
        Math.sin(b.angle) * b.radius
      );
      b.mesh.rotation.x += delta * 1.8;
      b.mesh.rotation.y += delta * 2.2;
    });
    astrolabeGroup.rotation.y += delta * (isPlaying ? 0.18 : 0.04);
  }

  // 9. Hypercube / Tesseract Mode Animation
  if (tesseractGroup.visible) {
    const rotSpeed = isPlaying ? 0.8 : 0.2;
    outerBoxMesh.rotation.y += delta * rotSpeed * 0.6;
    outerBoxMesh.rotation.x += delta * rotSpeed * 0.4;

    innerBoxMesh.rotation.y -= delta * rotSpeed * 1.2;
    innerBoxMesh.rotation.z += delta * rotSpeed * 0.9;

    const tCycle = Math.sin(beatPhase * 1.4);
    const oScale = 1.0 + (isPlaying ? tCycle * 0.18 : 0);
    const iScale = 1.0 - (isPlaying ? tCycle * 0.18 : 0);
    outerBoxMesh.scale.set(oScale, oScale, oScale);
    innerBoxMesh.scale.set(iScale, iScale, iScale);

    tesseractCoreMesh.rotation.y += delta * (isPlaying ? 2.5 : 0.6);
    tesseractCoreMesh.rotation.z += delta * (isPlaying ? 1.8 : 0.4);
    const cScale = 1.0 + (isPlaying ? Math.sin(beatPhase * 3) * 0.3 : 0);
    tesseractCoreMesh.scale.set(cScale, cScale, cScale);
    tesseractCoreMat.emissiveIntensity = isPlaying ? 0.7 + effectiveBass * 0.5 : 0.3;

    // Corner vertices calculation for 4D hypercube projection
    const outHalf = 6.5 * oScale;
    const inHalf = 3.25 * iScale;
    const signs = [
      [-1, -1, -1], [ 1, -1, -1], [ 1,  1, -1], [-1,  1, -1],
      [-1, -1,  1], [ 1, -1,  1], [ 1,  1,  1], [-1,  1,  1],
    ];

    const outRot = outerBoxMesh.rotation;
    const inRot = innerBoxMesh.rotation;
    const strutPositions = strutLineGeom.attributes.position.array;

    for (let i = 0; i < 8; i++) {
      const s = signs[i];
      const vOut = new THREE.Vector3(s[0] * outHalf, s[1] * outHalf, s[2] * outHalf);
      vOut.applyEuler(outRot);
      const vIn = new THREE.Vector3(s[0] * inHalf, s[1] * inHalf, s[2] * inHalf);
      vIn.applyEuler(inRot);

      tesseractNodes[i].mesh.position.copy(vOut);
      tesseractNodes[i + 8].mesh.position.copy(vIn);

      const baseIdx = i * 6;
      strutPositions[baseIdx]     = vOut.x;
      strutPositions[baseIdx + 1] = vOut.y;
      strutPositions[baseIdx + 2] = vOut.z;
      strutPositions[baseIdx + 3] = vIn.x;
      strutPositions[baseIdx + 4] = vIn.y;
      strutPositions[baseIdx + 5] = vIn.z;
    }
    strutLineGeom.attributes.position.needsUpdate = true;
    strutLineMat.opacity = isPlaying ? 0.65 + effectiveBass * 0.3 : 0.3;
    tesseractGroup.rotation.y += delta * (isPlaying ? 0.2 : 0.05);
  }

  // 10. Prism Void Mode Animation
  if (prismGroup.visible) {
    prismMesh.rotation.y += delta * (isPlaying ? 0.5 : 0.12);
    prismMesh.position.y = 8.5 + (isPlaying ? Math.sin(beatPhase * 1.5) * 1.2 : 0);
    prismMat.emissiveIntensity = isPlaying ? 0.3 + effectiveBass * 0.45 : 0.15;

    apexCrystalMesh.position.y = prismMesh.position.y + 10;
    apexCrystalMesh.rotation.y += delta * (isPlaying ? 2.5 : 0.7);
    apexCrystalMesh.rotation.x += delta * (isPlaying ? 1.8 : 0.5);
    const aScale = 1.0 + (isPlaying ? Math.sin(beatPhase * 2.8) * 0.28 : 0);
    apexCrystalMesh.scale.set(aScale, aScale, aScale);
    apexCrystalMat.emissiveIntensity = isPlaying ? 0.8 + effectiveBass * 0.5 : 0.4;

    const apexPos = apexCrystalMesh.position;
    const lPos = laserGeom.attributes.position.array;
    prismAnchorMeshes.forEach((a, i) => {
      const idx = i * 6;
      lPos[idx]     = apexPos.x;
      lPos[idx + 1] = apexPos.y;
      lPos[idx + 2] = apexPos.z;
      lPos[idx + 3] = a.mesh.position.x;
      lPos[idx + 4] = a.mesh.position.y + 1.25;
      lPos[idx + 5] = a.mesh.position.z;
    });
    laserGeom.attributes.position.needsUpdate = true;
    laserMat.opacity = isPlaying ? 0.55 + Math.sin(beatPhase * 4) * 0.35 : 0.2;

    prismFacets.forEach((f) => {
      f.angle += delta * f.speed * (isPlaying ? 1.5 : 0.5);
      f.mesh.position.set(
        Math.cos(f.angle) * f.radius,
        f.height + Math.sin(f.angle * 2) * 1.5,
        Math.sin(f.angle) * f.radius
      );
      f.mesh.rotation.x += delta * 1.5;
      f.mesh.rotation.y += delta * 2.0;
    });

    prismSparks.forEach((s) => {
      s.mesh.position.y += delta * s.speed * (isPlaying ? 1.5 : 0.5);
      if (s.mesh.position.y > 26) {
        s.mesh.position.y = 0.5;
      }
      s.mesh.rotation.y += delta * 2;
    });
    prismGroup.rotation.y += delta * (isPlaying ? 0.15 : 0.03);
  }

  // 11+. Procedural Extra Modes Animation (Modes 10 through 49)
  if (currentModeIdx >= 10) {
    const extraHandle = extraModeHandles[currentModeIdx - 10];
    if (extraHandle && typeof extraHandle.animate === "function") {
      extraHandle.animate(delta, isPlaying, effectiveBass, beatPhase);
    }
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
    let directThumb = track.thumbnail || "/logo.png?v=2";
    if (directThumb.startsWith("http://")) directThumb = directThumb.replace(/^http:\/\//, "https://");

    // In Discord Activity, route remote image URLs through thumbnail proxy to bypass CSP/Referrer blocking
    const thumbSrc = (isInsideDiscord && directThumb.startsWith("http"))
      ? `/api/thumbnail?url=${encodeURIComponent(directThumb)}`
      : directThumb;

    return `
      <div class="queue-track-item">
        <span class="queue-item-idx">#${track.index}</span>
        <img class="queue-item-thumb" 
             src="${escapeHtml(thumbSrc)}" 
             referrerpolicy="no-referrer"
             loading="lazy"
             data-original="${escapeHtml(directThumb)}"
             onerror="if(!this.src.includes('/api/thumbnail') && this.dataset.original && this.dataset.original.startsWith('http')){this.src='/api/thumbnail?url=' + encodeURIComponent(this.dataset.original);}else if(!this.src.includes('logo.png')){this.src='/logo.png?v=2';}" 
             alt="Thumb">
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
          this.src = "/logo.png?v=2";
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

// ── 17. 3D Visual Mode Switcher (50 Visualizer Modes) ─────────
function setVisualMode(modeIdx) {
  currentModeIdx = ((modeIdx % VISUAL_MODES.length) + VISUAL_MODES.length) % VISUAL_MODES.length;
  const mode = VISUAL_MODES[currentModeIdx];

  const modeLabel = document.getElementById("mode-name");
  if (modeLabel) {
    modeLabel.innerText = `${mode.icon ? mode.icon + " " : ""}${mode.name}`;
  }

  // Toggle Visibility of Base 10 Groups
  monolithGroup.visible   = (mode.id === "monolith");
  arenaGroup.visible      = (mode.id === "monolith");
  polyhedraGroup.visible  = (mode.id === "monolith");
  tunnelGroup.visible     = (mode.id === "tunnel");
  metropolisGroup.visible = (mode.id === "metropolis");
  vortexGroup.visible     = (mode.id === "vortex");
  horizonGroup.visible    = (mode.id === "horizon");
  neuralGroup.visible     = (mode.id === "neural");
  supernovaGroup.visible  = (mode.id === "supernova");
  astrolabeGroup.visible  = (mode.id === "astrolabe");
  tesseractGroup.visible  = (mode.id === "tesseract");
  prismGroup.visible      = (mode.id === "prism");

  // Toggle Visibility of Extra 40 Modes
  extraModeHandles.forEach((handle, idx) => {
    if (handle && handle.group) {
      handle.group.visible = (currentModeIdx === 10 + idx);
    }
  });

  // Adjust Camera for best viewing angle per mode
  if (controls) {
    if (currentModeIdx >= 10 && mode.camera) {
      camera.position.set(mode.camera.x, mode.camera.y, mode.camera.z);
      controls.target.set(0, mode.camera.targetY !== undefined ? mode.camera.targetY : 6, 0);
    } else if (mode.id === "tunnel") {
      camera.position.set(0, 0, 18);
      controls.target.set(0, 0, -40);
    } else if (mode.id === "metropolis") {
      camera.position.set(0, 24, 38);
      controls.target.set(0, 4, 0);
    } else if (mode.id === "vortex") {
      camera.position.set(0, 16, 36);
      controls.target.set(0, 8, 0);
    } else if (mode.id === "horizon") {
      camera.position.set(0, 11, 46);
      controls.target.set(0, 10, -50);
    } else if (mode.id === "neural") {
      camera.position.set(0, 15, 34);
      controls.target.set(0, 9, 0);
    } else if (mode.id === "supernova") {
      camera.position.set(0, 22, 38);
      controls.target.set(0, 9, 0);
    } else if (mode.id === "astrolabe") {
      camera.position.set(0, 16, 36);
      controls.target.set(0, 9, 0);
    } else if (mode.id === "tesseract") {
      camera.position.set(20, 19, 28);
      controls.target.set(0, 9, 0);
    } else if (mode.id === "prism") {
      camera.position.set(0, 16, 38);
      controls.target.set(0, 9, 0);
    } else {
      camera.position.copy(INITIAL_CAMERA_POS);
      controls.target.set(0, 5, 0);
    }
    controls.update();
  }

  updateModeModalCards();
}

// ── 18. Mode Selector Modal Controller ────────────────────────
const modeModal       = document.getElementById("mode-modal");
const modeBtn         = document.getElementById("mode-btn");
const modeCloseBtn    = document.getElementById("mode-close-btn");
const modeBtnPrev     = document.getElementById("mode-btn-prev");
const modeBtnNext     = document.getElementById("mode-btn-next");
const modeBtnRandom   = document.getElementById("mode-btn-random");
const modeSearchInput = document.getElementById("mode-search-input");
const modeFilterPills = document.querySelectorAll(".mode-filter-pill");
const modeGrid        = document.getElementById("mode-grid");
const modeCountLabel  = document.getElementById("mode-modal-count");

let activeFilterCategory = "ALL";
let activeSearchQuery    = "";

function renderModeCards() {
  if (!modeGrid) return;
  modeGrid.innerHTML = "";

  let matchCount = 0;
  VISUAL_MODES.forEach((mode, idx) => {
    const category = mode.category || "Standard";
    const matchesCategory = activeFilterCategory === "ALL" || category.toLowerCase() === activeFilterCategory.toLowerCase();
    const query = activeSearchQuery.toLowerCase();
    const matchesSearch = !query || mode.name.toLowerCase().includes(query) || category.toLowerCase().includes(query) || String(idx + 1).includes(query);

    if (matchesCategory && matchesSearch) {
      matchCount++;
      const card = document.createElement("div");
      card.className = `mode-card ${idx === currentModeIdx ? "active" : ""}`;
      card.id = `mode-card-${idx}`;
      card.dataset.index = idx;

      card.innerHTML = `
        <div class="mode-card-top">
          <span class="mode-card-idx">#${String(idx + 1).padStart(2, "0")}</span>
          <span class="mode-card-category">${escapeHtml(category)}</span>
        </div>
        <div class="mode-card-main">
          <span class="mode-card-icon">${mode.icon || "🔮"}</span>
          <span class="mode-card-title">${escapeHtml(mode.name)}</span>
        </div>
      `;

      card.addEventListener("click", () => {
        setVisualMode(idx);
        closeModeModal();
      });

      modeGrid.appendChild(card);
    }
  });

  if (modeCountLabel) {
    modeCountLabel.innerText = `Showing ${matchCount} / ${VISUAL_MODES.length} modes`;
  }
}

function updateModeModalCards() {
  document.querySelectorAll(".mode-card").forEach((card) => {
    const idx = Number(card.dataset.index);
    if (idx === currentModeIdx) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }
  });
}

function openModeModal() {
  if (modeModal) {
    modeModal.classList.add("open");
    modeModal.setAttribute("aria-hidden", "false");
    renderModeCards();
    setTimeout(() => {
      const activeCard = document.getElementById(`mode-card-${currentModeIdx}`);
      if (activeCard) activeCard.scrollIntoView({ block: "nearest", behavior: "smooth" });
      if (modeSearchInput) modeSearchInput.focus();
    }, 60);
  }
}

function closeModeModal() {
  if (modeModal) {
    modeModal.classList.remove("open");
    modeModal.setAttribute("aria-hidden", "true");
  }
}

modeBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  openModeModal();
});

modeCloseBtn?.addEventListener("click", closeModeModal);

modeModal?.addEventListener("click", (e) => {
  if (e.target === modeModal) closeModeModal();
});

modeBtnPrev?.addEventListener("click", () => {
  setVisualMode(currentModeIdx - 1);
});

modeBtnNext?.addEventListener("click", () => {
  setVisualMode(currentModeIdx + 1);
});

modeBtnRandom?.addEventListener("click", () => {
  let nextIdx;
  do {
    nextIdx = Math.floor(Math.random() * VISUAL_MODES.length);
  } while (nextIdx === currentModeIdx && VISUAL_MODES.length > 1);
  setVisualMode(nextIdx);
});

modeSearchInput?.addEventListener("input", (e) => {
  activeSearchQuery = e.target.value.trim();
  renderModeCards();
});

modeFilterPills?.forEach((pill) => {
  pill.addEventListener("click", () => {
    modeFilterPills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    activeFilterCategory = pill.dataset.category || "ALL";
    renderModeCards();
  });
});

// Keyboard shortcuts for visualizer control
window.addEventListener("keydown", (e) => {
  if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
    if (e.key === "Escape") closeModeModal();
    return;
  }
  if (e.key === "m" || e.key === "M") {
    if (modeModal && modeModal.classList.contains("open")) {
      closeModeModal();
    } else {
      openModeModal();
    }
  } else if (e.key === "ArrowLeft") {
    setVisualMode(currentModeIdx - 1);
  } else if (e.key === "ArrowRight") {
    setVisualMode(currentModeIdx + 1);
  } else if (e.key === "Escape") {
    closeModeModal();
    if (queueDrawer) queueDrawer.classList.remove("open");
  }
});

// Initialize default mode with icon
setVisualMode(0);

// ── 19. Theme Switcher: Cycle Brutalist Themes in 3D and DOM ──
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

  // Horizon Elements
  horizonMat.emissive.setHex(theme.primary);
  sunMat.color.setHex(theme.primary);

  // Neural Elements
  neuralNodes.forEach((n, i) => {
    n.mat.emissive.setHex(i % 2 === 0 ? theme.primary : theme.secondary);
    n.edgeMat.color.setHex(theme.primary);
  });
  neuralLinesMat.color.setHex(theme.secondary);

  // Supernova Elements
  pulsarMat.emissive.setHex(theme.primary);
  supernovaParticles.forEach((p, i) => {
    p.mat.emissive.setHex(p.arm === 0 ? theme.primary : theme.secondary);
  });
  blastRingMat.color.setHex(theme.primary);

  // Astrolabe Elements
  astrolabeRings.forEach((r, i) => {
    r.mat.emissive.setHex(i % 2 === 0 ? theme.primary : theme.secondary);
    r.edgeMat.color.setHex(i % 2 === 0 ? theme.primary : theme.secondary);
  });
  astrolabeCoreMat.emissive.setHex(theme.primary);
  astrolabeCoreEdgeMat.color.setHex(theme.secondary);
  astrolabeBeacons.forEach((b, i) => {
    b.mat.emissive.setHex(i % 2 === 0 ? theme.primary : theme.secondary);
    b.edgeMat.color.setHex(theme.primary);
  });

  // Tesseract Elements
  outerBoxEdgeMat.color.setHex(theme.primary);
  innerBoxMat.emissive.setHex(theme.secondary);
  innerBoxEdgeMat.color.setHex(theme.secondary);
  strutLineMat.color.setHex(theme.primary);
  tesseractNodes.forEach((n) => {
    n.mat.emissive.setHex(n.isInner ? theme.secondary : theme.primary);
  });
  tesseractCoreMat.emissive.setHex(theme.primary);

  // Prism Void Elements
  prismMat.emissive.setHex(theme.primary);
  prismEdgeMat.color.setHex(theme.primary);
  apexCrystalMat.emissive.setHex(theme.secondary);
  apexEdgeMat.color.setHex(theme.primary);
  laserMat.color.setHex(theme.primary);
  prismAnchorMeshes.forEach((a) => {
    a.mat.emissive.setHex(theme.secondary);
    a.edgeMat.color.setHex(theme.primary);
  });
  prismFacets.forEach((f, i) => {
    f.mat.emissive.setHex(i % 2 === 0 ? theme.primary : theme.secondary);
    f.edgeMat.color.setHex(theme.secondary);
  });
  prismSparks.forEach((s, i) => {
    s.mat.color.setHex(i % 2 === 0 ? theme.primary : theme.secondary);
  });

  // Extra 40 Modes Dynamic Recoloring
  extraModeHandles.forEach((handle) => {
    if (handle && typeof handle.recolor === "function") {
      handle.recolor(theme);
    }
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

// ── 19. Auto-Discover Active Guild Session on Initial Load ────
async function autoDiscoverPlayingServer() {
  if (activeTargetId === "default") {
    try {
      const res = await fetch("/api/active-sessions");
      if (res.ok) {
        const data = await res.json();
        const active = (data.sessions || []).find((s) => s.playing);
        if (active && active.guildId) {
          activeTargetId = active.guildId;
          const url = new URL(window.location.href);
          url.searchParams.set("guild", activeTargetId);
          window.history.replaceState(null, "", url.toString());
          initSSE();
          syncPlayerSnapshot();
        }
      }
    } catch {}
  }
}
autoDiscoverPlayingServer();

// Initialize Handshake & SSE
initSSE();
syncPlayerSnapshot();
setInterval(syncPlayerSnapshot, 6000);
