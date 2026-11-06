import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ExternalLink, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Star } from 'lucide-react';
import { BrutButton } from '../components/Brutalist';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text flex items-center justify-center p-4 brutal-grid">
      <div className="max-w-md w-full border-2 border-brutal-border bg-brutal-surface p-8 shadow-brutal relative">
        <div className="w-full h-2 brutal-hazard-emerald mb-6"></div>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-4 h-4 bg-brutal-accent border border-black shadow-brutal-sm"></div>
          <h1 className="font-display font-black text-2xl tracking-wider text-brutal-text">
            TOGETHER // DASH
          </h1>
        </div>

        <p className="font-mono text-xs text-brutal-muted uppercase tracking-widest mb-6">
          24-BIT LOSSLESS AUDIO OS
        </p>

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
        <div className="mt-8 pt-4 border-t border-brutal-border flex justify-between items-center font-mono text-[10px] text-brutal-muted uppercase flex-wrap gap-2">
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
  );
}
