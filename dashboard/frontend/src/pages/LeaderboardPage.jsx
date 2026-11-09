import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Trophy, 
  Flame, 
  Music, 
  Clock, 
  Crown, 
  Sparkles, 
  RefreshCw, 
  Search,
  Globe,
  Server,
  Disc3,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { BrutCard, StatBox, BrutButton } from '../components/Brutalist';
import SEO from '../components/SEO';

export default function LeaderboardPage() {
  const [data, setData] = useState({ 
    leaderboard: [], 
    totalUsers: 0, 
    scope: 'global',
    serverName: 'Global',
    myRank: null, 
    myProfile: null 
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & scope states
  const [scope, setScope] = useState('global'); // 'global' | 'server'
  const [guilds, setGuilds] = useState([]);
  const [selectedGuildId, setSelectedGuildId] = useState('');
  const [sortBy, setSortBy] = useState('time'); // 'time' | 'songs' | 'xp' | 'streak'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    fetchGuilds();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [scope, selectedGuildId, sortBy]);

  async function fetchGuilds() {
    try {
      const resp = await axios.get('/api/guilds', { withCredentials: true });
      const mutual = resp.data?.mutualGuilds || (resp.data?.guilds || []).filter((g) => g.hasBot);
      setGuilds(mutual);
      if (mutual.length > 0 && !selectedGuildId) {
        setSelectedGuildId(mutual[0].id);
      }
    } catch {
      // User might be unauthenticated, which is completely fine for public leaderboard
    }
  }

  async function fetchLeaderboard(isManual = false) {
    if (isManual) setRefreshing(true);
    try {
      const params = { sort: sortBy };
      if (scope === 'server' && selectedGuildId) {
        params.guildId = selectedGuildId;
      }

      const resp = await axios.get('/api/xp/leaderboard', { 
        params,
        withCredentials: true 
      });
      setData(resp.data || { leaderboard: [], totalUsers: 0, myRank: null });
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }

  const rawList = data.leaderboard || [];

  // Filter by search query
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return rawList;
    const q = searchQuery.toLowerCase().trim();
    return rawList.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.userId && u.userId.includes(q))
    );
  }, [rawList, searchQuery]);

  const top3 = searchQuery.trim() ? [] : rawList.slice(0, 3);
  const tableList = searchQuery.trim() ? filteredList : rawList.slice(3);

  // Pagination for table
  const totalTablePages = Math.max(1, Math.ceil(tableList.length / pageSize));
  const paginatedTable = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return tableList.slice(start, start + pageSize);
  }, [tableList, currentPage, pageSize]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SEO 
        title="Leaderboard — Together Music Bot"
        description="Track live global and server music listening leaderboards for Together Music Bot. View hours listened, streak rankings, and top community listeners."
        canonical="https://dash.together.dpdns.org/leaderboard"
      />
      {/* Header Banner */}
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-brutal-accent inline-block"></span>
            <span className="font-mono text-xs uppercase text-brutal-accent font-black tracking-widest">
              OFFICIAL BOT STANDINGS // DISCORD SYNCED
            </span>
          </div>
          <h1 className="font-display font-black text-3xl text-brutal-text uppercase">
            MUSIC LEADERBOARD
          </h1>
          <p className="font-mono text-xs text-brutal-muted mt-1">
            Real-time rankings across {data.totalUsers || rawList.length} verified listeners in {data.serverName || 'the community'}.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <BrutButton 
            onClick={() => fetchLeaderboard(true)} 
            disabled={refreshing}
            variant="secondary"
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </BrutButton>
        </div>
      </div>

      {/* Scope & Metric Selection Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-brutal-surface border-2 border-brutal-border p-4 shadow-brutal font-mono text-xs">
        {/* Scope selector */}
        <div className="md:col-span-4 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setScope('global'); }}
            className={`px-3 py-2 border-2 border-black font-black uppercase flex items-center gap-1.5 transition-all ${
              scope === 'global'
                ? 'bg-brutal-accent text-black shadow-brutal-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>GLOBAL</span>
          </button>

          <button
            onClick={() => { setScope('server'); }}
            className={`px-3 py-2 border-2 border-black font-black uppercase flex items-center gap-1.5 transition-all ${
              scope === 'server'
                ? 'bg-brutal-accent text-black shadow-brutal-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>SERVER</span>
          </button>

          {scope === 'server' && guilds.length > 0 && (
            <select
              value={selectedGuildId}
              onChange={(e) => setSelectedGuildId(e.target.value)}
              className="bg-zinc-900 text-white border-2 border-brutal-border px-3 py-2 font-mono text-xs focus:outline-none focus:border-brutal-accent max-w-[180px] truncate"
            >
              {guilds.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Sort by Metric */}
        <div className="md:col-span-5 flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'time', label: 'LISTEN TIME', icon: Clock },
            { id: 'songs', label: 'TRACKS', icon: Music },
            { id: 'xp', label: 'EXPERIENCE', icon: Sparkles },
            { id: 'streak', label: 'STREAK', icon: Flame },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = sortBy === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSortBy(tab.id)}
                className={`px-2.5 py-1.5 border border-zinc-700 font-bold uppercase flex items-center gap-1 text-[11px] transition-colors ${
                  active
                    ? 'bg-zinc-800 text-brutal-accent border-brutal-accent'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="md:col-span-3 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search listener..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-zinc-900 text-white border-2 border-brutal-border pl-9 pr-3 py-1.5 text-xs font-mono focus:outline-none focus:border-brutal-accent placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Viewer Personal Standing Banner (if logged in) */}
      {data.myProfile && (
        <div className="border-2 border-brutal-accent bg-brutal-secondary p-4 shadow-brutal flex items-center justify-between flex-wrap gap-4 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black overflow-hidden bg-black shrink-0">
              <img 
                src={data.myProfile.avatarUrl || '/logo.png'} 
                alt={data.myProfile.name} 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/logo.png'; }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-brutal-accent text-black px-1.5 py-0.5 font-black uppercase">
                  YOUR STANDING
                </span>
                <span className="font-bold text-sm text-brutal-text">
                  #{data.myRank || data.myProfile.rank || 'Unranked'} {data.myProfile.name}
                </span>
              </div>
              <p className="text-xs text-brutal-muted mt-0.5">
                LVL {data.myProfile.level || 1} • {(data.myProfile.xp || 0).toLocaleString()} XP • {data.myProfile.songsPlayed || 0} tracks played
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-brutal-muted text-[10px] block uppercase">LISTENING TIME</span>
              <span className="font-bold text-brutal-accent">
                {Math.floor((data.myProfile.listeningMinutes || 0) / 60)}h {(data.myProfile.listeningMinutes || 0) % 60}m
              </span>
            </div>
            {data.myProfile.streak > 0 && (
              <div className="text-right">
                <span className="text-brutal-muted text-[10px] block uppercase">STREAK</span>
                <span className="font-bold text-amber-400 flex items-center gap-1 justify-end">
                  <Flame className="w-3.5 h-3.5" /> {data.myProfile.streak}d
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-brutal-accent border-t-transparent animate-spin mx-auto mb-3"></div>
          <p className="font-mono text-xs text-brutal-muted uppercase font-bold tracking-wider">
            Loading {scope === 'server' ? 'server' : 'community'} leaderboard...
          </p>
        </div>
      ) : rawList.length === 0 ? (
        <div className="border-2 border-brutal-border bg-brutal-surface p-12 text-center font-mono">
          <Disc3 className="w-12 h-12 text-brutal-muted mx-auto mb-3 opacity-50" />
          <h3 className="font-bold text-base text-brutal-text uppercase">No Leaderboard Records Found</h3>
          <p className="text-xs text-brutal-muted mt-1 max-w-md mx-auto">
            {scope === 'server'
              ? 'No members in this server have earned music XP yet. Play music with TOGETHER in voice to claim #1!'
              : 'Play music in any Discord voice channel with TOGETHER to start earning XP and claim the #1 podium!'}
          </p>
          {scope === 'server' && (
            <BrutButton
              onClick={() => setScope('global')}
              variant="primary"
              className="mt-4 text-xs"
            >
              SWITCH TO GLOBAL STANDINGS
            </BrutButton>
          )}
        </div>
      ) : (
        <>
          {/* Top 3 Podium Display (only when not searching) */}
          {!searchQuery.trim() && top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* 2nd Place */}
              {top3[1] && (
                <BrutCard 
                  className="text-center relative pt-8 order-2 md:order-1 border-slate-400"
                  badge="🥈 RANK #2"
                >
                  <div className="w-20 h-20 mx-auto mb-3 border-2 border-black bg-slate-800 relative overflow-hidden shadow-brutal">
                    <img 
                      src={top3[1].avatarUrl || '/logo.png'} 
                      alt={top3[1].name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/logo.png'; }}
                    />
                  </div>
                  <h4 className="font-mono font-black text-base text-brutal-text truncate px-2">
                    {top3[1].name}
                  </h4>
                  <p className="font-mono text-[11px] text-brutal-muted">
                    @{top3[1].username || `user_${top3[1].userId.slice(-4)}`}
                  </p>
                  <div className="inline-block mt-2 px-2.5 py-0.5 bg-slate-800 border border-slate-600 font-mono text-xs font-bold text-slate-200">
                    LVL {top3[1].level} • {(top3[1].xp || 0).toLocaleString()} XP
                  </div>
                  <div className="mt-4 pt-3 border-t border-brutal-border grid grid-cols-2 gap-2 text-left font-mono text-[11px]">
                    <div>
                      <span className="text-brutal-muted text-[10px] block">TRACKS</span>
                      <span className="font-bold text-brutal-text">{top3[1].songsPlayed || 0}</span>
                    </div>
                    <div>
                      <span className="text-brutal-muted text-[10px] block">LISTEN TIME</span>
                      <span className="font-bold text-brutal-text">{Math.floor((top3[1].listeningMinutes || 0) / 60)}h</span>
                    </div>
                  </div>
                </BrutCard>
              )}

              {/* 1st Place (Champion) */}
              {top3[0] && (
                <BrutCard 
                  className="text-center relative pt-10 order-1 md:order-2 border-brutal-accent shadow-brutal"
                  highlight={true}
                  badge="👑 CHAMPION #1"
                >
                  <div className="w-24 h-24 mx-auto mb-3 border-3 border-black bg-emerald-950 relative overflow-hidden shadow-brutal ring-2 ring-brutal-accent">
                    <img 
                      src={top3[0].avatarUrl || '/logo.png'} 
                      alt={top3[0].name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/logo.png'; }}
                    />
                    <div className="absolute top-0 right-0 bg-brutal-accent text-black p-0.5">
                      <Crown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h4 className="font-mono font-black text-lg text-brutal-text truncate px-2">
                    {top3[0].name}
                  </h4>
                  <p className="font-mono text-xs text-brutal-muted">
                    @{top3[0].username || `user_${top3[0].userId.slice(-4)}`}
                  </p>
                  <div className="inline-block mt-2 px-3 py-1 bg-brutal-accent text-black font-mono text-xs font-black uppercase shadow-brutal-sm">
                    LVL {top3[0].level} • {(top3[0].xp || 0).toLocaleString()} XP
                  </div>
                  <div className="mt-5 pt-3 border-t-2 border-brutal-border grid grid-cols-2 gap-2 text-left font-mono text-xs">
                    <div>
                      <span className="text-brutal-muted text-[10px] block">TOTAL TRACKS</span>
                      <span className="font-bold text-brutal-accent text-sm">{top3[0].songsPlayed || 0}</span>
                    </div>
                    <div>
                      <span className="text-brutal-muted text-[10px] block">LISTENING TIME</span>
                      <span className="font-bold text-brutal-accent text-sm">{Math.floor((top3[0].listeningMinutes || 0) / 60)}h {(top3[0].listeningMinutes || 0) % 60}m</span>
                    </div>
                  </div>
                </BrutCard>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <BrutCard 
                  className="text-center relative pt-8 order-3 border-amber-700"
                  badge="🥉 RANK #3"
                >
                  <div className="w-20 h-20 mx-auto mb-3 border-2 border-black bg-amber-950 relative overflow-hidden shadow-brutal">
                    <img 
                      src={top3[2].avatarUrl || '/logo.png'} 
                      alt={top3[2].name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/logo.png'; }}
                    />
                  </div>
                  <h4 className="font-mono font-black text-base text-brutal-text truncate px-2">
                    {top3[2].name}
                  </h4>
                  <p className="font-mono text-[11px] text-brutal-muted">
                    @{top3[2].username || `user_${top3[2].userId.slice(-4)}`}
                  </p>
                  <div className="inline-block mt-2 px-2.5 py-0.5 bg-amber-950/60 border border-amber-800 font-mono text-xs font-bold text-amber-200">
                    LVL {top3[2].level} • {(top3[2].xp || 0).toLocaleString()} XP
                  </div>
                  <div className="mt-4 pt-3 border-t border-brutal-border grid grid-cols-2 gap-2 text-left font-mono text-[11px]">
                    <div>
                      <span className="text-brutal-muted text-[10px] block">TRACKS</span>
                      <span className="font-bold text-brutal-text">{top3[2].songsPlayed || 0}</span>
                    </div>
                    <div>
                      <span className="text-brutal-muted text-[10px] block">LISTEN TIME</span>
                      <span className="font-bold text-brutal-text">{Math.floor((top3[2].listeningMinutes || 0) / 60)}h</span>
                    </div>
                  </div>
                </BrutCard>
              )}
            </div>
          )}

          {/* Full Community Rankings Table */}
          {tableList.length > 0 ? (
            <BrutCard 
              title={searchQuery.trim() ? `SEARCH RESULTS (${filteredList.length})` : "COMMUNITY RANKINGS"} 
              subtitle={`Sorted by ${sortBy.toUpperCase()} • Showing ${paginatedTable.length} of ${tableList.length} listeners`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b-2 border-brutal-border text-brutal-muted uppercase text-[10px]">
                      <th className="py-2.5 px-3">RANK</th>
                      <th className="py-2.5 px-3">LISTENER</th>
                      <th className="py-2.5 px-3">LISTEN TIME</th>
                      <th className="py-2.5 px-3">TRACKS</th>
                      <th className="py-2.5 px-3">LEVEL</th>
                      <th className="py-2.5 px-3">EXPERIENCE</th>
                      <th className="py-2.5 px-3">STREAK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTable.map((u) => {
                      const isMe = String(data.myProfile?.userId) === String(u.userId);
                      return (
                        <tr 
                          key={u.userId} 
                          className={`border-b border-brutal-border hover:bg-brutal-secondary transition-colors ${
                            isMe ? 'bg-brutal-accent/15 border-brutal-accent' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-black text-brutal-accent">
                            #{u.rank}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 border border-brutal-border bg-black shrink-0 overflow-hidden">
                                <img 
                                  src={u.avatarUrl || '/logo.png'} 
                                  alt={u.name} 
                                  className="w-full h-full object-cover" 
                                  onError={(e) => { e.target.src = '/logo.png'; }}
                                />
                              </div>
                              <div className="truncate max-w-[180px]">
                                <span className="font-bold text-brutal-text block truncate leading-tight">
                                  {u.name} {isMe && <span className="text-[9px] text-brutal-accent uppercase">(YOU)</span>}
                                </span>
                                <span className="text-[10px] text-brutal-muted block truncate">
                                  @{u.username || `user_${u.userId.slice(-4)}`}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-brutal-accent font-bold">
                            {Math.floor((u.listeningMinutes || 0) / 60)}h {(u.listeningMinutes || 0) % 60}m
                          </td>
                          <td className="py-2.5 px-3 text-zinc-300">
                            {u.songsPlayed || 0}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-brutal-text">
                            LVL {u.level}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-300">
                            {(u.xp || 0).toLocaleString()} XP
                          </td>
                          <td className="py-2.5 px-3">
                            {u.streak > 0 ? (
                              <span className="text-amber-400 font-bold flex items-center gap-1">
                                <Flame className="w-3 h-3" /> {u.streak}d
                              </span>
                            ) : (
                              <span className="text-zinc-600">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalTablePages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-brutal-border font-mono text-xs">
                  <span className="text-zinc-500">
                    Page {currentPage} of {totalTablePages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="px-2.5 py-1 border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>PREV</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalTablePages, p + 1))}
                      disabled={currentPage >= totalTablePages}
                      className="px-2.5 py-1 border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <span>NEXT</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </BrutCard>
          ) : (
            searchQuery.trim() && (
              <div className="border-2 border-brutal-border bg-brutal-surface p-8 text-center font-mono">
                <Search className="w-8 h-8 text-brutal-muted mx-auto mb-2 opacity-40" />
                <p className="text-xs text-zinc-400">No listeners match "{searchQuery}"</p>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
