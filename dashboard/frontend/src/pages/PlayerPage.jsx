import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  Shield,
  Flame,
  Users,
  MicOff,
  Headphones,
  CheckCircle2,
  Sparkles,
  Music,
  RefreshCw,
  RadioTower
} from 'lucide-react';
import { BrutCard, BrutButton } from '../components/Brutalist';
import SEO from '../components/SEO';

function formatTime(ms) {
  if (!ms || isNaN(ms)) return "0:00";
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
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

  // Autocomplete search states
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchDebounceRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Local optimistic audio volume
  const [localVolume, setLocalVolume] = useState(80);
  const volumeDebounceRef = useRef(null);

  // Smooth client-side playback progress bar interpolation
  const [interpolatedPos, setInterpolatedPos] = useState(0);
  const lastSyncRef = useRef({ pos: 0, time: Date.now(), playing: false });

  // 1. Fetch accessible mutual guilds and auto-select active playing server
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
      } else {
        // Auto-select actively playing guild first!
        const playingGuild = mutual.find((g) => g.isPlaying);
        if (playingGuild) {
          targetId = playingGuild.id;
        } else if (savedGuild && mutual.some((g) => g.id === savedGuild)) {
          targetId = savedGuild;
        } else if (mutual.length > 0) {
          targetId = mutual[0].id;
        }
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

  // 2. Fetch player data periodically (1000ms low-latency interval)
  useEffect(() => {
    if (!guildId) return;
    fetchPlayer();
    const interval = setInterval(fetchPlayer, 1000);
    return () => clearInterval(interval);
  }, [guildId]);

  async function fetchPlayer() {
    try {
      const resp = await axios.get(`/api/player/${guildId}`, { withCredentials: true });
      const data = resp.data;
      setPlayerData(data);

      if (data) {
        const rawPos = data.position || 0;
        const isNowPlaying = Boolean(data.playing && !data.paused && data.current);
        lastSyncRef.current = {
          pos: rawPos,
          time: data.timestamp || Date.now(),
          playing: isNowPlaying
        };
        setInterpolatedPos(rawPos);
        if (typeof data.volume === 'number' && !volumeDebounceRef.current) {
          setLocalVolume(data.volume);
        }
      }
    } catch (err) {
      setPlayerData(null);
    }
  }

  // Real-time client-side progress tick every 200ms
  const currentDuration = playerData?.current?.duration || 0;
  useEffect(() => {
    const timer = setInterval(() => {
      const { pos, time, playing } = lastSyncRef.current;
      if (playing && currentDuration > 0) {
        const elapsed = Math.max(0, Date.now() - time);
        const est = Math.min(currentDuration, pos + elapsed);
        setInterpolatedPos(est);
      }
    }, 200);
    return () => clearInterval(timer);
  }, [currentDuration]);

  function handleGuildSwitch(newGuildId) {
    setGuildId(newGuildId);
    setSearchParams({ guild: newGuildId });
    setPlayerData(null);
    try {
      localStorage.setItem('together_selected_guild', newGuildId);
    } catch {}
  }

  async function sendAction(action, payload = {}) {
    setActionLoading(true);
    setStatusMsg('');

    // Optimistic UI updates
    if (action === 'pause') {
      lastSyncRef.current.playing = false;
      setPlayerData((prev) => prev ? { ...prev, paused: true } : prev);
    } else if (action === 'resume') {
      lastSyncRef.current.playing = true;
      lastSyncRef.current.time = Date.now();
      setPlayerData((prev) => prev ? { ...prev, paused: false } : prev);
    } else if (action === 'autoplay') {
      setPlayerData((prev) => prev ? { ...prev, autoplay: !prev.autoplay } : prev);
    } else if (action === 'seek' && payload.position !== undefined) {
      lastSyncRef.current.pos = payload.position;
      lastSyncRef.current.time = Date.now();
      setInterpolatedPos(payload.position);
    }

    try {
      await axios.post(`/api/player/${guildId}/action`, { action, ...payload }, { withCredentials: true });
      setStatusMsg(`Action "${action}" synced successfully.`);
      await fetchPlayer();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setActionLoading(false);
    }
  }

  // Handle outside click to close autocomplete dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleVolumeChange(e) {
    const newVol = parseInt(e.target.value, 10);
    setLocalVolume(newVol);
    if (volumeDebounceRef.current) {
      clearTimeout(volumeDebounceRef.current);
    }
    volumeDebounceRef.current = setTimeout(() => {
      volumeDebounceRef.current = null;
      sendAction('volume', { value: newVol });
    }, 150);
  }

  function handleSeekClick(e) {
    if (!duration || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const seekMs = Math.round(percent * duration);
    sendAction('seek', { position: seekMs });
  }

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchQuery(val);
    setSelectedIndex(-1);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    const trimmed = val.trim();
    if (trimmed.length < 2) {
      setSearchSuggestions([]);
      setShowDropdown(false);
      setSearchLoading(false);
      return;
    }

    if (playerData && playerData.userInVoice === false) {
      setSearchSuggestions([]);
      setShowDropdown(false);
      setSearchLoading(false);
      return;
    }

    // Direct stream URLs don't need text search autocomplete
    if (/^https?:\/\//i.test(trimmed)) {
      setSearchSuggestions([]);
      setShowDropdown(false);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const resp = await axios.get(
          `/api/player/${guildId}/search?q=${encodeURIComponent(trimmed)}`,
          { withCredentials: true }
        );
        if (resp.data?.inVoice === false) {
          setSearchSuggestions([]);
          setShowDropdown(false);
          return;
        }
        const tracks = resp.data?.tracks || [];
        setSearchSuggestions(tracks);
        setShowDropdown(tracks.length > 0);
      } catch (err) {
        console.warn("Search autocomplete failed:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 280);
  }

  function handleSearchKeyDown(e) {
    if (showDropdown && searchSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % searchSuggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev <= 0 ? searchSuggestions.length - 1 : prev - 1));
        return;
      }
      if (e.key === 'Escape') {
        setShowDropdown(false);
        return;
      }
      if (e.key === 'Enter') {
        if (selectedIndex >= 0 && searchSuggestions[selectedIndex]) {
          e.preventDefault();
          executeSelectTrack(searchSuggestions[selectedIndex], false);
          return;
        }
      }
    }
  }

  function executeSelectTrack(track, playNow = false) {
    if (!track) return;
    if (playerData && playerData.userInVoice === false) {
      alert("You must be connected to a voice channel in this server to play or enqueue music.");
      return;
    }
    const query = track.uri || `${track.title} ${track.author}`;
    sendAction('play', { query, playNow });
    setShowDropdown(false);
    setSearchQuery('');
  }

  function executeDirectPlay(url, playNow = false) {
    if (!url.trim()) return;
    if (playerData && playerData.userInVoice === false) {
      alert("You must be connected to a voice channel in this server to play or enqueue music.");
      return;
    }
    sendAction('play', { query: url.trim(), playNow });
    setSearchQuery('');
  }

  function getSourceBadgeClass(src) {
    switch (src) {
      case 'spotify': return 'border-emerald-500 text-emerald-400 bg-emerald-950/40';
      case 'soundcloud': return 'border-orange-500 text-orange-400 bg-orange-950/40';
      case 'apple': return 'border-pink-500 text-pink-400 bg-pink-950/40';
      case 'youtube': return 'border-red-500 text-red-400 bg-red-950/40';
      default: return 'border-zinc-500 text-zinc-400 bg-zinc-900';
    }
  }

  function handleSearchPlay(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (playerData && playerData.userInVoice === false) {
      alert("You must be connected to a voice channel in this server to play or enqueue music.");
      return;
    }
    if (selectedIndex >= 0 && searchSuggestions[selectedIndex]) {
      executeSelectTrack(searchSuggestions[selectedIndex], false);
    } else {
      sendAction('play', { query: searchQuery.trim(), playNow: false });
      setSearchQuery('');
      setShowDropdown(false);
    }
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
      <div className="max-w-2xl mx-auto border-2 border-brutal-border bg-brutal-surface p-10 text-center shadow-brutal mt-12 space-y-4 font-mono">
        <Radio className="w-12 h-12 text-brutal-accent mx-auto" />
        <h2 className="font-display font-black text-2xl text-brutal-text uppercase">NO ACCESSIBLE BOT SERVERS</h2>
        <p className="font-mono text-xs text-brutal-muted max-w-md mx-auto">
          You must be in a Discord server where TOGETHER bot is installed to stream and control music.
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
  const queue = playerData?.queue || [];
  const is247 = Boolean(playerData?.is247);
  const isAutoplay = Boolean(playerData?.autoplay);
  const loopMode = playerData?.loop || 'none';
  const voiceChannel = playerData?.voiceChannel || 'Not in Voice';
  const listeners = playerData?.listeners || 0;
  const audienceMembers = playerData?.audienceMembers || [];

  const trimmedQuery = searchQuery.trim();
  const isDirectLink = /^https?:\/\//i.test(trimmedQuery);
  let directLinkPlatform = "Direct Audio Link";
  if (trimmedQuery.includes("spotify.com")) directLinkPlatform = "Spotify (Track/Album/Playlist)";
  else if (trimmedQuery.includes("soundcloud.com")) directLinkPlatform = "SoundCloud Stream";
  else if (trimmedQuery.includes("apple.com")) directLinkPlatform = "Apple Music";
  else if (trimmedQuery.includes("youtube.com") || trimmedQuery.includes("youtu.be")) directLinkPlatform = "YouTube Stream";

  const duration = current?.duration || 0;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (interpolatedPos / duration) * 100)) : 0;

  // Check if any other guild is actively streaming music
  const otherPlayingGuild = guilds.find((g) => g.id !== guildId && g.isPlaying);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-mono">
      <SEO 
        title="Webplayer & Audio Controller — TOGETHER Discord Music Bot"
        description="Stream, control, and visualize Discord music in real time with the TOGETHER webplayer. Search tracks, adjust 14 DSP audio filters, manage queue, and toggle 24/7."
        canonical="https://dash.together.dpdns.org/player"
      />
      {/* Notice Banner: If another guild has active playback, give 1-click switch */}
      {otherPlayingGuild && !isPlaying && (
        <div className="border-2 border-brutal-accent bg-brutal-accent/15 p-4 shadow-brutal flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <RadioTower className="w-5 h-5 text-brutal-accent shrink-0" />
            <div>
              <span className="text-xs font-black text-white uppercase tracking-wider block">
                ACTIVE PLAYBACK DETECTED IN ANOTHER SERVER
              </span>
              <p className="text-xs text-zinc-300">
                Music is currently playing live in <strong className="text-brutal-accent">"{otherPlayingGuild.name}"</strong>
                {otherPlayingGuild.currentTrack?.title ? ` (${otherPlayingGuild.currentTrack.title})` : ''}.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleGuildSwitch(otherPlayingGuild.id)}
            className="px-4 py-2 bg-brutal-accent text-black font-black text-xs uppercase border-2 border-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 shrink-0"
          >
            SWITCH TO "{otherPlayingGuild.name.slice(0, 16)}"
          </button>
        </div>
      )}

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
          {/* Server Switcher Dropdown with [NOW PLAYING] Badges */}
          <div className="relative">
            <select
              value={guildId}
              onChange={(e) => handleGuildSwitch(e.target.value)}
              className="w-full sm:w-64 bg-brutal-bg border-2 border-brutal-border text-brutal-text font-mono text-xs px-3 py-2 appearance-none focus:outline-none focus:border-brutal-accent font-bold"
            >
              {guilds.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.isPlaying ? "● [NOW PLAYING] " : ""}{g.name}
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

      {/* Live Server Telemetry Bar: Shows 24/7, Autoplay, Voice Channel, Audience */}
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
                {listeners} {listeners === 1 ? 'Listener' : 'Listeners'}
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
              <div className="relative shrink-0">
                <img 
                  src={current?.thumbnail || "/logo.png"} 
                  alt="Album Artwork" 
                  className="w-44 h-44 border-2 border-black object-cover shadow-brutal bg-black" 
                />
                {current?.isStream && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white font-mono text-[9px] font-black uppercase tracking-wider border border-black shadow-brutal-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE STREAM
                  </span>
                )}
              </div>

              <div className="flex-1 w-full text-center md:text-left overflow-hidden space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className={`font-mono text-[10px] px-2 py-0.5 font-black uppercase ${
                    isPlaying 
                      ? (isPaused ? "bg-amber-400 text-black" : "bg-brutal-accent text-black") 
                      : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {isPlaying ? (isPaused ? "PAUSED" : "NOW PLAYING") : "IDLE STANDBY"}
                  </span>

                  {current?.requester && (
                    <div className="flex items-center gap-1.5 bg-black/60 px-2 py-0.5 border border-zinc-800 text-[10px] text-zinc-400">
                      {current.requesterAvatar && (
                        <img 
                          src={current.requesterAvatar} 
                          alt="Requester" 
                          className="w-3.5 h-3.5 rounded-full object-cover" 
                        />
                      )}
                      <span>Req by: <strong className="text-white">{current.requester}</strong></span>
                    </div>
                  )}

                  {current?.uri && (
                    <a 
                      href={current.uri} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-zinc-400 hover:text-white transition-colors"
                      title="Open source URL"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <h3 className="font-display font-black text-2xl text-brutal-text truncate">
                  {current?.title || "No Track Currently Playing"}
                </h3>
                <p className="font-mono text-xs text-brutal-muted truncate">
                  {current?.author || "Use the search bar below or /play in Discord to stream music."}
                </p>

                {/* Interactive Seek Bar with Real-Time Progress */}
                {duration > 0 && (
                  <div className="pt-2 space-y-1">
                    <div 
                      onClick={handleSeekClick}
                      className="w-full h-3 bg-zinc-900 border border-zinc-700 overflow-hidden cursor-pointer relative group"
                      title="Click anywhere to seek track"
                    >
                      <div 
                        className="h-full bg-brutal-accent transition-[width] duration-200" 
                        style={{ width: `${progressPercent}%` }}
                      />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity pointer-events-none" />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>{formatTime(interpolatedPos)}</span>
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
                    {loopMode === 'track' ? 'LOOP: TRACK' : (loopMode === 'queue' ? 'LOOP: QUEUE' : 'LOOP: OFF')}
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
                value={localVolume}
                onChange={handleVolumeChange}
                className="w-full accent-brutal-accent bg-brutal-secondary cursor-pointer h-2"
              />
              <span className="font-mono text-xs font-bold w-12 text-right">{localVolume}%</span>
            </div>
          </BrutCard>

          {/* Search & Enqueue Input with Autocomplete */}
          <BrutCard title="SEARCH & PLAY SONG" subtitle="Enqueue by song title, Spotify, SoundCloud, Apple Music, or direct URL">
            {playerData && playerData.userInVoice === false && (
              <div className="mb-4 border-2 border-amber-500 bg-amber-950/40 p-3 shadow-brutal flex items-center justify-between gap-3 text-amber-300 font-mono text-xs">
                <div className="flex items-center gap-2.5">
                  <MicOff className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <strong className="text-white block uppercase tracking-wider font-bold">
                      VOICE CHANNEL REQUIRED
                    </strong>
                    <span className="text-zinc-300 text-[11px]">
                      Connect to a Discord voice channel in this server to search songs, enqueue tracks, or start playback.
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-amber-400 text-black font-black text-[10px] uppercase border border-black shrink-0">
                  DISCONNECTED
                </span>
              </div>
            )}
            <div className="relative" ref={searchContainerRef}>
              <form onSubmit={handleSearchPlay} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-muted" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => { if (searchSuggestions.length > 0) setShowDropdown(true); }}
                    disabled={Boolean(playerData && playerData.userInVoice === false)}
                    placeholder={
                      playerData && playerData.userInVoice === false
                        ? "⚠️ Join a Discord voice channel in this server to search & play..."
                        : "Search song title or paste Spotify / SoundCloud / Apple / YouTube link..."
                    }
                    className="w-full bg-brutal-secondary border-2 border-brutal-border pl-10 pr-9 py-2.5 font-mono text-xs text-brutal-text focus:outline-none focus:border-brutal-accent font-bold placeholder:text-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {searchLoading ? (
                    <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-accent animate-spin" />
                  ) : searchQuery ? (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setSearchSuggestions([]); setShowDropdown(false); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white font-mono text-xs"
                    >
                      ✕
                    </button>
                  ) : null}
                </div>
                <BrutButton 
                  variant="primary" 
                  type="submit" 
                  disabled={actionLoading || !searchQuery.trim() || Boolean(playerData && playerData.userInVoice === false)}
                >
                  {playerData && playerData.userInVoice === false ? "JOIN VOICE TO PLAY" : "PLAY SONG"}
                </BrutButton>
              </form>

              {/* Direct link recognized helper */}
              {isDirectLink && (
                <div className="mt-2 p-2.5 bg-black/80 border-2 border-brutal-accent flex flex-wrap items-center justify-between gap-2 shadow-brutal animate-fade-in">
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#00E676] font-bold">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Direct Link: {directLinkPlatform}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => executeDirectPlay(searchQuery, true)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[10px] font-bold border border-zinc-600 transition-colors"
                    >
                      PLAY NOW
                    </button>
                    <button
                      type="button"
                      onClick={() => executeDirectPlay(searchQuery, false)}
                      className="px-2.5 py-1 bg-brutal-accent hover:bg-emerald-400 text-black font-mono text-[10px] font-bold border border-emerald-400 transition-colors"
                    >
                      + ENQUEUE
                    </button>
                  </div>
                </div>
              )}

              {/* Autocomplete Dropdown */}
              {showDropdown && searchSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-black border-2 border-brutal-border shadow-2xl z-50 max-h-96 overflow-y-auto divide-y divide-zinc-800">
                  <div className="p-2 bg-zinc-900/90 text-[10px] font-mono text-zinc-400 flex items-center justify-between border-b border-zinc-800 sticky top-0 backdrop-blur z-10">
                    <span className="flex items-center gap-1.5 font-bold text-white">
                      <Music className="w-3 h-3 text-brutal-accent" />
                      AUTOCOMPLETE SUGGESTIONS ({searchSuggestions.length})
                    </span>
                    <span className="text-[9px]">Use ↑ ↓ to navigate • Enter to play</span>
                  </div>

                  {searchSuggestions.map((track, idx) => (
                    <div 
                      key={idx}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-2.5 flex items-center justify-between gap-3 transition-colors ${
                        selectedIndex === idx ? 'bg-zinc-800/90 border-l-4 border-brutal-accent' : 'hover:bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        <img 
                          src={track.thumbnail || "/logo.png?v=2"} 
                          alt={track.title} 
                          className="w-10 h-10 object-cover border border-zinc-700 shrink-0 bg-zinc-900" 
                          onError={(e) => { e.currentTarget.src = "/logo.png?v=2"; }}
                        />
                        <div className="overflow-hidden">
                          <p className="font-mono font-bold text-xs text-white truncate" title={track.title}>
                            {track.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                            <span className="truncate max-w-[140px] sm:max-w-[200px]">{track.author}</span>
                            {track.duration > 0 && <span>• {formatTime(track.duration)}</span>}
                            <span className={`px-1 py-0.2 text-[8px] font-bold border uppercase ${getSourceBadgeClass(track.source)}`}>
                              {track.source}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => executeSelectTrack(track, true)}
                          disabled={actionLoading}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-mono font-bold border border-zinc-600 transition-colors"
                          title="Play Immediately"
                        >
                          PLAY NOW
                        </button>
                        <button
                          type="button"
                          onClick={() => executeSelectTrack(track, false)}
                          disabled={actionLoading}
                          className="px-2.5 py-1 bg-brutal-accent text-black hover:bg-emerald-400 text-[10px] font-mono font-bold border border-emerald-400 transition-colors"
                          title="Add to Upcoming Queue"
                        >
                          + QUEUE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </BrutCard>

          {/* Real-time Voice Channel Audience Section */}
          <BrutCard 
            title={`VOICE AUDIENCE (${listeners})`} 
            subtitle={voiceChannel !== 'Not in Voice' ? `Connected in #${voiceChannel}` : 'Not connected to voice channel'}
            icon={Users}
          >
            {audienceMembers.length === 0 ? (
              <div className="py-6 text-center text-zinc-500 text-xs border border-dashed border-zinc-800">
                {is247 
                  ? "Bot is streaming in 24/7 persistence mode. Join voice channel on Discord to listen together!" 
                  : "No listeners currently detected in this voice channel."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {audienceMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className="p-2.5 bg-black border border-zinc-800 flex items-center gap-3 hover:border-brutal-accent transition-colors"
                  >
                    <img 
                      src={member.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
                      alt={member.username} 
                      className="w-8 h-8 rounded-full border border-zinc-700 object-cover shrink-0" 
                    />
                    <div className="overflow-hidden flex-1">
                      <p className="font-bold text-xs text-white truncate">
                        {member.displayName || member.username}
                      </p>
                      <p className="text-[10px] text-zinc-400 truncate">
                        @{member.username}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {member.deaf && (
                        <Headphones className="w-3.5 h-3.5 text-red-400" title="Deafened" />
                      )}
                      {member.mute && (
                        <MicOff className="w-3.5 h-3.5 text-amber-400" title="Muted" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              isAutoplay ? (
                <div className="py-8 text-center border-2 border-dashed border-[#00E676]/40 bg-[#00E676]/5 p-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-brutal-accent font-mono text-xs font-bold animate-pulse">
                    <Sparkles className="w-4 h-4" />
                    <span>[ AUTOPLAY ENGINE ACTIVE ]</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Discovering next recommendation based on current song & history...
                  </p>
                </div>
              ) : (
                <p className="font-mono text-xs text-brutal-muted py-8 text-center border border-dashed border-zinc-800">
                  The queue is empty. Enqueue songs on the left or use <code className="text-brutal-accent">/play</code> in Discord.
                </p>
              )
            ) : (
              <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                {queue.map((track, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-2.5 bg-brutal-secondary border transition-colors ${
                      track.isAutoplay 
                        ? 'border-[#00E676]/60 bg-[#00E676]/5 hover:border-brutal-accent' 
                        : 'border-brutal-border hover:border-brutal-accent'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="font-mono text-xs font-bold text-brutal-accent w-5 text-right shrink-0">
                        {idx + 1}
                      </span>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold text-xs truncate text-brutal-text">{track.title}</p>
                          {track.isAutoplay && (
                            <span className="shrink-0 bg-black/80 text-[#00E676] border border-[#00E676]/50 px-1.5 py-0.2 text-[9px] font-mono font-bold flex items-center gap-1 shadow-sm">
                              <Sparkles className="w-2.5 h-2.5" /> AUTOPLAY
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[10px] text-brutal-muted truncate">
                          {track.author} {track.duration ? `• ${formatTime(track.duration)}` : ''} {track.requester ? `• ${track.requester}` : ''}
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
