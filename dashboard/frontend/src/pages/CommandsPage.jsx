import React, { useState, useEffect } from 'react';
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
  Filter
} from 'lucide-react';
import { BrutCard, StatBox } from '../components/Brutalist';
import SEO from '../components/SEO';

const DEFAULT_TOPGG_URL = "https://top.gg/bot/863496211667484676/vote";

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
        // Exclude owner commands strictly
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

  // Filter commands by Category, Search, Vote, Voice (Strictly excluding Owner)
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <SEO 
        title="Commands — Together Music Bot & Webplayer"
        description="Browse all 69+ Together Music Bot commands for Discord. Full slash and prefix syntax for playing music, 14 DSP audio filters, 24/7 playback, and playlists."
        canonical="https://dash.together.dpdns.org/commands"
      />
      {/* Brutalist Header Banner */}
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase bg-brutal-accent text-black font-black px-2 py-0.5 tracking-widest">
              LIVE SYSTEM CATALOG
            </span>
            <span className="font-mono text-xs text-brutal-muted">v2.4.0 ENGINE</span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-brutal-text uppercase tracking-tight">
            DISCORD MUSIC BOT COMMANDS
          </h1>
          <p className="font-mono text-xs text-brutal-muted mt-1 max-w-2xl">
            Complete synchronized inventory of all {stats.total} public Discord slash interactions and prefix utilities powering TOGETHER.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={topggVoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border-2 border-amber-500 bg-amber-950/30 text-amber-400 font-mono text-xs font-bold px-3 py-2 hover:bg-amber-500 hover:text-black transition-all"
          >
            <Star className="w-4 h-4 fill-amber-400" />
            TOP.GG PERKS
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatBox
          label="PUBLIC COMMANDS"
          value={loading ? '...' : stats.total}
          sub="Synchronized registry"
          accent
        />
        <StatBox
          label="SLASH COMMANDS"
          value={loading ? '...' : stats.slashCount}
          sub="Discord interactions"
        />
        <StatBox
          label="PREFIX UTILITIES"
          value={loading ? '...' : stats.prefixCount}
          sub="Text-based commands"
        />
        <StatBox
          label="VOTER-LOCKED"
          value={loading ? '...' : stats.voterOnlyCount}
          sub="Top.gg exclusive"
        />
      </div>

      {/* Category Pills & Filters */}
      <div className="border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 md:gap-2">
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

          {/* Quick Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyVote(!onlyVote)}
              className={`px-2.5 py-1 font-mono text-[11px] font-bold border-2 transition-all flex items-center gap-1 ${
                onlyVote
                  ? 'border-amber-400 bg-amber-400 text-black'
                  : 'border-brutal-border text-brutal-muted hover:border-amber-400 hover:text-amber-400'
              }`}
            >
              <Star className="w-3 h-3" />
              TOP.GG VOTE
            </button>
            <button
              onClick={() => setOnlyVoice(!onlyVoice)}
              className={`px-2.5 py-1 font-mono text-[11px] font-bold border-2 transition-all flex items-center gap-1 ${
                onlyVoice
                  ? 'border-brutal-accent bg-brutal-accent text-black'
                  : 'border-brutal-border text-brutal-muted hover:border-brutal-accent hover:text-brutal-accent'
              }`}
            >
              <Mic className="w-3 h-3" />
              VOICE CHANNEL
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-muted" />
          <label id="commands-page-search-label" htmlFor="commands-page-search" className="sr-only">Search Discord Commands</label>
          <input
            id="commands-page-search"
            name="commands-search"
            type="text"
            aria-label="Search public commands by name, aliases, description, or parameter"
            aria-labelledby="commands-page-search-label"
            title="Search Discord commands"
            placeholder="Search public commands by name, aliases, description, or parameter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brutal-bg border-2 border-brutal-border pl-10 pr-4 py-2.5 font-mono text-xs text-brutal-text placeholder-brutal-muted focus:outline-none focus:border-brutal-accent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-brutal-muted hover:text-brutal-text uppercase"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between font-mono text-xs text-brutal-muted">
        <span>
          SHOWING <strong className="text-brutal-accent">{filtered.length}</strong> COMMANDS
          {filter !== 'ALL' && ` IN ${filter}`}
          {search && ` MATCHING "${search}"`}
        </span>
        <span className="text-[10px] uppercase">
          CLICK ANY COMMAND TO INSPECT PARAMETERS & SYNTAX
        </span>
      </div>

      {/* Commands Grid */}
      {loading ? (
        <div className="text-center py-20 font-mono text-sm text-brutal-muted animate-pulse">
          INITIALIZING COMMAND REGISTRY & RETRIEVING DISCORD SCHEMAS...
        </div>
      ) : filtered.length === 0 ? (
        <div className="border-2 border-brutal-border bg-brutal-surface p-12 text-center shadow-brutal space-y-3">
          <Command className="w-10 h-10 text-brutal-muted mx-auto" />
          <h4 className="font-display font-black text-xl text-brutal-text uppercase">
            NO MATCHING COMMANDS FOUND
          </h4>
          <p className="font-mono text-xs text-brutal-muted max-w-md mx-auto">
            No registered commands matched your current category, search term, or filters.
          </p>
          <button
            onClick={() => {
              setFilter('ALL');
              setSearch('');
              setOnlyVote(false);
              setOnlyVoice(false);
            }}
            className="px-4 py-2 border-2 border-brutal-accent bg-brutal-accent text-black font-mono text-xs font-bold uppercase mt-2 hover:bg-black hover:text-brutal-accent transition-all"
          >
            RESET ALL FILTERS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cmd) => (
            <div
              key={cmd.name}
              className="border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal-sm hover:border-brutal-accent transition-all flex flex-col justify-between cursor-pointer group"
              onClick={() => setSelectedModalCmd(cmd)}
            >
              <div>
                {/* Top Bar: Name & Badges */}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-bold text-base text-brutal-accent group-hover:underline">
                      /{cmd.name}
                    </span>
                    {cmd.aliases && cmd.aliases.length > 0 && (
                      <span className="font-mono text-[10px] text-brutal-muted">
                        (!{cmd.aliases[0]})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    {cmd.voterOnly && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 border border-amber-600 bg-amber-950/40 text-amber-400 font-bold uppercase flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        VOTE
                      </span>
                    )}
                    {cmd.inVoiceChannel && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 border border-cyan-800 bg-cyan-950/40 text-cyan-400 font-bold uppercase">
                        VC
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="font-mono text-xs text-brutal-muted leading-relaxed line-clamp-2 mb-3">
                  {cmd.description}
                </p>

                {/* Slash Parameters Pills */}
                {cmd.slashOptions && cmd.slashOptions.length > 0 && (
                  <div className="mb-3 space-y-1">
                    <span className="font-mono text-[9px] text-brutal-muted uppercase block">
                      PARAMETERS ({cmd.slashOptions.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cmd.slashOptions.map((opt, idx) => (
                        <span
                          key={idx}
                          className={`font-mono text-[10px] px-1.5 py-0.5 border ${
                            opt.required
                              ? 'border-brutal-accent/50 bg-brutal-accent/10 text-brutal-accent font-bold'
                              : 'border-brutal-border bg-brutal-bg text-brutal-muted'
                          }`}
                        >
                          {opt.name}
                          {opt.required && '*'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="mt-3 pt-2.5 border-t border-brutal-border flex justify-between items-center text-[10px] font-mono text-brutal-muted uppercase">
                <div className="flex items-center gap-2">
                  <span className="text-brutal-text font-bold">{cmd.category}</span>
                  {cmd.cooldown > 0 && (
                    <span>• {cmd.cooldown}s CD</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {cmd.hasSlash && (
                    <span className="px-1 border border-brutal-border bg-brutal-bg text-[9px] text-emerald-400 font-bold">
                      SLASH
                    </span>
                  )}
                  {cmd.hasPrefix && (
                    <span className="px-1 border border-brutal-border bg-brutal-bg text-[9px] text-zinc-400 font-bold">
                      PREFIX
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Command Modal */}
      {selectedModalCmd && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedModalCmd(null)}
        >
          <div
            className="border-2 border-brutal-border bg-brutal-surface max-w-2xl w-full p-6 shadow-brutal space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-brutal-border pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] uppercase bg-brutal-accent text-black font-black px-2 py-0.5">
                    {selectedModalCmd.category}
                  </span>
                  {selectedModalCmd.voterOnly && (
                    <a
                      href={topggVoteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] border border-amber-600 bg-amber-950/40 text-amber-400 font-bold px-2 py-0.5 hover:bg-amber-500 hover:text-black transition-all flex items-center gap-1"
                    >
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      TOP.GG VOTE REQUIRED
                    </a>
                  )}
                </div>
                <h3 className="font-display font-black text-3xl text-brutal-text uppercase">
                  /{selectedModalCmd.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedModalCmd(null)}
                className="border-2 border-brutal-border px-3 py-1 font-mono text-xs font-bold text-brutal-muted hover:text-white hover:border-white uppercase"
              >
                CLOSE [ESC]
              </button>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase text-brutal-accent font-black tracking-wider">
                FUNCTIONALITY
              </span>
              <p className="font-mono text-xs text-brutal-text leading-relaxed bg-brutal-bg p-3 border border-brutal-border">
                {selectedModalCmd.description}
              </p>
            </div>

            {/* Syntax & Usage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-brutal-border bg-brutal-bg p-3 space-y-1">
                <span className="font-mono text-[10px] uppercase text-emerald-400 font-bold">
                  SLASH SYNTAX
                </span>
                <p className="font-mono text-xs text-brutal-text font-bold">
                  /{selectedModalCmd.name}{' '}
                  {selectedModalCmd.slashOptions &&
                    selectedModalCmd.slashOptions.map((o) => `[${o.name}]`).join(' ')}
                </p>
              </div>
              <div className="border border-brutal-border bg-brutal-bg p-3 space-y-1">
                <span className="font-mono text-[10px] uppercase text-zinc-400 font-bold">
                  PREFIX SYNTAX
                </span>
                <p className="font-mono text-xs text-brutal-text font-bold">
                  !{selectedModalCmd.name}{' '}
                  {selectedModalCmd.slashOptions &&
                    selectedModalCmd.slashOptions.map((o) => `<${o.name}>`).join(' ')}
                </p>
              </div>
            </div>

            {/* Options List */}
            {selectedModalCmd.slashOptions && selectedModalCmd.slashOptions.length > 0 && (
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase text-brutal-accent font-black tracking-wider">
                  ARGUMENTS & OPTIONS ({selectedModalCmd.slashOptions.length})
                </span>
                <div className="border border-brutal-border divide-y divide-brutal-border bg-brutal-bg">
                  {selectedModalCmd.slashOptions.map((opt, i) => (
                    <div key={i} className="p-2.5 flex items-start justify-between gap-4 font-mono text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-brutal-accent">{opt.name}</strong>
                          <span
                            className={`text-[9px] px-1 py-0.2 border ${
                              opt.required
                                ? 'border-red-600 bg-red-950/30 text-red-400 font-bold'
                                : 'border-brutal-border text-brutal-muted'
                            }`}
                          >
                            {opt.required ? 'REQUIRED' : 'OPTIONAL'}
                          </span>
                        </div>
                        <p className="text-brutal-muted text-[11px] mt-0.5">
                          {opt.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata Badges */}
            <div className="border-t border-brutal-border pt-4 flex flex-wrap gap-4 font-mono text-xs text-brutal-muted">
              <div>
                <span className="text-[10px] uppercase block">ALIASES:</span>
                <span className="text-brutal-text font-bold">
                  {selectedModalCmd.aliases && selectedModalCmd.aliases.length > 0
                    ? selectedModalCmd.aliases.map((a) => `!${a}`).join(', ')
                    : 'None'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase block">COOLDOWN:</span>
                <span className="text-brutal-text font-bold">{selectedModalCmd.cooldown || 0} seconds</span>
              </div>
              <div>
                <span className="text-[10px] uppercase block">VOICE CHANNEL:</span>
                <span className="text-brutal-text font-bold">
                  {selectedModalCmd.inVoiceChannel ? 'Required' : 'Not required'}
                </span>
              </div>
              {selectedModalCmd.botPerms && selectedModalCmd.botPerms.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase block">BOT PERMISSIONS:</span>
                  <span className="text-brutal-text font-bold">{selectedModalCmd.botPerms.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
