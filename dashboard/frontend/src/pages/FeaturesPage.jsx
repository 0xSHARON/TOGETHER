import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Sparkles, 
  Sliders, 
  Radio, 
  Music, 
  Flame, 
  Disc3, 
  Cpu, 
  Shield, 
  Check, 
  X, 
  ArrowRight, 
  Terminal, 
  Volume2, 
  Layers, 
  Headphones, 
  Activity, 
  Share2, 
  ExternalLink,
  ChevronRight,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { BrutCard, StatBox } from '../components/Brutalist';
import SEO from '../components/SEO';

const BOT_INVITE_URL = "https://discord.com/oauth2/authorize?client_id=863496211667484676&permissions=8&integration_type=0&scope=bot+applications.commands";
const DEFAULT_TOPGG_URL = "https://top.gg/bot/863496211667484676/vote";
const SUPPORT_SERVER_URL = "https://discord.gg/mUdGTs2Dw5";

const ARCHITECTURE_PILLARS = [
  {
    id: "opus-audio",
    icon: Disc3,
    badge: "48,000 HZ • 24-BIT PCM",
    title: "24-Bit Studio Opus Sound Engine",
    tagline: "Audiophile-grade direct audio buffering with zero distortion.",
    desc: "Unlike standard Discord bots that downsample audio to 16-bit 96kbps, Together transmits losslessly compressed 48,000Hz 24-bit stereo streams directly through Lavalink v4 audio clusters. Enjoy wide soundstages, punchy low frequencies, and pristine high-end clarity.",
    specs: [
      { label: "Sample Rate", val: "48,000 Hz" },
      { label: "Bit Depth", val: "24-Bit Linear PCM" },
      { label: "Max Bitrate", val: "320 kbps Opus" },
      { label: "Frame Pacing", val: "±0.2ms Jitter Buffer" }
    ],
    features: [
      "Lossless Opus direct transcoder bypasses standard dynamic compression",
      "Native 48,000Hz 24-bit studio stereo stream reproduction",
      "Zero buffer underrun architecture with automatic packet loss concealment",
      "Independent server volume normalization prevents ear-splitting audio spikes"
    ]
  },
  {
    id: "webgl-player",
    icon: Sparkles,
    badge: "50+ SHADERS • WEBGL 2.0",
    title: "Real-Time 3D WebGL Webplayer",
    tagline: "An interactive, browser-based visualizer synced with your voice room.",
    desc: "Transform your Discord hangout into an immersive visual stage. Together's 3D Webplayer renders real-time audio reactive shaders directly on your GPU using WebGL 2.0. Switch between neon waveforms, cosmic nebulas, tunnel vortexes, and frequency spectrums.",
    specs: [
      { label: "Renderer", val: "WebGL 2.0 GPU Compute" },
      { label: "Preset Shaders", val: "50+ Reactive Themes" },
      { label: "Sync Latency", val: "< 15ms WebSockets" },
      { label: "Device Support", val: "Desktop & Mobile Browsers" }
    ],
    features: [
      "Zero client CPU load using GPU-accelerated fragment shader pipelines",
      "Live room state: see currently connected members and vote on tracks",
      "Shareable stage URLs for friends who aren't in Discord",
      "Mobile-optimized touch controls for interactive 3D rotation and zoom"
    ]
  },
  {
    id: "dsp-filters",
    icon: Sliders,
    badge: "14 REAL-TIME EFFECTS",
    title: "14 Studio DSP Audio Filters & EQ",
    tagline: "Instant digital signal processing with zero latency or transcoding artifacts.",
    desc: "Shape your sound with our comprehensive suite of hardware-accelerated digital filters. Switch seamlessly between binaural 8D spatial sound, skull-shaking multi-stage Bassboost, high-tempo Nightcore, nostalgic Vaporwave, or activate Karaoke mode to remove vocals.",
    specs: [
      { label: "Processing", val: "Hardware DSP Pipeline" },
      { label: "Filters Total", val: "14 Presets & Graphic EQ" },
      { label: "Switch Latency", val: "Instant (< 50ms)" },
      { label: "Price", val: "100% Free Forever" }
    ],
    features: [
      "8D Binaural Spatial Audio panning creates rotating 360-degree soundscapes",
      "Multi-stage Bassboost with Low, Medium, and Extreme frequency boosts",
      "Nightcore and Vaporwave dynamic tempo, pitch, and resampling algorithms",
      "Karaoke frequency band suppression isolates instrumentals for singing"
    ]
  },
  {
    id: "247-uptime",
    icon: Radio,
    badge: "ALWAYS CONNECTED",
    title: "24/7 Voice Channel Locking & Failover",
    tagline: "Your server radio that never disconnects or drops idle sessions.",
    desc: "Keep Together anchored in your study, lounge, or gaming channel indefinitely. Our 24/7 mode eliminates idle timeouts, while our automated heartbeat watchdog reconnects within milliseconds if regional Discord gateway servers hiccup.",
    specs: [
      { label: "Idle Timeout", val: "Disabled in 24/7" },
      { label: "Failover Watchdog", val: "5-Second Heartbeat" },
      { label: "State Memory", val: "Full Queue Recovery" },
      { label: "Bandwidth Saver", val: "Auto-Mute on Empty Room" }
    ],
    features: [
      "Dedicated /247 toggle locks the bot into designated voice channels",
      "Instant automatic reconnect on Discord gateway server migrations",
      "Stateful queue memory restores playback position after channel disruptions",
      "Configurable auto-pause mode saves server CPU when rooms are empty"
    ]
  },
  {
    id: "universal-sources",
    icon: Music,
    badge: "CROSS-PLATFORM ENGINE",
    title: "Universal Multi-Platform Source Engine",
    tagline: "Play anything from Spotify, SoundCloud, YouTube, Deezer, and HTTP streams.",
    desc: "No broken links or restricted platforms. Together parses tracks, full albums, and multi-thousand song playlists across every major music service. If a primary stream is blocked, our smart fallback engine automatically finds the best alternative source.",
    specs: [
      { label: "Supported Services", val: "Spotify, SC, YT, Apple, Deezer" },
      { label: "Playlist Cap", val: "5,000 Songs per Queue" },
      { label: "Link Parsing", val: "Instant (< 120ms)" },
      { label: "Duplicate Guard", val: "Built-In Auto-Filter" }
    ],
    features: [
      "One-click loading for Spotify public, private, and collaborative playlists",
      "SoundCloud track and set resolution including independent and remix tracks",
      "Direct HTTP/HTTPS audio stream support for web radios and podcasts",
      "Cross-platform matching ensures your music never stops when links vary"
    ]
  },
  {
    id: "gamification-xp",
    icon: Flame,
    badge: "GLOBAL GAMIFICATION",
    title: "Global Listening XP & Daily Streaks",
    tagline: "Earn XP, unlock custom listening cards, and compete on server leaderboards.",
    desc: "Listening to music is better together. Earn XP for every minute spent vibing in voice channels, build daily listening streaks, customize your brutalist profile badge, and climb global and server-specific leaderboards.",
    specs: [
      { label: "XP Accrual", val: "Real-Time Minute Tick" },
      { label: "Streak Multipliers", val: "Up to 2.5x Boost" },
      { label: "Profile Cards", val: "Dynamic Canvas Cards" },
      { label: "Leaderboards", val: "Guild & Global Ranks" }
    ],
    features: [
      "Dynamic listening streak counter rewards loyal community members",
      "Exportable SVG/PNG listening profile cards with favorite tracks and artists",
      "Server-wide leaderboard embeds for voice channel communities",
      "Top.gg voter perks unlock exclusive badges and double XP weekends"
    ]
  }
];

