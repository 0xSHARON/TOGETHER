import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, 
  Heart, 
  ListMusic, 
  Trophy, 
  Flame, 
  Clock, 
  Music, 
  Star, 
  ShieldCheck, 
  ExternalLink,
  Disc3,
  Sparkles
} from 'lucide-react';
import { BrutCard, StatBox, BrutButton } from '../components/Brutalist';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const resp = await axios.get('/api/auth/profile', { withCredentials: true });
      setProfileData(resp.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-24 font-mono text-sm text-brutal-accent animate-pulse">
        [ RETRIEVING DISCORD USER PREFERENCES & MUSIC XP TELEMETRY... ]
      </div>
    );
  }

  const u = profileData?.user || user;
  const stats = profileData?.stats || {};
  const liked = profileData?.likedSongs || { total: 0, recent: [] };
  const playlists = profileData?.playlists || { total: 0, items: [] };

  const hoursListened = ((stats.listeningSeconds || 0) / 3600).toFixed(1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Profile Header Banner */}
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal flex flex-col md:flex-row items-center md:items-start gap-6">
        <img
          src={u?.avatar || "/logo.png"}
          alt={u?.username}
          className="w-28 h-28 border-4 border-black object-cover shadow-brutal shrink-0"
        />

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="font-mono text-[10px] uppercase bg-brutal-accent text-black font-black px-2 py-0.5 tracking-wider">
              COMMUNITY PROFILE
            </span>
            {u?.isOwner && (
              <span className="font-mono text-[10px] uppercase bg-red-600 text-white font-black px-2 py-0.5 border border-black shadow-brutal-sm">
                👑 BOT OWNER
              </span>
            )}
            <span className="font-mono text-[10px] uppercase border border-brutal-border bg-brutal-bg text-brutal-muted px-2 py-0.5">
              ID: {u?.id}
            </span>
          </div>

          <h2 className="font-display font-black text-3xl md:text-4xl text-brutal-text uppercase tracking-tight">
            {u?.global_name || u?.username}
          </h2>

          <p className="font-mono text-xs text-brutal-muted">
            @{u?.username} • Active Discord Music Listener
          </p>

          {stats.bio && (
            <p className="font-mono text-xs text-brutal-text bg-brutal-bg p-3 border border-brutal-border mt-2 italic">
              "{stats.bio}"
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <a
            href="https://top.gg/bot/863496211667484676/vote"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 border-2 border-amber-500 bg-amber-950/30 text-amber-400 font-mono text-xs font-bold px-4 py-2 hover:bg-amber-500 hover:text-black transition-all"
          >
            <Star className="w-4 h-4 fill-amber-400" />
            VOTE FOR TOGETHER
          </a>
          <a href="/servers">
            <BrutButton variant="secondary" size="sm" className="w-full">
              MY SERVERS
            </BrutButton>
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <StatBox
          label="MUSIC XP LEVEL"
          value={`LVL ${stats.level || 1}`}
          sub={`${(stats.xp || 0).toLocaleString()} Total XP`}
          accent
          icon={Trophy}
        />
        <StatBox
          label="TRACKS PLAYED"
          value={stats.songsPlayed || 0}
          sub="Playback requests"
          icon={Music}
        />
        <StatBox
          label="LISTENING TIME"
          value={`${hoursListened}h`}
          sub="Audio engagement"
          icon={Clock}
        />
        <StatBox
          label="DAILY STREAK"
          value={`${stats.streak || 0} Days`}
          sub="Consecutive sessions"
          icon={Flame}
        />
        <StatBox
          label="FAVOURITES"
          value={liked.total}
          sub="Liked songs in library"
          icon={Heart}
        />
      </div>

      {/* Anthem Card if present */}
      {stats.anthem?.title && (
        <div className="border-2 border-brutal-border bg-brutal-surface p-5 shadow-brutal flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brutal-accent text-black flex items-center justify-center font-bold">
              <Disc3 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <span className="font-mono text-[9px] uppercase text-brutal-accent font-black tracking-widest block">
                FEATURED USER ANTHEM
              </span>
              <h4 className="font-display font-black text-lg text-brutal-text uppercase">
                {stats.anthem.title}
              </h4>
              <p className="font-mono text-xs text-brutal-muted">
                {stats.anthem.artist || "Unknown Artist"}
              </p>
            </div>
          </div>
          {stats.anthem.uri && (
            <a
              href={stats.anthem.uri}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 border-2 border-brutal-border hover:border-brutal-accent font-mono text-xs font-bold text-brutal-text uppercase flex items-center gap-1.5 transition-all"
            >
              <span>LISTEN</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Grid: Liked Songs & Saved Playlists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Liked Songs Box */}
        <BrutCard
          title={`FAVOURITE SONGS (${liked.total})`}
          subtitle="Saved using /like in Discord"
          icon={Heart}
        >
          {liked.recent.length === 0 ? (
            <div className="p-8 text-center text-brutal-muted font-mono text-xs border border-dashed border-brutal-border">
              No liked songs yet. Use <code className="text-brutal-accent">/like</code> while listening to save tracks to your personal library.
            </div>
          ) : (
            <div className="space-y-2">
              {liked.recent.map((song, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-brutal-bg border border-brutal-border hover:border-brutal-accent transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="font-mono text-xs font-bold text-brutal-accent w-4 text-right">
                      {i + 1}
                    </span>
                    <div className="overflow-hidden">
                      <p className="font-mono font-bold text-xs truncate text-brutal-text">
                        {song.title}
                      </p>
                      <p className="font-mono text-[10px] text-brutal-muted truncate">
                        {song.author || "Track"}
                      </p>
                    </div>
                  </div>
                  {song.url && (
                    <a
                      href={song.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brutal-muted hover:text-brutal-accent p-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </BrutCard>

        {/* Saved Playlists Box */}
        <BrutCard
          title={`SAVED PLAYLISTS (${playlists.total})`}
          subtitle="Created using /playlist create in Discord"
          icon={ListMusic}
        >
          {playlists.items.length === 0 ? (
            <div className="p-8 text-center text-brutal-muted font-mono text-xs border border-dashed border-brutal-border">
              No custom playlists created yet. Use <code className="text-brutal-accent">/playlist create</code> to build custom collections.
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.items.map((pl, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-brutal-bg border border-brutal-border hover:border-brutal-accent transition-colors"
                >
                  <div>
                    <h5 className="font-display font-bold text-sm text-brutal-text uppercase">
                      {pl.name}
                    </h5>
                    <p className="font-mono text-[10px] text-brutal-muted">
                      {pl.tracksCount} tracks in playlist
                    </p>
                  </div>
                  <span className="font-mono text-[10px] bg-brutal-surface px-2 py-1 border border-brutal-border text-brutal-accent font-bold">
                    PLAYLIST
                  </span>
                </div>
              ))}
            </div>
          )}
        </BrutCard>
      </div>
    </div>
  );
}

