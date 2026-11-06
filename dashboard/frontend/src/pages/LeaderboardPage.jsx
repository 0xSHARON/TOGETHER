import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trophy, 
  Flame, 
  Music, 
  Clock, 
  Crown, 
  Sparkles, 
  RefreshCw, 
  UserCheck,
  Disc3
} from 'lucide-react';
import { BrutCard, StatBox, BrutButton } from '../components/Brutalist';

export default function LeaderboardPage() {
  const [data, setData] = useState({ leaderboard: [], totalUsers: 0, myRank: null, myProfile: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard(isManual = false) {
    if (isManual) setRefreshing(true);
    try {
      const resp = await axios.get('/api/xp/leaderboard', { withCredentials: true });
      setData(resp.data || { leaderboard: [], totalUsers: 0, myRank: null });
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }

  const list = data.leaderboard || [];
  const top3 = list.slice(0, 3);
  const rest = list.slice(3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-brutal-accent inline-block"></span>
            <span className="font-mono text-xs uppercase text-brutal-accent font-black tracking-widest">
              OFFICIAL BOT STANDINGS // DISCORD SYNCED
            </span>
          </div>
          <h2 className="font-display font-black text-3xl text-brutal-text uppercase">
            MUSIC XP LEADERBOARD
          </h2>
          <p className="font-mono text-xs text-brutal-muted mt-1">
            Real-time rankings across all {data.totalUsers || list.length} active listeners and supporters.
          </p>
        </div>

        <BrutButton 
          onClick={() => fetchLeaderboard(true)} 
          disabled={refreshing}
          variant="secondary"
          className="flex items-center gap-2 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>REFRESH STANDINGS</span>
        </BrutButton>
      </div>

      {/* Viewer Personal Standing Banner (if logged in) */}
      {data.myRank && data.myProfile && (
        <div className="border-2 border-brutal-accent bg-brutal-secondary p-4 shadow-brutal flex items-center justify-between flex-wrap gap-4 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black overflow-hidden bg-black shrink-0">
              <img 
                src={data.myProfile.avatarUrl || '/logo.png'} 
                alt={data.myProfile.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-brutal-accent text-black px-1.5 py-0.5 font-black uppercase">
                  YOUR STANDING
                </span>
                <span className="font-bold text-sm text-brutal-text">
                  #{data.myRank} {data.myProfile.name}
                </span>
              </div>
              <p className="text-xs text-brutal-muted mt-0.5">
                LVL {data.myProfile.level} • {(data.myProfile.xp || 0).toLocaleString()} XP • {data.myProfile.songsPlayed || 0} tracks played
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
            Loading bot community leaderboard...
          </p>
        </div>
      ) : list.length === 0 ? (
        <div className="border-2 border-brutal-border bg-brutal-surface p-12 text-center font-mono">
          <Disc3 className="w-12 h-12 text-brutal-muted mx-auto mb-3 opacity-50" />
          <h3 className="font-bold text-base text-brutal-text uppercase">No Leaderboard Records Found</h3>
          <p className="text-xs text-brutal-muted mt-1 max-w-md mx-auto">
            Play music in any Discord voice channel with TOGETHER to start earning XP and claim the #1 podium!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Display */}
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

          {/* Full Community Rankings Table (Ranks 4+) */}
          {rest.length > 0 && (
            <BrutCard title="COMMUNITY RANKINGS" subtitle="All ranked listeners & audiophiles">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b-2 border-brutal-border text-brutal-muted uppercase text-[10px]">
                      <th className="py-2.5 px-3">RANK</th>
                      <th className="py-2.5 px-3">LISTENER</th>
                      <th className="py-2.5 px-3">LEVEL</th>
                      <th className="py-2.5 px-3">EXPERIENCE</th>
                      <th className="py-2.5 px-3">TRACKS</th>
                      <th className="py-2.5 px-3">HOURS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map((u) => (
                      <tr 
                        key={u.userId} 
                        className={`border-b border-brutal-border hover:bg-brutal-secondary transition-colors ${
                          data.myRank === u.rank ? 'bg-brutal-accent/10 border-brutal-accent' : ''
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
                                {u.name}
                              </span>
                              <span className="text-[10px] text-brutal-muted block truncate">
                                @{u.username || `user_${u.userId.slice(-4)}`}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-brutal-text">
                          LVL {u.level}
                        </td>
                        <td className="py-2.5 px-3 text-brutal-accent font-bold">
                          {(u.xp || 0).toLocaleString()} XP
                        </td>
                        <td className="py-2.5 px-3 text-brutal-muted">
                          {u.songsPlayed || 0}
                        </td>
                        <td className="py-2.5 px-3 text-brutal-muted">
                          {Math.floor((u.listeningMinutes || 0) / 60)}h {(u.listeningMinutes || 0) % 60}m
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </BrutCard>
          )}
        </>
      )}
    </div>
  );
}
