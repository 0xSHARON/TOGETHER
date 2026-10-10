# TOGETHER System Architecture & Codebase Structure

TOGETHER is an audiophile-grade Discord music bot and real-time 3D WebGL sound stage platform engineered with a modular, resilient, event-driven design.

---

## 🏛️ High-Level Topology

```
                   ┌──────────────────────────────────┐
                   │    Process Supervisor: devrock.js │
                   └─────────────────┬────────────────┘
                                     │ (discord-hybrid-sharding)
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
     ┌───────────────────────┐               ┌───────────────────────┐
     │   Cluster 0 Worker    │               │   Cluster 1..N Worker │
     │       (index.js)      │               │       (index.js)      │
     └───────────┬───────────┘               └───────────┬───────────┘
                 │                                       │
     ┌───────────▼───────────┐               ┌───────────▼───────────┐
     │      MusicClient      │               │      MusicClient      │
     └─────┬───────────┬─────┘               └───────────────────────┘
           │           │
           │           ▼
           │   ┌───────────────────────────────────────────────┐
           │   │ Visualizer HTTP & SSE Server: visualizerServer.js│
           │   │ Port: 5050 (Reverse-proxied via Nginx / HTTPS) │
           │   └───────┬───────────────────────────────┬───────┘
           │           │                               │
           │           ▼                               ▼
           │   ┌───────────────┐               ┌───────────────┐
           │   │ Landing Page  │               │ 3D Stage WebGL│
           │   │  public/      │               │ public/visual/│
           │   └───────────────┘               └───────────────┘
           │
           ▼
     ┌─────────────────────────────────────────────────────────┐
     │              Native TOGETHER Audio Engine               │
     │      @discordjs/voice  +  FFmpeg Stream Pipeline        │
     │     (TogetherStreamer & togetherStreamWorker.js)        │
     └─────────────────────────────────────────────────────────┘
```

---

## 🔄 Runtime Flow & Lifecycle

1. **Supervisor Initialization (`devrock.js`):**
   - Validates mandatory environment variables (`TOKEN`, `MONGO_URI`, `CLIENT_ID`, etc.).
   - Starts cluster manager (`ClusterManager` from `discord-hybrid-sharding`).
   - Spawns isolated cluster child processes.

2. **Cluster Client Bootstrap (`index.js`):**
   - Instantiates `MusicClient` with optimized gateway intents and sharding data.
   - Installs global exception and unhandled rejection shields (`monitorProcessLeaks.js`).
   - Connects to MongoDB (`src/schema/`).
   - Starts the embedded **Visualizer HTTP & SSE Server** (`src/utils/visualizerServer.js`) on port `5050` (or `PORT` env).
   - Loads commands, events, application emojis, and voice health monitors.
   - Authenticates to Discord Gateway.

3. **Application Emoji Synchronization:**
   - Cluster `0` scans `assets/emojis/` for high-resolution transparent custom icons.
   - Automatically registers missing emojis to the Discord Application.
   - Downstream clusters inherit the synchronized emoji mapping.

4. **Command Routing & Interaction Dispatch:**
   - Handles both 68 prefix commands (default `.`) and 66 Discord slash commands.
   - Supports real-time query autocomplete for music tracks, playlists, and filters.
   - Routes Discord **Components V2** buttons (play/pause, skip, rewind, volume, loop, autoplay) through `interactionCreate.js`.

5. **Audio Streaming & Voice Channel Management:**
   - Connects to Discord voice channels via `@discordjs/voice`.
   - Uses **Native Together Audio Engine** (`TogetherStreamer` and `togetherStreamWorker.js`) streaming high-fidelity 24-bit 320kbps Opus audio through FFmpeg pipelines.
   - Monitors voice connection health with auto-recovery and 24/7 persistence.

---

## 🔮 3D WebGL Audio Stage & Discord Activity System

Located under `public/visualizer/`, the 3D visualizer allows users to watch and interact with playback in real-time on desktop, mobile, and directly embedded inside Discord as an official Discord Activity:

- **10 Selectable 3D Visual Modes:**
  1. `MONOLITH`: Central obsidian cylinder with core octahedron and 48 reactive spectrum arena towers.
  2. `CYBER TUNNEL`: 30-ring warp tunnel with pulsating Z-axis translation.
  3. `METROPOLIS`: 64-building geometric city skyline reacting to audio equalizer bands.
  4. `QUANTUM VORTEX`: Event horizon core with dual counter-rotating accretion disk rings.
  5. `NEON HORIZON`: Retro synthwave undulating terrain grid with illuminated wireframe sun.
  6. `NEURAL MATRIX`: 44-node synaptic network calculating dynamic graph distance lines.
  7. `SUPERNOVA DISK`: Pulsar star with dual spiral arms and relativistic blast wave rings.
  8. `ASTROLABE`: Quad-axis concentric celestial armillary rings rotating at harmonic speeds with orbital diamond satellites.
  9. `HYPERCUBE`: 4D Tesseract wireframe projection with corner hyper-struts, inner-outer cube dimensional inversion, and pulsing vertex nodes.
  10. `PRISM VOID`: Hexagonal crystal obelisk with levitating apex crystal, 6 anchor laser beams, tumbling faceted crystal shards, and ascending spark void particles.

