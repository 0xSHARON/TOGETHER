import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  X, 
  ArrowLeft, 
  Disc3, 
  Zap, 
  Sliders, 
  Radio, 
  ExternalLink, 
  ArrowRight, 
  ShieldCheck, 
  Headphones, 
  HelpCircle,
  Layers,
  Sparkles
} from 'lucide-react';
import SEO from '../components/SEO';

const BOT_INVITE_URL = "https://discord.com/oauth2/authorize?client_id=863496211667484676&permissions=8&integration_type=0&scope=bot+applications.commands";
const TOPGG_VOTE_URL = "https://top.gg/bot/863496211667484676/vote";

const COMPARISON_ROWS = [
  {
    feature: "24-Bit Lossless Opus Audio (48,000Hz)",
    together: "Full 24-Bit PCM Direct",
    hydra: "Music Removed",
    rythm: "Web-Only / Stripped",
    smooth: "Standard 16-Bit",
    jockie: "Standard 16-Bit",
    highlight: true
  },
  {
    feature: "Interactive 3D WebGL Webplayer Visualizer",
    together: "Built-in Live Visualizer",
    hydra: "None",
    rythm: "None",
    smooth: "Basic Static Player",
    jockie: "Basic Static Player",
    highlight: true
  },
  {
    feature: "14 Studio DSP Audio Filters (8D, Bassboost)",
    together: "14 Free DSP Filters",
    hydra: "None",
    rythm: "None",
    smooth: "Limited / Basic",
    jockie: "Paid Premium Only",
    highlight: true
  },
  {
    feature: "24/7 Voice Channel Persistence",
    together: "100% Free (Vote Perk)",
    hydra: "None",
    rythm: "Paid Tier Only",
    smooth: "Vote Required",
    jockie: "$5/Month Premium",
    highlight: true
  },
  {
    feature: "Universal Sources (Spotify, YouTube, SoundCloud)",
    together: "All Major Platforms",
    hydra: "Soundcloud Only",
    rythm: "Limited Sources",
    smooth: "Spotify & YouTube",
    jockie: "Multiple Sources",
    highlight: false
  },
  {
    feature: "Dual Command Parity (Slash / & Prefix .)",
    together: "69 Prefix + 67 Slash",
    hydra: "Slash Only",
    rythm: "Slash Only",
    smooth: "Slash Only",
    jockie: "Both",
    highlight: false
  },
  {
    feature: "Global Listening Leaderboards & Server XP",
    together: "Full XP & Streaks",
    hydra: "None",
    rythm: "None",
    smooth: "None",
    jockie: "None",
    highlight: true
  },
  {
    feature: "Open Architecture & Verified Security",
    together: "Verified Open Source",
    hydra: "Proprietary Closed",
    rythm: "Proprietary Closed",
    smooth: "Proprietary Closed",
    jockie: "Proprietary Closed",
    highlight: false
  }
];

