import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Mail, MessageSquare, ShieldCheck, ArrowLeft, Send, CheckCircle2, 
  HelpCircle, Sparkles, Server, Clock, MapPin, User, ExternalLink,
  Lock, LogIn, AlertTriangle, RefreshCw, Tag, FileText, Check
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';

export default function ContactPage() {
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    discordTag: '',
    guildId: '',
    category: 'Technical Support',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Auto-fill form fields once authenticated Discord user info is available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.global_name || user.username || '',
        discordTag: prev.discordTag || (user.discriminator && user.discriminator !== '0' ? `${user.username}#${user.discriminator}` : `@${user.username}`)
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setSubmitError('Authentication required. Please sign in with Discord to transmit support dispatches.');
      return;
    }
    if (!formData.subject.trim() || !formData.message.trim()) {
      setSubmitError('Please fill in both the Subject and Detailed Message fields.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const resp = await axios.post('/api/contact/dispatch', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      if (resp.data?.success) {
        setDispatchResult(resp.data);
        setSubmitted(true);
      } else {
        setSubmitError(resp.data?.error || 'Failed to dispatch ticket. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error transmitting support ticket to bot owner.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setDispatchResult(null);
    setSubmitError(null);
    setFormData(prev => ({
      ...prev,
      subject: '',
      message: ''
    }));
  };

  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text font-mono p-4 md:p-8 flex flex-col justify-between selection:bg-brutal-accent selection:text-black">
      <SEO 
        title="Contact Technical Support & Engineering — Together Music Bot"
        description="Official Contact and Support portal for Together Music Bot. Transmit direct technical support dispatches straight to the Bot Owner via Discord Direct Message."
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
            <span>24/7 DEVELOPER DISPATCH & BOT OWNER ESCALATION</span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl text-white uppercase tracking-tight">
            CONTACT & TECHNICAL SUPPORT
          </h1>
          <p className="font-mono text-xs text-brutal-muted mt-2 max-w-2xl leading-relaxed">
            Need help configuring Together in your Discord server? Have questions about our 24-bit sound transcode pipeline, 3D visualizer, or custom DJ roles? Transmit an authenticated dispatch directly to the Bot Owner below.
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
            <p className="text-xs text-zinc-300">Dispatched tickets are DM'd directly to the bot owner's mobile and desktop Discord client with high priority alerts.</p>
            <div className="text-[11px] text-zinc-500 font-bold">DISPATCH GATEWAY: ONLINE</div>
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

        {/* Contact Form Section */}
        <section className="border-2 border-brutal-border bg-black/60 p-6 md:p-8 shadow-brutal space-y-6">
          <div className="border-b border-brutal-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-black text-xl text-white uppercase flex items-center gap-2">
                <Send className="w-5 h-5 text-brutal-accent" />
                <span>TRANSMIT TECHNICAL SUPPORT DISPATCH</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Submit technical inquiries, bug reports, and setup questions directly to the Bot Owner via Discord Direct Message.</p>
            </div>
            {user && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-[11px] font-bold uppercase self-start md:self-auto">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AUTHENTICATED DISCORD USER</span>
              </span>
            )}
          </div>

          {/* Authentication State Handling */}
          {authLoading ? (
            <div className="p-8 border border-zinc-800 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-brutal-accent animate-spin mx-auto" />
              <p className="text-xs text-zinc-400">Verifying Discord authentication session...</p>
            </div>
          ) : !user ? (
            /* User Not Logged In: Lockdown Notice & Sign-in Gate */
            <div className="space-y-6">
              <div className="p-5 border-2 border-amber-500 bg-amber-950/30 text-amber-200 shadow-brutal-sm space-y-3">
                <div className="flex items-center gap-2 font-display font-black text-sm uppercase text-amber-400">
                  <Lock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span>DISCORD AUTHENTICATION REQUIRED TO TRANSMIT DISPATCH</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                  To prevent automated spam and guarantee that every technical dispatch is routed directly to the Bot Owner (<strong className="text-white">KAJU🦋</strong>) as an authenticated Discord Direct Message with identity verification, you must sign in with your Discord account before sending a message.
                </p>
                <div className="pt-2">
                  <a
                    href="/login?redirect=/contact"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brutal-accent hover:bg-emerald-400 text-black font-display font-black text-xs uppercase shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>SIGN IN WITH DISCORD TO TRANSMIT</span>
                  </a>
                </div>
              </div>

              {/* Locked Form Preview */}
              <div className="opacity-45 pointer-events-none select-none space-y-4 filter grayscale-[30%]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                      Your Name / Display Name *
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder="Sign in required..."
                      className="w-full px-3 py-2 bg-zinc-900 border-2 border-zinc-700 text-zinc-500 text-xs cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                      Discord Username or User ID *
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder="Sign in required..."
                      className="w-full px-3 py-2 bg-zinc-900 border-2 border-zinc-700 text-zinc-500 text-xs cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                      Discord Server ID (Guild ID)
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder="e.g. 863496211667484676"
                      className="w-full px-3 py-2 bg-zinc-900 border-2 border-zinc-700 text-zinc-500 text-xs cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                      Inquiry Category *
                    </label>
                    <select
                      disabled
                      className="w-full px-3 py-2 bg-zinc-900 border-2 border-zinc-700 text-zinc-500 text-xs cursor-not-allowed"
                    >
                      <option>Technical Support / Audio Stutter</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                    Subject Brief *
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="Sign in required..."
                    className="w-full px-3 py-2 bg-zinc-900 border-2 border-zinc-700 text-zinc-500 text-xs cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                    Detailed Message / Error Description *
                  </label>
                  <textarea
                    rows="4"
                    disabled
                    placeholder="Sign in required to compose message..."
                    className="w-full px-3 py-2 bg-zinc-900 border-2 border-zinc-700 text-zinc-500 text-xs cursor-not-allowed"
                  />
                </div>

                <button
                  type="button"
                  disabled
                  className="px-6 py-3 bg-zinc-800 text-zinc-500 font-display font-black text-xs uppercase border-2 border-zinc-700 shadow-none cursor-not-allowed flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>AUTHENTICATION REQUIRED — CANNOT MESSAGE</span>
                </button>
              </div>
            </div>
          ) : submitted ? (
            /* Success Confirmation State */
            <div className="p-6 md:p-8 bg-emerald-950/40 border-2 border-emerald-500 text-center space-y-4 shadow-brutal">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="font-display font-black text-xl text-white uppercase tracking-wide">
                SUPPORT TICKET DISPATCHED DIRECTLY TO BOT OWNER
              </h3>
              <p className="text-xs text-zinc-300 max-w-lg mx-auto leading-relaxed">
                Thank you, <strong className="text-white">{user.global_name || user.username}</strong>! Your technical support inquiry has been transmitted directly to Bot Owner <strong className="text-emerald-400">KAJU🦋</strong> (<code>@kajukatli.</code>) via Discord Direct Message with high-priority alert status.
              </p>

              {/* Summary of transmitted embed */}
              <div className="max-w-md mx-auto p-4 bg-black/60 border border-emerald-500/40 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-zinc-800 pb-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>TRANSMITTED EMBED PAYLOAD</span>
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-cyan-400" />
                  <span><strong>Sender:</strong> {formData.name} ({formData.discordTag})</span>
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-amber-400" />
                  <span><strong>Category:</strong> {formData.category}</span>
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-emerald-400" />
                  <span><strong>Subject:</strong> {formData.subject}</span>
                </div>
                {formData.guildId && (
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <Server className="w-3 h-3 text-purple-400" />
                    <span><strong>Guild:</strong> {formData.guildId}</span>
                  </div>
                )}
                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  <span><strong>Delivery Status:</strong> Direct Message to <code>780345293237125152</code></span>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-brutal-accent hover:bg-emerald-400 text-black font-display font-black text-xs uppercase shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  TRANSMIT ANOTHER INQUIRY
                </button>
              </div>
            </div>
          ) : (
            /* Authenticated User Form with Live Discord Embed Preview */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Authenticated User Identity Badge */}
              <div className="p-3 bg-emerald-950/20 border-2 border-emerald-500/40 text-xs text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-brutal-sm">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`}
                      alt={user.username}
                      className="w-8 h-8 rounded-full border border-emerald-400"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold border border-emerald-400">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>AUTHENTICATED DISCORD SESSION</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Signed in as <strong className="text-emerald-400">{user.global_name || user.username}</strong> (@{user.username}) • ID: <code className="text-zinc-300">{user.id}</code>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1 self-start sm:self-auto">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>DIRECT OWNER DM ENABLED</span>
                </div>
              </div>

              {submitError && (
                <div className="p-4 bg-red-950/40 border-2 border-red-500 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Form Inputs */}
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
                    Discord Tag / Username *
                  </label>
                  <input
                    id="contact-discord"
                    name="discordTag"
                    type="text"
                    required
                    value={formData.discordTag}
                    onChange={(e) => setFormData({...formData, discordTag: e.target.value})}
                    placeholder="e.g. username"
                    className="w-full px-3 py-2 bg-brutal-surface border-2 border-brutal-border text-white text-xs focus:border-brutal-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-guild" className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Discord Server ID (Guild ID) <span className="text-zinc-500 font-normal">(Optional)</span>
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
                  placeholder="Summary of the issue or inquiry..."
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
                  placeholder="Please describe your server configuration, voice channel behavior, or reproduction steps..."
                  className="w-full px-3 py-2 bg-brutal-surface border-2 border-brutal-border text-white text-xs focus:border-brutal-accent focus:outline-none"
                />
              </div>

              {/* ── Discord Embed Message Live Preview with Lucide React Icons ── */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>BOT OWNER DISCORD DM EMBED PREVIEW (LUCIDE ICONS)</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">LIVE PREVIEW OF TRANSMISSION</span>
                </div>

                <div className="border-2 border-zinc-800 bg-black/90 p-4 sm:p-5 rounded-none border-l-4 border-l-emerald-400 space-y-4 shadow-brutal-sm">
                  {/* Author / Sender line with Lucide User icon */}
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white">{formData.name || user.global_name || user.username || 'Discord User'}</span>
                    <span className="text-zinc-500">(@{formData.discordTag || user.username || 'username'})</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded font-mono">ID: {user.id}</span>
                  </div>

                  {/* Embed Title & Category with Lucide Tag icon */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wide">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      <span>[SUPPORT DISPATCH] • {formData.category}</span>
                    </div>
                    {/* Subject with Lucide FileText icon */}
                    <div className="text-white font-bold text-sm flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{formData.subject || 'Subject brief will appear here...'}</span>
                    </div>
                  </div>

                  {/* Embed Message Body */}
                  <div className="p-3 bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-mono whitespace-pre-wrap rounded">
                    {formData.message || 'Detailed message and reproduction steps will appear here in the discord embed...'}
                  </div>

                  {/* Embed Field Matrix with Lucide Icons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-zinc-800/80 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400 font-bold uppercase text-[11px]">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Sender Information</span>
                      </div>
                      <div className="text-zinc-300 text-[11px] font-mono">
                        • Name: <strong className="text-white">{formData.name || 'User'}</strong><br />
                        • Tag: <code className="text-zinc-400">{formData.discordTag || 'User#0000'}</code><br />
                        • Discord ID: <code className="text-zinc-400">{user.id}</code>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400 font-bold uppercase text-[11px]">
                        <Server className="w-3.5 h-3.5 text-purple-400" />
                        <span>Guild Reference</span>
                      </div>
                      <div className="text-zinc-300 text-[11px] font-mono">
                        • Server ID: <code className="text-zinc-400">{formData.guildId || 'None provided'}</code><br />
                        • Priority: <strong className="text-emerald-400">HIGH (DIRECT DISPATCH)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Security Badge with Lucide ShieldCheck & Clock */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-800 text-[11px] text-zinc-500">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Session Verified (Discord OAuth2)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Real-time Direct Message to KAJU🦋</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  aria-label="Send technical support inquiry to Together Bot team"
                  className="px-6 py-3 bg-brutal-accent hover:bg-emerald-400 text-black font-display font-black text-xs uppercase border-2 border-black shadow-brutal hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>TRANSMITTING DISPATCH TO BOT OWNER...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>TRANSMIT TECHNICAL SUPPORT DISPATCH</span>
                    </>
                  )}
                </button>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Direct DM will be delivered to <code>780345293237125152</code>
                </span>
              </div>
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
          <Link to="/about" className="hover:text-brutal-accent">About</Link>
          <Link to="/features" className="hover:text-brutal-accent">Features</Link>
          <Link to="/commands" className="hover:text-brutal-accent">Commands</Link>
          <Link to="/faq" className="hover:text-brutal-accent">FAQ</Link>
          <Link to="/terms" className="hover:text-brutal-accent">Terms</Link>
          <Link to="/privacy" className="hover:text-brutal-accent">Privacy</Link>
          <a href="https://discord.gg/mUdGTs2Dw5" target="_blank" rel="noopener noreferrer" className="hover:text-brutal-accent">Discord</a>
        </nav>
      </footer>
    </div>
  );
}
