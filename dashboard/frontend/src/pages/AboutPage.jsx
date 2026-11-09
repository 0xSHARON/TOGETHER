import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, ShieldCheck, ArrowLeft, Cpu, Disc3, Sparkles, Scale, BookOpen, 
  HeartHandshake, Radio, Award, ExternalLink
} from 'lucide-react';
import SEO from '../components/SEO';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text font-mono p-4 md:p-8 flex flex-col justify-between selection:bg-brutal-accent selection:text-black">
      <SEO 
        title="About Us & Systems Architecture — Together Music Bot"
        description="Learn about Together Music Bot, our studio 24-bit Opus sound engine, open-source architecture, and our creator KAJU🦋, Lead Systems Architect."
        canonical="https://dash.together.dpdns.org/about"
      />

      {/* Top Navbar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal mb-8">
        <Link to="/" className="flex items-center gap-3 group" aria-label="Together Music Bot Home">
          <img src="/logo.webp" alt="Together Logo" width="32" height="32" className="w-8 h-8 object-contain" />
          <span className="font-display font-black text-sm tracking-wider group-hover:text-brutal-accent transition-colors">
            TOGETHER // ABOUT &amp; ARCHITECTURE
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
      <main id="main-content" className="max-w-5xl w-full mx-auto border-2 border-brutal-border bg-brutal-surface p-6 md:p-10 shadow-brutal space-y-10">
        {/* Header Title */}
        <div className="border-b-2 border-brutal-border pb-6">
          <div className="flex items-center gap-2 text-brutal-accent text-xs font-black uppercase mb-2">
            <Cpu className="w-4 h-4" />
            <span>ENGINEERING EXCELLENCE &amp; AUDIO ARCHITECTURE</span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl text-white uppercase tracking-tight">
            ABOUT TOGETHER MUSIC BOT
          </h1>
          <p className="font-mono text-xs text-brutal-muted mt-2 max-w-2xl leading-relaxed">
            Engineered from the ground up for audiophiles, community managers, and Discord power users. Discover the technology, mission, and team behind the platform.
          </p>
        </div>

        {/* Section 1: The Mission */}
        <section className="space-y-4">
          <h2 className="font-display font-black text-xl text-white uppercase flex items-center gap-2">
            <span className="text-brutal-accent">01.</span> OUR ENGINEERING MISSION
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
            Together was conceived with a simple yet ambitious goal: to deliver true studio-grade audio streaming to Discord voice channels with zero latency and zero stutter. While generic music bots compress audio to low-bitrate streams or lock essential features behind paywalls, Together provides an uncompromising sound experience featuring 24-bit 48kHz Opus transcoding, real-time 3D WebGL visualizations, and 24/7 channel locking completely free.
          </p>
        </section>

        {/* Section 2: Creator & Systems Architecture (E-E-A-T Bio) */}
        <section className="border-2 border-brutal-border bg-black/60 p-6 md:p-8 shadow-brutal space-y-6">
          <div className="flex items-center gap-2 text-brutal-accent text-xs font-black uppercase">
            <User className="w-4 h-4" />
            <span>LEAD SYSTEMS ARCHITECT &amp; CREATOR BIO</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="shrink-0 relative">
              <img
                src="https://cdn.discordapp.com/avatars/780345293237125152/9352c3dd8bc5d5722007156bcdc62075.png?size=512"
                srcSet="https://cdn.discordapp.com/avatars/780345293237125152/9352c3dd8bc5d5722007156bcdc62075.png?size=256 1x, https://cdn.discordapp.com/avatars/780345293237125152/9352c3dd8bc5d5722007156bcdc62075.png?size=512 2x"
                alt="KAJU🦋 - Lead Systems Architect and Bot Creator"
                width="112"
                height="112"
                fetchPriority="high"
                loading="eager"
                className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-black object-cover shadow-brutal-sm"
                onError={(e) => { e.currentTarget.src = "/logo.png"; }}
              />
              <div className="absolute -bottom-2 -right-2 bg-brutal-accent text-black font-black text-[9px] px-2 py-0.5 border border-black">
                LEAD
              </div>
            </div>

            <div className="space-y-2 text-center md:text-left flex-1" itemscope itemType="https://schema.org/Person">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h3 itemprop="name" className="font-display font-black text-2xl text-white">KAJU🦋</h3>
                <span className="font-mono text-xs bg-black px-2 py-0.5 border border-brutal-border text-brutal-accent font-bold">
                  @kajukatli.
                </span>
                <span itemprop="jobTitle" className="font-mono text-[10px] bg-red-950/40 text-red-400 px-2 py-0.5 border border-red-800 font-bold">
                  LEAD AUDIO SYSTEMS ARCHITECT
                </span>
              </div>
              <p itemprop="description" className="text-xs text-zinc-300 leading-relaxed">
                KAJU🦋 is a software engineer with 8+ years of production experience designing scalable distributed backend microservices, real-time WebRTC audio gateways, and high-performance WebGL 3D rendering pipelines. As the creator and lead maintainer of Together, KAJU steers the core sound pipeline and voice failover algorithms.
              </p>
              <div className="text-[11px] font-mono text-zinc-400 pt-1">
                Author &amp; Systems Architect &bull; Verified Discord Developer &bull; GPL-3.0 Core Contributor
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Open Architecture & GPL-3.0 */}
        <section className="space-y-4">
          <h2 className="font-display font-black text-xl text-white uppercase flex items-center gap-2">
            <span className="text-brutal-accent">02.</span> OPEN SOURCE GPL-3.0 INTEGRITY
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
            Together is licensed under the <strong>GNU General Public License v3.0 (GPL-3.0)</strong>, with our complete open source repository hosted at <a href="https://github.com/0xSHARON/TOGETHER" target="_blank" rel="noopener noreferrer" className="text-brutal-accent hover:underline font-bold">GitHub (0xSHARON/TOGETHER)</a>. We believe community music streaming tools must remain open, inspectable, and resilient against vendor lock-in. Our software application does not monetize basic playback controls or lock essential audio equalizer filters behind subscription paywalls.
          </p>
        </section>

        {/* Section 4: Editorial Policy (E-E-A-T Mandatory Anchor) */}
        <section id="editorial-policy" className="border-2 border-brutal-border bg-brutal-surface p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 text-brutal-accent text-xs font-black uppercase">
            <BookOpen className="w-4 h-4" />
            <span>EDITORIAL POLICY &amp; CONTENT STANDARDS</span>
          </div>
          <h2 className="font-display font-black text-xl text-white uppercase">
            EDITORIAL STANDARDS &amp; TECHNICAL DISCLOSURES
          </h2>
          <div className="text-xs md:text-sm text-zinc-300 space-y-3 leading-relaxed">
            <p>
              The Together documentation, command catalogs, audio filter specifications, and technical benchmarks are curated by our engineering team adhering to strict editorial principles:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong>Technical Accuracy:</strong> Audio frequency ranges, bitrates (24-bit 48kHz Opus), and DSP latency metrics are verified through direct server telemetry before publication.</li>
              <li><strong>Zero Paywalls:</strong> We do not publish promotional sponsored rankings or paywall essential playback commands.</li>
              <li><strong>Transparent Governance:</strong> Updates to voice protocols, Discord API policy changes, and privacy practices are documented with visible version timestamps.</li>
              <li><strong>User Privacy:</strong> We strictly avoid collecting private conversation audio. Audio packets are transcoded in volatile memory without disk retention.</li>
            </ul>
          </div>
        </section>

        {/* Section 5: Connect & Support */}
        <section className="border-t-2 border-brutal-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-black text-base text-white uppercase">HAVE QUESTIONS OR NEED ASSISTANCE?</h3>
            <p className="text-xs text-zinc-400 mt-1">Our technical support desk is active 24/7 for Discord server administrators.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              className="px-4 py-2 bg-brutal-accent text-black font-display font-black text-xs uppercase border-2 border-black shadow-brutal-sm hover:translate-x-0.5 transition-all"
            >
              CONTACT SUPPORT DESK
            </Link>
            <Link
              to="/faq"
              className="px-4 py-2 bg-brutal-surface text-white font-display font-black text-xs uppercase border-2 border-brutal-border shadow-brutal-sm hover:border-brutal-accent transition-all"
            >
              READ BOT FAQ
            </Link>
          </div>
        </section>
      </main>

      {/* Footer Navigation */}
      <footer className="max-w-5xl w-full mx-auto mt-8 pt-6 border-t border-brutal-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brutal-muted">
        <div>&copy; 2026 Together Music Bot Team. All rights reserved.</div>
        <nav className="flex flex-wrap gap-4 uppercase font-bold text-[11px]" aria-label="Footer Navigation">
          <Link to="/" className="hover:text-brutal-accent">Home</Link>
          <Link to="/commands" className="hover:text-brutal-accent">Commands</Link>
          <Link to="/contact" className="hover:text-brutal-accent">Contact</Link>
          <Link to="/faq" className="hover:text-brutal-accent">FAQ</Link>
          <Link to="/terms" className="hover:text-brutal-accent">Terms</Link>
          <Link to="/privacy" className="hover:text-brutal-accent">Privacy</Link>
          <Link to="/about#editorial-policy" rel="editorial" className="hover:text-brutal-accent">Editorial Policy</Link>
          <a href="https://github.com/0xSHARON/TOGETHER" target="_blank" rel="noopener noreferrer" className="hover:text-brutal-accent">GitHub</a>
        </nav>
      </footer>
    </div>
  );
}
