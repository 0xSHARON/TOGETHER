import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  ArrowLeft, 
  Radio, 
  Home, 
  Terminal, 
  Headphones, 
  Layers,
  Disc3
} from 'lucide-react';
import { BrutButton } from '../components/Brutalist';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text font-mono flex flex-col justify-between p-4 sm:p-8 brutal-grid">
      {/* Top Header Strip */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between pb-6 border-b-2 border-brutal-border">
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="TOGETHER" className="w-8 h-8 object-contain" />
          <span className="font-display font-black text-xl text-white group-hover:text-brutal-accent transition-colors">
            TOGETHER // AUDIO OS
          </span>
        </Link>
        <span className="font-mono text-xs bg-red-600 text-white font-black px-2 py-0.5 border border-black shadow-brutal-sm">
          ERROR 404
        </span>
      </header>

      {/* Main 404 Error Center Box */}
      <main className="max-w-2xl mx-auto w-full py-12">
        <div className="border-4 border-brutal-border bg-brutal-surface p-6 sm:p-10 shadow-brutal space-y-6 relative overflow-hidden">
          {/* Decorative Corner Badge */}
          <div className="absolute top-0 right-0 bg-brutal-accent text-black font-black text-[10px] px-3 py-1 border-b-2 border-l-2 border-brutal-border uppercase tracking-widest">
            SECTOR UNREACHABLE
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border-2 border-black bg-red-600 text-white flex items-center justify-center shrink-0 shadow-brutal-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <span className="font-mono text-xs font-black text-red-500 uppercase tracking-widest block">
                SIGNAL TIMEOUT // 404
              </span>
              <h1 className="font-display font-black text-4xl sm:text-5xl text-white uppercase tracking-tight">
                PAGE NOT FOUND
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 font-mono leading-relaxed border-l-2 border-brutal-accent pl-3">
            The requested audio sector, dashboard route, or stream coordinate does not exist or has been reassigned to a different cluster frequency.
          </p>

          {/* Technical Diagnostics Box */}
          <div className="bg-black border-2 border-zinc-800 p-4 font-mono text-xs space-y-1.5 text-zinc-400">
            <div className="flex justify-between">
              <span>STATUS_CODE:</span>
              <strong className="text-red-400">404 NOT_FOUND</strong>
            </div>
            <div className="flex justify-between">
              <span>STREAM_CHANNEL:</span>
              <strong className="text-zinc-200">OUT_OF_BOUNDS</strong>
            </div>
            <div className="flex justify-between">
              <span>DIAGNOSTIC:</span>
              <strong className="text-brutal-accent">ROUTER_FAILOVER_READY</strong>
            </div>
          </div>

          {/* Action Navigation Matrix */}
          <div className="pt-2 space-y-3">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              RE-ESTABLISH TELEMETRY VIA AVAILABLE CORRIDORS:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/">
                <button className="w-full p-3 bg-brutal-accent text-black font-mono font-black text-xs uppercase border-2 border-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2">
                  <Home className="w-4 h-4" />
                  <span>RETURN TO HOME</span>
                </button>
              </Link>

              <Link to="/overview">
                <button className="w-full p-3 bg-zinc-900 text-white font-mono font-bold text-xs uppercase border-2 border-zinc-700 hover:border-white transition-all flex items-center justify-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>OPEN DASHBOARD</span>
                </button>
              </Link>

              <Link to="/player">
                <button className="w-full p-3 bg-zinc-900 text-white font-mono font-bold text-xs uppercase border-2 border-zinc-700 hover:border-white transition-all flex items-center justify-center gap-2">
                  <Headphones className="w-4 h-4 text-amber-400" />
                  <span>AUDIO PLAYER</span>
                </button>
              </Link>

              <Link to="/commands">
                <button className="w-full p-3 bg-zinc-900 text-white font-mono font-bold text-xs uppercase border-2 border-zinc-700 hover:border-white transition-all flex items-center justify-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>COMMAND REGISTRY</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="max-w-6xl mx-auto w-full pt-6 border-t-2 border-brutal-border flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <Disc3 className="w-4 h-4 text-brutal-accent animate-spin" />
          <span>TOGETHER AUDIO PROTOCOL • 24-BIT ARCHITECTURE</span>
        </div>
        <span>Crafted by KAJU🦋</span>
      </footer>
    </div>
  );
}
