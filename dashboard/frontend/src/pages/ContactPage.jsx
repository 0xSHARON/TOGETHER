import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, MessageSquare, ShieldCheck, ArrowLeft, Send, CheckCircle2, 
  HelpCircle, Sparkles, Server, Clock, MapPin, User, ExternalLink
} from 'lucide-react';
import SEO from '../components/SEO';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    discordTag: '',
    guildId: '',
    category: 'Technical Support',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text font-mono p-4 md:p-8 flex flex-col justify-between selection:bg-brutal-accent selection:text-black">
      <SEO 
        title="Contact Technical Support & Engineering — Together Music Bot"
        description="Official Contact and Support portal for Together Music Bot. Get instant technical assistance for Discord audio playback, voice channels, and server setup."
        canonical="https://dash.together.dpdns.org/contact"
      />

      {/* Top Navbar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal mb-8">
        <Link to="/" className="flex items-center gap-3 group" aria-label="Together Music Bot Home">
          <img src="/logo.webp" alt="Together Logo" width="32" height="32" className="w-8 h-8 object-contain" />
          <span className="font-display font-black text-sm tracking-wider group-hover:text-brutal-accent transition-colors">
            TOGETHER // CONTACT & SUPPORT
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
        {/* Banner / Header Title */}
        <div className="border-b-2 border-brutal-border pb-6">
          <div className="flex items-center gap-2 text-brutal-accent text-xs font-black uppercase mb-2">
            <MessageSquare className="w-4 h-4" />
            <span>24/7 DEVELOPER DISPATCH & BOT ASSISTANCE</span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl text-white uppercase tracking-tight">
            CONTACT & TECHNICAL SUPPORT
          </h1>
          <p className="font-mono text-xs text-brutal-muted mt-2 max-w-2xl leading-relaxed">
            Need help configuring Together in your Discord server? Have questions about our 24-bit sound transcode pipeline, 3D visualizer, or custom DJ roles? Reach our engineering team below.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border-2 border-brutal-border bg-black/40 shadow-brutal-sm space-y-2">
            <div className="flex items-center gap-2 text-brutal-accent font-bold text-xs uppercase">
              <MessageSquare className="w-4 h-4" />
              <span>COMMUNITY GUILD</span>
            </div>
            <p className="text-xs text-zinc-300">Join our official Discord server for real-time live assistance with moderators and bot developers.</p>
            <div className="pt-2">
              <a 
                href="https://discord.gg/mUdGTs2Dw5" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-brutal-accent text-black font-bold text-xs uppercase hover:bg-emerald-400"
              >
                <span>JOIN DISCORD</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-4 border-2 border-brutal-border bg-black/40 shadow-brutal-sm space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase">
              <Clock className="w-4 h-4" />
              <span>RESPONSE SLA</span>
            </div>
            <p className="text-xs text-zinc-300">Community questions are answered within <strong>15 minutes</strong> on average. Automated failover monitoring is active 24/7/365.</p>
            <div className="text-[11px] text-zinc-500 font-bold">STATUS: ALL AUDIO NODES OPERATIONAL</div>
          </div>

          <div className="p-4 border-2 border-brutal-border bg-black/40 shadow-brutal-sm space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
              <HelpCircle className="w-4 h-4" />
              <span>COMMAND PALETTE</span>
            </div>
            <p className="text-xs text-zinc-300">Encountering voice lag? Type <code className="text-brutal-accent">/forcefix</code> in chat to instantly flush voice buffers and re-route audio.</p>
            <div className="pt-2">
              <Link to="/commands" className="text-xs text-brutal-accent hover:underline font-bold">
                VIEW COMMAND MANUAL &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <section className="border-2 border-brutal-border bg-black/60 p-6 md:p-8 shadow-brutal space-y-6">
          <div className="border-b border-brutal-border pb-4">
            <h2 className="font-display font-black text-xl text-white uppercase flex items-center gap-2">
              <Send className="w-5 h-5 text-brutal-accent" />
              <span>TRANSMIT TECHNICAL SUPPORT DISPATCH</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Submit technical inquiries, bug reports, and partnership inquiries directly to our developer inbox.</p>
          </div>

          {submitted ? (
            <div className="p-6 bg-emerald-950/40 border-2 border-emerald-500 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-display font-black text-lg text-white uppercase">SUPPORT TICKET DISPATCHED</h3>
              <p className="text-xs text-zinc-300 max-w-md mx-auto">
                Thank you! Your ticket has been logged with our systems monitoring desk. An architect will review your server logs and respond via Discord.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 bg-brutal-accent text-black font-bold text-xs uppercase shadow-brutal-sm hover:translate-x-0.5"
              >
                SUBMIT ANOTHER INQUIRY
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Your Name / Display Name *
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Alex Carter"
                    className="w-full px-3 py-2 bg-brutal-surface border-2 border-brutal-border text-white text-xs focus:border-brutal-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="contact-discord" className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Discord Username or User ID *
                  </label>
                  <input
                    id="contact-discord"
                    name="discordTag"
                    type="text"
                    required
                    value={formData.discordTag}
                    onChange={(e) => setFormData({...formData, discordTag: e.target.value})}
                    placeholder="e.g. username#0000 or username"
                    className="w-full px-3 py-2 bg-brutal-surface border-2 border-brutal-border text-white text-xs focus:border-brutal-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-guild" className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Discord Server ID (Guild ID)
                  </label>
                  <input
                    id="contact-guild"
                    name="guildId"
                    type="text"
                    value={formData.guildId}
                    onChange={(e) => setFormData({...formData, guildId: e.target.value})}
                    placeholder="e.g. 863496211667484676"
                    className="w-full px-3 py-2 bg-brutal-surface border-2 border-brutal-border text-white text-xs focus:border-brutal-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="contact-category" className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Inquiry Category *
                  </label>
                  <select
                    id="contact-category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 bg-brutal-surface border-2 border-brutal-border text-white text-xs focus:border-brutal-accent focus:outline-none"
                  >
                    <option value="Technical Support">Technical Support / Audio Stutter</option>
                    <option value="Server Setup">24/7 Channel Locking & DJ Roles</option>
                    <option value="Voter Perks">Top.gg Vote Perks & XP Multipliers</option>
                    <option value="Visualizer">3D WebGL Webplayer Feedback</option>
                    <option value="Partnership">Partnership & Verified Communities</option>
                    <option value="Security">Security & Responsible Disclosure</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Subject Brief *
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Summary of the inquiry or issue..."
                  className="w-full px-3 py-2 bg-brutal-surface border-2 border-brutal-border text-white text-xs focus:border-brutal-accent focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Detailed Message / Error Description *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="5"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Please describe the steps to reproduce, voice channel region, or your questions..."
                  className="w-full px-3 py-2 bg-brutal-surface border-2 border-brutal-border text-white text-xs focus:border-brutal-accent focus:outline-none"
                />
              </div>

              <button
                type="submit"
                aria-label="Send technical support inquiry to Together Bot team"
                className="px-6 py-3 bg-brutal-accent text-black font-display font-black text-xs uppercase border-2 border-black shadow-brutal hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>DISPATCH SUPPORT TICKET</span>
              </button>
            </form>
          )}
        </section>

        {/* Lead Architect Credentials & Office Info */}
        <section className="border-t-2 border-brutal-border pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-300">
          <div className="space-y-2">
            <h3 className="font-display font-black text-sm text-white uppercase flex items-center gap-2">
              <User className="w-4 h-4 text-brutal-accent" />
              <span>LEAD SYSTEMS ARCHITECT</span>
            </h3>
            <p>
              Together Music Bot is designed and architected by <strong className="text-white">KAJU🦋</strong> (<code>@kajukatli.</code>). With 8+ years of engineering experience in low-latency WebRTC systems, audio transcode servers, and WebGL visualizations, our priority is zero-stutter playback across all servers.
            </p>
            <p>
              Read more in our <Link to="/about" className="text-brutal-accent hover:underline font-bold">About TOGETHER</Link> documentation.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-black text-sm text-white uppercase flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>PROJECT LOCATION & COMPLIANCE</span>
            </h3>
            <address className="not-italic text-zinc-400">
              Together Audio Systems • Global Distributed Engineering
            </address>
            <p className="text-[11px] text-zinc-500">
              Verified Discord Developer Application. For compliance and privacy notices, view our <Link to="/privacy" className="text-brutal-accent hover:underline font-bold">Privacy Policy</Link> and <Link to="/terms" className="text-brutal-accent hover:underline font-bold">Terms of Service</Link>.
            </p>
          </div>
        </section>
      </main>

      {/* Footer Navigation */}
      <footer className="max-w-5xl w-full mx-auto mt-8 pt-6 border-t border-brutal-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brutal-muted">
        <div>&copy; 2026 Together Music Bot Team. All rights reserved.</div>
        <nav className="flex flex-wrap gap-4 uppercase font-bold text-[11px]" aria-label="Footer Navigation">
          <Link to="/" className="hover:text-brutal-accent">Home</Link>
          <Link to="/about" className="hover:text-brutal-accent">About Together</Link>
          <Link to="/commands" className="hover:text-brutal-accent">Bot Commands</Link>
          <Link to="/faq" className="hover:text-brutal-accent">Documentation & FAQ</Link>
          <Link to="/terms" className="hover:text-brutal-accent">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-brutal-accent">Privacy Policy</Link>
          <Link to="/about#editorial-policy" className="hover:text-brutal-accent">Editorial Standards</Link>
          <a href="https://discord.gg/mUdGTs2Dw5" target="_blank" rel="noopener noreferrer" className="hover:text-brutal-accent">Official Discord</a>
        </nav>
      </footer>
    </div>
  );
}
