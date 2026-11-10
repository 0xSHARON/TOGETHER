import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, ShieldCheck, ArrowLeft, ArrowUpRight, Lock, AlertTriangle, 
  CheckCircle2, HelpCircle, FileText, Radio, Terminal, ExternalLink, 
  Zap, BookOpen, HeartHandshake, Server, ShieldAlert, Cpu
} from 'lucide-react';
import SEO from '../components/SEO';

const SECTIONS = [
  { id: 'acceptance', title: '01. Acceptance of Terms' },
  { id: 'discord-terms', title: '02. Discord Compliance' },
  { id: 'native-together-sla', title: '03. Audio SLA & 24/7' },
  { id: 'acceptable-use', title: '04. Acceptable Use' },
  { id: 'intellectual-property', title: '05. IP & Streaming' },
  { id: 'dmca-policy', title: '06. DMCA & Copyright' },
  { id: 'server-management', title: '07. Guild Admin & DJ' },
  { id: 'liability-disclaimer', title: '08. Warranty & Limits' },
  { id: 'termination-policy', title: '09. Termination' },
  { id: 'governing-law', title: '10. Governing Law' },
  { id: 'contact-desk', title: '11. Support & Disputes' },
];

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState('acceptance');

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
        title="Terms of Service & Usage Agreement — Together Music Bot"
        description="Official Terms of Service for Together Discord Music Bot and Web Dashboard. Transparent guidelines on audio streaming, acceptable use, 24/7 mode, and Discord API compliance."
        canonical="https://dash.together.dpdns.org/terms"
      />

      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-4 border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal mb-8">
        <Link to="/" className="flex items-center gap-3 group" aria-label="Together Music Bot Home">
          <img src="/logo.webp" alt="Together Logo" width="32" height="32" className="w-8 h-8 object-contain" />
          <div className="flex flex-col">
            <span className="font-display font-black text-sm tracking-wider group-hover:text-brutal-accent transition-colors">
              TOGETHER // LEGAL CONTRACT
            </span>
            <span className="text-[10px] text-brutal-muted uppercase tracking-widest hidden sm:inline">
              Terms of Service & Usage Policy
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/privacy"
            className="px-3 py-1.5 bg-brutal-bg border border-brutal-border hover:border-brutal-accent text-white font-bold text-xs uppercase shadow-brutal-sm flex items-center gap-1.5 transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-brutal-accent" />
            <span className="hidden sm:inline">PRIVACY POLICY</span>
            <span className="sm:hidden">PRIVACY</span>
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
              <Scale className="w-3.5 h-3.5" /> BINDING SERVICE AGREEMENT
            </span>
            <span className="text-xs text-brutal-muted border border-brutal-border px-2 py-0.5">
              REVISION 2.6 • EFFECTIVE NOV 10, 2026
            </span>
            <span className="text-xs text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 px-2 py-0.5">
              ✓ NATIVE-TOGETHER CLUSTER READY
            </span>
          </div>

          <h1 className="font-display font-black text-2xl md:text-5xl text-white uppercase tracking-tight">
            TERMS OF SERVICE
          </h1>
          <p className="font-mono text-xs md:text-sm text-zinc-300 mt-3 max-w-3xl leading-relaxed">
            Welcome to <strong>TOGETHER</strong>. These Terms of Service constitute a legally binding agreement between you (individual user or Discord server administrator) and the Together development team, governing access to our Discord application, web player dashboard (<code className="text-brutal-accent">dash.together.dpdns.org</code>), 3D WebGL visualizer, and streaming infrastructure.
          </p>

          {/* Quick Jump Bar */}
          <div className="mt-6 pt-6 border-t border-brutal-border">
            <div className="text-[11px] font-bold text-brutal-muted uppercase mb-3 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-brutal-accent" />
              <span>QUICK NAVIGATION TABLE:</span>
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

        {/* Legal Sections Card */}
        <div className="border-2 border-brutal-border bg-brutal-surface p-6 md:p-10 shadow-brutal space-y-10">

          {/* Section 01 */}
          <section id="acceptance" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">01</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                ACCEPTANCE OF TERMS & SCOPE OF SERVICE
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              By adding <strong>TOGETHER</strong> ("the Bot", Application ID: <code className="text-brutal-accent">863496211667484676</code>) to a Discord guild, authenticating via Discord OAuth2 at <code>dash.together.dpdns.org</code> ("the Dashboard"), invoking bot commands via slash syntax (<code className="text-white">/play</code>) or prefix (<code className="text-white">.play</code>), or streaming audio through our real-time 3D WebGL visualizer, you explicitly agree to be bound by these Terms of Service.
            </p>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              If you represent a Discord guild or community, you warrant that you possess the administrative authority to bind that server to these Terms. If you do not agree to every provision herein, you must immediately remove the Bot from your server and cease use of the web platform.
            </p>
          </section>

          {/* Section 02 */}
          <section id="discord-terms" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">02</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                DISCORD DEVELOPER TERMS & COMMUNITY COMPLIANCE
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              TOGETHER operates as an approved, verified application within Discord's official developer ecosystem. All users and server owners must strictly abide by Discord's foundational policies:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <a 
                href="https://discord.com/terms" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="border border-brutal-border bg-black/40 p-3 hover:border-brutal-accent group transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-brutal-accent">
                  <span>DISCORD TOS</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Full Discord Terms of Service & user obligations.</p>
              </a>
              <a 
                href="https://discord.com/guidelines" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="border border-brutal-border bg-black/40 p-3 hover:border-brutal-accent group transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-brutal-accent">
                  <span>COMMUNITY GUIDELINES</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Acceptable online conduct & anti-harassment rules.</p>
              </a>
              <a 
                href="https://discord.com/developers/docs/policies-and-agreements/developer-terms-of-service" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="border border-brutal-border bg-black/40 p-3 hover:border-brutal-accent group transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-brutal-accent">
                  <span>DEVELOPER POLICY</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">API developer agreements and data privacy mandates.</p>
              </a>
            </div>
          </section>

          {/* Section 03 */}
          <section id="native-together-sla" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">03</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                NATIVE-TOGETHER AUDIO ENGINE SLA & 24/7 PLAYBACK
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              Together is powered by our proprietary high-throughput <strong>native-together</strong> audio streaming cluster delivering studio-grade 24-bit 48,000Hz Opus output directly to Discord voice gateways with 20ms frame pacing.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="border border-brutal-border bg-black/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                  <Cpu className="w-4 h-4 text-brutal-accent" />
                  <span>UPTIME TARGET & BUFFER REDUNDANCY</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We maintain a 99.9% uptime target across our native-together cluster. However, occasional upstream disruptions (such as Discord Voice Gateway disconnects, rate limits by upstream providers, or scheduled host kernel maintenance) do not constitute a breach of service.
                </p>
              </div>
              <div className="border border-brutal-border bg-black/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
                  <Radio className="w-4 h-4 text-brutal-accent" />
                  <span>24/7 CHANNEL LOCKING POLICY</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The <code className="text-brutal-accent">/247</code> command enables persistent voice channel residency. To preserve cluster bandwidth for active listeners, servers with 24/7 mode enabled may undergo an automated idle disconnect if no audio has been queued for over 72 consecutive hours.
                </p>
              </div>
            </div>
          </section>

          {/* Section 04 */}
          <section id="acceptable-use" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">04</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                ACCEPTABLE USE POLICY & PROHIBITED CONDUCT
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              To maintain system integrity and low latency for all communities, the following behaviors are strictly prohibited and subject to immediate global blacklisting:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="border border-red-500/30 bg-red-950/10 p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
                  <ShieldAlert className="w-4 h-4" />
                  <span>API FLOODING & COMMAND SPAM</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Deploying self-bots, automated curl loops, or DDoS attacks against bot endpoints, dashboard APIs, or native-together audio sockets.
                </p>
              </div>

              <div className="border border-red-500/30 bg-red-950/10 p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
                  <AlertTriangle className="w-4 h-4" />
                  <span>MALICIOUS AUDIO & EAR-RAPE ATTACKS</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Intentionally queuing high-gain, clipped, ear-damaging sound loops designed to harass voice participants or bypass volume safeguards.
                </p>
              </div>

              <div className="border border-red-500/30 bg-red-950/10 p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
                  <Lock className="w-4 h-4" />
                  <span>REVERSE ENGINEERING & EXPLOITATION</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Attempting to intercept bot authentication tokens, forge session cookies (<code className="text-white">together_token</code>), extract proprietary source code, or exploit MongoDB collections.
                </p>
              </div>

              <div className="border border-red-500/30 bg-red-950/10 p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
                  <Scale className="w-4 h-4" />
                  <span>GUILD IMPERSONATION & ILLEGAL MEDIA</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Streaming hate speech, child sexual abuse material (CSAM), non-consensual media, or attempting to modify settings of guilds you do not administer.
                </p>
              </div>
            </div>
          </section>

          {/* Section 05 */}
          <section id="intellectual-property" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">05</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                INTELLECTUAL PROPERTY, STREAMING SOURCES & FAIR USE
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              Together is a playback utility and streaming bridge. Together does <strong>not</strong> host, store, sell, or claim ownership of any musical recordings, sound files, or artistic media streamed through its engine.
            </p>
            <ul className="list-disc list-inside text-xs md:text-sm text-zinc-300 space-y-2 pl-2">
              <li>
                <strong>Third-Party Source Providers:</strong> Audio queries are resolved dynamically on demand from public third-party services including YouTube, Spotify, SoundCloud, Deezer, Apple Music, and direct HTTP streams.
              </li>
              <li>
                <strong>Trademarks & Metadata:</strong> All song titles, artist names, album art, and lyrics belong entirely to their respective copyright holders. Together displays metadata solely for identification and navigational clarity.
              </li>
              <li>
                <strong>Non-Commercial Playback:</strong> Together is distributed as a free utility. Streaming is provided for personal, communal, non-commercial entertainment inside Discord voice channels.
              </li>
            </ul>
          </section>

          {/* Section 06 */}
          <section id="dmca-policy" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">06</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                DMCA & COPYRIGHT COMPLAINT PROCEDURE
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              We respect copyright law and comply with the Digital Millennium Copyright Act (17 U.S.C. § 512). If you believe your copyrighted work is being accessed or relayed through Together in an infringing manner, you or your authorized copyright agent may submit a formal takedown notice containing:
            </p>
            <div className="border border-brutal-border bg-black/40 p-4 text-xs text-zinc-300 space-y-2">
              <ol className="list-decimal list-inside space-y-1.5 pl-1">
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>The specific URL, query, or stream identifier enabling us to locate and block the material.</li>
                <li>Your full legal name, company or artist affiliation, mailing address, telephone number, and email.</li>
                <li>A statement confirming your good-faith belief that the disputed use is unauthorized.</li>
                <li>A statement made under penalty of perjury that the information in your notification is accurate.</li>
              </ol>
              <div className="mt-3 pt-3 border-t border-brutal-border flex items-center justify-between flex-wrap gap-2">
                <span>Submit DMCA Takedown Dispatches via:</span>
                <Link to="/contact" className="text-brutal-accent underline font-bold hover:text-white">
                  Technical Support Dispatch Form &rarr;
                </Link>
              </div>
            </div>
          </section>

          {/* Section 07 */}
          <section id="server-management" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">07</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                GUILD ADMINISTRATION, DJ PERMISSIONS & VOLATILITY
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              Server administrators retain full sovereignty over Together within their respective Discord servers:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-300 pt-1">
              <div className="border border-brutal-border bg-black/40 p-3">
                <strong className="text-white block mb-1">DJ Role Governance</strong>
                Admins may designate a DJ role via <code className="text-brutal-accent">.setdj @role</code> to restrict playback controls (skip, stop, filter) to authorized server moderators.
              </div>
              <div className="border border-brutal-border bg-black/40 p-3">
                <strong className="text-white block mb-1">24/7 Channel Locking</strong>
                Admins can lock playback to a designated channel via <code className="text-brutal-accent">/247</code>, enabling uninterrupted ambient audio or radio streams.
              </div>
            </div>
          </section>

          {/* Section 08 */}
          <section id="liability-disclaimer" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">08</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                WARRANTY DISCLAIMER & LIMITATION OF LIABILITY
              </h2>
            </div>
            <div className="border-l-4 border-amber-400 bg-amber-950/20 p-4 space-y-2 text-xs md:text-sm text-zinc-300">
              <p className="font-bold text-amber-300 uppercase">
                PROVIDED ON AN "AS-IS" AND "AS-AVAILABLE" BASIS:
              </p>
              <p className="leading-relaxed">
                TOGETHER, ITS DEVELOPERS, ARCHITECTS, AND AFFILIATES EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className="leading-relaxed">
                UNDER NO CIRCUMSTANCES SHALL TOGETHER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES ARISING OUT OF SERVICE INTERRUPTIONS, DATA CORRUPTION, DISCORD ACCOUNT ACTIONS, OR LOSS OF AUDIO BUFFER STREAMS.
              </p>
            </div>
          </section>

          {/* Section 09 */}
          <section id="termination-policy" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">09</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                SUSPENSION, BLACKLISTING & ENFORCEMENT
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              We reserve the absolute right to suspend, terminate access, revoke dashboard sessions, or force-leave any Discord guild without advance notice if a user or server is found in breach of these Terms, violating Discord Community Guidelines, or launching cyber attacks against our cluster.
            </p>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              Blacklisted users may submit a formal appeal by opening a ticket on our <Link to="/contact" className="text-brutal-accent underline font-bold">Contact Support Desk</Link> or messaging in the Discord Support Server.
            </p>
          </section>

          {/* Section 10 */}
          <section id="governing-law" className="space-y-4 scroll-mt-24 border-b border-brutal-border pb-8">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">10</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                GOVERNING LAW & MODIFICATIONS TO TERMS
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              These Terms shall be interpreted and governed in accordance with international digital commerce principles and applicable local statutes. We reserve the right to revise these Terms at any time. When material changes are made, we will update the revision date at the top of this document and broadcast an announcement in our official Discord community.
            </p>
          </section>

          {/* Section 11 */}
          <section id="contact-desk" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-3">
              <span className="text-brutal-accent font-black text-xl font-display">11</span>
              <h2 className="font-display font-black text-xl text-white uppercase">
                LEGAL CONTACT, DISPUTES & SUPPORT CHANNELS
              </h2>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              For questions regarding these Terms, enterprise server deployment, or copyright inquiries, reach out through our official channels:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="border border-brutal-border bg-black/50 p-4 space-y-2">
                <div className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-brutal-accent" />
                  <span>ONLINE SUPPORT DESK</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Transmit tickets directly to bot engineers via our web dispatch form.
                </p>
                <Link 
                  to="/contact" 
                  className="inline-block mt-2 px-3 py-1 bg-brutal-accent text-black font-bold text-xs uppercase border border-black hover:bg-emerald-300 transition-all"
                >
                  TRANSMIT SUPPORT TICKET &rarr;
                </Link>
              </div>

              <div className="border border-brutal-border bg-black/50 p-4 space-y-2">
                <div className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-brutal-accent" />
                  <span>COMMUNITY DISCORD GUILD</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Join hundreds of server admins and get live real-time assistance.
                </p>
                <a 
                  href="https://discord.gg/mUdGTs2Dw5" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block mt-2 px-3 py-1 bg-black text-white font-bold text-xs uppercase border border-brutal-border hover:border-brutal-accent transition-all"
                >
                  JOIN DISCORD SERVER &rarr;
                </a>
              </div>
            </div>
          </section>

        </div>

        {/* CTA Banner */}
        <div className="border-2 border-brutal-border bg-black/60 p-6 md:p-8 shadow-brutal flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-black text-lg text-white uppercase">
              NEED IMMEDIATE TECHNICAL ASSISTANCE?
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Our support team and systems engineers are active 24/7 to resolve playback issues and server permissions.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/contact"
              className="px-4 py-2.5 bg-brutal-accent text-black font-display font-black text-xs uppercase border-2 border-black shadow-brutal-sm hover:translate-x-0.5 transition-all"
            >
              DISPATCH TICKET
            </Link>
            <Link
              to="/faq"
              className="px-4 py-2.5 bg-brutal-surface text-white font-display font-black text-xs uppercase border-2 border-brutal-border shadow-brutal-sm hover:border-brutal-accent transition-all"
            >
              READ FAQ
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="max-w-6xl w-full mx-auto mt-12 pt-6 border-t border-brutal-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brutal-muted">
        <div>&copy; 2026 Together Music Bot Team. All legal rights reserved.</div>
        <nav className="flex flex-wrap gap-4 uppercase font-bold text-[11px]" aria-label="Footer Navigation">
          <Link to="/" className="hover:text-brutal-accent">Home</Link>
          <Link to="/features" className="hover:text-brutal-accent">Features</Link>
          <Link to="/commands" className="hover:text-brutal-accent">Commands</Link>
          <Link to="/about" className="hover:text-brutal-accent">About</Link>
          <Link to="/faq" className="hover:text-brutal-accent">FAQ</Link>
          <Link to="/contact" className="hover:text-brutal-accent">Contact</Link>
          <Link to="/terms" className="text-brutal-accent">Terms</Link>
          <Link to="/privacy" className="hover:text-brutal-accent">Privacy</Link>
          <Link to="/login" className="hover:text-brutal-accent">Dashboard</Link>
        </nav>
      </footer>
    </div>
  );
}
