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
  ShieldCheck, 
  Zap, 
  Terminal, 
  Headphones, 
  Music, 
  Layers, 
  Star, 
  Flame, 
  CheckCircle2, 
  Cpu,
  Volume2,
  Search,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const BOT_INVITE_URL = "https://discord.com/oauth2/authorize?client_id=863496211667484676&permissions=8&integration_type=0&scope=bot+applications.commands";
const TOPGG_VOTE_URL = "https://top.gg/bot/863496211667484676/vote";
const SUPPORT_SERVER_URL = "https://discord.gg/mUdGTs2Dw5";

export default function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    guilds: 106,
    users: 23075,
    sessions: 3,
    ping: 96,
  });

  const [commands, setCommands] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [cmdSearch, setCmdSearch] = useState('');

  useEffect(() => {
    // 1. Fetch bot telemetry
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

    // 2. Fetch public command registry
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

  // Display ALL filtered commands without arbitrary slice
  const displayedCmds = filteredCmds;

  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text font-mono brutal-grid">
      <SEO 
        title="TOGETHER — #1 Discord Music Bot & Lossless Webplayer"
        description="Top-rated Discord music bot featuring 24-bit lossless opus audio, real-time 3D webplayer visualizer, 24/7 uptime, and multi-source streaming. Add to Discord now."
        canonical="https://dash.together.dpdns.org/"
      />
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-brutal-surface/95 backdrop-blur border-b-2 border-brutal-border px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="TOGETHER" className="w-9 h-9 object-contain" />
            <div>
              <span className="font-display font-black text-xl md:text-2xl tracking-wider text-brutal-text">
                TOGETHER
              </span>
              <span className="hidden sm:inline-block ml-2 text-[9px] bg-brutal-accent text-black font-black px-1.5 py-0.2">
                24-BIT AUDIO OS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 font-mono text-xs font-bold uppercase">
            <a href="#features" className="text-brutal-muted hover:text-brutal-accent transition-colors">
              FEATURES
            </a>
            <a href="#commands" className="text-brutal-muted hover:text-brutal-accent transition-colors">
              COMMANDS
            </a>
            <a href="#creator" className="text-brutal-muted hover:text-brutal-accent transition-colors">
              CREATOR
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={TOPGG_VOTE_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-black border-2 border-black font-bold text-xs shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <Star className="w-3.5 h-3.5 fill-black" />
              <span>VOTE TOP.GG</span>
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
                <span>LOGIN</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 md:px-8 pt-16 pb-20 border-b-2 border-brutal-border overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-8 text-center md:text-left">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brutal-surface border-2 border-brutal-border text-[11px] font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-brutal-accent animate-ping" />
            <span className="text-brutal-accent">NATIVE TOGETHER TRANSCODER ACTIVE</span>
            <span className="text-brutal-muted hidden sm:inline">•</span>
            <span className="text-zinc-400 hidden sm:inline">VERSION 2.5.0 STUDIO RELEASE</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-6">
              <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl leading-none uppercase tracking-tight text-white">
                THE NEXT GENERATION <br />
                <span className="text-brutal-accent underline decoration-4 decoration-black">OF DISCORD MUSIC BOT.</span>
              </h1>

              <p className="font-mono text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
                Experience ultra-low latency, 24-bit lossless opus audio streaming across your Discord servers with TOGETHER, the premier Discord music bot and real-time 3D WebGL webplayer. 
                Featuring 14 DSP studio audio filters, zero dropouts, and 24/7 channel locking.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-4 justify-center md:justify-start">
                <a
                  href={BOT_INVITE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 bg-brutal-accent text-black font-display font-black text-sm uppercase border-2 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                >
                  <Disc3 className="w-5 h-5 animate-spin" />
                  <span>+ ADD TOGETHER TO DISCORD</span>
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
                  rel="noreferrer"
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
                  <img src="/logo.png" alt="TOGETHER Logo" className="w-16 h-16 object-contain border-2 border-brutal-border bg-black/40 p-1" />
                  <div>
                    <h3 className="font-display font-black text-xl text-white">TOGETHER</h3>
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
            <span>24-BIT LOSSLESS TRANSCODING</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2 text-cyan-400">
            <Sliders className="w-4 h-4" />
            <span>14 DSP STUDIO AUDIO FILTERS</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2 text-amber-400">
            <Radio className="w-4 h-4" />
            <span>24/7 ZERO-DOWNTIME PERSISTENCE</span>
          </div>
        </div>
      </div>

      {/* Feature Bento Grid */}
      <section id="features" className="px-4 md:px-8 py-16 border-b-2 border-brutal-border max-w-7xl mx-auto">
        <div className="mb-12">
          <span className="font-mono text-[10px] bg-brutal-accent text-black font-black px-2 py-0.5 uppercase tracking-widest">
            ENGINEERING EXCELLENCE
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white mt-2">
            BUILT FOR PERFORMANCE & PRECISION.
          </h2>
          <p className="font-mono text-xs text-zinc-400 mt-2 max-w-xl">
            TOGETHER is designed from the ground up for zero stutter, high audio clarity, and deep customization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Smart Music Autoplay */}
          <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal hover:border-brutal-accent transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 border-2 border-brutal-border bg-black flex items-center justify-center text-brutal-accent">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-xl text-white uppercase">Smart Music Autoplay</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Algorithmic discovery engine keeps the music going endlessly. When your queue ends, TOGETHER seamlessly finds and queues fresh matching songs based on genre, artist, and acoustic vibe.
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
                Native audio transcoder utilizing raw 48,000Hz 24-bit opus frames. Delivers studio acoustics, crisp treble, punchy sub-bass, and crystal clear voice frequency balance.
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
                Play any link instantly: Spotify tracks, albums and playlists, YouTube Music, SoundCloud, Apple Music, Deezer, and direct HTTP audio livestreams.
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
                Transform any track in real time: 8D circular spatial audio, Bassboost (Low, Med, Extreme), Vaporwave, Nightcore, Pop, Soft, Tremolo, Vibrato, and Karaoke.
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
                Keep TOGETHER connected in your server's voice lounge 24 hours a day, 7 days a week. Automatic reconnect when voice empties or after Discord gateway disconnects.
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
                Complete synchronization between 69 text prefix commands (<code className="text-brutal-accent">.play</code>) and 67 Discord slash interactions (<code className="text-brutal-accent">/play</code>) with autocomplete.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-brutal-border/50">
              <span className="text-[10px] text-purple-400 font-black uppercase tracking-wider">PREFIX & SLASH INTEGRATED</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMANDS SECTION (NEW) ── */}
      <section id="commands" className="px-4 md:px-8 py-16 border-b-2 border-brutal-border max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] bg-brutal-accent text-black font-black px-2 py-0.5 uppercase tracking-widest">
              COMMAND INTERACTION SUITE
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white mt-2">
              69+ POWERFUL COMMANDS.
            </h2>
            <p className="font-mono text-xs text-zinc-400 mt-2 max-w-xl">
              100% parity between Discord Slash interactions (<code className="text-brutal-accent">/command</code>) and classic text prefix controls (<code className="text-brutal-accent">.command</code>).
            </p>
          </div>

          <Link
            to="/commands"
            className="px-4 py-2 bg-brutal-surface text-brutal-text hover:text-brutal-accent hover:border-brutal-accent border-2 border-brutal-border font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 self-start md:self-auto shrink-0"
          >
            <span>VIEW FULL COMMAND DIRECTORY</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter Pills & Instant Search */}
        <div className="border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
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
                      activeCategory === cat ? 'bg-black text-brutal-accent font-black' : 'bg-brutal-surface text-zinc-400'
                    }`}
                  >
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search commands (e.g. play, 247, loop)..."
                value={cmdSearch}
                onChange={(e) => setCmdSearch(e.target.value)}
                className="w-full bg-brutal-bg border-2 border-brutal-border pl-9 pr-3 py-1.5 font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brutal-accent"
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
              className="text-xs text-brutal-accent hover:underline uppercase font-bold"
            >
              CLEAR SEARCH
            </button>
          )}
        </div>

        {/* Command Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedCmds.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-zinc-800 p-8 text-center font-mono text-xs text-zinc-500">
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
                    <span className="font-mono text-xs text-zinc-500">
                      .{cmd.name}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] bg-black text-zinc-400 px-2 py-0.5 border border-zinc-800 uppercase font-bold">
                    {cmd.category}
                  </span>
                </div>

                <p className="font-mono text-xs text-zinc-400 line-clamp-2">
                  {cmd.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Usage: <code className="text-zinc-300">.{cmd.name}</code></span>
                {cmd.voterOnly && (
                  <span className="text-amber-400 text-[10px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" /> VOTER PERK
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout Banner */}
      </section>

      {/* Frequently Asked Questions (SEO & Schema Compliance) */}
      <section id="faq" className="px-4 md:px-8 py-16 border-b-2 border-brutal-border max-w-7xl mx-auto space-y-8">
        <div>
          <span className="font-mono text-[10px] bg-brutal-accent text-black font-black px-2 py-0.5 uppercase tracking-widest">
            KNOWLEDGE BASE
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white mt-2">
            FREQUENTLY ASKED QUESTIONS.
          </h2>
          <p className="font-mono text-xs text-zinc-400 mt-2 max-w-xl">
            Everything you need to know about the TOGETHER Discord music bot, lossless webplayer, and server configurations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal space-y-2">
            <h3 className="font-display font-black text-lg text-white uppercase flex items-center gap-2">
              <span className="text-brutal-accent">Q1.</span> What is TOGETHER Discord Music Bot?
            </h3>
            <p className="font-mono text-xs text-zinc-300 leading-relaxed">
              TOGETHER is a next-generation high-fidelity Discord music bot engineered for 24-bit lossless opus audio streaming, interactive real-time 3D webplayer visualizer, 24/7 channel locking, and zero-latency playback across servers.
            </p>
          </div>

          <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal space-y-2">
            <h3 className="font-display font-black text-lg text-white uppercase flex items-center gap-2">
              <span className="text-brutal-accent">Q2.</span> How do I add the Discord music bot?
            </h3>
            <p className="font-mono text-xs text-zinc-300 leading-relaxed">
              Click <a href={BOT_INVITE_URL} target="_blank" rel="noreferrer" className="text-brutal-accent underline font-bold">Invite Discord Bot</a> on the homepage to authorize the bot with slash command permissions. Once in your server, join a voice channel and type <code className="text-brutal-accent bg-black px-1">/play</code> to start streaming.
            </p>
          </div>

          <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal space-y-2">
            <h3 className="font-display font-black text-lg text-white uppercase flex items-center gap-2">
              <span className="text-brutal-accent">Q3.</span> Does TOGETHER have a webplayer?
            </h3>
            <p className="font-mono text-xs text-zinc-300 leading-relaxed">
              Yes! TOGETHER features an interactive real-time 3D WebGL webplayer at <a href="https://together.dpdns.org/visualizer/" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold">together.dpdns.org/visualizer</a> that renders live audio frequency spectrums, synchronized waveforms, track queues, and controls in your web browser.
            </p>
          </div>

          <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal space-y-2">
            <h3 className="font-display font-black text-lg text-white uppercase flex items-center gap-2">
              <span className="text-brutal-accent">Q4.</span> Is TOGETHER Discord music bot free?
            </h3>
            <p className="font-mono text-xs text-zinc-300 leading-relaxed">
              Yes, TOGETHER provides 100% free access to all core audio features, 24/7 voice channel locking, studio DSP filters, and real-time dashboard controls without arbitrary premium paywalls.
            </p>
          </div>
        </div>
      </section>

      {/* Creator Showcase */}
      <section id="creator" className="px-4 md:px-8 py-16 border-b-2 border-brutal-border max-w-7xl mx-auto">
        <div className="border-2 border-brutal-border bg-brutal-surface p-8 shadow-brutal flex flex-col md:flex-row items-center gap-8">
          <div className="shrink-0 relative">
            <img
              src="https://cdn.discordapp.com/avatars/780345293237125152/9352c3dd8bc5d5722007156bcdc62075.png?size=512"
              alt="KAJU🦋"
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
                BOT OWNER & LEAD ARCHITECT
              </span>
            </div>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              TOGETHER is engineered and crafted with precision by kajukatli. Built with a passion for lossless Discord music streaming, custom audio pipelines, and high-performance WebGL visualization.
            </p>
            <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
              <a
                href={TOPGG_VOTE_URL}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 bg-amber-400 text-black border-2 border-black font-bold text-xs uppercase shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 fill-black" />
                <span>SUPPORT ON TOP.GG</span>
              </a>
              <a
                href={SUPPORT_SERVER_URL}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 bg-brutal-secondary text-white border-2 border-brutal-border font-bold text-xs uppercase hover:border-white transition-all flex items-center gap-1.5"
              >
                <span>JOIN SUPPORT GUILD</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 md:px-8 py-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-brutal-muted">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="TOGETHER" className="w-6 h-6 object-contain" />
          <span className="text-white font-bold">TOGETHER // MUSIC OS v2.5.0</span>
        </div>

        <div className="flex flex-wrap gap-4 uppercase font-bold text-[11px]">
          <Link to="/overview" className="hover:text-brutal-accent">Dashboard</Link>
          <Link to="/commands" className="hover:text-brutal-accent">Commands</Link>
          <Link to="/terms" className="hover:text-brutal-accent">Terms</Link>
          <Link to="/privacy" className="hover:text-brutal-accent">Privacy</Link>
          <a href={SUPPORT_SERVER_URL} target="_blank" rel="noreferrer" className="hover:text-brutal-accent">Support</a>
          <a href={BOT_INVITE_URL} target="_blank" rel="noreferrer" className="hover:text-brutal-accent">Invite Bot</a>
          <a href={TOPGG_VOTE_URL} target="_blank" rel="noreferrer" className="hover:text-brutal-accent">Vote Top.gg</a>
        </div>

        <div>
          <span>Crafted by <strong className="text-white">KAJU🦋</strong></span>
        </div>
      </footer>
    </div>
  );
}
