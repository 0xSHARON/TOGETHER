import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ExternalLink, ShieldAlert, ArrowRight, Star } from 'lucide-react';
import { BrutButton } from '../components/Brutalist';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const FALLBACK_BOT = {
  name: "TOGETHER",
  tag: "TOGETHER#8106",
  id: "863496211667484676",
  avatar: "https://cdn.discordapp.com/avatars/863496211667484676/b2b06f7f709e0963ed8ac5b31218246f.png?size=512",
  banner: "https://cdn.discordapp.com/banners/863496211667484676/eeb36e3b03b9cee8ef995ca107b635e2.png?size=1024",
  totalGuilds: 106,
  totalUsers: 23075,
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const { user } = useAuth();
  const [bot, setBot] = useState(FALLBACK_BOT);

  useEffect(() => {
    axios
      .get('/api/overview')
      .then((res) => {
        if (res.data?.bot) {
          setBot((prev) => ({
            ...prev,
            ...res.data.bot,
            avatar: res.data.bot.avatar || prev.avatar,
            banner: res.data.bot.banner || prev.banner,
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text flex items-center justify-center p-4 brutal-grid">
      <SEO 
        title="Login — TOGETHER Discord Music Bot Dashboard"
        description="Authorize with Discord to access the TOGETHER Discord music bot dashboard, control 3D webplayer streaming, manage 24/7 channels, and tune audio settings."
        canonical="https://dash.together.dpdns.org/login"
      />
      <div className="max-w-md w-full border-2 border-brutal-border bg-brutal-surface shadow-brutal relative overflow-hidden">
        {/* Bot Banner */}
        <div className="relative w-full h-36 bg-zinc-900 border-b-2 border-brutal-border overflow-hidden">
          <img
            src={bot.banner}
            alt={`${bot.name} Banner`}
            className="w-full h-full object-cover"
            onError={(e) => {
              if (e.target.src !== FALLBACK_BOT.banner) {
                e.target.src = FALLBACK_BOT.banner;
              }
            }}
          />
          {/* Dark gradient overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

          {/* Top-left System Status Tag */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 bg-black/85 border border-brutal-border text-[9px] font-mono text-zinc-300 font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ONLINE // {bot.totalGuilds ? `${bot.totalGuilds} GUILDS` : "24/7 AUDIO"}
          </div>

          {/* Top-right Official Tag */}
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-brutal-accent text-black text-[9px] font-mono font-black uppercase tracking-wider shadow-sm">
            OFFICIAL BOT
          </div>
        </div>

        {/* Bot Avatar (PFP) overlapping the Banner */}
        <div className="relative px-6 -mt-12 flex items-end justify-between">
          <div className="relative">
            <img
              src={bot.avatar}
              alt={bot.name}
              className="w-24 h-24 border-2 border-brutal-border bg-black object-cover shadow-brutal"
              onError={(e) => {
                if (e.target.src !== FALLBACK_BOT.avatar) {
                  e.target.src = FALLBACK_BOT.avatar;
                }
              }}
            />
            {/* Online Status indicator badge */}
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-black flex items-center justify-center shadow-sm"
              title="Bot Online"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>

          <div className="flex flex-col items-end pb-1">
            <span className="font-mono text-[9px] text-brutal-muted uppercase tracking-wider">
              VERIFIED BOT // DISCORD
            </span>
            <span className="font-mono text-xs font-black text-brutal-accent">
              {bot.tag || "TOGETHER#8106"}
            </span>
          </div>
        </div>

        {/* Card Body Content */}
        <div className="p-6 pt-3">
          <div className="w-full h-1.5 brutal-hazard-emerald mb-4" />

          <div className="flex items-center gap-3 mb-1">
            <div className="w-3.5 h-3.5 bg-brutal-accent border border-black shadow-brutal-sm" />
            <h1 className="font-display font-black text-2xl tracking-wider text-brutal-text">
              {bot.name || "TOGETHER"} // DASH
            </h1>
          </div>

          <p className="font-mono text-xs text-brutal-muted uppercase tracking-widest mb-4">
            24-BIT LOSSLESS AUDIO OS
          </p>

          {/* Telemetry stats */}
          <div className="grid grid-cols-2 gap-2 mb-5 font-mono text-[11px]">
            <div className="border border-brutal-border bg-black/60 p-2.5 flex items-center justify-between">
              <span className="text-brutal-muted uppercase">SERVERS</span>
              <span className="font-bold text-white">
                {bot.totalGuilds ? bot.totalGuilds.toLocaleString() : "106"}
              </span>
            </div>
            <div className="border border-brutal-border bg-black/60 p-2.5 flex items-center justify-between">
              <span className="text-brutal-muted uppercase">LISTENERS</span>
              <span className="font-bold text-white">
                {bot.totalUsers
                  ? bot.totalUsers > 1000
                    ? `${(bot.totalUsers / 1000).toFixed(1)}k`
                    : bot.totalUsers
                  : "23k+"}
              </span>
            </div>
          </div>

          {/* If User Already Authenticated */}
          {user ? (
            <div className="border-2 border-brutal-accent bg-black p-4 mb-6 shadow-brutal-sm space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-10 h-10 border-2 border-brutal-accent object-cover shrink-0"
                />
                <div className="overflow-hidden">
                  <span className="font-mono text-[9px] text-brutal-accent font-black uppercase tracking-wider block">
                    ACTIVE DISCORD SESSION
                  </span>
                  <p className="font-mono font-bold text-sm text-brutal-text truncate">
                    {user.global_name || user.username}
                  </p>
                </div>
              </div>
              <p className="font-mono text-xs text-brutal-muted">
                You are currently authenticated. You can proceed directly to your music control center.
              </p>
              <Link to="/overview" className="block w-full">
                <BrutButton variant="primary" size="md" className="w-full" icon={ArrowRight}>
                  ENTER DASHBOARD
                </BrutButton>
              </Link>
            </div>
          ) : (
            <p className="font-mono text-xs text-brutal-text leading-relaxed mb-6">
              Log in with your Discord account to control active music sessions, configure 24/7 channels, view global rankings, and customize music cards.
            </p>
          )}

          {/* Error Banners */}
          {error && (
            <div className="mb-6 border-2 border-brutal-danger bg-red-950/40 p-4 shadow-brutal-sm space-y-2">
              <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  {error === 'missing_client_secret' || error === 'invalid_client_secret'
                    ? 'DISCORD CLIENT SECRET REQUIRED'
                    : error === 'missing_code'
                    ? 'MISSING AUTHORIZATION CODE'
                    : 'DISCORD OAUTH2 FAILED'}
                </span>
              </div>
              <p className="font-mono text-[11px] text-zinc-300 leading-relaxed">
                {error === 'missing_client_secret' || error === 'invalid_client_secret' ? (
                  <>
                    The bot’s Discord OAuth2 Client Secret (<code>DISCORD_CLIENT_SECRET</code>) has not been added to the server environment yet. Please add <code>DISCORD_CLIENT_SECRET=&lt;secret&gt;</code> in <code>.env</code> from your Discord Developer Portal.
                  </>
                ) : error === 'missing_code' ? (
                  'Discord did not provide an authorization code. Please retry the login procedure.'
                ) : (
                  'Discord authorization was cancelled or failed to verify. Ensure your Redirect URI is set to https://dash.together.dpdns.org/api/auth/callback in the Discord Developer Portal.'
                )}
              </p>
            </div>
          )}

          {/* Login Button */}
          {!user && (
            <a href="/api/auth/login" className="block w-full">
              <BrutButton variant="primary" size="lg" className="w-full" icon={ExternalLink}>
                CONNECT VIA DISCORD
              </BrutButton>
            </a>
          )}

          {/* Footer Links with Real Top.gg URL */}
          <div className="mt-6 pt-4 border-t border-brutal-border flex justify-between items-center font-mono text-[10px] text-brutal-muted uppercase flex-wrap gap-2">
            <span>OAUTH2 ENCRYPTED</span>
            <div className="flex items-center gap-3">
              <a
                href="https://top.gg/bot/863496211667484676/vote"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1"
              >
                <Star className="w-3 h-3 fill-amber-400" />
                TOP.GG VOTE
              </a>
              <a
                href="https://discord.gg/mUdGTs2Dw5"
                target="_blank"
                rel="noreferrer"
                className="text-brutal-accent hover:underline"
              >
                SUPPORT SERVER
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
