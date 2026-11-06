import React, { useState } from 'react';
import { Terminal, Search, Shield, Zap } from 'lucide-react';
import { BrutCard } from '../components/Brutalist';

export default function CommandsPage() {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const commands = [
    { name: '/play', desc: 'Enqueue a song or playlist from Spotify, YouTube, SoundCloud or Apple Music', cat: 'MUSIC', vote: false },
    { name: '/pause', desc: 'Pause active voice channel playback', cat: 'MUSIC', vote: false },
    { name: '/resume', desc: 'Resume paused track playback', cat: 'MUSIC', vote: false },
    { name: '/skip', desc: 'Skip current playing song', cat: 'MUSIC', vote: false },
    { name: '/stop', desc: 'Stop playback, clear queue and leave voice channel', cat: 'MUSIC', vote: false },
    { name: '/queue', desc: 'Display full upcoming song queue', cat: 'MUSIC', vote: false },
    { name: '/volume', desc: 'Adjust lossless stream volume (1-100%)', cat: 'MUSIC', vote: false },
    { name: '/loop', desc: 'Cycle loop mode (None / Track / Queue)', cat: 'MUSIC', vote: false },
    { name: '/autoplay', desc: 'Automatically find & play similar tracks when queue finishes', cat: 'MUSIC', vote: true },
    { name: '/lyrics', desc: 'Fetch synced lyrics for currently playing song', cat: 'MUSIC', vote: true },
    { name: '/visualizer', desc: 'Launch link to 3D WebGL reactive sound stage', cat: 'MUSIC', vote: false },
    { name: '/filter', desc: 'Apply studio DSP filters: Bassboost, Nightcore, 8D Spatial, Vaporwave', cat: 'MUSIC', vote: false },
    { name: '/247', desc: 'Toggle 24/7 persistent voice connection in channel', cat: 'CONFIG', vote: true },
    { name: '/setprefix', desc: 'Change custom prefix for the current server', cat: 'CONFIG', vote: false },
    { name: '/lb', desc: 'Display brutalist podium leaderboard and top listeners', cat: 'INFO', vote: false },
    { name: '/profile', desc: 'View listening statistics, XP level and rank canvas card', cat: 'INFO', vote: false },
    { name: '/vote', desc: 'Vote for TOGETHER on Top.gg and receive voter perks', cat: 'INFO', vote: false }
  ];

  const categories = ['ALL', 'MUSIC', 'CONFIG', 'INFO'];

  const filtered = commands.filter(c => {
    const matchCat = filter === 'ALL' || c.cat === filter;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-xs uppercase text-brutal-accent font-black tracking-widest">
            SYNCHRONIZED COMMAND REGISTRY
          </span>
          <h2 className="font-display font-black text-3xl text-brutal-text uppercase mt-1">
            SLASH & PREFIX COMMANDS CATALOG
          </h2>
          <p className="font-mono text-xs text-brutal-muted mt-1">
            Complete list of 67 registered slash commands and 69 prefix utilities.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 font-mono text-xs font-bold uppercase border-2 transition-all ${
                filter === cat
                  ? "bg-brutal-accent text-black border-black shadow-brutal-sm"
                  : "bg-brutal-surface text-brutal-text border-brutal-border hover:bg-brutal-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-72">
          <input 
            type="text" 
            placeholder="Search commands..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brutal-surface border-2 border-brutal-border px-3 py-2 font-mono text-xs text-brutal-text focus:outline-none focus:border-brutal-accent"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cmd) => (
          <div key={cmd.name} className="border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono font-bold text-sm text-brutal-accent">{cmd.name}</span>
                {cmd.vote && (
                  <span className="font-mono text-[9px] px-1.5 py-0.5 border border-amber-600 bg-amber-950/40 text-amber-400 font-bold uppercase">
                    ⭐ TOP.GG VOTE
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-brutal-muted">{cmd.desc}</p>
            </div>
            <div className="mt-4 pt-2 border-t border-brutal-border flex justify-between items-center text-[10px] font-mono text-brutal-muted uppercase">
              <span>CATEGORY: {cmd.cat}</span>
              <span>SLASH / PREFIX</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

