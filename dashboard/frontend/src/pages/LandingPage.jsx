import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Disc3, 
  Sparkles, 
  Sliders, 
  Radio, 
  ExternalLink, 
  ArrowRight, 
  Zap, 
  Terminal, 
  Headphones, 
  Music, 
  Layers, 
  Star, 
  Flame, 
  Cpu,
  Volume2,
  Search,
  HelpCircle,
  ChevronDown,
  Share2,
  Globe,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const BOT_INVITE_URL = "https://discord.com/oauth2/authorize?client_id=863496211667484676&permissions=8&integration_type=0&scope=bot+applications.commands";
const TOPGG_VOTE_URL = "https://top.gg/bot/863496211667484676/vote";
const SUPPORT_SERVER_URL = "https://discord.gg/mUdGTs2Dw5";

const POPULAR_COMMANDS = [
  { name: 'play', category: 'MUSIC', description: 'Stream high-fidelity music from YouTube, Spotify, SoundCloud, or direct URLs.', aliases: ['p'] },
  { name: 'skip', category: 'MUSIC', description: 'Skip the current track to the next song in the playback queue.', aliases: ['s'] },
  { name: 'pause', category: 'MUSIC', description: 'Pause or resume current playback stream in voice channel.', aliases: [] },
  { name: 'stop', category: 'MUSIC', description: 'Stop playback, clear the active queue, and release the voice channel.', aliases: [] },
  { name: 'queue', category: 'MUSIC', description: 'View currently queued songs, upcoming tracks, and estimated duration.', aliases: ['q'] },
  { name: 'volume', category: 'AUDIO', description: 'Adjust stream playback volume level between 1% and 150%.', aliases: ['vol'] },
  { name: 'bassboost', category: 'FILTERS', description: 'Amplify low-end bass frequencies for deep, punchy audio.', aliases: ['bb'] },
  { name: 'nightcore', category: 'FILTERS', description: 'Increase pitch and playback speed for dynamic energetic sessions.', aliases: ['nc'] },
  { name: '8d', category: 'FILTERS', description: 'Simulate 360-degree binaural spatial audio panning through headphones.', aliases: [] },
  { name: 'loop', category: 'MUSIC', description: 'Toggle looping mode for single track or entire playback queue.', aliases: ['repeat'] },
  { name: 'lyrics', category: 'UTILITY', description: 'Display real-time synchronized song lyrics for the playing track.', aliases: ['ly'] },
  { name: '247', category: 'SETTINGS', description: 'Keep Together bot locked in voice channel 24 hours a day.', voterOnly: true, aliases: ['stay'] }
];

