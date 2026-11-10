import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Lock, ShieldCheck, ArrowLeft, Database, Trash2, EyeOff, 
  KeyRound, Server, CheckCircle2, HelpCircle, FileText, 
  Terminal, ExternalLink, Zap, BookOpen, HeartHandshake, 
  UserCheck, ShieldAlert, Cpu, Radio
} from 'lucide-react';
import SEO from '../components/SEO';

const SECTIONS = [
  { id: 'data-minimization', title: '01. Data Minimization' },
  { id: 'data-collected', title: '02. What We Collect' },
  { id: 'zero-voice-recording', title: '03. Strict Zero Voice Recording' },
  { id: 'native-together-audio', title: '04. native-together Pipeline' },
  { id: 'cookies-auth', title: '05. Cookies & Auth Tokens' },
  { id: 'data-retention', title: '06. Retention Schedules' },
  { id: 'statutory-rights', title: '07. GDPR & CCPA Rights' },
  { id: 'purge-procedure', title: '08. Request Data Deletion' },
  { id: 'children-privacy', title: '09. Protection of Minors' },
  { id: 'security-measures', title: '10. Security & Encryption' },
  { id: 'privacy-contact', title: '11. Privacy Contact Desk' },
];

export default function PrivacyPage() {
  const [activeTab, setActiveTab] = useState('data-minimization');

  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text font-mono p-4 md:p-8 flex flex-col justify-between selection:bg-brutal-accent selection:text-black">
      <SEO 
        title="Privacy Policy & Data Protection Standards — Together Music Bot"
        description="Official Privacy Policy for Together Discord Music Bot and Web Dashboard. Strict zero-voice-recording guarantee, GDPR compliance, transparent data retention, and user data rights."
        canonical="https://dash.together.dpdns.org/privacy"
      />

      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-4 border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal mb-8">
        <Link to="/" className="flex items-center gap-3 group" aria-label="Together Music Bot Home">
          <img src="/logo.webp" alt="Together Logo" width="32" height="32" className="w-8 h-8 object-contain" />
          <div className="flex flex-col">
            <span className="font-display font-black text-sm tracking-wider group-hover:text-brutal-accent transition-colors">
              TOGETHER // PRIVACY POLICY
            </span>
            <span className="text-[10px] text-brutal-muted uppercase tracking-widest hidden sm:inline">
              Data Protection & Privacy Standards
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/terms"
            className="px-3 py-1.5 bg-brutal-bg border border-brutal-border hover:border-brutal-accent text-white font-bold text-xs uppercase shadow-brutal-sm flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-brutal-accent" />
            <span className="hidden sm:inline">TERMS OF SERVICE</span>
            <span className="sm:hidden">TERMS</span>
          </Link>
          <Link
            to="/contact"
            className="px-3 py-1.5 bg-brutal-bg border border-brutal-border hover:border-brutal-accent text-white font-bold text-xs uppercase shadow-brutal-sm flex items-center gap-1.5 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-brutal-accent" />
            <span className="hidden sm:inline">SUPPORT DESK</span>
            <span className="sm:hidden">SUPPORT</span>
          </Link>
          <Link
            to="/"
            className="px-3 py-1.5 bg-black border border-brutal-border hover:border-brutal-accent text-white font-bold text-xs uppercase shadow-brutal-sm flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>HOME</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" className="max-w-6xl w-full mx-auto space-y-8">
        {/* Banner / Header Title */}
        <div className="border-2 border-brutal-border bg-brutal-surface p-6 md:p-10 shadow-brutal">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 text-black bg-brutal-accent text-xs font-black px-2.5 py-0.5 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" /> ZERO-COMPROMISE DATA PRIVACY
            </span>
            <span className="text-xs text-brutal-muted border border-brutal-border px-2 py-0.5">
              REVISION 2.6 • EFFECTIVE NOV 10, 2026
            </span>
            <span className="text-xs text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 px-2 py-0.5">
              ✓ GDPR & DISCORD DEVELOPER CERTIFIED
            </span>
          </div>

          <h1 className="font-display font-black text-2xl md:text-5xl text-white uppercase tracking-tight">
            PRIVACY POLICY
          </h1>
          <p className="font-mono text-xs md:text-sm text-zinc-300 mt-3 max-w-3xl leading-relaxed">
            At <strong>TOGETHER</strong>, we believe privacy is a fundamental human right. We maintain a strict data minimization architecture: we never sell personal data, never record voice channel microphones, never deploy advertising trackers, and only store information strictly essential to provide high-fidelity audio streaming and web dashboard functionality.
          </p>

          {/* Quick Jump Bar */}
          <div className="mt-6 pt-6 border-t border-brutal-border">
            <div className="text-[11px] font-bold text-brutal-muted uppercase mb-3 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-brutal-accent" />
              <span>NAVIGATE PRIVACY PROTOCOLS:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`text-[11px] px-2.5 py-1 border transition-all text-left uppercase font-bold ${
                    activeTab === sec.id
                      ? 'bg-brutal-accent text-black border-black shadow-brutal-sm'
                      : 'bg-black/60 text-zinc-300 border-brutal-border hover:border-brutal-accent hover:text-white'
                  }`}
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy Sections Card */}
        <div className="border-2 border-brutal-border bg-brutal-surface p-6 md:p-10 shadow-brutal space-y-10">

          {/* Section 01 */}
          <section id="data-minimization" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">01</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                CORE PHILOSOPHY & DATA MINIMIZATION
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              Together operates on the principle of <strong>Privacy by Design</strong> (aligned with European General Data Protection Regulation Article 25). We collect only the absolute minimum telemetry required to play music, manage guild settings, and authenticate web dashboard sessions.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="border border-brutal-border bg-black/40 p-3 space-y-1">
                <span className="text-emerald-400 font-bold text-xs uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ZERO DATA SALES
                </span>
                <p className="text-[11px] text-zinc-400">We never sell, rent, monetize, or broker user data to advertisers or third-party data aggregators.</p>
              </div>
              <div className="border border-brutal-border bg-black/40 p-3 space-y-1">
                <span className="text-emerald-400 font-bold text-xs uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ZERO AD TRACKERS
                </span>
                <p className="text-[11px] text-zinc-400">Zero Google Analytics, zero Meta pixels, and zero behavioral tracking scripts loaded on our web domain.</p>
              </div>
              <div className="border border-brutal-border bg-black/40 p-3 space-y-1">
                <span className="text-emerald-400 font-bold text-xs uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> TRANSMIT ONLY
                </span>
                <p className="text-[11px] text-zinc-400">Our audio socket pipeline is strictly one-way transmit. We physically cannot tap or listen to voice audio.</p>
              </div>
            </div>
          </section>

          {/* Section 02 */}
          <section id="data-collected" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">02</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                GRANULAR INVENTORY OF DATA COLLECTED & STORED
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              When you interact with Together or log into the dashboard, we store the following data points in our isolated, encrypted MongoDB cluster:
            </p>

            <div className="space-y-3 pt-1">
              <div className="border border-brutal-border bg-black/40 p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <strong className="text-white text-xs uppercase flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-brutal-accent" />
                    DISCORD USER PROFILE DATA (VOLUNTARY / AUTHENTICATED)
                  </strong>
                  <span className="text-[10px] bg-black text-zinc-400 border border-brutal-border px-2 py-0.5">
                    STORED ONLY UPON AUTH OR XP ACCRUAL
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>Fields:</strong> Discord User Snowflake ID, username, discriminator, and avatar hash.
                  <br />
                  <strong>Purpose:</strong> Authenticating dashboard sessions via OAuth2, rendering your music player avatar, displaying listening ranks on server leaderboards, and attributing custom playlists.
                </p>
              </div>

              <div className="border border-brutal-border bg-black/40 p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <strong className="text-white text-xs uppercase flex items-center gap-2">
                    <Server className="w-4 h-4 text-brutal-accent" />
                    DISCORD GUILD CONFIGURATION DATA
                  </strong>
                  <span className="text-[10px] bg-black text-zinc-400 border border-brutal-border px-2 py-0.5">
                    PER-SERVER SETTINGS
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>Fields:</strong> Discord Guild ID, configured custom command prefix (default: <code className="text-white">.</code>), locked 24/7 voice channel ID, DJ role ID, and custom guild volume defaults.
                  <br />
                  <strong>Purpose:</strong> Retaining your server's customized bot preferences across bot reboots.
                </p>
              </div>

              <div className="border border-brutal-border bg-black/40 p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <strong className="text-white text-xs uppercase flex items-center gap-2">
                    <Database className="w-4 h-4 text-brutal-accent" />
                    MUSIC PREFERENCES & SAVED LIBRARIES
                  </strong>
                  <span className="text-[10px] bg-black text-zinc-400 border border-brutal-border px-2 py-0.5">
                    USER-CREATED ASSETS
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>Fields:</strong> Track titles, URLs, and artist strings for tracks added via <code className="text-white">/like</code> or saved into custom playlists via <code className="text-white">/playlist save</code>, user bio, profile anthem track URL, and chosen hex accent color.
                  <br />
                  <strong>Purpose:</strong> Providing persistent custom playlists and dynamic brutalist profile cards.
                </p>
              </div>

              <div className="border border-brutal-border bg-black/40 p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <strong className="text-white text-xs uppercase flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-brutal-accent" />
                    SUPPORT DISPATCH & TICKET TRANSCRIPTS
                  </strong>
                  <span className="text-[10px] bg-black text-zinc-400 border border-brutal-border px-2 py-0.5">
                    SUPPORT DESK LOGS
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>Fields:</strong> Subject, message body, Discord user ID, and associated ticket thread ID created in our private support channel.
                  <br />
                  <strong>Purpose:</strong> Enabling bot developers to assist you and send official bot DM responses directly to your Discord account.
                </p>
              </div>
            </div>
          </section>

          {/* Section 03 */}
          <section id="zero-voice-recording" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">03</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                STRICT TECHNICAL GUARANTEE: ZERO VOICE AUDIO RECORDING
              </h2>
            </div>
            
            <div className="border-2 border-emerald-500 bg-emerald-950/20 p-5 space-y-3 shadow-brutal-sm">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase">
                <ShieldCheck className="w-5 h-5" />
                <span>UNCONDITIONAL AUDIO PRIVACY PROMISE</span>
              </div>
              <p className="text-xs md:text-sm text-zinc-200 leading-relaxed font-sans">
                Together's voice socket integration is engineered with an <strong>outbound-only transmit pipeline</strong>. Together joins Discord voice channels strictly as an audio speaker (transmitter). The bot does <strong>not</strong> subscribe to Discord voice audio receive packets, does <strong>not</strong> capture incoming UDP audio streams, and does <strong>not</strong> record, transcribe, tap, or analyze user conversations.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-300">
                <span className="bg-black/60 px-2.5 py-1 border border-emerald-500/40">✓ NO MICROPHONE CAPTURE</span>
                <span className="bg-black/60 px-2.5 py-1 border border-emerald-500/40">✓ NO SPEECH-TO-TEXT LOGGING</span>
                <span className="bg-black/60 px-2.5 py-1 border border-emerald-500/40">✓ NO VOICE CHAT VOLATILITY</span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed pt-2">
              In addition, Together never logs or stores regular text channel chatter. Only messages explicitly starting with the bot's configured prefix (e.g. <code className="text-white">.play</code>) or slash commands are processed by the command handler.
            </p>
          </section>

          {/* Section 04 */}
          <section id="native-together-audio" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">04</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                NATIVE-TOGETHER CLUSTER & THIRD-PARTY PROVIDERS
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              When a user requests a song via <code className="text-white">/play</code>, the audio query is parsed by our <strong>native-together</strong> audio streaming nodes to resolve track metadata and stream direct 24-bit Opus packets into your voice channel:
            </p>
            <ul className="list-disc list-inside text-xs md:text-sm text-zinc-300 space-y-2 pl-2">
              <li>
                <strong>Anonymous Metadata Resolution:</strong> Track queries resolved from third-party services (such as YouTube, Spotify, SoundCloud, Deezer, and Apple Music) are processed server-side without transmitting your Discord credentials or personal identifiers.
              </li>
              <li>
                <strong>No Account Linking Required:</strong> Together never requests your Spotify or YouTube login credentials. Public playlists and song URLs are resolved strictly via public API endpoints and scrape protocols.
              </li>
            </ul>
          </section>

          {/* Section 05 */}
          <section id="cookies-auth" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">05</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                COOKIES, AUTHENTICATION TOKENS & LOCAL STORAGE
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              The Together Web Dashboard (<code className="text-white">dash.together.dpdns.org</code>) uses state-of-the-art token security:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="border border-brutal-border bg-black/40 p-4 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                  <KeyRound className="w-4 h-4 text-brutal-accent" />
                  <span>SECURE HTTP-ONLY JWT COOKIE</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Dashboard login uses a single cookie named <code className="text-white">together_token</code> containing a cryptographically signed JWT. It is marked <code className="text-brutal-accent">HttpOnly</code>, <code className="text-brutal-accent">Secure</code>, and <code className="text-brutal-accent">SameSite=Lax</code>, making it completely immune to client-side XSS theft.
                </p>
              </div>

              <div className="border border-brutal-border bg-black/40 p-4 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                  <EyeOff className="w-4 h-4 text-brutal-accent" />
                  <span>LOCAL STORAGE PREFERENCES</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your browser's <code className="text-white">localStorage</code> is used exclusively for non-sensitive interface state (such as UI theme presets, 3D visualizer shader choices, and client-side audio volume levels).
                </p>
              </div>
            </div>
          </section>

          {/* Section 06 */}
          <section id="data-retention" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">06</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                DATA RETENTION SCHEDULES & AUTOMATED LIFECYCLES
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              We retain stored information only as long as necessary to provide service:
            </p>
            <div className="border border-brutal-border overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-brutal-border bg-black text-white font-bold uppercase">
                    <th className="p-3">Data Category</th>
                    <th className="p-3">Retention Period</th>
                    <th className="p-3">Purge Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brutal-border text-zinc-300">
                  <tr className="bg-black/30">
                    <td className="p-3 font-bold text-white">Guild Preferences (Prefix, 24/7 channel)</td>
                    <td className="p-3">Active bot residency</td>
                    <td className="p-3 text-zinc-400">Purged 90 days after bot is kicked from guild</td>
                  </tr>
                  <tr className="bg-black/10">
                    <td className="p-3 font-bold text-white">User Playlists & Liked Songs</td>
                    <td className="p-3">Indefinite (Persistent)</td>
                    <td className="p-3 text-zinc-400">Immediate upon user deletion request</td>
                  </tr>
                  <tr className="bg-black/30">
                    <td className="p-3 font-bold text-white">Listening XP & Leaderboard Ranks</td>
                    <td className="p-3">Permanent across active seasons</td>
                    <td className="p-3 text-zinc-400">Purged upon profile deletion request</td>
                  </tr>
                  <tr className="bg-black/10">
                    <td className="p-3 font-bold text-white">Support Ticket Logs & Threads</td>
                    <td className="p-3">30 days post-resolution</td>
                    <td className="p-3 text-zinc-400">Automated archival & prune cycle</td>
                  </tr>
                  <tr className="bg-black/30">
                    <td className="p-3 font-bold text-white">Web Server In-Memory Logs (IPs)</td>
                    <td className="p-3">Volatile memory (up to 7 days)</td>
                    <td className="p-3 text-zinc-400">Automated log rotation for rate-limiting</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 07 */}
          <section id="statutory-rights" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">07</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                YOUR STATUTORY DATA RIGHTS (GDPR & CCPA)
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              Under international privacy statutes (including EU/UK GDPR and California Consumer Privacy Act CCPA/CPRA), users possess extensive rights over their personal data:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-300 pt-1">
              <div className="border border-brutal-border bg-black/40 p-3 space-y-1">
                <strong className="text-white block">Right of Access & Portability (Art. 15 & 20)</strong>
                Request a complete export in machine-readable JSON format of all playlists, stats, and records tied to your Discord ID.
              </div>
              <div className="border border-brutal-border bg-black/40 p-3 space-y-1">
                <strong className="text-white block">Right to Rectification (Art. 16)</strong>
                Update or rectify inaccurate profile metadata, custom bios, or playlist configurations at any time.
              </div>
              <div className="border border-brutal-border bg-black/40 p-3 space-y-1">
                <strong className="text-white block">Right to Erasure / "Forgotten" (Art. 17)</strong>
                Demand total, permanent deletion of your profile, XP history, liked songs, and server configs from our databases.
              </div>
              <div className="border border-brutal-border bg-black/40 p-3 space-y-1">
                <strong className="text-white block">Right to Non-Discrimination (CCPA)</strong>
                We provide equal service quality regardless of whether you choose to exercise your privacy rights.
              </div>
            </div>
          </section>

          {/* Section 08 */}
          <section id="purge-procedure" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">08</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                HOW TO REQUEST IMMEDIATE DATA PURGE OR EXPORT
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              Exercising your data deletion right is frictionless and requires no fees:
            </p>
            
            <div className="border border-brutal-border bg-black/60 p-5 space-y-4">
              <div className="flex items-center gap-2 text-brutal-accent font-bold text-xs uppercase">
                <Trash2 className="w-4 h-4" />
                <span>STEP-BY-STEP DATA ERASURE PROTOCOL</span>
              </div>
              <ol className="list-decimal list-inside text-xs text-zinc-300 space-y-2 pl-1 leading-relaxed">
                <li>
                  <strong>Option A (Recommended):</strong> Submit an erasure request via our online <Link to="/contact" className="text-brutal-accent underline font-bold">Support Desk</Link> with subject <code>"DATA DELETION REQUEST"</code> while authenticated with your Discord account.
                </li>
                <li>
                  <strong>Option B:</strong> Join our <a href="https://discord.gg/mUdGTs2Dw5" target="_blank" rel="noopener noreferrer" className="text-brutal-accent underline font-bold">Discord Community Guild</a> and ping Lead Systems Architect <code>@kajukatli.</code> directly in support.
                </li>
              </ol>
              <div className="border-t border-brutal-border pt-3 text-[11px] text-zinc-400 flex items-center justify-between flex-wrap gap-2">
                <span>Verification SLA: Requests are executed within <strong>48 hours</strong> with verification confirmation delivered via Discord DM.</span>
                <Link to="/contact" className="px-3 py-1 bg-brutal-accent text-black font-bold uppercase text-[10px] hover:bg-emerald-300 transition-all">
                  OPEN DELETION TICKET &rarr;
                </Link>
              </div>
            </div>
          </section>

          {/* Section 09 */}
          <section id="children-privacy" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">09</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                PROTECTION OF MINORS (COPPA COMPLIANCE)
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              Together is strictly governed by Discord's Terms of Service, which requires all users to be at least 13 years of age (or the legal age of digital consent in their jurisdiction). We do not knowingly collect, store, or solicit personal data from children under 13.
            </p>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              If we discover that a user under 13 has interacted with Together or submitted data, we will immediately purge all associated records from our MongoDB collections.
            </p>
          </section>

          {/* Section 10 */}
          <section id="security-measures" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">10</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                INFRASTRUCTURE SECURITY & ENCRYPTION PROTOCOLS
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              We employ enterprise-grade defensive measures across our full deployment stack:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-zinc-300">
              <div className="border border-brutal-border bg-black/40 p-3">
                <strong className="text-white block mb-1">In-Transit Encryption</strong>
                Enforced TLS 1.3 encryption across all HTTPS dashboard routes and WSS visualizer connections. HSTS with 1-year preload enforced.
              </div>
              <div className="border border-brutal-border bg-black/40 p-3">
                <strong className="text-white block mb-1">Isolated Docker Containers</strong>
                Database, bot workers, helper services, and dashboard web tier run in sandboxed Docker containers on hardened Linux servers.
              </div>
              <div className="border border-brutal-border bg-black/40 p-3">
                <strong className="text-white block mb-1">Encrypted Database Storage</strong>
                MongoDB access is protected via SCRAM authentication, strict internal IP whitelisting, and encryption-at-rest.
              </div>
              <div className="border border-brutal-border bg-black/40 p-3">
                <strong className="text-white block mb-1">Continuous Rate Limiting</strong>
                Nginx and Express rate-limit layers guard against brute-force attacks and automated token harvesting.
              </div>
            </div>
          </section>

          {/* Section 11 */}
          <section id="privacy-contact" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">11</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                DATA PROTECTION OFFICER & PRIVACY CONTACT DESK
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              For legal inquiries, GDPR compliance inquiries, or data audit requests, contact our Lead Audio Systems Architect directly:
            </p>
            <div className="border border-brutal-border bg-black/50 p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-1">
                  <div className="text-white font-bold text-sm uppercase">Lead Systems Architect — KAJU🦋</div>
                  <div className="text-xs text-brutal-muted">Discord Handle: <code className="text-brutal-accent">@kajukatli.</code> • Lead Engineering & Data Governance</div>
                </div>
                <div className="flex gap-2">
                  <Link 
                    to="/contact" 
                    className="px-3.5 py-1.5 bg-brutal-accent text-black font-bold text-xs uppercase border border-black hover:bg-emerald-300 transition-all"
                  >
                    CONTACT SUPPORT DESK
                  </Link>
                  <a 
                    href="https://discord.gg/mUdGTs2Dw5" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-3.5 py-1.5 bg-black text-white font-bold text-xs uppercase border border-brutal-border hover:border-brutal-accent transition-all"
                  >
                    DISCORD GUILD
                  </a>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* CTA Banner */}
        <div className="border-2 border-brutal-border bg-black/60 p-6 md:p-8 shadow-brutal flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-black text-lg text-white uppercase">
              WANT TO REVIEW OR PURGE YOUR DATA?
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Submit an automated privacy dispatch ticket. Our security team will process your request within 48 hours.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/contact"
              className="px-4 py-2.5 bg-brutal-accent text-black font-display font-black text-xs uppercase border-2 border-black shadow-brutal-sm hover:translate-x-0.5 transition-all"
            >
              DISPATCH PRIVACY TICKET
            </Link>
            <Link
              to="/terms"
              className="px-4 py-2.5 bg-brutal-surface text-white font-display font-black text-xs uppercase border-2 border-brutal-border shadow-brutal-sm hover:border-brutal-accent transition-all"
            >
              TERMS OF SERVICE
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="max-w-6xl w-full mx-auto mt-12 pt-6 border-t border-brutal-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brutal-muted">
        <div>&copy; 2026 Together Music Bot Team. All privacy rights reserved.</div>
        <nav className="flex flex-wrap gap-4 uppercase font-bold text-[11px]" aria-label="Footer Navigation">
          <Link to="/" className="hover:text-brutal-accent">Home</Link>
          <Link to="/features" className="hover:text-brutal-accent">Features</Link>
          <Link to="/commands" className="hover:text-brutal-accent">Commands</Link>
          <Link to="/about" className="hover:text-brutal-accent">About</Link>
          <Link to="/faq" className="hover:text-brutal-accent">FAQ</Link>
          <Link to="/contact" className="hover:text-brutal-accent">Contact</Link>
          <Link to="/terms" className="hover:text-brutal-accent">Terms</Link>
          <Link to="/privacy" className="text-brutal-accent">Privacy</Link>
          <Link to="/login" className="hover:text-brutal-accent">Dashboard</Link>
        </nav>
      </footer>
    </div>
  );
}
