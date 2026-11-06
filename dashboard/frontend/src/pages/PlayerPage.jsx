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
  ExternalLink
} from 'lucide-react';
import { BrutCard, BrutButton } from '../components/Brutalist';

export default function PlayerPage() {
  const [searchParams] = useSearchParams();
  const guildId = searchParams.get('guild');

  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
    } finally {
      setLoading(false);
    }
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

  if (!guildId) {
    return (
      <div className="max-w-2xl mx-auto border-2 border-brutal-border bg-brutal-surface p-8 text-center shadow-brutal mt-12">
        <Radio className="w-12 h-12 text-brutal-accent mx-auto mb-4" />
        <h2 className="font-display font-black text-2xl text-brutal-text uppercase">NO SERVER SELECTED</h2>
        <p className="font-mono text-xs text-brutal-muted mt-2 mb-6">
          Please select a Discord server to open its real-time audio playback console.
        </p>
        <a href="/servers">
          <BrutButton variant="primary">SELECT A SERVER</BrutButton>
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & 3D Stage Link */}
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase text-brutal-accent font-black tracking-widest">
            NATIVE OPUS 320KBPS CONTROLLER // GUILD: {guildId}
          </span>
          <h2 className="font-display font-black text-3xl text-brutal-text uppercase">
            MUSIC PLAYER STAGE
          </h2>
        </div>
        <a 
          href={`https://together.dpdns.org/visualizer/?guild=${guildId}`} 
          target="_blank" 
          rel="noreferrer"
        >
          <BrutButton variant="outline" size="sm" icon={ExternalLink}>
            OPEN 3D STAGE
          </BrutButton>
        </a>
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
                  <BrutButton 
                    variant="primary" 
                    size="md" 
                    icon={isPaused ? Play : Pause}
                    onClick={() => sendAction(isPaused ? 'resume' : 'pause')}
                    disabled={actionLoading || !current}
                  >
                    {isPaused ? "RESUME" : "PAUSE"}
                  </BrutButton>
                  <BrutButton 
                    variant="secondary" 
                    size="sm" 
                    icon={SkipForward} 
                    onClick={() => sendAction('skip')}
                    disabled={actionLoading || !current}
                  />
                  <BrutButton 
                    variant="secondary" 
                    size="sm" 
                    icon={Shuffle} 
                    onClick={() => sendAction('shuffle')}
                    disabled={actionLoading || queue.length === 0}
                  />
                  <BrutButton 
                    variant="secondary" 
                    size="sm" 
                    icon={Repeat} 
                    onClick={() => sendAction('loop')}
                    disabled={actionLoading}
                  >
                    LOOP: {playerData?.loop || "NONE"}
                  </BrutButton>
                </div>
              </div>
            </div>

            {/* Volume Control Bar */}
            <div className="mt-8 pt-4 border-t-2 border-brutal-border flex items-center gap-4">
              <Volume2 className="w-5 h-5 text-brutal-accent shrink-0" />
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume}
                onChange={(e) => sendAction('volume', { position: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-brutal-secondary border border-brutal-border accent-brutal-accent cursor-pointer"
              />
              <span className="font-mono font-bold text-xs text-brutal-text w-12 text-right">
                {volume}%
              </span>
            </div>
          </BrutCard>

          {/* Quick Enqueue & Search Box */}
          <BrutCard title="ENQUEUE TRACK / PLAYLIST" subtitle="YouTube, Spotify, Apple Music, SoundCloud">
            <form onSubmit={handleSearchPlay} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Paste song URL or search query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-brutal-secondary border-2 border-brutal-border px-4 py-2.5 font-mono text-xs text-brutal-text focus:outline-none focus:border-brutal-accent"
              />
              <BrutButton variant="primary" size="md" icon={Search} disabled={actionLoading}>
                PLAY
              </BrutButton>
            </form>
          </BrutCard>
        </div>

        {/* Right: Upcoming Queue Column */}
        <div className="space-y-6">
          <BrutCard 
            title="UPCOMING QUEUE" 
            subtitle={`${queue.length} Tracks in Line`}
            badge={queue.length > 0 ? "LIVE" : "EMPTY"}
          >
            {queue.length === 0 ? (
              <p className="font-mono text-xs text-brutal-muted text-center py-8">
                Queue is currently empty.
              </p>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {queue.map((track, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-brutal-secondary border border-brutal-border">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="font-mono text-xs font-bold text-brutal-accent w-5 text-right shrink-0">
                        {i + 1}.
                      </span>
                      <div className="overflow-hidden">
                        <p className="font-bold text-xs text-brutal-text truncate">{track.title}</p>
                        <p className="font-mono text-[10px] text-brutal-muted truncate">{track.author}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {queue.length > 0 && (
              <div className="mt-4 pt-3 border-t border-brutal-border">
                <BrutButton 
                  variant="danger" 
                  size="sm" 
                  className="w-full" 
                  icon={Trash2}
                  onClick={() => sendAction('clear')}
                  disabled={actionLoading}
                >
                  CLEAR QUEUE
                </BrutButton>
              </div>
            )}
          </BrutCard>
        </div>
      </div>
    </div>
  );
}