const BOT_REVIEWS = [
  {
    name: "Together Music Bot",
    status: "Active & Recommended",
    verdict: "The most capable 2026 Discord music streamer. Combines studio-grade sound with a live 3D webplayer visualizer, 14 free sound effects, and zero-stutter voice transmission.",
    bestFor: "Audiophiles, active gaming servers, and communities looking for high quality free music.",
    rating: "4.9 / 5.0"
  },
  {
    name: "Hydra Bot (Legacy Alternative)",
    status: "Music Discontinued",
    verdict: "Hydra was once one of the most popular bots on Discord, but discontinued all direct YouTube and Spotify music streaming due to platform policy updates. It now focuses primarily on server utility.",
    bestFor: "General server moderation (no longer viable for music playback).",
    rating: "2.5 / 5.0"
  },
  {
    name: "Rythm Bot (Legacy Alternative)",
    status: "Transformed to Web Platform",
    verdict: "Rythm originally served over 16 million servers before shutting down its classic voice bot. While a web-based activity exists, it lacks classic voice channel autonomy and free 24/7 channel locking.",
    bestFor: "Casual Discord Activities inside small voice rooms.",
    rating: "3.2 / 5.0"
  },
  {
    name: "Smooth Bot",
    status: "Active Alternative",
    verdict: "A solid alternative that handles basic Spotify playlists. However, it lacks live 3D WebGL audio visualizers and advanced DSP equalization filters like 8D binaural sound.",
    bestFor: "Basic server background music.",
    rating: "4.1 / 5.0"
  },
  {
    name: "Jockie Music",
    status: "Active Alternative",
    verdict: "Famous for allowing up to 4 bot instances on one server. However, essential features like 24/7 mode, advanced volume controls, and sound filters require paid monthly Patreon pledges.",
    bestFor: "Large servers needing multiple music bots simultaneously.",
    rating: "4.0 / 5.0"
  }
];

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text font-mono p-4 md:p-8 flex flex-col justify-between selection:bg-brutal-accent selection:text-black">
      <SEO 
        title="Best Discord Music Bot (2026 Comparison) — Together vs Hydra, Rythm & Jockie"
        description="Looking for the best Discord music bot in 2026? Compare Together vs Hydra, Rythm, Smooth Bot, and Jockie Music. Discover 24-bit sound, 3D WebGL player, and 24/7 mode."
        canonical="https://dash.together.dpdns.org/compare"
      />

      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal mb-8">
        <Link to="/" className="flex items-center gap-3 group" aria-label="Together Music Bot Home">
          <img src="/logo.webp" alt="Together Logo" width="32" height="32" className="w-8 h-8 object-contain" />
          <span className="font-display font-black text-sm tracking-wider group-hover:text-brutal-accent transition-colors">
            TOGETHER // BOT COMPARISON 2026
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
      <main id="main-content" className="max-w-6xl w-full mx-auto border-2 border-brutal-border bg-brutal-surface p-6 md:p-10 shadow-brutal space-y-12">
        {/* Header Title */}
        <div className="border-b-2 border-brutal-border pb-6 space-y-3">
          <div className="inline-block bg-brutal-accent text-black font-black text-[10px] px-2 py-0.5 uppercase tracking-widest font-mono">
            COMPREHENSIVE 2026 AUDIT
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl text-white uppercase tracking-tight">
            BEST DISCORD MUSIC BOT: TOGETHER VS HYDRA, RYTHM, &amp; ALTERNATIVES
          </h1>
          <p className="font-mono text-xs text-zinc-400 max-w-3xl leading-relaxed">
            Finding a reliable Discord music bot that still works in 2026 can be challenging. Many famous bots like Hydra and Rythm were discontinued or stripped of music capabilities. In this objective benchmark, we compare sound quality, web player controls, sound filters, and 24/7 uptime across the most popular options.
          </p>
        </div>

        {/* Action Callout */}
        <div className="p-6 border-2 border-brutal-border bg-black/60 shadow-brutal flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-brutal-accent uppercase tracking-wider">RECOMMENDED CHOICE</span>
            <h2 className="font-display font-black text-xl text-white uppercase">Ready to Upgrade Your Server Music?</h2>
            <p className="text-xs text-zinc-400">Stream studio-grade 24-bit opus sound with live 3D visualizers in your voice lounge today.</p>
          </div>
          <a
            href={BOT_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Invite Together Music Bot to Discord"
            className="px-6 py-3 bg-brutal-accent text-black font-display font-black text-xs uppercase border-2 border-black shadow-brutal hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2 shrink-0"
          >
            <Disc3 className="w-4 h-4 animate-spin" />
            <span>INVITE TOGETHER FREE</span>
          </a>
        </div>

        {/* Feature Comparison Table */}
        <section aria-labelledby="matrix-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="matrix-heading" className="font-display font-black text-2xl text-white uppercase">
              Head-to-Head Feature Comparison
            </h2>
            <span className="text-xs font-mono text-zinc-500 hidden sm:inline">Updated November 2026</span>
          </div>

          <div className="overflow-x-auto border-2 border-brutal-border">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-black border-b-2 border-brutal-border text-zinc-300">
                  <th className="p-4 border-r border-brutal-border font-bold">Key Feature &amp; Capability</th>
                  <th className="p-4 border-r border-brutal-border font-black text-brutal-accent bg-brutal-accent/10">TOGETHER</th>
                  <th className="p-4 border-r border-brutal-border">Hydra Bot</th>
                  <th className="p-4 border-r border-brutal-border">Rythm</th>
                  <th className="p-4 border-r border-brutal-border">Smooth Bot</th>
                  <th className="p-4">Jockie Music</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brutal-border/50">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className={row.highlight ? "bg-white/[0.02]" : ""}>
                    <td className="p-4 border-r border-brutal-border font-bold text-white">
                      {row.feature}
                    </td>
                    <td className="p-4 border-r border-brutal-border font-bold text-brutal-accent bg-brutal-accent/5">
                      {row.together}
                    </td>
                    <td className="p-4 border-r border-brutal-border text-zinc-400">
                      {row.hydra}
                    </td>
                    <td className="p-4 border-r border-brutal-border text-zinc-400">
                      {row.rythm}
                    </td>
                    <td className="p-4 border-r border-brutal-border text-zinc-300">
                      {row.smooth}
                    </td>
                    <td className="p-4 text-zinc-300">
                      {row.jockie}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detailed Bot Breakdowns */}
        <section aria-labelledby="breakdowns-heading" className="space-y-6">
          <h2 id="breakdowns-heading" className="font-display font-black text-2xl text-white uppercase border-b-2 border-brutal-border pb-3">
            In-Depth Analysis: The 5 Most Popular Discord Music Bots
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {BOT_REVIEWS.map((bot, idx) => (
              <div 
                key={idx} 
                className={`p-6 border-2 border-brutal-border bg-black/40 shadow-brutal space-y-3 ${
                  idx === 0 ? "border-brutal-accent" : ""
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-brutal-accent">0{idx + 1}</span>
                    <h3 className="font-display font-black text-xl text-white uppercase">{bot.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-brutal-surface border border-brutal-border text-zinc-300">
                      {bot.status}
                    </span>
                    <span className="text-xs font-mono font-black text-brutal-accent px-2 py-0.5 bg-black border border-brutal-accent">
                      {bot.rating}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                  {bot.verdict}
                </p>

                <div className="pt-2 text-[11px] font-mono text-zinc-400 border-t border-brutal-border/40">
                  <strong className="text-white">Best suited for:</strong> {bot.bestFor}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Together Is The Best Alternative */}
        <section aria-labelledby="why-together-heading" className="space-y-6 border-t-2 border-brutal-border pt-8">
          <h2 id="why-together-heading" className="font-display font-black text-2xl text-white uppercase">
            Why Together Outranks Other Music Bots in 2026
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-2 border-brutal-border bg-black/40 p-6 space-y-3">
              <div className="w-10 h-10 border-2 border-brutal-border bg-black flex items-center justify-center text-brutal-accent">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-lg text-white uppercase">Studio 24-Bit Audio</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Most bots compress sound down to 64kbps or 96kbps to save bandwidth. Together transcodes raw 48,000Hz 24-bit opus audio frames directly into your Discord voice channel for unmatched acoustic fidelity.
              </p>
            </div>

            <div className="border-2 border-brutal-border bg-black/40 p-6 space-y-3">
              <div className="w-10 h-10 border-2 border-brutal-border bg-black flex items-center justify-center text-cyan-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-lg text-white uppercase">Interactive WebGL Player</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Control your music visually. The Together web dashboard lets you skip songs, reorder queues, and view live 3D audio-reactive waveforms right in your desktop or phone browser without typing chat commands.
              </p>
            </div>

            <div className="border-2 border-brutal-border bg-black/40 p-6 space-y-3">
              <div className="w-10 h-10 border-2 border-brutal-border bg-black flex items-center justify-center text-emerald-400">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-lg text-white uppercase">100% Free 24/7 Voice Lock</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Never pay monthly subscriptions just to keep music playing in your server lounge. Together provides free 24/7 channel locking as a simple voter perk, automatically reconnecting when voice regions shift.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison FAQs */}
        <section aria-labelledby="compare-faq-heading" className="space-y-6 border-t-2 border-brutal-border pt-8">
          <h2 id="compare-faq-heading" className="font-display font-black text-2xl text-white uppercase">
            Frequently Asked Questions About Music Bot Alternatives
          </h2>

          <div className="space-y-4">
            <div className="border-2 border-brutal-border bg-black/30 p-5 space-y-2">
              <h3 className="font-display font-black text-base text-white uppercase">What happened to Hydra and Rythm bots?</h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                Rythm and Hydra were forced to shut down direct YouTube audio streaming due to legal platform restrictions. While Rythm created a Discord Activity and Hydra shifted to server utility, neither provides classic independent voice bot streaming anymore. Together fills this exact void with dedicated, high-speed streaming infrastructure.
              </p>
            </div>

            <div className="border-2 border-brutal-border bg-black/30 p-5 space-y-2">
              <h3 className="font-display font-black text-base text-white uppercase">Can I play Spotify playlists without connecting my account?</h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                Yes. Together supports direct Spotify track, album, and playlist links. Simply paste any Spotify link into chat using <code>/play</code> or into the web dashboard search bar, and Together will resolve the metadata and stream the music instantly.
              </p>
            </div>

            <div className="border-2 border-brutal-border bg-black/30 p-5 space-y-2">
              <h3 className="font-display font-black text-base text-white uppercase">How do I switch from another bot to Together?</h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                Switching takes less than one minute. Click the Invite button to add Together to your Discord server. Together uses the exact same universal commands you are already used to (such as <code>/play</code>, <code>/skip</code>, <code>/queue</code>, and <code>/stop</code>), so your community members do not need to learn a new syntax.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <div className="p-8 border-2 border-brutal-accent bg-black text-center space-y-4 shadow-brutal">
          <h2 className="font-display font-black text-2xl md:text-3xl text-white uppercase">
            EXPERIENCE THE NEXT GENERATION OF DISCORD AUDIO
          </h2>
          <p className="text-xs text-zinc-400 font-mono max-w-xl mx-auto">
            Join thousands of servers streaming studio-quality music with Together. Setup is 100% free with zero configuration required.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 justify-center">
            <a
              href={BOT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Invite Together Music Bot to Discord"
              className="px-6 py-3.5 bg-brutal-accent text-black font-display font-black text-sm uppercase border-2 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
            >
              <Disc3 className="w-5 h-5 animate-spin" />
              <span>INVITE TO DISCORD</span>
            </a>
            <Link
              to="/commands"
              className="px-6 py-3.5 bg-brutal-surface text-white font-display font-black text-sm uppercase border-2 border-brutal-border shadow-brutal hover:border-brutal-accent hover:text-brutal-accent hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
            >
              <span>EXPLORE ALL 69 COMMANDS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto mt-12 pt-6 border-t-2 border-brutal-border text-center space-y-3 text-xs font-mono text-zinc-500">
        <p>&copy; 2026 Together Music Bot Team. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-4 text-zinc-400">
          <Link to="/" className="hover:text-brutal-accent">Home</Link>
          <span>&bull;</span>
          <Link to="/commands" className="hover:text-brutal-accent">Commands</Link>
          <span>&bull;</span>
          <Link to="/compare" className="text-brutal-accent font-bold">Bot Comparison</Link>
          <span>&bull;</span>
          <Link to="/faq" className="hover:text-brutal-accent">FAQ</Link>
          <span>&bull;</span>
          <Link to="/about" className="hover:text-brutal-accent">About</Link>
          <span>&bull;</span>
          <Link to="/contact" className="hover:text-brutal-accent">Contact</Link>
          <span>&bull;</span>
          <Link to="/terms" className="hover:text-brutal-accent">Terms</Link>
          <span>&bull;</span>
          <Link to="/privacy" className="hover:text-brutal-accent">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}

