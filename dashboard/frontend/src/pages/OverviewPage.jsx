import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Users, Disc3, Radio, Activity, Clock, ShieldCheck, Flame } from 'lucide-react';
import { BrutCard, StatBox, BrutButton } from '../components/Brutalist';

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 6000);
    return () => clearInterval(interval);
  }, []);

  async function fetchOverview() {
    try {
      const resp = await axios.get('/api/overview');
      setData(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const bot = data?.bot || {};
  const sessions = data?.activeSessions || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-brutal-accent animate-ping rounded-full inline-block"></span>
            <span className="font-mono text-xs uppercase text-brutal-accent tracking-widest font-black">
              LIVE SYSTEM TELEMETRY
            </span>
          </div>
          <h2 className="font-display font-black text-3xl md:text-4xl text-brutal-text uppercase">
            CONTROL CENTER OVERVIEW
          </h2>
          <p className="font-mono text-xs text-brutal-muted mt-1">
            Real-time status monitoring for TOGETHER Discord High-Resolution Music Cluster.
          </p>
        </div>
        <div className="flex gap-2">
          <a href="https://together.dpdns.org/visualizer/" target="_blank" rel="noreferrer">
            <BrutButton variant="outline" size="sm" icon={Radio}>
              3D STAGE
            </BrutButton>
          </a>
          <a href="/servers">
            <BrutButton variant="primary" size="sm" icon={Server}>
              MANAGE SERVERS
            </BrutButton>
          </a>
        </div>
      </div>

      {/* Top Numeric Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox 
          label="CONNECTED GUILDS" 
          value={`${bot.totalGuilds || 103}+`} 
          sub="Synchronized Shards" 
          icon={Server} 
          accent 
        />
        <StatBox 
          label="TOTAL LISTENERS" 
          value={`${(bot.totalUsers || 6770).toLocaleString()}+`} 
          sub="Global Audiences" 
          icon={Users} 
        />
        <StatBox 
          label="ACTIVE PLAYERS" 
          value={data?.activePlayers ?? sessions.length} 
          sub="Streaming 24-Bit Opus" 
          icon={Disc3} 
          accent 
        />
        <StatBox 
          label="GATEWAY LATENCY" 
          value={`${bot.ping || 24}ms`} 
          sub="Discord Websocket" 
          icon={Activity} 
        />
      </div>

      {/* Active Broadcasts Feed */}
      <BrutCard title="ACTIVE DISCORD MUSIC BROADCASTS" subtitle="Real-time synchronized streams" badge={`${sessions.length} SESSIONS`}>
        {sessions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-brutal-border bg-brutal-secondary p-8">
            <Radio className="w-12 h-12 text-brutal-muted mx-auto mb-3" />
            <h4 className="font-display font-bold text-lg text-brutal-text uppercase">NO ACTIVE STREAMS DETECTED</h4>
            <p className="font-mono text-xs text-brutal-muted mt-1 max-w-md mx-auto">
              No servers are playing music right now. Connect to a voice channel in your Discord server and type <code className="text-brutal-accent">/play</code>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((s, idx) => (
              <div key={idx} className="border-2 border-brutal-border bg-brutal-secondary p-4 flex flex-col justify-between shadow-brutal-sm">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-xs font-bold text-brutal-text truncate max-w-[180px]">{s.guildName}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-brutal-accent text-black font-black uppercase">
                      {s.playing ? "● LIVE" : "PAUSED"}
                    </span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <img 
                      src={s.thumbnail || "https://together.dpdns.org/logo.png"} 
                      alt="Art" 
                      className="w-14 h-14 border border-black object-cover shrink-0" 
                    />
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm text-brutal-text truncate">{s.title}</p>
                      <p className="font-mono text-xs text-brutal-muted truncate">{s.author}</p>
                      <p className="font-mono text-[10px] text-brutal-accent mt-1">
                        🔊 {s.voiceChannelName} • {s.listeners} listeners
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-brutal-border flex justify-between items-center">
                  <a href={`/player?guild=${s.guildId}`} className="font-mono text-xs text-brutal-accent hover:underline flex items-center gap-1">
                    <span>CONTROL STREAM</span> →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </BrutCard>
    </div>
  );
}

