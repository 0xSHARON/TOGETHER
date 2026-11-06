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
  ChevronDown,
  Shield,
  Flame,
  Music,
  CheckCircle2,
  Users
} from 'lucide-react';
import { BrutCard, BrutButton } from '../components/Brutalist';

function formatTime(ms) {
  if (!ms || isNaN(ms)) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export default function PlayerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [guilds, setMutualGuilds] = useState([]);
  const [guildId, setGuildId] = useState(searchParams.get('guild') || '');

  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

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

  // 2. Fetch player data periodically
  useEffect(() => {
    if (!guildId) return;
    fetchPlayer();
    const interval = setInterval(fetchPlayer, 2500);
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
    setStatusMsg('');
    try {
      await axios.post(`/api/player/${guildId}/action`, { action, ...payload }, { withCredentials: true });
      setStatusMsg(`Action "${action}" dispatched successfully.`);
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
  const isPlaying = Boolean(playerData?.playing && current);
  const isPaused = Boolean(playerData?.paused);
  const volume = playerData?.volume || 80;
  const queue = playerData?.queue || [];
  const is247 = Boolean(playerData?.is247);
  const isAutoplay = Boolean(playerData?.autoplay);
  const loopMode = playerData?.loop || 'none';
  const voiceChannel = playerData?.voiceChannel || 'Not in Voice';
  const listeners = playerData?.listeners || 0;

  const position = playerData?.position || 0;
  const duration = current?.duration || 0;
  const progressPercent = duration > 0 ? Math.min(100, Math.round((position / duration) * 100)) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-mono">
      {/* Top Banner with Server Switcher & Active Telemetry Chips */}
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase text-brutal-accent font-black tracking-widest block">
            NATIVE 24-BIT OPUS CONTROLLER
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

          <a href={`/settings?guild=${guildId}`}>
            <BrutButton variant="secondary" size="sm" icon={Sliders} className="w-full">
              SETTINGS
            </BrutButton>
          </a>
        </div>
      </div>

      {/* Live Server Telemetry Bar: Shows 24/7, Autoplay, Voice Channel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 24/7 Status Badge */}
        <div className={`p-3 border-2 ${is247 ? 'border-brutal-accent bg-brutal-accent/10' : 'border-zinc-800 bg-zinc-900'} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 ${is247 ? 'text-brutal-accent' : 'text-zinc-500'}`} />
            <div>
              <span className="text-[10px] text-zinc-400 block font-bold">24/7 PERSISTENCE</span>
              <span className={`text-xs font-black uppercase ${is247 ? 'text-brutal-accent' : 'text-zinc-500'}`}>
                {is247 ? 'LOCKED & ACTIVE' : 'DISABLED'}
              </span>
            </div>
          </div>
        </div>

        {/* Autoplay Status Toggle */}
        <button
          onClick={() => sendAction('autoplay')}
          disabled={actionLoading}
          className={`p-3 border-2 text-left transition-all ${isAutoplay ? 'border-amber-400 bg-amber-400/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'} flex items-center justify-between`}
        >
          <div className="flex items-center gap-2">
            <Flame className={`w-4 h-4 ${isAutoplay ? 'text-amber-400' : 'text-zinc-500'}`} />
            <div>
              <span className="text-[10px] text-zinc-400 block font-bold">AUTOPLAY MODE</span>
              <span className={`text-xs font-black uppercase ${isAutoplay ? 'text-amber-400' : 'text-zinc-500'}`}>
                {isAutoplay ? 'ENABLED (CLICK TO OFF)' : 'DISABLED (CLICK TO ON)'}
              </span>
            </div>
          </div>
        </button>

        {/* Voice Channel Info */}
        <div className="p-3 border-2 border-zinc-800 bg-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] text-zinc-400 block font-bold truncate">VOICE CHANNEL</span>
              <span className="text-xs font-bold text-white truncate block">
                {voiceChannel}
              </span>
            </div>
          </div>
        </div>

        {/* Listeners Info */}
        <div className="p-3 border-2 border-zinc-800 bg-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-[10px] text-zinc-400 block font-bold">AUDIENCE</span>
              <span className="text-xs font-bold text-white">
                {listeners} Listeners
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Player Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Now Playing Card & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <BrutCard className="relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <img 
                src={current?.thumbnail || "/logo.png"} 
                alt="Album Artwork" 
                className="w-44 h-44 border-2 border-black object-cover shadow-brutal shrink-0 bg-black" 
              />
              <div className="flex-1 w-full text-center md:text-left overflow-hidden space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className={`font-mono text-[10px] px-2 py-0.5 font-black uppercase ${
                    isPlaying 
                      ? (isPaused ? "bg-amber-400 text-black" : "bg-brutal-accent text-black") 
                      : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {isPlaying ? (isPaused ? "PAUSED" : "NOW PLAYING") : "IDLE STANDBY"}
                  </span>
                  {current?.requester && (
                    <span className="text-[10px] text-zinc-400">
                      Req by: <strong className="text-white">{current.requester}</strong>
                    </span>
                  )}
                </div>

                <h3 className="font-display font-black text-2xl text-brutal-text truncate">
                  {current?.title || "No Track Currently Playing"}
                </h3>
                <p className="font-mono text-xs text-brutal-muted truncate">
                  {current?.author || "Use the search bar below or /play in Discord to stream music."}
                </p>

                {/* Progress / Seek Bar */}
                {duration > 0 && (
                  <div className="pt-2 space-y-1">
                    <div className="w-full h-2 bg-zinc-900 border border-zinc-700 overflow-hidden">
                      <div 
                        className="h-full bg-brutal-accent" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>{formatTime(position)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                )}

                {/* Tactical Controls Row */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                  <BrutButton 
                    variant="secondary" 
                    size="sm" 
                    icon={SkipBack} 
                    onClick={() => sendAction('previous')}
                    disabled={actionLoading}
                    title="Previous Track"
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
                    title="Skip Track"
                  />

                  <BrutButton 
                    variant="secondary" 
                    size="sm" 
                    icon={Shuffle} 
                    onClick={() => sendAction('shuffle')}
                    disabled={actionLoading}
                    title="Shuffle Queue"
                  />

                  <BrutButton 
                    variant="secondary" 
                    size="sm" 
                    icon={Repeat} 
                    onClick={() => sendAction('loop')}
                    disabled={actionLoading}
                    title={`Loop Mode: ${loopMode}`}
                  >
                    {loopMode !== 'none' ? loopMode.toUpperCase() : ''}
                  </BrutButton>

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
            <div className="mt-6 pt-4 border-t border-brutal-border flex items-center gap-4">
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
          <BrutCard title="SEARCH & PLAY SONG" subtitle="Enqueue by song title, Spotify, SoundCloud, Apple Music, or direct URL">
            <form onSubmit={handleSearchPlay} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-muted" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter song name or paste link..." 
                  className="w-full bg-brutal-secondary border-2 border-brutal-border pl-10 pr-4 py-2.5 font-mono text-xs text-brutal-text focus:outline-none focus:border-brutal-accent font-bold"
                />
              </div>
              <BrutButton variant="primary" type="submit" disabled={actionLoading || !searchQuery.trim()}>
                PLAY SONG
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
                  className="font-mono text-[10px] text-red-400 hover:underline uppercase font-bold"
                >
                  CLEAR QUEUE
                </button>
              )
            }
          >
            {queue.length === 0 ? (
              <p className="font-mono text-xs text-brutal-muted py-8 text-center border border-dashed border-zinc-800">
                The queue is empty. Enqueue songs on the left or use <code className="text-brutal-accent">/play</code> in Discord.
              </p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {queue.map((track, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-2.5 bg-brutal-secondary border border-brutal-border hover:border-brutal-accent transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="font-mono text-xs font-bold text-brutal-accent w-5 text-right shrink-0">
                        {idx + 1}
                      </span>
                      <div className="overflow-hidden">
                        <p className="font-mono font-bold text-xs truncate text-brutal-text">{track.title}</p>
                        <p className="font-mono text-[10px] text-brutal-muted truncate">
                          {track.author} {track.duration ? `• ${formatTime(track.duration)}` : ''}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => sendAction('removeTrack', { index: idx })}
                      className="text-zinc-500 hover:text-red-400 p-1 shrink-0 transition-colors"
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
