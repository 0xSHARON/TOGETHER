import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Server, 
  Users, 
  Disc3, 
  Radio, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Flame, 
  ExternalLink, 
  Terminal, 
  Sliders, 
  Layers, 
  Cpu, 
  Sparkles,
  Zap
} from 'lucide-react';
import { BrutCard, StatBox, BrutButton } from '../components/Brutalist';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

export default function OverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 5000);
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
  const owner = data?.owner || {
    name: "KAJU🦋",
    tag: "kajukatli.",
    avatar: "https://cdn.discordapp.com/avatars/780345293237125152/7f51fb84d251a79180344e8ee91a4fb1.png?size=512",
    role: "Bot Owner & Core Audio Systems Architect",
    credit: "Engineered and crafted by kajukatli. High-performance Discord audio streaming & 3D WebGL visuals."
  };
  const features = data?.features || [
    { title: "24-Bit Lossless Quality", desc: "Studio-grade Opus 320kbps lossless streaming engine with custom system FFmpeg pipeline.", badge: "320 KBPS" },
    { title: "Universal Source Engine", desc: "Effortlessly stream from YouTube, Spotify, SoundCloud, Apple Music, and direct HTTP audio.", badge: "MULTI-SRC" },
    { title: "Studio DSP Filter Suite", desc: "14 real-time DSP sound filters including Bassboost, Nightcore, Vaporwave, and 8D Spatial Audio.", badge: "REALTIME DSP" },
    { title: "24/7 Persistent Voice", desc: "Non-stop 24/7 audio connection with auto-reconnect failover, health monitors, and queue recovery.", badge: "24/7 UPTIME" },
    { title: "Smart Music Autoplay", desc: "Intelligent related song discovery keeping the audio stream alive when queue ends.", badge: "AUTOPLAY" },
    { title: "Low-Latency Gateway", desc: "Sub-20ms Discord voice packet dispatch with UDP jitter buffer recovery and high uptime.", badge: "SUB-20MS" }
  ];
  const sessions = data?.activeSessions || [];

  const uptimeHours = Math.floor((bot.uptime || 0) / 3600);
  const uptimeMinutes = Math.floor(((bot.uptime || 0) % 3600) / 60);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <SEO 
        title="Dashboard Overview — TOGETHER Discord Music Bot"
        description="Monitor Discord music bot cluster status, live voice sessions, node telemetry, active listeners, and audio streaming statistics."
        canonical="https://dash.together.dpdns.org/overview"
      />
      {/* Hero Banner with Logo & Status */}
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 md:p-8 shadow-brutal flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <img
            src="/logo.png"
            alt="TOGETHER BOT"
            className="w-20 h-20 md:w-24 md:h-24 object-contain shrink-0 border-2 border-black shadow-brutal-sm bg-black p-1"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-brutal-accent animate-ping rounded-full inline-block"></span>
              <span className="font-mono text-xs uppercase text-brutal-accent tracking-widest font-black">
                {bot.version || "v2.5.0"} • NATIVE OPUS STREAMING ENGINE
              </span>
            </div>
            <h1 className="font-display font-black text-3xl md:text-5xl text-brutal-text uppercase tracking-tight">
              TOGETHER // BOT
            </h1>
            <p className="font-mono text-xs text-brutal-muted mt-1 max-w-xl">
              High-resolution 24-bit studio audio streaming, real-time 3D WebGL soundstage, and brutalist command infrastructure for Discord.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons & Auth State */}
        <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-auto shrink-0">
          {user ? (
            <a href="/servers" className="w-full">
              <BrutButton variant="primary" size="md" className="w-full" icon={Server}>
                MANAGE SERVERS
              </BrutButton>
            </a>
          ) : (
            <a href="/api/auth/login" className="w-full">
              <BrutButton variant="primary" size="md" className="w-full" icon={ExternalLink}>
                LOGIN WITH DISCORD
              </BrutButton>
            </a>
          )}
          <a
            href="https://together.dpdns.org/visualizer/"
            target="_blank"
            rel="noreferrer"
            className="w-full"
          >
            <BrutButton variant="outline" size="md" className="w-full" icon={Radio}>
              LAUNCH 3D STAGE
            </BrutButton>
          </a>
        </div>
      </div>

      {/* Numeric Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox 
          label="CONNECTED GUILDS" 
          value={`${bot.totalGuilds || 106}`} 
          sub="Synchronized Shards" 
          icon={Server} 
          accent 
        />
        <StatBox 
          label="TOTAL AUDIENCE" 
          value={`${(bot.totalUsers || 23000).toLocaleString()}+`} 
          sub="Registered Community" 
          icon={Users} 
        />
        <StatBox 
          label="ACTIVE PLAYERS" 
          value={data?.activePlayers ?? sessions.length} 
          sub="Lossless Voice Streams" 
          icon={Disc3} 
          accent 
        />
        <StatBox 
          label="GATEWAY LATENCY" 
          value={`${bot.ping || 24}ms`} 
          sub="Discord Websocket Ping" 
          icon={Activity} 
        />
      </div>

      {/* Active Music Broadcasts Feed */}
      <BrutCard
        title="LIVE AUDIO BROADCASTS"
        subtitle="Currently playing music streams across connected Discord voice channels"
        badge={`${sessions.length} ACTIVE`}
      >
        {sessions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-brutal-border bg-brutal-secondary p-8">
            <Radio className="w-12 h-12 text-brutal-muted mx-auto mb-3" />
            <h4 className="font-display font-bold text-lg text-brutal-text uppercase">NO ACTIVE STREAMS DETECTED</h4>
            <p className="font-mono text-xs text-brutal-muted mt-1 max-w-md mx-auto">
              No servers are playing music right now. Join a voice channel in your Discord server and type <code className="text-brutal-accent">/play</code>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((s, idx) => (
              <div key={idx} className="border-2 border-brutal-border bg-brutal-bg p-4 flex flex-col justify-between shadow-brutal-sm hover:border-brutal-accent transition-colors">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-xs font-bold text-brutal-text truncate max-w-[180px] uppercase">
                      {s.guildName}
                    </span>
                    <span className="font-mono text-[9px] px-2 py-0.5 bg-brutal-accent text-black font-black uppercase">
                      {s.playing ? "● LIVE" : "PAUSED"}
                    </span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <img 
                      src={s.thumbnail || "/logo.png"} 
                      alt="Art" 
                      className="w-14 h-14 border-2 border-black object-cover shrink-0 shadow-brutal-sm" 
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
                  <a
                    href={`/player?guild=${s.guildId}`}
                    className="font-mono text-xs text-brutal-accent hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>CONTROL STREAM</span> →
                  </a>
                  <a
                    href={`https://together.dpdns.org/visualizer/?guild=${s.guildId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[10px] text-brutal-muted hover:text-white uppercase flex items-center gap-1"
                  >
                    <span>3D STAGE</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </BrutCard>

      {/* Core Engineering Features Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-brutal-border pb-3">
          <div>
            <span className="font-mono text-[10px] uppercase text-brutal-accent font-black tracking-widest">
              SYSTEM CAPABILITIES
            </span>
            <h3 className="font-display font-black text-2xl text-brutal-text uppercase">
              STUDIO AUDIO ARCHITECTURE
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat, i) => (
            <div key={i} className="border-2 border-brutal-border bg-brutal-surface p-5 shadow-brutal-sm space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-base text-brutal-text uppercase">
                  {feat.title}
                </h4>
                <span className="font-mono text-[9px] px-2 py-0.5 bg-black border border-brutal-border text-brutal-accent font-bold uppercase">
                  {feat.badge}
                </span>
              </div>
              <p className="font-mono text-xs text-brutal-muted leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bot Owner & Developer Card */}
      <div className="border-2 border-brutal-border bg-brutal-surface p-6 shadow-brutal flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
          <img
            src={owner.avatar || "/logo.png"}
            alt={owner.name}
            className="w-20 h-20 border-4 border-black object-cover shadow-brutal shrink-0"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="font-mono text-[9px] uppercase bg-brutal-accent text-black font-black px-2 py-0.5 tracking-wider">
                SYSTEM ARCHITECT & BOT OWNER
              </span>
              <span className="font-mono text-[9px] uppercase border border-brutal-border bg-black text-zinc-400 px-2 py-0.5">
                ID: {owner.id || "780345293237125152"}
              </span>
            </div>
            <h4 className="font-display font-black text-2xl text-brutal-text uppercase">
              {owner.name} <span className="text-brutal-muted text-base font-normal">(@{owner.tag})</span>
            </h4>
            <p className="font-mono text-xs text-brutal-muted max-w-xl">
              {owner.credit || "Engineered and crafted by kajukatli. High-performance Discord audio streaming & 3D WebGL visuals."}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
          <a
            href="https://discord.gg/mUdGTs2Dw5"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-brutal-accent text-black font-mono text-xs font-bold uppercase border-2 border-black shadow-brutal-sm text-center hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            JOIN SUPPORT SERVER
          </a>
          <a
            href="https://top.gg/bot/863496211667484676/vote"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 border-2 border-amber-500 bg-amber-950/30 text-amber-400 font-mono text-xs font-bold uppercase text-center hover:bg-amber-500 hover:text-black transition-all"
          >
            ⭐ VOTE ON TOP.GG
          </a>
        </div>
      </div>
    </div>
  );
}
