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
  Sparkles,
  Edit3,
  CheckCircle2,
  Play,
  Palette
} from 'lucide-react';
import { BrutCard, StatBox, BrutButton } from '../components/Brutalist';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal/Panel State
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editColor, setEditColor] = useState('#00E676');
  const [editAnthem, setEditAnthem] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const resp = await axios.get('/api/auth/profile', { withCredentials: true });
      setProfileData(resp.data);
      if (resp.data?.stats) {
        setEditBio(resp.data.stats.bio || '');
        setEditColor(resp.data.stats.accentColor || '#00E676');
        setEditAnthem(resp.data.stats.anthem?.title || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      await axios.post('/api/auth/profile', {
        bio: editBio,
        accentColor: editColor,
        anthem: editAnthem
      }, { withCredentials: true });
      setSaveMsg('Profile successfully synchronized with Discord!');
      await fetchProfile();
      setTimeout(() => setEditing(false), 1200);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-24 font-mono text-sm text-brutal-accent animate-pulse">
        [ SYNCHRONIZING DISCORD USER PROFILE TELEMETRY... ]
      </div>
    );
  }

  const u = profileData?.user || user;
  const stats = profileData?.stats || {};
  const liked = profileData?.likedSongs || { total: 0, recent: [] };
  const playlists = profileData?.playlists || { total: 0, items: [] };
  const badges = stats.badges || [];

  const hoursListened = ((stats.listeningSeconds || 0) / 3600).toFixed(1);
  const maxXP = stats.maxXP || Math.max(100, (stats.level || 1) * 100);
  const xpPercent = Math.min(100, Math.round(((stats.xp || 0) / maxXP) * 100));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-mono">
      {/* DISCORD PROFILE CARD EMBED (Matching Discord /profile layout) */}
      <div 
        className="border-2 border-brutal-border bg-brutal-surface shadow-brutal overflow-hidden relative"
        style={{ borderTop: `6px solid ${stats.accentColor || '#00E676'}` }}
      >
        {/* Banner Strip */}
        <div 
          className="h-28 w-full relative p-4 flex items-end justify-between"
          style={{ 
            background: `linear-gradient(135deg, ${stats.accentColor || '#00E676'}33 0%, #0a0a0a 100%)` 
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] bg-black text-white px-2 py-0.5 border border-white/20 font-black uppercase tracking-wider">
              DISCORD EMBED PARITY
            </span>
            {u?.isOwner && (
              <span className="font-mono text-[10px] bg-red-600 text-white font-black px-2 py-0.5 border border-black shadow-brutal-sm">
                👑 BOT OWNER
              </span>
            )}
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="px-3 py-1.5 bg-black border-2 border-brutal-border hover:border-brutal-accent text-white font-bold text-xs uppercase shadow-brutal-sm flex items-center gap-1.5 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5 text-brutal-accent" />
            <span>{editing ? 'CLOSE EDITOR' : 'EDIT PROFILE'}</span>
          </button>
        </div>

        {/* Identity & Avatar Section */}
        <div className="px-6 pb-6 pt-2">
          <div className="flex flex-col sm:flex-row items-start gap-5 -mt-12">
            <img
              src={u?.avatar || "/logo.png"}
              alt={u?.username}
              className="w-24 h-24 border-4 border-black object-cover shadow-brutal shrink-0 bg-black"
            />

            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                  {u?.global_name || u?.username}
                </h2>
                <span className="text-xs text-zinc-400">@{u?.username}</span>
              </div>
              <p className="text-xs text-zinc-400">
                Member Music Profile • {stats.songsPlayed || 0} songs played
              </p>
            </div>
          </div>

          {/* Edit Form Panel if open */}
          {editing && (
            <form onSubmit={handleSaveProfile} className="mt-6 p-4 border-2 border-brutal-accent bg-black space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-bold text-xs text-brutal-accent uppercase">
                  CUSTOMIZE MUSIC PROFILE
                </span>
                {saveMsg && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {saveMsg}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">CUSTOM BIO (MAX 80 CHARS)</label>
                  <input
                    type="text"
                    maxLength={80}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="e.g. 24/7 Lo-Fi enthusiast"
                    className="w-full bg-zinc-900 border border-zinc-700 p-2 text-white font-mono focus:outline-none focus:border-brutal-accent"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">ACCENT COLOR (HEX)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="w-10 h-8 border border-zinc-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700 p-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">SIGNATURE ANTHEM</label>
                  <input
                    type="text"
                    value={editAnthem}
                    onChange={(e) => setEditAnthem(e.target.value)}
                    placeholder="e.g. Starboy - The Weeknd"
                    className="w-full bg-zinc-900 border border-zinc-700 p-2 text-white font-mono focus:outline-none focus:border-brutal-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-brutal-accent text-black font-bold text-xs uppercase border border-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  {saving ? 'SYNCHRONIZING...' : 'SAVE & APPLY TO DISCORD'}
                </button>
              </div>
            </form>
          )}

          {/* Bio & Anthem Card Display (Matching Discord Embed) */}
          <div className="mt-5 p-4 border border-zinc-800 bg-black/60 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-zinc-300 italic">
                {stats.bio ? `"${stats.bio}"` : "*No bio set yet. Click Edit Profile to add one.*"}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
              <Disc3 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-zinc-400">Anthem:</span>
              <span className="text-white font-bold">
                {stats.anthem?.title || "*No signature anthem set*"}
              </span>
            </div>
          </div>

          {/* Level & XP Progress Bar */}
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-brutal-accent" />
                <span>LEVEL {stats.level || 1}</span>
              </span>
              <span className="text-zinc-400">
                {(stats.xp || 0).toLocaleString()} / {maxXP.toLocaleString()} XP ({xpPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-900 border border-zinc-700 overflow-hidden">
              <div 
                className="h-full bg-brutal-accent transition-all duration-500" 
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Badges Display Row */}
          <div className="mt-6 pt-5 border-t border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block mb-3">
              EARNED MUSIC BADGES ({badges.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-xs font-bold text-white"
                  title={b.desc}
                >
                  <span>{b.emoji}</span>
                  <span>{b.label}</span>
                </div>
              ))}
              {badges.length === 0 && (
                <span className="text-xs text-zinc-500">Play songs in voice channels to unlock badges!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox
          label="TIME LISTENED"
          value={`${hoursListened}h`}
          sub="Total voice time"
          icon={Clock}
        />
        <StatBox
          label="TRACKS PLAYED"
          value={stats.songsPlayed || 0}
          sub="Audio queries"
          icon={Music}
        />
        <StatBox
          label="DAILY STREAK"
          value={`${stats.streak || 0}d`}
          sub="Consecutive days"
          icon={Flame}
        />
        <StatBox
          label="LIKED TRACKS"
          value={liked.total}
          sub="Personal library"
          icon={Heart}
          accent
        />
      </div>

      {/* Liked Songs Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BrutCard
          title={`LIKED SONGS LIBRARY (${liked.total})`}
          subtitle="Saved with /like command in Discord"
          icon={Heart}
        >
          {liked.recent.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs border border-dashed border-zinc-800">
              No liked songs yet. Use <code className="text-brutal-accent">/like</code> while listening to save tracks to your library.
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {liked.recent.map((song, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-black border border-zinc-800 hover:border-brutal-accent transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-xs font-bold text-brutal-accent w-4 text-right">
                      {i + 1}
                    </span>
                    <div className="overflow-hidden">
                      <p className="font-bold text-xs truncate text-white">
                        {song.title || "Unknown Track"}
                      </p>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {song.author || "Unknown Artist"}
                      </p>
                    </div>
                  </div>
                  {song.uri && (
                    <a
                      href={song.uri}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-zinc-400 hover:text-white"
                      title="Open Track Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </BrutCard>

        {/* Saved Playlists */}
        <BrutCard
          title={`CUSTOM PLAYLISTS (${playlists.total})`}
          subtitle="Created with /playlist command in Discord"
          icon={ListMusic}
        >
          {playlists.items.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs border border-dashed border-zinc-800">
              No custom playlists created yet. Use <code className="text-brutal-accent">/playlist create &lt;name&gt;</code> in Discord to save setlists.
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.items.map((pl, i) => (
                <div
                  key={i}
                  className="p-3 bg-black border border-zinc-800 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-xs text-white uppercase">{pl.name}</h5>
                    <p className="text-[10px] text-zinc-400">{pl.tracksCount} tracks</p>
                  </div>
                  <span className="text-[10px] text-brutal-accent font-bold uppercase">
                    SAVED
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
