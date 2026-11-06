import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Medal, Trophy, Flame, Music, Clock } from 'lucide-react';
import { BrutCard, StatBox } from '../components/Brutalist';

export default function LeaderboardPage() {
  const [data, setData] = useState({ leaderboard: [], totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      const resp = await axios.get('/api/xp/leaderboard', { withCredentials: true });
      setData(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const top3 = data.leaderboard.slice(0, 3);
  const rest = data.leaderboard.slice(3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal flex justify-between items-center flex-wrap gap-4">
        <div>
          <span className="font-mono text-xs uppercase text-brutal-accent font-black tracking-widest">
            COMPETITIVE AUDIO AUDIENCE
          </span>
          <h2 className="font-display font-black text-3xl text-brutal-text uppercase">
            MUSIC XP LEADERBOARD
          </h2>
          <p className="font-mono text-xs text-brutal-muted mt-1">
            Top listeners and supporters ranked across all {data.totalUsers} registered community members.
          </p>
        </div>
      </div>

      {/* Podium Display (Top 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {top3.map((user, idx) => (
          <BrutCard 
            key={user.userId} 
            className="text-center relative pt-8"
            highlight={idx === 0}
            badge={`RANK #${user.rank}`}
          >
            <div className="w-16 h-16 mx-auto mb-3 border-2 border-black bg-brutal-secondary flex items-center justify-center shadow-brutal">
              <Trophy className={`w-8 h-8 ${idx === 0 ? "text-brutal-accent" : idx === 1 ? "text-slate-300" : "text-amber-600"}`} />
            </div>
            <h4 className="font-mono font-bold text-base text-brutal-text truncate">
              User {user.userId.slice(-6)}
            </h4>
            <p className="font-mono text-xs text-brutal-accent font-bold mt-1">
              LEVEL {user.level} • {user.xp.toLocaleString()} XP
            </p>
            <div className="mt-4 pt-4 border-t border-brutal-border grid grid-cols-2 gap-2 text-left font-mono text-[11px]">
              <div>
                <span className="text-brutal-muted">SONGS:</span> <span className="font-bold text-brutal-text">{user.songsPlayed}</span>
              </div>
              <div>
                <span className="text-brutal-muted">HOURS:</span> <span className="font-bold text-brutal-text">{Math.floor(user.listeningMinutes / 60)}h</span>
              </div>
            </div>
          </BrutCard>
        ))}
      </div>

      {/* Ranks Table (4 to 20) */}
      <BrutCard title="COMMUNITY RANKINGS" subtitle="Top active listeners">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b-2 border-brutal-border text-brutal-muted uppercase text-[10px]">
                <th className="py-2.5 px-3">RANK</th>
                <th className="py-2.5 px-3">USER ID</th>
                <th className="py-2.5 px-3">LEVEL</th>
                <th className="py-2.5 px-3">TOTAL XP</th>
                <th className="py-2.5 px-3">SONGS PLAYED</th>
                <th className="py-2.5 px-3">LISTEN TIME</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((u) => (
                <tr key={u.userId} className="border-b border-brutal-border hover:bg-brutal-secondary transition-colors">
                  <td className="py-3 px-3 font-bold text-brutal-accent">#{u.rank}</td>
                  <td className="py-3 px-3 text-brutal-text font-bold">...{u.userId.slice(-8)}</td>
                  <td className="py-3 px-3 text-brutal-text">LVL {u.level}</td>
                  <td className="py-3 px-3 text-brutal-accent font-bold">{u.xp.toLocaleString()} XP</td>
                  <td className="py-3 px-3 text-brutal-muted">{u.songsPlayed} tracks</td>
                  <td className="py-3 px-3 text-brutal-muted">{Math.floor(u.listeningMinutes / 60)}h {u.listeningMinutes % 60}m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BrutCard>
    </div>
  );
}

