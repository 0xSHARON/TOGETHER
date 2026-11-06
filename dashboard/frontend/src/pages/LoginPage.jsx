import React from 'react';
import { ExternalLink, Radio, Disc3, ShieldCheck } from 'lucide-react';
import { BrutButton, BrutCard } from '../components/Brutalist';

export default function LoginPage() {
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

        <p className="font-mono text-xs text-brutal-text leading-relaxed mb-6">
          Log in with your Discord account to control active music sessions, configure 24/7 channels, view global rankings, and customize music cards.
        </p>

        <a href="/api/auth/login" className="block w-full">
          <BrutButton variant="primary" size="lg" className="w-full" icon={ExternalLink}>
            CONNECT VIA DISCORD
          </BrutButton>
        </a>

        <div className="mt-8 pt-4 border-t border-brutal-border flex justify-between items-center font-mono text-[10px] text-brutal-muted uppercase">
          <span>OAUTH2 ENCRYPTED</span>
          <a href="https://discord.gg/mUdGTs2Dw5" target="_blank" rel="noreferrer" className="text-brutal-accent hover:underline">
            SUPPORT SERVER
          </a>
        </div>
      </div>
    </div>
  );
}