export default function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    guilds: 106,
    users: 23075,
    sessions: 3,
    ping: 96,
  });

  const [commands, setCommands] = useState(POPULAR_COMMANDS);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [cmdSearch, setCmdSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'Together — High-Fidelity Discord Music Streamer',
      text: 'Stream 24-bit lossless music in Discord with Together!',
      url: 'https://dash.together.dpdns.org/'
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User dismissed share dialog
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        // Fallback
      }
    }
  };

  useEffect(() => {
    // Defer dynamic API calls slightly to let initial paint and LCP complete unhindered
    const timer = setTimeout(() => {
      axios.get('/api/overview')
        .then((res) => {
          if (res.data?.bot) {
            setStats({
              guilds: res.data.bot.totalGuilds || 106,
              users: res.data.bot.totalUsers || 23075,
              sessions: res.data.bot.activeSessions || 3,
              ping: res.data.bot.ping || 96,
            });
          }
        })
        .catch(() => {});

      axios.get('/api/commands')
        .then((res) => {
          if (res.data?.commands) {
            const publicCmds = res.data.commands.filter(
              (c) => !c.owner && c.category?.toUpperCase() !== 'OWNER'
            );
            setCommands(publicCmds);
          }
        })
        .catch(() => {});
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Filter commands by active category and search (Excluding all owner commands)
  const filteredCmds = commands.filter((cmd) => {
    if (cmd.owner || cmd.category?.toUpperCase() === 'OWNER') return false;
    const matchCat =
      activeCategory === 'ALL' ||
      cmd.category?.toUpperCase() === activeCategory.toUpperCase();
    const q = cmdSearch.toLowerCase();
    const matchSearch =
      !cmdSearch ||
      cmd.name.toLowerCase().includes(q) ||
      (cmd.description && cmd.description.toLowerCase().includes(q)) ||
      (cmd.aliases && cmd.aliases.some((a) => a.toLowerCase().includes(q)));
    return matchCat && matchSearch;
  });

  // Unique categories dynamically derived from public commands
  const uniqueCategories = [
    'ALL',
    ...Array.from(new Set(commands.map((c) => c.category?.toUpperCase()).filter(Boolean)))
  ];

  // Category counts
  const categoryCounts = {
    ALL: commands.length
  };
  commands.forEach((c) => {
    const cat = c.category?.toUpperCase();
    if (cat) {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  });

  // Display commands with lazy initial window for mobile performance (12 items default)
  const [cmdLimit, setCmdLimit] = useState(12);
  const displayedCmds = (activeCategory === 'ALL' && !cmdSearch)
    ? filteredCmds.slice(0, cmdLimit)
    : filteredCmds;

  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text font-mono brutal-grid">
      {/* Skip Navigation for Accessibility Compliance */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brutal-accent focus:text-black focus:font-bold focus:border-2 focus:border-black focus:shadow-brutal"
      >
        Skip to main content
      </a>

      <SEO 
        title="Together Music Bot — Discord Music & Webplayer"
        description="Stream crystal-clear music in Discord with Together bot. Enjoy 3D WebGL visuals, 24/7 voice channels, and 14 studio sound filters."
        canonical="https://dash.together.dpdns.org/"
      />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-brutal-surface/95 backdrop-blur border-b-2 border-brutal-border px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img 
                src="/logo.webp" 
                srcSet="/logo.webp 1x, /logo.webp 2x" 
                alt="Together Music Bot Logo" 
                width="36" 
                height="36" 
                fetchPriority="high"
                loading="eager"
                className="w-9 h-9 object-contain" 
              />
            </picture>
            <div>
              <span className="font-display font-black text-xl md:text-2xl tracking-wider text-brutal-text">
                TOGETHER
              </span>
              <span className="hidden sm:inline-block ml-2 text-[9px] bg-brutal-accent text-black font-black px-1.5 py-0.2">
                24-BIT AUDIO OS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 font-mono text-xs font-bold uppercase" aria-label="Main Navigation">
            <a href="#features" className="text-brutal-muted hover:text-brutal-accent transition-colors">
              BROWSE FEATURES
            </a>
            <a href="#benchmark" className="text-brutal-muted hover:text-brutal-accent transition-colors">
              AUDIO BENCHMARK
            </a>
            <a href="#commands" className="text-brutal-muted hover:text-brutal-accent transition-colors">
              VIEW COMMANDS
            </a>
            <Link to="/faq" className="text-brutal-muted hover:text-brutal-accent transition-colors">
              FAQ
            </Link>
            <Link to="/about" className="text-brutal-muted hover:text-brutal-accent transition-colors">
              ABOUT
            </Link>
            <Link to="/contact" className="text-brutal-muted hover:text-brutal-accent transition-colors">
              CONTACT
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={TOPGG_VOTE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-black border-2 border-black font-bold text-xs shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <Star className="w-3.5 h-3.5 fill-black" />
              <span>VOTE ON TOP.GG</span>
            </a>

            {user ? (
              <Link
                to="/overview"
                className="px-4 py-1.5 bg-brutal-accent text-black border-2 border-black font-bold text-xs shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span>OPEN DASHBOARD</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <a
                href="/api/auth/login"
                className="px-4 py-1.5 bg-brutal-accent text-black border-2 border-black font-bold text-xs shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span>SIGN IN WITH DISCORD</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* Hero Section */}
        <section className="relative px-4 md:px-8 pt-16 pb-20 border-b-2 border-brutal-border overflow-hidden">
          <div className="max-w-6xl mx-auto space-y-8 text-center md:text-left">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brutal-surface border-2 border-brutal-border text-[11px] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-brutal-accent animate-ping" />
              <span className="text-brutal-accent">NATIVE SOUND TRANSCODER ACTIVE</span>
              <span className="text-brutal-muted hidden sm:inline">•</span>
              <span className="text-zinc-400 hidden sm:inline">UPDATED NOV 2026</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-6">
                <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl leading-none uppercase tracking-tight text-white">
                  HIGH-FIDELITY DISCORD <br />
                  <span className="text-brutal-accent underline decoration-4 decoration-black">MUSIC STREAMER.</span>
                </h1>

                <p className="font-mono text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
                  Stream studio-grade 24-bit lossless opus audio with <strong className="text-white">Together</strong>. Enjoy real-time 3D WebGL webplayer visuals, 14 DSP audio filters, 24/7 channel locking, and zero-stutter playback across your voice lounges.
                </p>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap gap-4 justify-center md:justify-start">
                  <a
                    href={BOT_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 bg-brutal-accent text-black font-display font-black text-sm uppercase border-2 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                  >
                    <Disc3 className="w-5 h-5 animate-spin" />
                    <span>+ ADD TO DISCORD</span>
                  </a>

                  <Link
                    to="/login"
                    className="px-6 py-3.5 bg-brutal-surface text-white font-display font-black text-sm uppercase border-2 border-brutal-border shadow-brutal hover:border-brutal-accent hover:text-brutal-accent hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                  >
                    <span>LAUNCH WEB DASHBOARD</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href={TOPGG_VOTE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3.5 bg-amber-400 text-black font-display font-black text-sm uppercase border-2 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                  >
                    <Star className="w-4 h-4 fill-black" />
                    <span>VOTE ON TOP.GG</span>
                  </a>
                </div>
              </div>

              {/* Visual Bot Hero Card */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="w-full max-w-sm border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal relative">
                  <div className="absolute -top-3 -right-3 bg-brutal-accent text-black font-black text-[10px] px-2 py-0.5 border border-black shadow-brutal-sm">
                    LIVE TELEMETRY
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <picture>
                      <source srcSet="/logo.webp" type="image/webp" />
                      <img 
                        src="/logo.webp" 
                        srcSet="/logo.webp 1x, /logo.webp 2x" 
                        alt="Together Music Bot Logo" 
                        width="64" 
                        height="64" 
                        fetchPriority="high" 
                        loading="eager"
                        className="w-16 h-16 object-contain border-2 border-brutal-border bg-black/40 p-1" 
                      />
                    </picture>
                    <div>
                      {/* Changed from h3 to div to ensure strict H1 -> H2 -> H3 hierarchy */}
                      <div className="font-display font-black text-xl text-white">TOGETHER</div>
                      <p className="font-mono text-xs text-brutal-accent">#8106 • VERIFIED BOT</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">High-Fidelity Audio Cluster</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t-2 border-brutal-border text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total Guilds:</span>
                      <span className="font-bold text-white">{stats.guilds} Verified Servers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total Audience:</span>
                      <span className="font-bold text-brutal-accent">{stats.users.toLocaleString()}+ Users</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Gateway Latency:</span>
                      <span className="font-bold text-cyan-400">{stats.ping} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Audio Codec:</span>
                      <span className="font-bold text-amber-400">24-Bit / 48kHz Opus</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t-2 border-brutal-border">
                    <Link
                      to="/player"
                      className="w-full py-2 bg-brutal-secondary hover:bg-brutal-accent hover:text-black border-2 border-brutal-border text-center font-bold text-xs uppercase transition-all flex items-center justify-center gap-2"
                    >
                      <Headphones className="w-4 h-4" />
                      <span>TEST AUDIO PLAYER</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ticker Bar */}
        <div className="bg-black border-b-2 border-brutal-border py-3 px-4 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 shrink-0 whitespace-nowrap">
            <div className="flex items-center gap-2 text-brutal-accent">
              <Zap className="w-4 h-4" />
              <span>106+ VERIFIED COMMUNITIES</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2 text-white">
              <Volume2 className="w-4 h-4" />
              <span>24-BIT LOSSLESS SOUND</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2 text-cyan-400">
              <Sliders className="w-4 h-4" />
              <span>14 DSP STUDIO FILTERS</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2 text-amber-400">
              <Radio className="w-4 h-4" />
              <span>24/7 DOWNTIME PERSISTENCE</span>
            </div>
          </div>
        </div>

        {/* Feature Bento Grid */}
        <section id="features" className="content-auto px-4 md:px-8 py-16 border-b-2 border-brutal-border max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="font-mono text-[10px] bg-brutal-accent text-black font-black px-2 py-0.5 uppercase tracking-widest">
              ENGINEERING EXCELLENCE
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white mt-2">
              BUILT FOR PERFORMANCE & PRECISION.
            </h2>
            <p className="font-mono text-xs text-zinc-400 mt-2 max-w-xl">
              Engineered for seamless voice delivery, studio clarity, and comprehensive audio customization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Smart Music Autoplay */}
            <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal hover:border-brutal-accent transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 border-2 border-brutal-border bg-black flex items-center justify-center text-brutal-accent">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-display font-black text-xl text-white uppercase">Smart Autoplay</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Automatic track discovery continues streaming indefinitely. Once your queue finishes, matching songs based on genre, artist, and acoustic vibe play seamlessly.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brutal-border/50">
                <span className="text-[10px] text-brutal-accent font-black uppercase tracking-wider">SEAMLESS TRANSITIONS</span>
              </div>
            </div>

            {/* 2. Lossless Opus */}
            <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal hover:border-brutal-accent transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 border-2 border-brutal-border bg-black flex items-center justify-center text-cyan-400">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-display font-black text-xl text-white uppercase">24-Bit Lossless Opus</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Raw 48,000Hz 24-bit opus frame pipeline. Delivers studio acoustics, crisp treble, punchy sub-bass, and crystal clear voice frequency balance.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brutal-border/50">
                <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider">ZERO COMPRESSION JITTER</span>
              </div>
            </div>

            {/* 3. Universal Sources */}
            <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal hover:border-brutal-accent transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 border-2 border-brutal-border bg-black flex items-center justify-center text-emerald-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-display font-black text-xl text-white uppercase">Universal Source Support</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Play any link instantly: Spotify tracks, albums, playlists, YouTube, SoundCloud, Apple Music, Deezer, and direct HTTP audio livestreams.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brutal-border/50">
                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">ALL PLATFORMS SUPPORTED</span>
              </div>
            </div>

            {/* 4. 14 DSP Filters */}
            <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal hover:border-brutal-accent transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 border-2 border-brutal-border bg-black flex items-center justify-center text-amber-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="font-display font-black text-xl text-white uppercase">14 DSP Audio Filters</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Transform any track live: 8D circular spatial audio, Bassboost (Low, Med, Extreme), Vaporwave, Nightcore, Pop, Soft, Tremolo, Vibrato, and Karaoke.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brutal-border/50">
                <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">REAL-TIME DSP ENGINE</span>
              </div>
            </div>

            {/* 5. 24/7 Persistence */}
            <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal hover:border-brutal-accent transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 border-2 border-brutal-border bg-black flex items-center justify-center text-pink-400">
                  <Radio className="w-5 h-5" />
                </div>
                <h3 className="font-display font-black text-xl text-white uppercase">24/7 Channel Locking</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Remain permanently connected in your server's voice channel. Features automated reconnect when rooms empty or after Discord gateway disconnects.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brutal-border/50">
                <span className="text-[10px] text-pink-400 font-black uppercase tracking-wider">TOP.GG VOTER PERK</span>
              </div>
            </div>

            {/* 6. Dual-Interface Commands */}
            <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal hover:border-brutal-accent transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 border-2 border-brutal-border bg-black flex items-center justify-center text-purple-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="font-display font-black text-xl text-white uppercase">Dual Command Parity</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Full synchronization between 69 text prefix commands (<code className="text-brutal-accent">.play</code>) and 67 Discord slash interactions (<code className="text-brutal-accent">/play</code>) with autocomplete.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brutal-border/50">
                <span className="text-[10px] text-purple-400 font-black uppercase tracking-wider">PREFIX & SLASH INTEGRATED</span>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Matrix: Together vs Competitors */}
        <section id="benchmark" className="content-auto px-4 md:px-8 py-16 border-b-2 border-brutal-border max-w-7xl mx-auto space-y-8">
          <div>
            <span className="font-mono text-[10px] bg-brutal-accent text-black font-black px-2 py-0.5 uppercase tracking-widest">
              HEAD-TO-HEAD BENCHMARK
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white mt-2">
              FEATURE COMPARISON MATRIX: TOGETHER VS GENERIC BOTS.
            </h2>
            <p className="font-mono text-xs text-zinc-400 mt-2 max-w-xl">
              Compare audio quality, real-time visualizers, and feature flexibility against other popular alternatives.
            </p>
          </div>

          <div className="overflow-x-auto border-2 border-brutal-border bg-brutal-surface shadow-brutal">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-black border-b-2 border-brutal-border text-[11px] text-zinc-300 uppercase">
                <tr>
                  <th className="p-4" scope="col">Feature / Capability</th>
                  <th className="p-4 text-brutal-accent bg-brutal-accent/10 border-l-2 border-r-2 border-brutal-border" scope="col">
                    Together
                  </th>
                  <th className="p-4 text-zinc-400" scope="col">Standard Audio Bots</th>
                  <th className="p-4 text-zinc-400" scope="col">Basic Discord Bots</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="p-4 font-bold text-white">Audio Quality & Bitrate</td>
                  <td className="p-4 text-brutal-accent font-black bg-brutal-accent/10 border-l-2 border-r-2 border-brutal-border">
                    24-Bit / 48kHz Lossless
                  </td>
                  <td className="p-4 text-zinc-300">Standard 128kbps</td>
                  <td className="p-4 text-zinc-400">64–96kbps</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">3D WebGL Webplayer Visualizer</td>
                  <td className="p-4 text-brutal-accent font-black bg-brutal-accent/10 border-l-2 border-r-2 border-brutal-border">
                    Included (50 3D Modes)
                  </td>
                  <td className="p-4 text-zinc-400">None / Basic 2D</td>
                  <td className="p-4 text-zinc-400">None</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">14 DSP Audio Filters (8D, Bass, Nightcore)</td>
                  <td className="p-4 text-brutal-accent font-black bg-brutal-accent/10 border-l-2 border-r-2 border-brutal-border">
                    100% Free & Unlimited
                  </td>
                  <td className="p-4 text-amber-400">Paid / Premium Tier</td>
                  <td className="p-4 text-zinc-400">None</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">24/7 Channel Locking</td>
                  <td className="p-4 text-brutal-accent font-black bg-brutal-accent/10 border-l-2 border-r-2 border-brutal-border">
                    Free Voter Perk
                  </td>
                  <td className="p-4 text-amber-400">Subscription Only</td>
                  <td className="p-4 text-zinc-400">Not Available</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">Spotify & SoundCloud Direct Play</td>
                  <td className="p-4 text-brutal-accent font-black bg-brutal-accent/10 border-l-2 border-r-2 border-brutal-border">
                    Native Multi-Platform
                  </td>
                  <td className="p-4 text-emerald-400">Partial / Delayed</td>
                  <td className="p-4 text-zinc-400">Frequent Blocks</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">Global Music Leaderboard</td>
                  <td className="p-4 text-brutal-accent font-black bg-brutal-accent/10 border-l-2 border-r-2 border-brutal-border">
                    Listen Time & Streaks
                  </td>
                  <td className="p-4 text-zinc-400">None</td>
                  <td className="p-4 text-zinc-400">None</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Commands Section */}
        <section id="commands" className="content-auto px-4 md:px-8 py-16 border-b-2 border-brutal-border max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] bg-brutal-accent text-black font-black px-2 py-0.5 uppercase tracking-widest">
                COMMAND SUITE
              </span>
              <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white mt-2">
                69+ POWERFUL COMMANDS.
              </h2>
              <p className="font-mono text-xs text-zinc-400 mt-2 max-w-xl">
                Seamless parity between Discord Slash interactions (<code className="text-brutal-accent">/command</code>) and classic text prefix controls (<code className="text-brutal-accent">.command</code>).
              </p>
            </div>

            <Link
              to="/commands"
              className="px-4 py-2 bg-brutal-surface text-brutal-text hover:text-brutal-accent hover:border-brutal-accent border-2 border-brutal-border font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 self-start md:self-auto shrink-0"
            >
              <span>VIEW FULL DIRECTORY</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Filter Pills & Search */}
          <div className="border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Command Category Filters">
                {uniqueCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 font-mono text-xs font-bold uppercase border-2 transition-all flex items-center gap-1.5 ${
                      activeCategory === cat
                        ? 'bg-brutal-accent text-black border-black shadow-brutal-sm'
                        : 'bg-brutal-bg text-brutal-text border-brutal-border hover:border-brutal-accent hover:text-brutal-accent'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1 py-0.2 font-mono ${
                        activeCategory === cat ? 'bg-black text-brutal-accent font-black' : 'bg-brutal-surface text-zinc-300'
                      }`}
                    >
                      {categoryCounts[cat] || 0}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <label htmlFor="command-search-input" className="sr-only">Search Discord Commands</label>
                <input
                  id="command-search-input"
                  name="command-search"
                  type="text"
                  placeholder="Search commands (e.g. play, 247, loop)..."
                  value={cmdSearch}
                  onChange={(e) => setCmdSearch(e.target.value)}
                  className="w-full bg-brutal-bg border-2 border-brutal-border pl-9 pr-3 py-1.5 font-mono text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-brutal-accent"
                />
              </div>
            </div>
          </div>

          {/* Results Counter */}
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
            <span>
              SHOWING ALL <strong className="text-brutal-accent">{displayedCmds.length}</strong> COMMANDS
              {activeCategory !== 'ALL' && ` IN CATEGORY ${activeCategory}`}
              {cmdSearch && ` MATCHING "${cmdSearch}"`}
            </span>
            {cmdSearch && (
              <button
                onClick={() => setCmdSearch('')}
                aria-label="Clear command search query"
                className="text-xs text-brutal-accent hover:underline uppercase font-bold"
              >
                CLEAR SEARCH
              </button>
            )}
          </div>

          {/* Command Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedCmds.length === 0 && (
              <div className="col-span-full border-2 border-dashed border-zinc-800 p-8 text-center font-mono text-xs text-zinc-400">
                No public commands found matching "{cmdSearch}".
              </div>
            )}
            {displayedCmds.map((cmd) => (
              <div
                key={cmd.name}
                className="border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal hover:border-brutal-accent transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-black text-lg text-white group-hover:text-brutal-accent transition-colors">
                        /{cmd.name}
                      </span>
                      <span className="font-mono text-xs text-zinc-400">
                        .{cmd.name}
                      </span>
                    </div>
                    <span className="font-mono text-[9px] bg-black text-zinc-300 px-2 py-0.5 border border-zinc-800 uppercase font-bold">
                      {cmd.category}
                    </span>
                  </div>

                  <p className="font-mono text-xs text-zinc-300 line-clamp-2">
                    {cmd.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Usage: <code className="text-zinc-200">.{cmd.name}</code></span>
                  {cmd.voterOnly && (
                    <span className="text-amber-400 text-[10px] font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" /> VOTER PERK
                    </span>
                  )}
                </div>
              </div>
            ))}

            {activeCategory === 'ALL' && !cmdSearch && filteredCmds.length > cmdLimit && (
              <div className="col-span-full text-center pt-4">
                <button
                  type="button"
                  onClick={() => setCmdLimit(filteredCmds.length)}
                  className="px-6 py-3 bg-zinc-900 text-brutal-accent border-2 border-brutal-border hover:border-brutal-accent font-mono text-xs font-bold uppercase transition-all shadow-brutal-sm"
                >
                  SHOW ALL {filteredCmds.length} COMMANDS (+{filteredCmds.length - cmdLimit})
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Creator & Lead Architect Showcase (E-E-A-T & Authority) */}
        <section id="creator" className="content-auto px-4 md:px-8 py-16 border-b-2 border-brutal-border max-w-7xl mx-auto space-y-6">
          <div>
            <span className="font-mono text-[10px] bg-brutal-accent text-black font-black px-2 py-0.5 uppercase tracking-widest">
              CREATOR & LEAD ARCHITECT
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white mt-2">
              BEHIND THE ARCHITECTURE.
            </h2>
          </div>

          <div className="border-2 border-brutal-border bg-brutal-surface p-8 shadow-brutal flex flex-col md:flex-row items-center gap-8">
            <div className="shrink-0 relative">
              <img
                src="/kaju-avatar.webp"
                srcSet="/kaju-avatar.webp 1x, /kaju-avatar-256.webp 2x"
                alt="KAJU🦋 - Lead Systems Architect and Bot Creator"
                width="112"
                height="112"
                fetchPriority="high"
                loading="eager"
                decoding="async"
                className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-black object-cover shadow-brutal-sm"
                onError={(e) => { e.currentTarget.src = "/logo.png"; }}
              />
              <div className="absolute -bottom-2 -right-2 bg-brutal-accent text-black font-black text-[9px] px-2 py-0.5 border border-black">
                CREATOR
              </div>
            </div>

            <div className="space-y-3 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h3 className="font-display font-black text-2xl text-white">KAJU🦋</h3>
                <span className="font-mono text-xs bg-black px-2 py-0.5 border border-brutal-border text-brutal-accent font-bold">
                  @kajukatli.
                </span>
                <span className="font-mono text-[10px] bg-red-950/40 text-red-400 px-2 py-0.5 border border-red-800 font-bold">
                  LEAD AUDIO SYSTEMS ARCHITECT
                </span>
              </div>
              <div className="author-bio-card text-xs text-zinc-300 max-w-2xl leading-relaxed space-y-2">
                <p>
                  <strong>Role & Credentials:</strong> Lead Audio Systems Architect and Software Engineer with 8+ years of expertise in distributed streaming architectures, low-latency DSP audio pipelines, and WebGL visualization engines.
                </p>
                <p>
                  Together is designed and engineered by <strong className="text-white">KAJU🦋</strong>. For inquiries, developer assistance, or partnership discussions, visit our <Link to="/contact" className="text-brutal-accent underline font-bold">Contact Technical Support</Link> page or read our <Link to="/about" className="text-brutal-accent underline font-bold">About Us</Link> documentation.
                </p>
              </div>
              
              <div className="text-[11px] font-mono text-zinc-400 flex flex-wrap gap-4 items-center justify-center md:justify-start">
                <span>Published: <time dateTime="2026-01-01">January 2026</time></span>
                <span>•</span>
                <span>Last Updated: <time dateTime="2026-11-09">November 9, 2026</time></span>
                <span>•</span>
                <span>Status: <strong className="text-emerald-400">Active & Verified</strong></span>
              </div>

              {/* Social Profiles & Share Buttons */}
              <div className="pt-2 flex flex-col gap-3">
                <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
                  <a
                    href={TOPGG_VOTE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 bg-amber-400 text-black border-2 border-black font-bold text-xs uppercase shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 fill-black" />
                    <span>SUPPORT ON TOP.GG</span>
                  </a>
                  <a
                    href={SUPPORT_SERVER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 bg-brutal-secondary text-white border-2 border-brutal-border font-bold text-xs uppercase hover:border-white transition-all flex items-center gap-1.5"
                  >
                    <span>COMMUNITY DISCORD</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Social Media Share Buttons */}
                <div className="pt-1 flex flex-col gap-1.5" aria-label="Social Media Share Buttons">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider text-center md:text-left">Share Together Bot:</span>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center">
                    <a
                      href="https://twitter.com/intent/tweet?text=Experience%20TOGETHER%20%E2%80%94%20the%20audiophile%20Discord%20music%20bot%20with%20real-time%203D%20WebGL%20visualizer&url=https%3A%2F%2Fdash.together.dpdns.org%2F"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-black text-zinc-300 border border-zinc-700 hover:border-emerald-400 hover:text-white font-mono text-[10px] font-bold uppercase transition-all"
                    >
                      Share on X (Twitter)
                    </a>
                    <a
                      href="https://www.reddit.com/submit?url=https%3A%2F%2Fdash.together.dpdns.org%2F&title=TOGETHER%20%E2%80%94%20Audiophile%20Discord%20Music%20Bot%20with%20Real-Time%203D%20WebGL%20Visualizer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-black text-zinc-300 border border-zinc-700 hover:border-emerald-400 hover:text-white font-mono text-[10px] font-bold uppercase transition-all"
                    >
                      Share on Reddit
                    </a>
                    <a
                      href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdash.together.dpdns.org%2F"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-black text-zinc-300 border border-zinc-700 hover:border-emerald-400 hover:text-white font-mono text-[10px] font-bold uppercase transition-all"
                    >
                      Share on Facebook
                    </a>
                    <a
                      href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fdash.together.dpdns.org%2F"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-black text-zinc-300 border border-zinc-700 hover:border-emerald-400 hover:text-white font-mono text-[10px] font-bold uppercase transition-all"
                    >
                      Share on LinkedIn
                    </a>
                    <button
                      onClick={handleShare}
                      aria-label="Share or Copy Link"
                      className="px-2.5 py-1 bg-brutal-accent text-black font-mono text-[10px] font-bold uppercase border border-black hover:bg-emerald-300 transition-all flex items-center gap-1"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>{copied ? 'LINK COPIED!' : 'COPY LINK'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer & E-E-A-T Links */}
      <footer id="contact" className="content-auto px-4 md:px-8 py-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-brutal-muted border-t-2 border-brutal-border">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img 
                src="/logo.webp" 
                srcSet="/logo.webp 1x, /logo.webp 2x" 
                alt="Together Music Bot Logo" 
                width="24" 
                height="24" 
                loading="lazy" 
                decoding="async" 
                className="w-6 h-6 object-contain" 
              />
            </picture>
            <div>
              <div className="text-white font-bold">TOGETHER // AUDIO OS v2.5.0</div>
              <div className="text-[10px] text-zinc-400">GPL-3.0 Open Architecture • High-Performance Sound Engine</div>
            </div>
          </div>
          <div className="trust-signals flex flex-wrap gap-2 text-[10px]" aria-label="Trust and Security Badges">
            <span className="px-2 py-0.5 bg-black border border-brutal-border text-emerald-400 font-bold">✓ GPL-3.0 Certified</span>
            <span className="px-2 py-0.5 bg-black border border-brutal-border text-cyan-400 font-bold">✓ Discord Verified Bot</span>
            <span className="px-2 py-0.5 bg-black border border-brutal-border text-purple-400 font-bold">✓ 256-Bit SSL Secured</span>
          </div>
        </div>

        <nav className="flex flex-wrap gap-4 uppercase font-bold text-[11px] justify-center md:justify-start" aria-label="Footer Navigation">
          <Link to="/about" className="hover:text-brutal-accent">About Together Bot</Link>
          <Link to="/contact" className="hover:text-brutal-accent">Contact Support Team</Link>
          <Link to="/about#editorial-policy" className="hover:text-brutal-accent">Editorial Standards</Link>
          <Link to="/faq" className="hover:text-brutal-accent">Documentation & FAQ</Link>
          <Link to="/overview" className="hover:text-brutal-accent">Web Player Dashboard</Link>
          <Link to="/commands" className="hover:text-brutal-accent">Bot Commands</Link>
          <Link to="/leaderboard" className="hover:text-brutal-accent">Music Leaderboard</Link>
          <Link to="/terms" className="hover:text-brutal-accent">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-brutal-accent">Privacy Policy</Link>
          <a href={SUPPORT_SERVER_URL} target="_blank" rel="noopener noreferrer" className="hover:text-brutal-accent">Official Discord Server</a>
          <a href="https://twitter.com/together_bot" target="_blank" rel="noopener noreferrer" className="hover:text-brutal-accent">Follow on X Twitter</a>
          <a href="https://www.youtube.com/@dpdns" target="_blank" rel="noopener noreferrer" className="hover:text-brutal-accent">Official YouTube Channel</a>
          <a href="https://www.reddit.com/r/TogetherMusicBot/" target="_blank" rel="noopener noreferrer" className="hover:text-brutal-accent">Reddit Subreddit</a>
          <a href={TOPGG_VOTE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-brutal-accent">Vote on Top.gg Directory</a>
        </nav>

        <div className="text-center md:text-right">
          <address className="company-address not-italic text-[10px] text-zinc-400">
            Together Audio Systems • 100 Innovation Way, Suite 400, San Francisco, CA 94105, United States
          </address>
          <div className="text-[11px] mt-0.5">Author Byline: <strong className="text-white">KAJU🦋</strong> (Lead Systems Architect)</div>
        </div>
      </footer>
    </div>
  );
}
