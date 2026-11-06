import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, ArrowUpRight, Scale, Lock, HeartHandshake, Database, AlertCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text font-mono p-4 md:p-8 flex flex-col justify-between selection:bg-brutal-accent selection:text-black">
      {/* Top Navbar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal mb-8">
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="TOGETHER Logo" className="w-8 h-8 object-contain" />
          <span className="font-display font-black text-sm tracking-wider group-hover:text-brutal-accent transition-colors">
            TOGETHER // TERMS OF SERVICE
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
            <Scale className="w-4 h-4" />
            <span>LEGAL CONTRACT & USAGE POLICIES</span>
          </div>
          <h1 className="font-display font-black text-2xl md:text-4xl text-white uppercase tracking-tight">
            TERMS OF SERVICE
          </h1>
          <p className="font-mono text-xs text-brutal-muted mt-2">
            LAST REVISED: NOVEMBER 2026 • EFFECTIVE ACROSS DISCORD BOT APPLICATION & WEB DASHBOARD
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-3">
          <h2 className="font-display font-black text-lg text-white uppercase flex items-center gap-2">
            <span className="text-brutal-accent">01.</span> ACCEPTANCE OF TERMS
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
            By inviting, accessing, adding, or using <strong>TOGETHER</strong> ("the Bot"), or visiting and signing into the <strong>TOGETHER Web Dashboard</strong> (<code>dash.together.dpdns.org</code>, "the Dashboard"), you ("User", "Guild Administrator") acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service. If you do not agree to all terms outlined herein, you must immediately remove the Bot from your Discord server and cease use of the Dashboard.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h2 className="font-display font-black text-lg text-white uppercase flex items-center gap-2">
            <span className="text-brutal-accent">02.</span> DISCORD TERMS & COMMUNITY COMPLIANCE
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
            TOGETHER operates strictly within the official Discord API ecosystem. You agree that your use of the Bot and Dashboard will adhere to:
          </p>
          <ul className="list-disc list-inside text-xs md:text-sm text-zinc-300 space-y-1.5 pl-2">
            <li><a href="https://discord.com/terms" target="_blank" rel="noreferrer" className="text-brutal-accent underline hover:text-white">Discord Terms of Service</a></li>
            <li><a href="https://discord.com/guidelines" target="_blank" rel="noreferrer" className="text-brutal-accent underline hover:text-white">Discord Community Guidelines</a></li>
            <li><a href="https://discord.com/developers/docs/policies-and-agreements/developer-terms-of-service" target="_blank" rel="noreferrer" className="text-brutal-accent underline hover:text-white">Discord Developer Terms of Service</a></li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h2 className="font-display font-black text-lg text-white uppercase flex items-center gap-2">
            <span className="text-brutal-accent">03.</span> ACCEPTABLE USE & PROHIBITED CONDUCT
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
            You agree not to engage in any malicious, abusive, or unauthorized behavior, including but not limited to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-300">
            <div className="border border-brutal-border bg-black/40 p-3">
              <strong className="text-white block mb-1">API Exploitation & Flooding</strong>
              Spamming commands, intentionally overwhelming Lavalink audio nodes, or sending automated API requests to crash the bot or dashboard.
            </div>
            <div className="border border-brutal-border bg-black/40 p-3">
              <strong className="text-white block mb-1">TOS Violations & Malicious Media</strong>
              Attempting to stream illegal, abusive, hate-speech content, or audio intended to harm listener hearing (ear-rape audio loops).
            </div>
            <div className="border border-brutal-border bg-black/40 p-3">
              <strong className="text-white block mb-1">Reverse Engineering & Exploits</strong>
              Decompiling, scraping, or attempting to compromise authentication session cookies or bot tokens.
            </div>
            <div className="border border-brutal-border bg-black/40 p-3">
              <strong className="text-white block mb-1">Guild Impersonation</strong>
              Attempting to modify 24/7 or prefix configurations of guilds you do not administer or own.
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h2 className="font-display font-black text-lg text-white uppercase flex items-center gap-2">
            <span className="text-brutal-accent">04.</span> SERVICE AVAILABILITY & WARRANTY DISCLAIMER
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
            TOGETHER and its Dashboard are provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind, either express or implied. While we strive for 99.9% uptime, we do not guarantee uninterrupted playback, lossless stream guarantees during upstream third-party downtime (such as Discord Voice Gateway drops, YouTube/Spotify API rate limits, or host maintenance).
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-3">
          <h2 className="font-display font-black text-lg text-white uppercase flex items-center gap-2">
            <span className="text-brutal-accent">05.</span> TERMINATION & BLACKLISTING
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
            We reserve the right to revoke access, blacklist users, or force-leave Discord servers at our sole discretion, without prior notice, if a user or server is found violating these Terms or engaging in disruptive conduct.
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-3">
          <h2 className="font-display font-black text-lg text-white uppercase flex items-center gap-2">
            <span className="text-brutal-accent">06.</span> CONTACT & DISPUTES
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
            For questions regarding these Terms or to appeal a blacklist, please join our official Discord Support Guild at: <a href="https://discord.gg/mUdGTs2Dw5" target="_blank" rel="noreferrer" className="text-brutal-accent underline font-bold">discord.gg/mUdGTs2Dw5</a>.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-brutal-muted">
        <span>TOGETHER // LEGAL CONTRACT</span>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-brutal-accent uppercase">Privacy Policy</Link>
          <Link to="/" className="hover:text-brutal-accent uppercase">Landing Page</Link>
          <Link to="/login" className="hover:text-brutal-accent uppercase">Dashboard</Link>
        </div>
      </footer>
    </div>
  );
}
