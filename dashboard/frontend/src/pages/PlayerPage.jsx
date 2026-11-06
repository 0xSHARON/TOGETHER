import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Repeat, 
  Shuffle, 
  Trash2, 
  Radio, 
  Search,
  Sliders,
  ExternalLink,
  Server,
  ChevronDown
} from 'lucide-react';
import { BrutCard, BrutButton } from '../components/Brutalist';

export default function PlayerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [guilds, setMutualGuilds] = useState([]);
  const [guildId, setGuildId] = useState(searchParams.get('guild') || '');

  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Fetch accessible mutual guilds and auto-select
  useEffect(() => {
    fetchMutualGuilds();
  }, []);

  async function fetchMutualGuilds() {
    try {
      const resp = await axios.get('/api/guilds', { withCredentials: true });
      const mutual = resp.data?.mutualGuilds || (resp.data?.guilds || []).filter((g) => g.hasBot);
      setMutualGuilds(mutual);

      const urlGuild = searchParams.get('guild');
      const savedGuild = localStorage.getItem('together_selected_guild');

      let targetId = '';
      if (urlGuild && mutual.some((g) => g.id === urlGuild)) {
        targetId = urlGuild;
      } else if (savedGuild && mutual.some((g) => g.id === savedGuild)) {
        targetId = savedGuild;
      } else if (mutual.length > 0) {
        targetId = mutual[0].id;
      }

      if (targetId) {
        setGuildId(targetId);
        setSearchParams({ guild: targetId }, { replace: true });
        try {
          localStorage.setItem('together_selected_guild', targetId);
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load guilds in player:', err);
    } finally {
      setLoading(false);
    }
  }

  // 2. Fetch player data
  useEffect(() => {
    if (!guildId) return;
    fetchPlayer();
    const interval = setInterval(fetchPlayer, 3000);
    return () => clearInterval(interval);
  }, [guildId]);

  async function fetchPlayer() {
    try {
      const resp = await axios.get(`/api/player/${guildId}`, { withCredentials: true });
      setPlayerData(resp.data);
    } catch (err) {
      setPlayerData(null);
    }
  }

  function handleGuildSwitch(newGuildId) {
    setGuildId(newGuildId);
    setSearchParams({ guild: newGuildId });
    try {
      localStorage.setItem('together_selected_guild', newGuildId);
    } catch {}
  }

  async function sendAction(action, payload = {}) {
    setActionLoading(true);
    try {
      await axios.post(`/api/player/${guildId}/action`, { action, ...payload }, { withCredentials: true });
      await fetchPlayer();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setActionLoading(false);
    }
  }

  function handleSearchPlay(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    sendAction('play', { query: searchQuery.trim() });
    setSearchQuery('');
  }

  if (loading) {
    return (
      <div className="text-center py-24 font-mono text-sm text-brutal-accent animate-pulse">
        [ CONNECTING TO OPUS STREAMING ENGINE... ]
      </div>
    );
  }

  if (!guildId || guilds.length === 0) {
    return (
      <div className="max-w-2xl mx-auto border-2 border-brutal-border bg-brutal-surface p-10 text-center shadow-brutal mt-12 space-y-4">
        <Radio className="w-12 h-12 text-brutal-accent mx-auto" />
        <h2 className="font-display font-black text-2xl text-brutal-text uppercase">NO ACTIVE BOT SERVER</h2>
        <p className="font-mono text-xs text-brutal-muted max-w-md mx-auto">
          You must invite TOGETHER bot into a server you manage to unlock real-time playback controls.
        </p>
        <a href="/servers" className="inline-block mt-2">
          <BrutButton variant="primary">GO TO SERVER SELECTOR</BrutButton>
        </a>
      </div>
    );
  }

  const current = playerData?.current;
  const isPlaying = playerData?.playing;
  const isPaused = playerData?.paused;
  const volume = playerData?.volume || 80;
  const queue = playerData?.queue || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner with Server Switcher & 3D Stage Link */}
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase text-brutal-accent font-black tracking-widest">
            NATIVE OPUS 320KBPS CONTROLLER
          </span>
          <h2 className="font-display font-black text-3xl text-brutal-text uppercase">
            MUSIC PLAYER STAGE
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Server Switcher Dropdown */}
          <div className="relative">
            <select
              value={guildId}
              onChange={(e) => handleGuildSwitch(e.target.value)}
              className="w-full sm:w-60 bg-brutal-bg border-2 border-brutal-border text-brutal-text font-mono text-xs px-3 py-2 appearance-none focus:outline-none focus:border-brutal-accent font-bold"
            >
              {guilds.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-muted pointer-events-none" />
          </div>

          <a 
            href={`https://together.dpdns.org/visualizer/?guild=${guildId}`} 
            target="_blank" 
            rel="noreferrer"
          >
            <BrutButton variant="outline" size="sm" icon={ExternalLink} className="w-full">
              3D STAGE
            </BrutButton>
          </a>
        </div>
      </div>

      {/* Main Player Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Now Playing Card & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <BrutCard className="relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <img 
                src={current?.thumbnail || "https://together.dpdns.org/logo.png"} 
                alt="Album Artwork" 
                className="w-48 h-48 border-2 border-black object-cover shadow-brutal shrink-0" 
              />
              <div className="flex-1 w-full text-center md:text-left overflow-hidden">
                <span className="font-mono text-[10px] px-2 py-0.5 bg-brutal-accent text-black font-black uppercase">
                  {isPlaying ? (isPaused ? "PAUSED" : "NOW STREAMING") : "IDLE"}
                </span>
                <h3 className="font-display font-black text-2xl text-brutal-text truncate mt-2">
                  {current?.title || "No Track Currently Playing"}
                </h3>
                <p className="font-mono text-sm text-brutal-muted truncate mt-0.5">
                  {current?.author || "Join a voice channel and enqueue music."}
                </p>

                {/* Tactical Controls Row */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-6">
                  <BrutButton 
                    variant="secondary" 
                    size="sm" 
                    icon={SkipBack} 
                    onClick={() => sendAction('previous')}
                    disabled={actionLoading}
                  />

                  {isPaused || !isPlaying ? (
                    <BrutButton 
                      variant="primary" 
                      size="md" 
                      icon={Play} 
                      onClick={() => sendAction('resume')}
                      disabled={actionLoading}
                    >
                      RESUME
                    </BrutButton>
                  ) : (
                    <BrutButton 
                      variant="primary" 
                      size="md" 
                      icon={Pause} 
                      onClick={() => sendAction('pause')}
                      disabled={actionLoading}
                    >
                      PAUSE
                    </BrutButton>
                  )}

                  <BrutButton 
                    variant="secondary" 
                    size="sm" 
                    icon={SkipForward} 
                    onClick={() => sendAction('skip')}
                    disabled={actionLoading}
                  />

                  <BrutButton 
                    variant="secondary" 
                    size="sm" 
                    icon={Shuffle} 
                    onClick={() => sendAction('shuffle')}
                    disabled={actionLoading}
                  />

                  <BrutButton 
                    variant="secondary" 
                    size="sm" 
                    icon={Repeat} 
                    onClick={() => sendAction('loop')}
                    disabled={actionLoading}
                  />

                  <BrutButton 
                    variant="danger" 
                    size="sm" 
                    icon={Trash2} 
                    onClick={() => sendAction('stop')}
                    disabled={actionLoading}
                  >
                    DISCONNECT
                  </BrutButton>
                </div>
              </div>
            </div>

            {/* Volume Slider Section */}
            <div className="mt-8 pt-6 border-t border-brutal-border flex items-center gap-4">
              <Volume2 className="w-5 h-5 text-brutal-accent shrink-0" />
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={volume}
                onChange={(e) => sendAction('volume', { value: parseInt(e.target.value) })}
                className="w-full accent-brutal-accent bg-brutal-secondary cursor-pointer h-2"
              />
              <span className="font-mono text-xs font-bold w-12 text-right">{volume}%</span>
            </div>
          </BrutCard>

          {/* Search & Enqueue Input */}
          <BrutCard title="STREAM DISCOVERY ENGINE" subtitle="Enqueue by song title, Spotify, SoundCloud, Apple Music, or direct URL">
            <form onSubmit={handleSearchPlay} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-muted" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Paste URL or enter song name..." 
                  className="w-full bg-brutal-secondary border-2 border-brutal-border pl-10 pr-4 py-2 font-mono text-xs text-brutal-text focus:outline-none focus:border-brutal-accent"
                />
              </div>
              <BrutButton variant="primary" type="submit" disabled={actionLoading || !searchQuery.trim()}>
                PLAY
              </BrutButton>
            </form>
          </BrutCard>
        </div>

        {/* Right: Upcoming Track Queue */}
        <div className="space-y-6">
          <BrutCard 
            title={`UPCOMING QUEUE (${queue.length})`} 
            subtitle="Lossless queue pipeline"
            headerAction={
              queue.length > 0 && (
                <button 
                  onClick={() => sendAction('clearQueue')}
                  className="font-mono text-[10px] text-brutal-danger hover:underline uppercase font-bold"
                >
                  CLEAR QUEUE
                </button>
              )
            }
          >
            {queue.length === 0 ? (
              <p className="font-mono text-xs text-brutal-muted py-6 text-center">
                The queue is empty. Enqueue songs above or using /play in Discord.
              </p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {queue.map((track, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-2.5 bg-brutal-secondary border border-brutal-border hover:border-brutal-accent transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="font-mono text-xs font-bold text-brutal-accent w-4 text-right">
                        {idx + 1}
                      </span>
                      <div className="overflow-hidden">
                        <p className="font-mono font-bold text-xs truncate text-brutal-text">{track.title}</p>
                        <p className="font-mono text-[10px] text-brutal-muted truncate">{track.author}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => sendAction('removeTrack', { index: idx })}
                      className="text-brutal-muted hover:text-brutal-danger p-1"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </BrutCard>
        </div>
      </div>
    </div>
  );
}