- **5 Brutalist Themes:**
  - `TOGETHER CRIMSON`, `CYBER BRUTAL`, `ACID INDUSTRIAL`, `MIDNIGHT PURPLE`, `OLED MONOCHROME`.

- **Real-Time SSE Sync:**
  - `GET /api/stream/:targetId`: Server-Sent Events stream delivering live track titles, artwork, duration, position, pause state, and queue updates directly to the web client.
  - Interactive deck controls (play, pause, skip, previous, seek bar, loop, autoplay) communicate via `/api/action/:targetId`.

- **Discord Embedded App SDK:**
  - Automatically activates when embedded in a Discord voice channel, establishing a direct Activity handshake (`discord-sdk.js`).

---

## 📂 Source Layout

```
discord-music-bot/
├── assets/                  # Brand assets (logo, banner, badges, emojis, banners/)
│   ├── banner.png           # 2048x768 Master High-Res Brutalist Banner
│   ├── banner.webp          # Optimized WebP Banner
│   ├── logo.png             # Official Round Logo
│   └── emojis/              # High-resolution transparent UI emojis
├── public/                  # Public web server root (together.dpdns.org)
│   ├── index.html           # Modern Cyber-Brutalist Web Portal & Live Session Monitor
│   ├── banner.webp          # High-fidelity banner for web display
│   ├── logo.png / logo.webp # Official branding icons
│   └── visualizer/          # 3D Brutalist Audio Stage & Discord Activity
│       ├── index.html       # WebGL stage DOM & Neo-Brutalist HUD
│       ├── visualizer.js    # Three.js 3D engine (10 visual modes, 5 themes, SSE)
│       ├── banner.webp      # Social preview & Discord embed banner
│       ├── three.min.js     # Bundled Three.js WebGL engine
│       ├── OrbitControls.js # Camera orbital controls with damping
│       └── discord-sdk.js   # Discord Embedded App SDK for Activities
├── scripts/                 # Asset generators & maintenance utilities
├── src/
│   ├── commands/            # Prefix & Slash command modules
│   │   ├── Config/          # 24/7 mode, autoplay, default volume, prefix config
│   │   ├── Favourite/       # Personal music library, liked tracks, playlists
│   │   ├── Filters/         # 13+ DSP audio filters (8D, Bassboost, Nightcore, etc.)
│   │   ├── Information/     # Bot info, ping, stats, node status, invite
│   │   ├── Music/           # Play, skip, pause, visualizer, seek, lyrics, queue
│   │   └── Utility/         # Top.gg vote, avatar, banner, serverinfo
│   ├── events/
│   │   ├── Client/          # ready, interactionCreate, messageCreate, voiceStateUpdate
│   │   ├── Node/            # Lavalink node connection lifecycle handlers
│   │   └── Players/         # Player state updates, track start/end, deck refresh
│   ├── loaders/             # Command loaders, event listeners, emoji synchronizer
│   ├── schema/              # Mongoose models (Guild, User, Playlist, Voter)
│   ├── structures/          # MusicClient, TogetherStreamer, StreamWorker
│   └── utils/
│       ├── visualizerServer.js # Express HTTP & SSE streaming service
│       ├── trackBanner.js   # Canvas now-playing track artwork banner renderer
│       ├── playerCard.js    # Components V2 interactive now-playing card builder
│       ├── voiceHealthMonitor.js # Voice connection monitor & auto-recovery
│       └── ui.js            # Standardized color tokens, badges, and notice containers
└── test/                    # 59 automated unit & integration tests
```

---

## 🛠️ Testing & Quality Assurance

All systems are covered by an automated test suite executed via `npm test` (`node --test`):
- Application emoji synchronization tests.
- Autoplay recommendation and history divergence tests.
- Standalone Discord sharding and process isolation tests.
- Components V2 player card rendering tests.
- YouTube artwork normalization and metadata sanitization tests.
- Stage channel permission handling and speaker unsuppression tests.
- Top.gg webhook authentication and owner bypass tests.
- Canvas track banner generation and graceful fallback tests.
