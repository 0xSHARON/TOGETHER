import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Terminal, 
  Search, 
  Shield, 
  Zap, 
  Sliders, 
  Star, 
  Mic, 
  Volume2, 
  Radio, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Layers,
  Sparkles,
  Command,
  Filter,
  Check,
  Disc3,
  Cpu,
  Flame,
  ArrowRight,
  Headphones,
  Music,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { BrutCard, StatBox } from '../components/Brutalist';
import SEO from '../components/SEO';

const BOT_INVITE_URL = "https://discord.com/oauth2/authorize?client_id=863496211667484676&permissions=8&integration_type=0&scope=bot+applications.commands";
const DEFAULT_TOPGG_URL = "https://top.gg/bot/863496211667484676/vote";
const SUPPORT_SERVER_URL = "https://discord.gg/mUdGTs2Dw5";

export default function CommandsPage() {
  const [commands, setCommands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topggVoteUrl, setTopggVoteUrl] = useState(DEFAULT_TOPGG_URL);
  const [stats, setStats] = useState({
    total: 0,
    slashCount: 0,
    prefixCount: 0,
    voterOnlyCount: 0,
    byCategory: {}
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [onlyVote, setOnlyVote] = useState(false);
  const [onlyVoice, setOnlyVoice] = useState(false);
  const [selectedModalCmd, setSelectedModalCmd] = useState(null);

  useEffect(() => {
    fetchCommands();
  }, []);

  async function fetchCommands() {
    try {
      const resp = await axios.get('/api/commands');
      if (resp.data) {
        const publicCmds = (resp.data.commands || []).filter(
          (c) => !c.owner && c.category?.toUpperCase() !== 'OWNER'
        );
        const publicCats = (resp.data.categories || []).filter(
          (cat) => cat.toUpperCase() !== 'OWNER'
        );

        setCommands(publicCmds);
        setCategories(publicCats);
        if (resp.data.topggVoteUrl) {
          setTopggVoteUrl(resp.data.topggVoteUrl);
        }

        const slashCount = publicCmds.filter((c) => c.hasSlash).length;
        const prefixCount = publicCmds.filter((c) => c.hasPrefix).length;
        const voterOnlyCount = publicCmds.filter((c) => c.voterOnly).length;
        const byCat = {};
        publicCats.forEach((cat) => {
          byCat[cat] = publicCmds.filter((c) => c.category === cat).length;
        });

        setStats({
          total: publicCmds.length,
          slashCount,
          prefixCount,
          voterOnlyCount,
          byCategory: byCat
        });
      }
    } catch (err) {
      console.error('Failed to load commands from API:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = commands.filter((c) => {
    if (c.owner || c.category?.toUpperCase() === 'OWNER') return false;

    const matchCat = filter === 'ALL' || c.category.toUpperCase() === filter.toUpperCase();
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.aliases && c.aliases.some((a) => a.toLowerCase().includes(q))) ||
      (c.slashOptions && c.slashOptions.some((o) => o.name.toLowerCase().includes(q)));
    const matchVote = !onlyVote || c.voterOnly;
    const matchVoice = !onlyVoice || c.inVoiceChannel;

    return matchCat && matchSearch && matchVote && matchVoice;
  });

  const allCategories = ['ALL', ...categories.map((c) => c.toUpperCase())];

  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text font-mono p-4 md:p-8 flex flex-col justify-between selection:bg-brutal-accent selection:text-black">
      <SEO 
        title="Discord Music Bot Commands — Complete Slash & Prefix Reference | Together Bot"
        description="Explore all 69 Discord music commands for Together Bot. Complete syntax reference for playback, queue management, volume control, 14 DSP audio filters, and 24/7 channel locking."
        canonical="https://dash.together.dpdns.org/commands"
      />

      {/* Top Navbar */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal mb-8">
        <Link to="/" className="flex items-center gap-3 group" aria-label="Together Music Bot Home">
          <img src="/logo.webp" alt="Together Logo" width="32" height="32" className="w-8 h-8 object-contain" />
          <span className="font-display font-black text-sm tracking-wider group-hover:text-brutal-accent transition-colors">
            TOGETHER // COMMANDS CATALOG
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/features"
            className="px-3 py-1.5 bg-brutal-bg border border-brutal-border hover:border-brutal-accent text-white font-bold text-xs uppercase shadow-brutal-sm flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-brutal-accent" />
            <span className="hidden sm:inline">VIEW FEATURES</span>
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
      <main id="main-content" className="space-y-10 max-w-7xl w-full mx-auto pb-12">
        {/* Hero Section */}
        <div className="border-2 border-brutal-border bg-brutal-surface p-6 md:p-10 shadow-brutal space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase bg-brutal-accent text-black font-black px-2 py-0.5 tracking-widest">
              OFFICIAL COMMAND REGISTRY
            </span>
            <span className="font-mono text-xs text-brutal-muted">v2.5.0 SYNCED</span>
            <span className="font-mono text-[10px] uppercase bg-black border border-brutal-border text-emerald-400 font-bold px-2 py-0.5">
              ✓ 69 COMMANDS ONLINE
            </span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl text-white uppercase tracking-tight">
            DISCORD MUSIC BOT COMMANDS
          </h1>
          <p className="font-mono text-xs md:text-sm text-zinc-300 max-w-3xl leading-relaxed">
            Full syntax reference for Together Music Bot. Search and filter across all 69 slash and text commands for song queue management, 14 DSP audio filters, 24/7 channel locking, server volume controls, and music leaderboards.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#commands-list"
              className="px-4 py-2 bg-brutal-accent text-black font-bold text-xs uppercase border-2 border-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              <span>BROWSE ALL COMMANDS</span>
            </a>
            <Link
              to="/features"
              className="px-4 py-2 bg-brutal-bg text-white font-bold text-xs uppercase border-2 border-brutal-border hover:border-brutal-accent transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-brutal-accent" />
              <span>EXPLORE BOT FEATURES</span>
            </Link>
            <a
              href={topggVoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border-2 border-amber-500 bg-amber-950/30 text-amber-400 font-bold text-xs uppercase hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2"
            >
              <Star className="w-4 h-4 fill-amber-400" />
              <span>TOP.GG VOTER PERKS</span>
            </a>
          </div>
        </div>

        {/* Section: Command Inventory & Search */}
        <section id="commands-list" className="space-y-6">
          <div className="border-b-2 border-brutal-border pb-4 flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-brutal-accent tracking-widest">
                INTERACTIVE DIRECTORY
              </span>
              <h2 className="font-display font-black text-2xl md:text-3xl text-white uppercase tracking-tight">
                SYNCHRONIZED COMMAND DIRECTORY
              </h2>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              69 PREFIX COMMANDS • 67 SLASH INTERACTIONS
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox
              label="TOTAL COMMANDS"
              value={loading ? '...' : stats.total || 69}
              sub="Synchronized registry"
              accent
            />
            <StatBox
              label="SLASH COMMANDS"
              value={loading ? '...' : stats.slashCount || 67}
              sub="Discord interactions"
            />
            <StatBox
              label="PREFIX UTILITIES"
              value={loading ? '...' : stats.prefixCount || 69}
              sub="Text prefix commands (!)"
            />
            <StatBox
              label="VOTER EXCLUSIVE"
              value={loading ? '...' : stats.voterOnlyCount || 8}
              sub="Unlocked via Top.gg"
            />
          </div>

          {/* Search & Category Filtering Controls */}
          <div className="border-2 border-brutal-border bg-brutal-surface p-5 shadow-brutal-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {allCategories.map((cat) => {
                  const count =
                    cat === 'ALL'
                      ? stats.total
                      : stats.byCategory[cat.charAt(0) + cat.slice(1).toLowerCase()] ||
                        stats.byCategory[cat] ||
                        0;
                  const isActive = filter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border-2 transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-brutal-accent text-black border-black shadow-brutal-sm'
                          : 'bg-brutal-bg text-brutal-text border-brutal-border hover:border-brutal-accent hover:text-brutal-accent'
                      }`}
                    >
                      <span>{cat}</span>
                      <span
                        className={`text-[10px] px-1 py-0.2 font-mono ${
                          isActive ? 'bg-black text-brutal-accent' : 'bg-brutal-surface text-brutal-muted'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Toggle Filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOnlyVote(!onlyVote)}
                  className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border-2 transition-all flex items-center gap-1.5 ${
                    onlyVote
                      ? 'border-amber-400 bg-amber-950/40 text-amber-400'
                      : 'border-brutal-border bg-brutal-bg text-brutal-muted hover:text-white'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>VOTER ONLY</span>
                </button>
                <button
                  onClick={() => setOnlyVoice(!onlyVoice)}
                  className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border-2 transition-all flex items-center gap-1.5 ${
                    onlyVoice
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-400'
                      : 'border-brutal-border bg-brutal-bg text-brutal-muted hover:text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>VOICE REQ</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <label htmlFor="command-search-input" className="sr-only">
                Search commands by name, description, alias, or parameter
              </label>
              <Search className="w-4 h-4 text-brutal-muted absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                id="command-search-input"
                name="command_search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search commands by name, alias, category, or description..."
                aria-label="Search commands by name, description, alias, or parameter"
                title="Search commands"
                className="w-full bg-brutal-bg border-2 border-brutal-border py-2.5 pl-10 pr-4 text-xs font-mono text-brutal-text placeholder-brutal-muted focus:border-brutal-accent focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Clear search query"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-brutal-muted hover:text-white"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>

          {/* Commands Grid */}
          {loading ? (
            <div className="text-center py-16 border-2 border-brutal-border bg-brutal-surface p-8">
              <div className="w-8 h-8 border-2 border-brutal-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-mono text-xs text-brutal-muted uppercase">LOADING COMMAND REGISTRY...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-brutal-border bg-brutal-surface p-8 space-y-3">
              <Filter className="w-10 h-10 text-brutal-muted mx-auto" />
              <h4 className="font-display font-black text-xl text-white uppercase">NO MATCHING COMMANDS FOUND</h4>
              <p className="font-mono text-xs text-brutal-muted max-w-md mx-auto">
                No commands match your filter query "{search}". Try searching for popular commands like <code className="text-brutal-accent">play</code>, <code className="text-brutal-accent">skip</code>, <code className="text-brutal-accent">queue</code>, or <code className="text-brutal-accent">volume</code>.
              </p>
              <button
                onClick={() => { setFilter('ALL'); setSearch(''); setOnlyVote(false); setOnlyVoice(false); }}
                className="px-4 py-2 bg-brutal-accent text-black font-bold text-xs uppercase border border-black hover:bg-emerald-300 transition-all inline-block"
              >
                RESET FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((cmd) => (
                <div
                  key={cmd.name}
                  onClick={() => setSelectedModalCmd(cmd)}
                  className="border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal-sm hover:border-brutal-accent cursor-pointer transition-all flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-base text-white group-hover:text-brutal-accent transition-colors">
                          /{cmd.name}
                        </span>
                        {cmd.hasPrefix && (
                          <span className="font-mono text-[10px] text-zinc-400">
                            (!{cmd.name})
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[9px] px-2 py-0.5 bg-black border border-brutal-border text-zinc-300 uppercase font-bold">
                        {cmd.category}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                      {cmd.description || 'Executes Discord audio playback routine.'}
                    </p>
                  </div>

                  <div className="border-t border-brutal-border pt-2.5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <div className="flex items-center gap-2">
                      {cmd.voterOnly && (
                        <span className="px-1.5 py-0.5 border border-amber-500 bg-amber-950/30 text-amber-400 font-bold">
                          TOP.GG
                        </span>
                      )}
                      {cmd.inVoiceChannel && (
                        <span className="px-1.5 py-0.5 border border-cyan-500 bg-cyan-950/30 text-cyan-400 font-bold">
                          VOICE
                        </span>
                      )}
                    </div>
                    <span className="text-brutal-accent font-bold group-hover:underline flex items-center gap-1">
                      <span>DETAILS</span> →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section: Command Usage Guidance FAQ */}
        <section className="border-2 border-brutal-border bg-brutal-surface p-6 md:p-8 shadow-brutal space-y-6">
          <div className="border-b-2 border-brutal-border pb-4">
            <span className="text-[10px] uppercase font-bold text-brutal-accent tracking-widest">
              HELP &amp; SYNTAX GUIDANCE
            </span>
            <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight">
              FREQUENTLY ASKED QUESTIONS ABOUT TOGETHER COMMANDS
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-300 font-mono leading-relaxed">
            <div className="space-y-2 border border-brutal-border bg-brutal-bg p-4">
              <h3 className="font-bold text-white text-sm">How do I start playing music in my Discord server?</h3>
              <p>
                Join any voice channel in your Discord server, then type <code className="text-brutal-accent font-bold">/play</code> followed by a song title, YouTube URL, or Spotify playlist link. Together will join immediately and begin streaming 24-bit audio.
              </p>
            </div>
            <div className="space-y-2 border border-brutal-border bg-brutal-bg p-4">
              <h3 className="font-bold text-white text-sm">How do I enable 24/7 channel locking?</h3>
              <p>
                Type <code className="text-brutal-accent font-bold">/247</code> while the bot is connected to your voice channel. Together will lock itself into the room and remain connected even after the music queue ends.
              </p>
            </div>
            <div className="space-y-2 border border-brutal-border bg-brutal-bg p-4">
              <h3 className="font-bold text-white text-sm">How do I open the 3D WebGL Webplayer?</h3>
              <p>
                While music is playing, type <code className="text-brutal-accent font-bold">/nowplaying</code> to receive a direct link to your server's live 3D visualizer stage, or visit our <Link to="/overview" className="text-brutal-accent underline font-bold">Web Player Dashboard</Link>.
              </p>
            </div>
            <div className="space-y-2 border border-brutal-border bg-brutal-bg p-4">
              <h3 className="font-bold text-white text-sm">Are DSP sound filters completely free?</h3>
              <p>
                Yes. All 14 studio DSP filters—including 8D binaural spatial audio, Bassboost, Nightcore, and Vaporwave—are 100% free with zero paid paywalls. Use <code className="text-brutal-accent font-bold">/filter</code> to select your effect.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Command Details Modal */}
      {selectedModalCmd && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedModalCmd(null)}
        >
          <div 
            className="border-2 border-brutal-border bg-brutal-surface max-w-lg w-full p-6 shadow-brutal space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b-2 border-brutal-border pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[9px] px-2 py-0.5 bg-black border border-brutal-border text-brutal-accent font-bold uppercase">
                    {selectedModalCmd.category}
                  </span>
                  {selectedModalCmd.voterOnly && (
                    <span className="font-mono text-[9px] px-2 py-0.5 border border-amber-500 bg-amber-950/40 text-amber-400 font-bold uppercase">
                      TOP.GG VOTER PERK
                    </span>
                  )}
                </div>
                <h3 className="font-display font-black text-2xl text-white">
                  /{selectedModalCmd.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedModalCmd(null)}
                className="px-2.5 py-1 bg-black border border-brutal-border text-zinc-400 hover:text-white font-mono text-xs font-bold"
              >
                ESC
              </button>
            </div>

            <p className="font-mono text-xs text-zinc-300 leading-relaxed">
              {selectedModalCmd.description || 'No description provided.'}
            </p>

            {/* Syntax Box */}
            <div className="space-y-2">
              <div className="border border-brutal-border bg-brutal-bg p-3 space-y-1">
                <span className="font-mono text-[10px] uppercase text-zinc-400 font-bold">
                  SLASH SYNTAX
                </span>
                <p className="font-mono text-xs text-brutal-accent font-bold">
                  /{selectedModalCmd.name}{' '}
                  {selectedModalCmd.slashOptions &&
                    selectedModalCmd.slashOptions.map((o) => `[${o.name}]`).join(' ')}
                </p>
              </div>
              <div className="border border-brutal-border bg-brutal-bg p-3 space-y-1">
                <span className="font-mono text-[10px] uppercase text-zinc-400 font-bold">
                  PREFIX SYNTAX
                </span>
                <p className="font-mono text-xs text-white font-bold">
                  !{selectedModalCmd.name}{' '}
                  {selectedModalCmd.slashOptions &&
                    selectedModalCmd.slashOptions.map((o) => `<${o.name}>`).join(' ')}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-brutal-border pt-4 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400">
                Cooldown: {selectedModalCmd.cooldown || 0}s • Voice: {selectedModalCmd.inVoiceChannel ? 'Required' : 'Not required'}
              </span>
              <button
                onClick={() => setSelectedModalCmd(null)}
                className="px-4 py-1.5 bg-brutal-accent text-black font-bold font-mono text-xs uppercase border border-black hover:bg-emerald-300 transition-all"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <footer className="max-w-7xl w-full mx-auto mt-12 pt-8 border-t-2 border-brutal-border flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-brutal-muted">
        <div>&copy; 2026 Together Music Bot Team. All rights reserved.</div>
        <nav className="flex flex-wrap gap-4 uppercase font-bold text-[11px] justify-center md:justify-start" aria-label="Footer Navigation">
          <Link to="/" className="hover:text-brutal-accent">Home</Link>
          <Link to="/features" className="hover:text-brutal-accent">Features</Link>
          <Link to="/commands" className="hover:text-brutal-accent text-brutal-accent font-bold">Commands</Link>
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