const DSP_FILTER_LIST = [
  { name: "8D Audio", desc: "Rotates sound around your head in 360-degree binaural spatial audio." },
  { name: "Bassboost", desc: "Amplifies sub-bass frequencies (30Hz–120Hz) for punchy electronic beats." },
  { name: "Nightcore", desc: "Speeds up tempo by 25% and pitches vocals up for energetic anime vibes." },
  { name: "Vaporwave", desc: "Slows tempo down by 20% and lowers pitch for nostalgic lo-fi aesthetics." },
  { name: "Karaoke", desc: "Filters out center-panned vocal frequencies, leaving the instrumental backing." },
  { name: "Pop", desc: "Enhances mid-high vocals and tightens bass for radio-ready pop hits." },
  { name: "Rock", desc: "Boosts low-end punch and aggressive guitar distortion frequencies." },
  { name: "Jazz", desc: "Balances warmth across brass, piano, and upright bass instruments." },
  { name: "Treble Boost", desc: "Crisp amplification of high frequencies (8kHz–16kHz) for vocal clarity." },
  { name: "Tremolo", desc: "Rapidly oscillates volume levels for a retro vintage organ vibrato." },
  { name: "Vibrato", desc: "Modulates pitch continuously to create shimmering acoustic effects." },
  { name: "Phaser", desc: "Creates sweeping phase cancellation dips for spacey psychedelic textures." },
  { name: "Distortion", desc: "Overdrives digital buffers for industrial, metal, and harsh noise tracks." },
  { name: "Custom 10-Band EQ", desc: "Full manual control across 10 precise frequency bands from 31Hz to 16kHz." }
];

