/**
 * visualizer.js  —  TOGETHER 3D BRUTALIST AUDIO STAGE
 * Compliant with 3d-web-experience skill:
 * - WebGL capability detection & fallback state
 * - DPR mobile clamping (60fps target)
 * - Three.js OrbitControls with damping & camera reset
 * - Neo-Brutalist 3D scene (Monolith, Stepped VU Arena, Tumbling Polyhedra)
 * - Real-time SSE synchronization with TOGETHER Music Engine
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

// Discord Embedded Activity Detection & Auto-Handshake (Desktop, Web, iOS & Android)
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

  // Discord Embedded App RPC Protocol Handshake
  const frameId = urlParams.get("frame_id");
  if (frameId && window.parent) {
    try {
      const rpcSource = window.parent.opener || window.parent;
      const handshakePayload = {
        v: 1,
        encoding: "json",
        client_id: "863496211667484676",
        frame_id: frameId,
        sdk_version: "1.1.0"
      };

      // Send Opcode 0 (HANDSHAKE) to parent window
      rpcSource.postMessage([0, handshakePayload], "*");

      // Listen for Discord Client Handshake Confirmation / HELLO / FRAME
      window.addEventListener("message", (ev) => {
        if (!Array.isArray(ev.data)) return;
        const [opcode, payload] = ev.data;
        if (opcode === 0) {
          // Handshake confirmed by Discord
          rpcSource.postMessage([1, { cmd: "SUBSCRIBE", evt: "VOICE_CHANNEL_SELECT", nonce: "init" }], "*");
        } else if (opcode === 3) {
          // HELLO received
          rpcSource.postMessage([0, handshakePayload], "*");
        }
      });
    } catch (e) {
      console.warn("[Discord Activity] Handshake notice:", e.message);
    }
  }
}

let playerState = {
  title: "Waiting for music...",
  author: "Join a voice channel and use /play",
  thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80",
  position: 0,
  duration: 0,
  paused: true,
  playing: false,
  loop: "none",
  autoplay: false,
  volume: 80,
  lastUpdate: Date.now(),
};

// ── 2. Neo-Brutalist Color Themes (Matched to assets/banner.png) ─────
const THEMES = [
  {
    key: "TOGETHER_CRIMSON",
    name: "TOGETHER CRIMSON",
    primary: 0xff0033,       // Banner High-Voltage Crimson Red
    secondary: 0xffffff,     // Stark Banner White
    background: 0x06070a,    // Deep Void Black
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

// 3D-Web-Experience Rule: Clamp DPR on mobile to 1 to guarantee 60fps
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));

// ── 4. Interactive OrbitControls & Mouse Parallax ─────────────
let controls = null;
if (typeof THREE.OrbitControls !== "undefined") {
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't dip below floor plane
  controls.minDistance   = 16;
  controls.maxDistance   = 85;
  controls.target.set(0, 5, 0);
}

// Mouse Parallax coordinates
let mouseX = 0;
let mouseY = 0;
window.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ── 5. Brutalist Dynamic Lighting ─────────────────────────────
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(20, 40, 20);
scene.add(dirLight);

const primaryLight = new THREE.PointLight(THEMES[0].primary, 3.5, 75);
primaryLight.position.set(0, 16, 0);
scene.add(primaryLight);

const rimLight = new THREE.PointLight(THEMES[0].secondary, 2.5, 60);
rimLight.position.set(-25, 12, -20);
scene.add(rimLight);

// ── 6. Brutalist 3D Elements ──────────────────────────────────

// (A) Central Monolithic Brutalist Obelisk
const monolithGroup = new THREE.Group();

// Main faceted pillar
const monolithGeom = new THREE.CylinderGeometry(2.8, 4.4, 11, 6);
const monolithMat  = new THREE.MeshStandardMaterial({
  color: 0x0c0e14,
  roughness: 0.35,
  metalness: 0.85,
});
const monolithMesh = new THREE.Mesh(monolithGeom, monolithMat);
monolithMesh.position.y = 5.5;
monolithGroup.add(monolithMesh);

// Brutalist Wireframe Edges
const monolithEdgesGeom = new THREE.EdgesGeometry(monolithGeom);
const monolithEdgesMat  = new THREE.LineBasicMaterial({
  color: THEMES[0].primary,
  linewidth: 2,
});
const monolithEdges = new THREE.LineSegments(monolithEdgesGeom, monolithEdgesMat);
monolithMesh.add(monolithEdges);

// Floating Floating Core Crystal on top
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

// (B) Circular Brutalist VU Arena (48 Stepped Monolith Towers)
const ARENA_BARS_COUNT = 48;
const arenaTowers = [];
const arenaEdges  = [];
const arenaGroup  = new THREE.Group();
const ARENA_RADIUS = 18;

const towerBoxGeom = new THREE.BoxGeometry(1.2, 1, 1.2);
towerBoxGeom.translate(0, 0.5, 0); // Scale up from the base
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

  const lineMat = new THREE.LineBasicMaterial({
    color: THEMES[0].primary,
  });
  const towerLine = new THREE.LineSegments(towerEdgesGeom, lineMat);
  towerMesh.add(towerLine);

  arenaTowers.push(towerMesh);
  arenaEdges.push(towerLine);
  arenaGroup.add(towerMesh);
}
scene.add(arenaGroup);

// (C) Tumbling Low-Poly Wireframe Polyhedra
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

// (D) Infinite Brutalist Grid Floor
let gridFloor = new THREE.GridHelper(160, 64, THEMES[0].primary, 0x22131a);
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

  // Strobe primary light on beats
  primaryLight.intensity = isPlaying ? 2.5 + bassIntensity * 2.2 : 1.0;

  // Animate Arena Towers
  for (let i = 0; i < ARENA_BARS_COUNT; i++) {
    if (isPlaying) {
      const freqSpread = (i / ARENA_BARS_COUNT) * Math.PI * 3;
      const wave = Math.abs(Math.sin(beatPhase * 1.8 + freqSpread));
      const targetHeight = 1.0 + wave * 16.0 + Math.cos(beatPhase * 0.9 + i) * 3.0;
      audioBands[i] += (targetHeight - audioBands[i]) * 0.3;
    } else {
      audioBands[i] += (0.8 - audioBands[i]) * 0.1;
    }

    const scaleY = Math.max(0.2, audioBands[i]);
    arenaTowers[i].scale.y = scaleY;
  }

  // Rotate arena & monolith
  arenaGroup.rotation.y += delta * (isPlaying ? 0.25 : 0.05);
  monolithGroup.rotation.y -= delta * (isPlaying ? 0.3 : 0.08);

  // Pulse & spin floating core crystal
  coreMesh.rotation.x += delta * (isPlaying ? 1.8 : 0.4);
  coreMesh.rotation.y += delta * (isPlaying ? 2.2 : 0.5);
  coreMesh.position.y = 14 + Math.sin(beatPhase * 1.2) * (isPlaying ? 1.2 : 0.3);
  coreMesh.material.emissiveIntensity = isPlaying ? 0.5 + bassIntensity * 0.5 : 0.2;

  // Orbit & tumble low-poly shapes
  polyhedraItems.forEach((item) => {
    item.angle += delta * item.speed * (isPlaying ? 1.5 : 0.5);
    item.mesh.position.x = Math.cos(item.angle) * item.radius;
    item.mesh.position.z = Math.sin(item.angle) * item.radius;
    item.mesh.rotation.x += delta * item.rotX * (isPlaying ? 2.0 : 0.8);
    item.mesh.rotation.y += delta * item.rotY * (isPlaying ? 2.0 : 0.8);
  });

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
  const delta = Math.min((now - lastFrameTime) / 1000, 0.1); // Clamp delta to avoid large jump
  lastFrameTime = now;

  // Calculate FPS
  frameCount++;
  if (now - lastFpsCheck >= 1000) {
    if (fpsDisplay) fpsDisplay.innerText = frameCount;
    frameCount   = 0;
    lastFpsCheck = now;
  }

  // Update OrbitControls
  if (controls) {
    // Parallax damping when not actively dragging
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

// ── 10. Responsive Resizing ───────────────────────────────────
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
});

// ── 11. Scrubber & Timeline Synchronization ───────────────────
function updateLocalPlaybackPosition(delta) {
  if (playerState.playing && !playerState.paused && playerState.duration > 0) {
    playerState.position = Math.min(playerState.duration, playerState.position + delta * 1000);
    renderScrubber();
  }
}

function formatTimecode(ms) {
  if (!ms || isNaN(ms)) return "0:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}

function renderScrubber() {
  const current = document.getElementById("time-current");
  const total   = document.getElementById("time-total");
  const fill    = document.getElementById("scrubber-fill");
  const badge   = document.getElementById("time-badge");

  const curFormatted = formatTimecode(playerState.position);
  const totFormatted = formatTimecode(playerState.duration);

  if (current) current.innerText = curFormatted;
  if (total)   total.innerText   = totFormatted;
  if (badge)   badge.innerText   = `${curFormatted} / ${totFormatted}`;

  if (fill && playerState.duration > 0) {
    const pct = Math.min(100, Math.max(0, (playerState.position / playerState.duration) * 100));
    fill.style.width = `${pct}%`;
  }
}

// ── 12. Apply Player State to Neo-Brutalist HUD ───────────────
function applyPlayerState(data) {
  if (!data) return;
  playerState = { ...playerState, ...data };

  // Track metadata
  const deckTitle   = document.getElementById("deck-title");
  const trackTitle  = document.getElementById("track-title");
  const deckArtist  = document.getElementById("deck-artist");
  const trackArtist = document.getElementById("track-artist");
  const deckArt     = document.getElementById("deck-artwork");

  const title  = playerState.title  || "Waiting for Music...";
  const artist = playerState.author || "Use /play in Discord to stream";

  if (deckTitle)   deckTitle.innerText   = title;
  if (trackTitle)  trackTitle.innerText  = title;
  if (deckArtist)  deckArtist.innerText  = artist;
  if (trackArtist) trackArtist.innerText = artist;

  const fallbackTitle  = document.getElementById("fallback-title");
  const fallbackArtist = document.getElementById("fallback-artist");
  const fallbackArt    = document.getElementById("fallback-art");
  if (fallbackTitle)  fallbackTitle.innerText  = title;
  if (fallbackArtist) fallbackArtist.innerText = artist;

  if (playerState.thumbnail) {
    let rawThumb = playerState.thumbnail;
    if (rawThumb.startsWith("http://")) rawThumb = rawThumb.replace(/^http:\/\//, "https://");

    const setResilientImage = (imgEl) => {
      if (!imgEl) return;
      imgEl.referrerPolicy = "no-referrer";
      // CRITICAL FIX: Do NOT set crossOrigin = "anonymous" on <img> tags!
      // External CDNs (i.ytimg.com) do not return Access-Control-Allow-Origin, causing browser to block images.
      imgEl.crossOrigin = null;
      imgEl.removeAttribute("crossorigin");

      let failCount = 0;
      imgEl.onerror = function() {
        failCount++;
        if (failCount === 1 && this.src.includes("maxresdefault.jpg")) {
          this.src = this.src.replace("maxresdefault.jpg", "hqdefault.jpg");
        } else if (failCount === 2 && this.src.includes("hqdefault.jpg")) {
          this.src = this.src.replace("hqdefault.jpg", "mqdefault.jpg");
        } else if (failCount <= 3 && !this.src.includes("/api/thumbnail")) {
          // High-reliability server proxy fallback
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

  // Play / Pause Icon
  const playIcon = document.getElementById("btn-play-icon");
  const streamText = document.getElementById("player-state-text");
  const isPlaying = playerState.playing && !playerState.paused;

  if (playIcon) playIcon.innerText = isPlaying ? "⏸" : "▶";
  if (streamText) {
    streamText.innerText = isPlaying ? "STREAMING" : (playerState.playing ? "PAUSED" : "IDLE");
    streamText.className = `metric-val mono ${isPlaying ? "green" : ""}`;
  }

  // Badges
  const bLoop = document.getElementById("badge-loop");
  const bAuto = document.getElementById("badge-autoplay");
  if (bLoop) {
    const loopVal = (playerState.loop || "off").toUpperCase();
    bLoop.innerText = `LOOP: ${loopVal}`;
    bLoop.className = `status-pill ${playerState.loop && playerState.loop !== "none" ? "active" : ""}`;
  }
  if (bAuto) {
    bAuto.innerText = `AUTO: ${playerState.autoplay ? "ON" : "OFF"}`;
    bAuto.className = `status-pill ${playerState.autoplay ? "active" : ""}`;
  }

  renderScrubber();
}

// ── 13. SSE Live Feed & Polling Fallback ──────────────────────
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

// ── Instant Player State Sync & Fast Periodic Sync ────────────
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

// Immediately load snapshot on load (0ms delay)
syncPlayerSnapshot();
// Continuous 1s sync interval to keep track position & status live
const playerSyncInterval = setInterval(syncPlayerSnapshot, 1000);

// ── Discord Embedded Activity Handshake (iOS, Android & Desktop) ─
function notifyDiscordFrameReady() {
  // 1. React Native Webview Bridge (iOS & Android native Discord app)
  if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === "function") {
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify({ cmd: "FRAME_READY", args: {} }));
    } catch {}
  }

  // 2. Standard parent window postMessage (Web & Desktop client)
  try {
    if (window.parent) {
      window.parent.postMessage({ cmd: "FRAME_READY", args: {} }, "*");
      window.parent.postMessage(JSON.stringify({ cmd: "FRAME_READY", args: {} }), "*");
    }
  } catch {}

  // 3. Window event dispatch fallback
  try {
    window.postMessage({ cmd: "FRAME_READY", args: {} }, "*");
  } catch {}
}

if (isInsideDiscord) {
  notifyDiscordFrameReady();
  let burstCount = 0;
  const burstInterval = setInterval(() => {
    notifyDiscordFrameReady();
    burstCount++;
    if (burstCount > 8) clearInterval(burstInterval);
  }, 120);

  window.addEventListener("message", (e) => {
    if (e.data?.cmd === "DISPATCH" || e.data?.evt === "READY") {
      console.log("[Discord Activity] Handshake confirmed by Discord client.");
    }
  });
}

initSSE();

// ── 14. Interactive Controls & Theme Switcher ─────────────────
async function sendControlCommand(action, extra = {}) {
  try {
    await fetch(`/api/player/${encodeURIComponent(activeTargetId)}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
  } catch (err) {
    console.error("Control command error:", err);
  }
}

document.getElementById("btn-play-pause")?.addEventListener("click", () => {
  const action = playerState.paused ? "resume" : "pause";
  sendControlCommand(action);
});

document.getElementById("btn-next")?.addEventListener("click", () => {
  sendControlCommand("skip");
});

document.getElementById("btn-prev")?.addEventListener("click", () => {
  sendControlCommand("previous");
});

// Interactive Scrubber Seek
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

// Camera Reset Button
document.getElementById("camera-reset-btn")?.addEventListener("click", () => {
  if (controls) {
    camera.position.copy(INITIAL_CAMERA_POS);
    controls.target.set(0, 5, 0);
    controls.update();
  }
});

// Fullscreen Toggle
document.getElementById("fullscreen-btn")?.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

// Theme Switcher: Cycle Brutalist Themes in 3D and DOM
document.getElementById("theme-btn")?.addEventListener("click", () => {
  currentThemeIdx = (currentThemeIdx + 1) % THEMES.length;
  const theme = THEMES[currentThemeIdx];

  // Update DOM data-theme attribute
  document.documentElement.setAttribute("data-theme", theme.key);
  const themeLabel = document.getElementById("theme-name");
  if (themeLabel) themeLabel.innerText = theme.name;

  // Update Three.js Scene colors
  scene.background.setHex(theme.background);
  scene.fog.color.setHex(theme.fogColor);
  primaryLight.color.setHex(theme.primary);
  rimLight.color.setHex(theme.secondary);

  // Update Monolith & Core colors
  monolithEdgesMat.color.setHex(theme.primary);
  coreMat.emissive.setHex(theme.primary);
  coreEdgesMat.color.setHex(theme.secondary);

  // Update Arena Towers
  arenaEdges.forEach((edgeLine) => {
    edgeLine.material.color.setHex(theme.primary);
  });
  arenaTowers.forEach((tower) => {
    tower.material.emissive.setHex(theme.primary);
  });

  // Update Polyhedra
  polyhedraItems.forEach((item, idx) => {
    item.edgeMat.color.setHex(idx % 2 === 0 ? theme.primary : theme.secondary);
  });

  // Update Grid
  scene.remove(gridFloor);
  gridFloor = new THREE.GridHelper(160, 64, theme.primary, 0x1f2433);
  gridFloor.position.y = 0;
  scene.add(gridFloor);
});
