import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, Database, Trash2, EyeOff, KeyRound } from 'lucide-react';
import SEO from '../components/SEO';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text font-mono p-4 md:p-8 flex flex-col justify-between selection:bg-brutal-accent selection:text-black">
      <SEO 
        title="Privacy Policy — TOGETHER Discord Music Bot"
        description="Privacy policy and data retention practices for TOGETHER Discord music bot. Learn how telemetry, server configs, and Discord IDs are securely processed."
        canonical="https://dash.together.dpdns.org/privacy"
      />
      {/* Top Navbar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal mb-8">
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="TOGETHER Logo" className="w-8 h-8 object-contain" />
          <span className="font-display font-black text-sm tracking-wider group-hover:text-brutal-accent transition-colors">
            TOGETHER // PRIVACY POLICY
          </span>
        </Link>
        <Link
          to="/"
          className="px-3 py-1.5 bg-black border border-brutal-border hover:border-brutal-accent text-white font-bold text-xs uppercase shadow-brutal-sm flex items-center gap-1.5 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN HOME</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto border-2 border-brutal-border bg-brutal-surface p-6 md:p-10 shadow-brutal space-y-8">
        {/* Banner / Header Title */}
        <div className="border-b-2 border-brutal-border pb-6">
          <div className="flex items-center gap-2 text-brutal-accent text-xs font-black uppercase mb-2">
            <Lock className="w-4 h-4" />
            <span>TRANSPARENT TELEMETRY & DATA RETENTION</span>
          </div>
          <h1 className="font-display font-black text-2xl md:text-4xl text-white uppercase tracking-tight">
            PRIVACY POLICY
          </h1>
          <p className="font-mono text-xs text-brutal-muted mt-2">
            LAST REVISED: NOVEMBER 2026 • COMPLIANT WITH DISCORD DEVELOPER PRIVACY STANDARDS & GDPR PRINCIPLES
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="font-display font-black text-lg text-white uppercase flex items-center gap-2">
            <span className="text-brutal-accent">01.</span> INFORMATION WE COLLECT
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
            TOGETHER practices strict minimal data collection. We only store information necessary to provide music playback, rank XP, and execute dashboard settings:
          </p>
          <div className="space-y-2.5 text-xs text-zinc-300">
            <div className="border border-brutal-border bg-black/40 p-3">
              <strong className="text-white block mb-0.5">Discord User Data (When Authenticated or Command Used)</strong>
              Your Discord User ID, username, discriminator, and avatar hash. Used for verifying dashboard sessions, rendering your music card profile, and storing music XP leaderboard scores.
            </div>
            <div className="border border-brutal-border bg-black/40 p-3">
              <strong className="text-white block mb-0.5">Discord Guild Configuration</strong>
              Guild ID, chosen custom command prefix (default <code>.</code>), locked 24/7 voice channel ID, and custom playlist libraries created via <code>/playlist</code>.
            </div>
            <div className="border border-brutal-border bg-black/40 p-3">
              <strong className="text-white block mb-0.5">Music Preferences & Library</strong>
              Titles, authors, and URLs of songs you mark with <code>/like</code>, your custom bio, anthem, and chosen hex accent color.
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="font-display font-black text-lg text-white uppercase flex items-center gap-2">
            <span className="text-brutal-accent">02.</span> WHAT WE NEVER COLLECT OR RECORD
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
            Your privacy in voice and text channels is paramount:
          </p>
          <ul className="list-disc list-inside text-xs md:text-sm text-zinc-300 space-y-1.5 pl-2">
            <li><strong>No Voice Recording:</strong> TOGETHER does NOT record, tap, capture, store, or transmit your voice or microphone audio. Our audio engine is strictly an outbound audio player (transmit-only).</li>
            <li><strong>No Message Harvesting:</strong> We do NOT read, store, or log server messages that are not direct commands targeted to the bot.</li>
            <li><strong>No Passwords or Financial Details:</strong> Authentication is handled strictly through Discord OAuth2. We never see or store your Discord password, payment data, or billing address.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="font-display font-black text-lg text-white uppercase flex items-center gap-2">
            <span className="text-brutal-accent">03.</span> COOKIES & SESSION STORAGE
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
            The Web Dashboard uses a single secure, encrypted, HTTP-only JWT cookie (<code>together_token</code>) to verify your authenticated Discord session. We do not use third-party tracking pixels, marketing cookies, or behavioral advertising trackers.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="font-display font-black text-lg text-white uppercase flex items-center gap-2">
            <span className="text-brutal-accent">04.</span> DATA RETENTION & YOUR RIGHT TO DELETION
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
            All stored user preferences, playlists, and guild configurations persist until deleted. Under privacy regulations (including GDPR and CCPA), you have the right to request full erasure of your data:
          </p>
          <div className="border border-brutal-border bg-black/60 p-4 text-xs text-zinc-300 space-y-2">
            <div className="flex items-center gap-2 text-brutal-accent font-bold uppercase">
              <Trash2 className="w-4 h-4" />
              <span>HOW TO PURGE YOUR STORED DATA</span>
            </div>
            <p>
              To request a complete wipe of your user profile, liked songs, playlists, or server preferences, submit a request in our <a href="https://discord.gg/mUdGTs2Dw5" target="_blank" rel="noreferrer" className="text-white underline font-bold">Discord Support Guild</a> or contact the bot owner directly at <code>@kajukatli.</code>. Your records will be permanently removed from MongoDB within 48 hours.
            </p>
          </div>
        </div>

        {/* Section 5 */}
        <div className="space-y-3">
          <h2 className="font-display font-black text-lg text-white uppercase flex items-center gap-2">
            <span className="text-brutal-accent">05.</span> THIRD-PARTY SERVICES
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
            When streaming music, song queries may be resolved via third-party providers including Spotify, YouTube, SoundCloud, Deezer, and JioSaavn. Queries are processed anonymously via Lavalink audio nodes and are subject to their respective terms.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-brutal-muted">
        <span>TOGETHER // DATA PRIVACY PROTOCOL</span>
        <div className="flex gap-4">
          <Link to="/terms" className="hover:text-brutal-accent uppercase">Terms of Service</Link>
          <Link to="/" className="hover:text-brutal-accent uppercase">Landing Page</Link>
          <Link to="/login" className="hover:text-brutal-accent uppercase">Dashboard</Link>
        </div>
      </footer>
    </div>
  );
}