const COMPARISON_DATA = [
  { feature: "Audio Transcoding Quality", together: "24-Bit / 48,000Hz Lossless Opus", rythm: "Downsampled 16-Bit", groovy: "Defunct / Offline", fredboat: "Standard 96kbps" },
  { feature: "Interactive 3D Webplayer", together: "Yes (50+ WebGL Shaders)", rythm: "No", groovy: "No", fredboat: "No" },
  { feature: "14 Studio DSP Audio Filters", together: "100% Free Forever", rythm: "Paywalled / Premium", groovy: "No", fredboat: "Limited Basic EQ" },
  { feature: "24/7 Channel Locking", together: "Free Toggle (/247)", rythm: "Monthly Subscription", groovy: "No", fredboat: "Tier-Gated" },
  { feature: "Spotify, SC, Apple, Deezer Support", together: "Instant Cross-Platform Fallback", rythm: "Restricted", groovy: "No", fredboat: "Partial" },
  { feature: "Global XP & Streaks System", together: "Integrated Leaderboards", rythm: "No", groovy: "No", fredboat: "No" },
  { feature: "Slash & Prefix Command Parity", together: "69 Commands (100% Dual Support)", rythm: "Slash Only", groovy: "No", fredboat: "Partial" },
  { feature: "No Audio Degradation Paywalls", together: "All Features 100% Free", rythm: "Paid Tiers", groovy: "N/A", fredboat: "Paid Tiers" }
];

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState(ARCHITECTURE_PILLARS[0].id);

  const selectedPillar = ARCHITECTURE_PILLARS.find(p => p.id === activeTab) || ARCHITECTURE_PILLARS[0];
  const PillarIcon = selectedPillar.icon;

  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text font-mono p-4 md:p-8 flex flex-col justify-between selection:bg-brutal-accent selection:text-black">
      <SEO 
        title="Discord Music Bot Features — 24-Bit Lossless Audio & 3D Webplayer | Together Bot"
        description="Discover Together Music Bot's studio architecture: 24-bit 48kHz lossless Opus audio, real-time 3D WebGL visualizer, 14 free DSP filters, 24/7 channel locking, and universal music sources."
        canonical="https://dash.together.dpdns.org/features"
      />

      {/* Top Navbar */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal mb-8">
        <Link to="/" className="flex items-center gap-3 group" aria-label="Together Music Bot Home">
          <img src="/logo.webp" alt="Together Logo" width="32" height="32" className="w-8 h-8 object-contain" />
          <span className="font-display font-black text-sm tracking-wider group-hover:text-brutal-accent transition-colors">
            TOGETHER // BOT FEATURES
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/commands"
            className="px-3 py-1.5 bg-brutal-bg border border-brutal-border hover:border-brutal-accent text-white font-bold text-xs uppercase shadow-brutal-sm flex items-center gap-1.5 transition-all"
          >
            <Terminal className="w-3.5 h-3.5 text-brutal-accent" />
            <span className="hidden sm:inline">COMMANDS LIST</span>
          </Link>
          <a
            href={BOT_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-brutal-accent text-black font-bold text-xs uppercase shadow-brutal-sm flex items-center gap-1.5 hover:bg-emerald-300 transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span className="hidden sm:inline">INVITE BOT</span>
          </a>
          <Link
            to="/"
            className="px-3 py-1.5 bg-black border border-brutal-border hover:border-brutal-accent text-white font-bold text-xs uppercase shadow-brutal-sm flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>HOME</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="space-y-12 max-w-7xl w-full mx-auto pb-12">
        {/* Hero Section */}
        <div className="border-2 border-brutal-border bg-brutal-surface p-6 md:p-10 shadow-brutal space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase bg-brutal-accent text-black font-black px-2 py-0.5 tracking-widest">
              NEXT-GEN AUDIO ARCHITECTURE
            </span>
            <span className="font-mono text-xs text-brutal-muted">LAVALINK v4 + WEBGL 2.0</span>
            <span className="font-mono text-[10px] uppercase bg-black border border-brutal-border text-emerald-400 font-bold px-2 py-0.5">
              ✓ ZERO PAYWALLS
            </span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl text-white uppercase tracking-tight">
            DISCORD MUSIC BOT FEATURES &amp; AUDIO ARCHITECTURE
          </h1>
          <p className="font-mono text-xs md:text-sm text-zinc-300 max-w-3xl leading-relaxed">
            Built from the ground up for audiophiles and Discord communities. Together blends studio-grade 24-bit Opus transcoding, an interactive 3D WebGL Webplayer, 14 hardware DSP sound filters, and persistent 24/7 channel playback into a blazing-fast Discord bot.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#interactive-pillars"
              className="px-4 py-2 bg-brutal-accent text-black font-bold text-xs uppercase border-2 border-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              <span>EXPLORE ARCHITECTURE</span>
            </a>
            <Link
              to="/commands"
              className="px-4 py-2 bg-brutal-bg text-white font-bold text-xs uppercase border-2 border-brutal-border hover:border-brutal-accent transition-all flex items-center gap-2"
            >
              <Terminal className="w-4 h-4 text-brutal-accent" />
              <span>COMMAND SYNTAX (69)</span>
            </Link>
            <a
              href="#comparison"
              className="px-4 py-2 bg-black border-2 border-brutal-border text-zinc-300 font-bold text-xs uppercase hover:border-white transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>BOT COMPARISON MATRIX</span>
            </a>
          </div>
        </div>

        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox
            label="AUDIO FIDELITY"
            value="24-BIT"
            sub="48,000Hz direct PCM"
            accent
          />
          <StatBox
            label="3D SHADERS"
            value="50+"
            sub="WebGL 2.0 Webplayer"
          />
          <StatBox
            label="DSP SOUND FILTERS"
            value="14"
            sub="Free 8D, Bassboost & EQ"
          />
          <StatBox
            label="UPTIME RELIABILITY"
            value="99.99%"
            sub="24/7 failover watchdog"
          />
        </div>

        {/* Section 1: Interactive Pillar Explorer */}
        <section id="interactive-pillars" className="space-y-6">
          <div className="border-b-2 border-brutal-border pb-4 flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-brutal-accent tracking-widest">
                SYSTEM DEEP-DIVE
              </span>
              <h2 className="font-display font-black text-2xl md:text-3xl text-white uppercase tracking-tight">
                THE 6 CORE ARCHITECTURAL PILLARS
              </h2>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              CLICK A PILLAR TO INSPECT TECHNICAL SPECIFICATIONS
            </span>
          </div>

          {/* Pillar Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {ARCHITECTURE_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              const isActive = activeTab === pillar.id;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActiveTab(pillar.id)}
                  className={`p-3 text-left border-2 transition-all flex flex-col justify-between gap-3 ${
                    isActive
                      ? 'bg-brutal-accent text-black border-black shadow-brutal-sm'
                      : 'bg-brutal-surface text-brutal-text border-brutal-border hover:border-brutal-accent'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-brutal-accent'}`} />
                    <span className={`text-[8px] font-black uppercase px-1 py-0.5 ${isActive ? 'bg-black text-brutal-accent' : 'bg-black/50 text-zinc-400'}`}>
                      ACTIVE
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xs uppercase leading-tight line-clamp-2">
                      {pillar.title.split(' ')[0]} {pillar.title.split(' ')[1]}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Pillar Inspector Box */}
          <div className="border-2 border-brutal-border bg-brutal-surface p-6 md:p-8 shadow-brutal space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-brutal-border pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-black border-2 border-brutal-border text-brutal-accent">
                  <PillarIcon className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[9px] px-2 py-0.5 bg-black border border-brutal-border text-brutal-accent font-black uppercase">
                      {selectedPillar.badge}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">
                      ARCHITECTURAL SUBSYSTEM
                    </span>
                  </div>
                  <h3 className="font-display font-black text-2xl md:text-3xl text-white uppercase">
                    {selectedPillar.title}
                  </h3>
                </div>
              </div>
              <a
                href={BOT_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-brutal-accent text-black font-bold text-xs uppercase border border-black shadow-brutal-sm hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>TRY THIS FEATURE NOW</span>
              </a>
            </div>

            <p className="font-mono text-sm text-zinc-200 leading-relaxed max-w-4xl">
              {selectedPillar.desc}
            </p>

            {/* Hardware & Protocol Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-brutal-border bg-black/40 p-4">
              {selectedPillar.specs.map((sp, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                    {sp.label}
                  </span>
                  <span className="text-sm font-display font-black text-brutal-accent">
                    {sp.val}
                  </span>
                </div>
              ))}
            </div>

            {/* Feature Highlights Checklist */}
            <div className="space-y-3 pt-2">
              <h4 className="font-display font-bold text-xs uppercase text-zinc-400 tracking-wider">
                KEY CAPABILITIES &amp; ARCHITECTURAL GUARANTEES
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedPillar.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-brutal-bg border border-brutal-border p-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-zinc-300 font-mono leading-relaxed">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: 14 Studio DSP Audio Filters Catalog */}
        <section className="border-2 border-brutal-border bg-brutal-surface p-6 md:p-8 shadow-brutal space-y-6">
          <div className="border-b-2 border-brutal-border pb-4 flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-brutal-accent tracking-widest">
                DIGITAL SIGNAL PROCESSING
              </span>
              <h2 className="font-display font-black text-2xl md:text-3xl text-white uppercase tracking-tight">
                14 HARDWARE-ACCELERATED AUDIO FILTERS
              </h2>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              ALL INCLUDED 100% FREE VIA /FILTER
            </span>
          </div>

          <p className="text-xs md:text-sm text-zinc-300 font-mono leading-relaxed max-w-3xl">
            Together applies digital signal transformations directly to raw PCM audio frames before Opus transmission. There is zero latency hit and no stuttering when toggling filters during live playback.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {DSP_FILTER_LIST.map((filter, idx) => (
              <div 
                key={idx}
                className="border border-brutal-border bg-brutal-bg p-3.5 space-y-1.5 hover:border-brutal-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-sm text-white uppercase">
                    {filter.name}
                  </h3>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-black border border-brutal-border text-brutal-accent font-bold">
                    DSP
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">
                  {filter.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-brutal-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
            <span className="text-zinc-400">
              Want to see all filter command flags? View our comprehensive <Link to="/commands" className="text-brutal-accent underline font-bold">Commands Catalog</Link>.
            </span>
            <Link
              to="/commands"
              className="px-3 py-1.5 bg-black border border-brutal-border hover:border-brutal-accent text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-all shrink-0"
            >
              <span>VIEW /FILTER COMMAND</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Section 3: Technical Comparison Matrix */}
        <section id="comparison" className="border-2 border-brutal-border bg-brutal-surface p-6 md:p-8 shadow-brutal space-y-6">
          <div className="border-b-2 border-brutal-border pb-4 flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-brutal-accent tracking-widest">
                BENCHMARKS &amp; ARCHITECTURE
              </span>
              <h2 className="font-display font-black text-2xl md:text-3xl text-white uppercase tracking-tight">
                HOW TOGETHER COMPARES TO OTHER BOTS
              </h2>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              TOGETHER VS LEGACY DISCORD AUDIO BOTS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-brutal-border bg-black text-white">
                  <th className="p-3 uppercase tracking-wider font-bold">Feature / Architectural Spec</th>
                  <th className="p-3 uppercase tracking-wider font-black text-brutal-accent bg-emerald-950/20 border-l border-r border-brutal-accent">
                    TOGETHER BOT (2026)
                  </th>
                  <th className="p-3 uppercase tracking-wider font-bold text-zinc-400">Rythm Bot</th>
                  <th className="p-3 uppercase tracking-wider font-bold text-zinc-400">Groovy Bot</th>
                  <th className="p-3 uppercase tracking-wider font-bold text-zinc-400">FredBoat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brutal-border">
                {COMPARISON_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-brutal-bg/60 transition-colors">
                    <td className="p-3 font-bold text-white whitespace-nowrap">{row.feature}</td>
                    <td className="p-3 font-bold text-emerald-400 bg-emerald-950/10 border-l border-r border-brutal-accent/40 whitespace-nowrap">
                      ✓ {row.together}
                    </td>
                    <td className="p-3 text-zinc-400 whitespace-nowrap">{row.rythm}</td>
                    <td className="p-3 text-zinc-500 whitespace-nowrap">{row.groovy}</td>
                    <td className="p-3 text-zinc-400 whitespace-nowrap">{row.fredboat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Features FAQ */}
        <section className="border-2 border-brutal-border bg-brutal-surface p-6 md:p-8 shadow-brutal space-y-6">
          <div className="border-b-2 border-brutal-border pb-4">
            <span className="text-[10px] uppercase font-bold text-brutal-accent tracking-widest">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight">
              COMMONLY ASKED QUESTIONS ABOUT TOGETHER FEATURES
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-300 font-mono leading-relaxed">
            <div className="space-y-2 border border-brutal-border bg-brutal-bg p-4">
              <h3 className="font-bold text-white text-sm">Why is 24-bit Opus audio noticeably clearer?</h3>
              <p>
                Standard Discord music bots re-encode heavily compressed audio through multiple software bridges, causing loss of high frequencies and mushy bass. Together bypasses intermediary lossy steps, streaming 24-bit 48,000Hz direct PCM buffers straight to Discord's voice gateways.
              </p>
            </div>
            <div className="space-y-2 border border-brutal-border bg-brutal-bg p-4">
              <h3 className="font-bold text-white text-sm">How does the 3D WebGL Webplayer work?</h3>
              <p>
                When you play a track, Together provides an instant webplayer link. Opening it in any browser syncs your session in real time via low-latency WebSockets and computes 3D reactive audio geometry on your graphics card with 50+ shader presets.
              </p>
            </div>
            <div className="space-y-2 border border-brutal-border bg-brutal-bg p-4">
              <h3 className="font-bold text-white text-sm">Are there any paid subscriptions required for 24/7 mode?</h3>
              <p>
                No. Together believes in an open, un-paywalled music experience. 24/7 channel locking, all 14 DSP filters, unlimited queue length, and 3D visualizers are 100% free for every server.
              </p>
            </div>
            <div className="space-y-2 border border-brutal-border bg-brutal-bg p-4">
              <h3 className="font-bold text-white text-sm">What happens if a music stream link fails?</h3>
              <p>
                Our universal multi-source engine automatically scans fallback audio databases. If a primary Spotify or YouTube link cannot be decoded due to region locks, Together resolves an identical, pristine acoustic match from SoundCloud, Deezer, or Apple Music without interrupting your queue.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Call to Action */}
        <section className="border-2 border-brutal-border bg-gradient-to-br from-brutal-surface via-black to-emerald-950/20 p-8 md:p-12 shadow-brutal text-center space-y-6">
          <span className="font-mono text-xs uppercase px-3 py-1 bg-brutal-accent text-black font-black tracking-widest inline-block">
            READY TO UPGRADE YOUR VOICE CHANNELS?
          </span>
          <h2 className="font-display font-black text-3xl md:text-5xl text-white uppercase tracking-tight max-w-2xl mx-auto">
            EXPERIENCE STUDIO SOUND ON YOUR DISCORD SERVER TODAY
          </h2>
          <p className="font-mono text-xs md:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
            Invite Together in seconds. Zero configuration required—just add the bot, join any voice channel, and start playing your favorite tracks with unmatched fidelity.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={BOT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-brutal-accent text-black font-black text-sm uppercase border-2 border-black shadow-brutal hover:bg-emerald-300 hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>INVITE TOGETHER BOT NOW</span>
            </a>
            <Link
              to="/commands"
              className="px-6 py-3 bg-black border-2 border-brutal-border hover:border-brutal-accent text-white font-bold text-sm uppercase shadow-brutal-sm flex items-center gap-2 transition-all"
            >
              <Terminal className="w-4 h-4 text-brutal-accent" />
              <span>EXPLORE ALL 69 COMMANDS</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer Navigation */}
      <footer className="max-w-7xl w-full mx-auto mt-12 pt-8 border-t-2 border-brutal-border flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-brutal-muted">
        <div>&copy; 2026 Together Music Bot Team. All rights reserved.</div>
        <nav className="flex flex-wrap gap-4 uppercase font-bold text-[11px] justify-center md:justify-start" aria-label="Footer Navigation">
          <Link to="/" className="hover:text-brutal-accent">Home</Link>
          <Link to="/features" className="hover:text-brutal-accent text-brutal-accent font-bold">Features</Link>
          <Link to="/commands" className="hover:text-brutal-accent">Commands</Link>
          <Link to="/faq" className="hover:text-brutal-accent">FAQ</Link>
          <Link to="/leaderboard" className="hover:text-brutal-accent">Leaderboard</Link>
          <Link to="/about" className="hover:text-brutal-accent">About</Link>
          <Link to="/contact" className="hover:text-brutal-accent">Contact</Link>
          <Link to="/terms" className="hover:text-brutal-accent">Terms</Link>
          <Link to="/privacy" className="hover:text-brutal-accent">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
