import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  HelpCircle, 
  Disc3, 
  Sliders, 
  Radio, 
  Zap, 
  Terminal, 
  Headphones, 
  ShieldCheck, 
  ExternalLink, 
  BookOpen, 
  Check, 
  Copy, 
  Layers,
  ChevronRight,
  Sparkles,
  Volume2,
  LifeBuoy
} from 'lucide-react';
import SEO from '../components/SEO';

const BOT_INVITE_URL = "https://discord.com/oauth2/authorize?client_id=863496211667484676&permissions=8&integration_type=0&scope=bot+applications.commands";
const SUPPORT_SERVER_URL = "https://discord.gg/mUdGTs2Dw5";
const WEBPLAYER_URL = "https://together.dpdns.org/visualizer/";

const DOC_CATEGORIES = [
  { id: 'quickstart', label: 'Quickstart & Adding Bot', icon: Zap },
  { id: 'audio-engine', label: '24-Bit Lossless Audio', icon: Volume2 },
  { id: 'webplayer', label: '3D WebGL Webplayer', icon: Sparkles },
  { id: 'dsp-filters', label: '14 DSP Sound Filters', icon: Sliders },
  { id: 'persistence-247', label: '24/7 Channel Locking', icon: Radio },
  { id: 'commands-parity', label: 'Slash & Prefix Commands', icon: Terminal },
  { id: 'dashboard', label: 'Web Dashboard & Controls', icon: Layers },
  { id: 'troubleshooting', label: 'Troubleshooting & Audio Fixes', icon: ShieldCheck },
];

const FAQ_SECTIONS = [
  {
    category: 'quickstart',
    categoryLabel: 'Quickstart & Adding Bot',
    items: [
      {
        id: 'what-is-together',
        question: 'What is Together Music Bot?',
        answer: 'Together is a next-generation high-fidelity Discord music streamer engineered for 24-bit lossless opus audio, an interactive real-time 3D WebGL webplayer visualizer, 24/7 voice channel locking, and zero-latency playback across servers.',
        callout: {
          type: 'tip',
          text: 'Together uses pure 48,000Hz 24-bit PCM-to-Opus frame transcoding for studio acoustics without compression artifacts.'
        }
      },
      {
        id: 'how-to-invite',
        question: 'How do I add Together to my Discord server?',
        answer: 'Click the "+ ADD TO DISCORD" button or use the direct OAuth2 invite link. Make sure to grant the bot "Connect", "Speak", "Use Slash Commands", and "Embed Links" permissions in your server role settings.',
        command: 'https://discord.com/oauth2/authorize?client_id=863496211667484676&permissions=8&integration_type=0&scope=bot+applications.commands',
        commandLabel: 'Direct OAuth2 Bot Invite Link'
      },
      {
        id: 'is-together-free',
        question: 'Is Together free to use?',
        answer: 'Yes! Together provides 100% free access to all core audio features: 24-bit lossless transcoding, 14 studio DSP filters, real-time dashboard controls, and voter perks like 24/7 voice channel persistence without paid subscriptions.'
      }
    ]
  },
  {
    category: 'audio-engine',
    categoryLabel: '24-Bit Lossless Audio Engine',
    items: [
      {
        id: 'audio-bitrate-specs',
        question: 'What audio quality and codecs does Together support?',
        answer: 'Together transcodes incoming streams directly into 24-Bit / 48kHz stereo Opus frames. The internal ring-buffer ensures steady 384kbps maximum Discord voice bitrate with sub-25ms audio frame latency.',
        callout: {
          type: 'note',
          text: 'Discord voice channels default to 64kbps. For the best acoustic experience, server administrators should set voice channel bitrate to 128kbps, 256kbps, or 384kbps in channel settings.'
        }
      },
      {
        id: 'supported-sources',
        question: 'Which music sources and platforms are supported?',
        answer: 'Together natively resolves tracks, albums, artist radio, and playlists from YouTube, YouTube Music, Spotify, SoundCloud, Apple Music, Deezer, and direct HTTP audio livestreams.',
        command: '/play query: https://open.spotify.com/playlist/...',
        commandLabel: 'Example Multi-Platform Stream'
      }
    ]
  },
  {
    category: 'webplayer',
    categoryLabel: '3D WebGL Webplayer Visualizer',
    items: [
      {
        id: 'what-is-webplayer',
        question: 'What is the 3D WebGL Webplayer and how do I open it?',
        answer: 'Together features a dedicated real-time browser visualizer at together.dpdns.org/visualizer/. It captures live synchronized audio frequencies from your server and renders reactive 3D soundstages, animated waveforms, particle meshes, and full track controls in your browser.',
        command: 'https://together.dpdns.org/visualizer/',
        commandLabel: 'Open 3D Webplayer Visualizer'
      },
      {
        id: 'visualizer-modes',
        question: 'How many visualizer modes are available?',
        answer: 'Over 50 distinct 3D visual styles are available, including Cyber Tunnel, Neon Spectrum, Retro Grid, Audio Bloom, Hologram Matrix, and Particle Nebula. All modes sync in real time to the current playing track.'
      }
    ]
  },
  {
    category: 'dsp-filters',
    categoryLabel: '14 DSP Studio Sound Filters',
    items: [
      {
        id: 'how-to-use-filters',
        question: 'How do I enable 8D Audio, Bass Boost, or Nightcore?',
        answer: 'You can enable any audio filter using either slash commands in Discord or directly through the Web Dashboard player tab. DSP filters are applied in real time without pausing or resetting your position in the song.',
        command: '/filters mode: bassboost level: extreme',
        commandLabel: 'Apply Studio Audio DSP'
      },
      {
        id: 'list-of-filters',
        question: 'What filters are included in the DSP engine?',
        answer: 'Together includes 14 hardware-accelerated DSP audio filters: 8D Circular Spatial Audio, Bass Boost (Low, Medium, Extreme), Nightcore, Vaporwave, Pop, Soft, Tremolo, Vibrato, Karaoke, Treble, and Mono.'
      }
    ]
  },
  {
    category: 'persistence-247',
    categoryLabel: '24/7 Channel Locking & Persistence',
    items: [
      {
        id: 'how-to-activate-247',
        question: 'How do I keep Together in my voice channel 24/7?',
        answer: 'Type /247 or .247 in your server voice channel. Together will lock to the current channel and stay connected indefinitely, automatically resuming audio if the Discord gateway disconnects or when members leave.',
        command: '/247 status: enable',
        commandLabel: 'Lock Bot in Voice Channel'
      },
      {
        id: 'voter-perk-requirements',
        question: 'Is 24/7 channel locking free?',
        answer: 'Yes! 24/7 persistence is available to all servers as a free Top.gg community voter perk. Simply cast a quick vote on Top.gg to activate 24/7 mode on your server for 24 hours.'
      }
    ]
  },
  {
    category: 'commands-parity',
    categoryLabel: 'Slash & Prefix Command Parity',
    items: [
      {
        id: 'command-prefixes',
        question: 'Can I use classic text prefix commands as well as Slash commands?',
        answer: 'Yes! Together maintains complete 100% feature parity between modern Discord Slash interactions (/play, /queue, /skip, /filters) and classic text prefix controls (.play, .q, .s, .filters). Autocomplete suggestions are available for all slash interactions.'
      },
      {
        id: 'essential-commands',
        question: 'What are the most essential commands to remember?',
        answer: 'The primary command suite includes /play (or .play), /pause, /resume, /skip, /queue, /volume, /filters, /loop, /shuffle, /lyrics, and /247.',
        command: '.play lofi hip hop radio',
        commandLabel: 'Classic Text Prefix Play'
      }
    ]
  },
  {
    category: 'dashboard',
    categoryLabel: 'Web Dashboard & Remote Controls',
    items: [
      {
        id: 'how-dashboard-works',
        question: 'How do I access and manage the web dashboard?',
        answer: 'Log in at dash.together.dpdns.org with your Discord account. You can view bot telemetry, monitor live server queues, adjust volume and DSP filters, inspect audio bitrate, and customize server-specific prefixes remotely.'
      }
    ]
  },
  {
    category: 'troubleshooting',
    categoryLabel: 'Troubleshooting & Audio Fixes',
    items: [
      {
        id: 'no-audio-output',
        question: 'The bot joined my voice channel but I cannot hear any sound. How do I fix it?',
        answer: '1. Check the bot user volume in Discord (right-click the bot in voice and ensure volume is set to 100%).\n2. Verify the voice channel server region is not experiencing packet drops.\n3. Make sure the bot role has "Speak" permission in that specific voice channel.\n4. Type .stop and .play again to re-initialize the audio frame transcoder.',
        callout: {
          type: 'alert',
          text: 'If problems persist, join the Community Discord server and our staff will inspect voice gateway telemetry.'
        }
      },
      {
        id: 'bot-auto-leaves',
        question: 'Why did the bot leave the voice channel when the queue finished?',
        answer: 'By default, Together leaves empty voice channels to save server bandwidth. To keep the bot permanently in your voice room, activate 24/7 channel locking using the /247 command.'
      }
    ]
  }
];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState('quickstart');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter items by search query across all categories
  const filteredSections = FAQ_SECTIONS.map((section) => {
    if (!searchQuery.trim()) {
      return section;
    }
    const q = searchQuery.toLowerCase();
    const matchedItems = section.items.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        (item.command && item.command.toLowerCase().includes(q))
    );
    return {
      ...section,
      items: matchedItems
    };
  }).filter((section) => section.items.length > 0);

  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-text font-mono selection:bg-brutal-accent selection:text-black">
      <SEO 
        title="Documentation &amp; FAQ — Together Music Bot"
        description="Official documentation and FAQ for Together Music Bot: 24-bit lossless opus audio, 3D webplayer visualizer, commands guide, DSP filters, and 24/7 channel locking."
        canonical="https://dash.together.dpdns.org/faq"
      />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-brutal-surface/95 backdrop-blur border-b-2 border-brutal-border px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img 
                  src="/logo.png" 
                  alt="Together Logo" 
                  width="36" 
                  height="36" 
                  className="w-9 h-9 object-contain" 
                />
              </picture>
              <div>
                <span className="font-display font-black text-xl md:text-2xl tracking-wider text-brutal-text group-hover:text-brutal-accent transition-colors">
                  TOGETHER
                </span>
                <span className="hidden sm:inline-block ml-2 text-[9px] bg-brutal-accent text-black font-black px-1.5 py-0.2">
                  DOCS &amp; KNOWLEDGE BASE
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={BOT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-brutal-accent text-black border-2 border-black font-bold text-xs uppercase shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <Disc3 className="w-3.5 h-3.5 animate-spin" />
              <span>INVITE BOT</span>
            </a>

            <Link
              to="/"
              className="px-3 py-1.5 bg-black border-2 border-brutal-border hover:border-brutal-accent text-white font-bold text-xs uppercase shadow-brutal-sm flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN HOME</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner with Instant Doc Search */}
      <section className="bg-black border-b-2 border-brutal-border px-4 md:px-8 py-10">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-brutal-surface border border-brutal-border text-[10px] font-black uppercase text-brutal-accent">
            <BookOpen className="w-3.5 h-3.5" />
            <span>OFFICIAL AUDIO PROTOCOL SPECIFICATION &amp; GUIDES</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
            DOCUMENTATION &amp; FAQ.
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Everything you need to know about setting up Together, maximizing 24-bit lossless audio streams, launching the 3D WebGL webplayer, and configuring Discord voice rooms.
          </p>

          {/* Search Bar */}
          <div className="pt-2 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <label htmlFor="doc-search-input" className="sr-only">Search documentation</label>
              <input
                id="doc-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation (e.g. 24-bit opus, visualizer, 24/7, filters)..."
                className="w-full bg-brutal-surface border-2 border-brutal-border pl-10 pr-4 py-2.5 font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brutal-accent shadow-brutal-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear doc search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brutal-accent uppercase font-bold hover:underline"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Doc Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sticky Sidebar: Doc Navigation */}
          <aside className="lg:col-span-4 sticky top-20 border-2 border-brutal-border bg-brutal-surface p-4 shadow-brutal space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-brutal-border text-xs font-black uppercase tracking-wider text-zinc-400">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brutal-accent" />
                CATEGORIES
              </span>
              <span className="text-[10px] bg-black text-brutal-accent px-1.5 py-0.5 border border-zinc-800">
                8 TOPICS
              </span>
            </div>

            <nav className="space-y-1" aria-label="Documentation Categories">
              {DOC_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id && !searchQuery;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSearchQuery('');
                      const el = document.getElementById(cat.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-2.5 font-mono text-xs font-bold uppercase border transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-brutal-accent text-black border-black shadow-brutal-sm'
                        : 'bg-brutal-bg text-zinc-300 border-transparent hover:border-brutal-border hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{cat.label}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-black' : 'text-zinc-600'}`} />
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t-2 border-brutal-border space-y-2">
              <a
                href={SUPPORT_SERVER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-black hover:bg-zinc-900 border border-brutal-border text-center text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 text-zinc-300 hover:text-white"
              >
                <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
                <span>COMMUNITY SUPPORT DISCORD</span>
              </a>
              <a
                href={WEBPLAYER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-black hover:bg-zinc-900 border border-brutal-border text-center text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 text-zinc-300 hover:text-cyan-400"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>3D WEBPLAYER VISUALIZER</span>
              </a>
            </div>
          </aside>

          {/* Right Main Column: Doc Content */}
          <main className="lg:col-span-8 space-y-12">
            {filteredSections.length === 0 ? (
              <div className="border-2 border-dashed border-zinc-800 p-12 text-center space-y-3 bg-brutal-surface">
                <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto" />
                <div className="font-display font-black text-lg text-white uppercase">No Documentation Found</div>
                <p className="text-xs text-zinc-400">
                  No topics or answers matched "{searchQuery}". Try searching for terms like "opus", "filters", "24/7", or "webplayer".
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-brutal-accent text-black font-bold text-xs uppercase border-2 border-black"
                >
                  RESET SEARCH
                </button>
              </div>
            ) : (
              filteredSections.map((section) => (
                <article
                  key={section.category}
                  id={section.category}
                  className="border-2 border-brutal-border bg-brutal-surface p-6 md:p-8 shadow-brutal space-y-6 scroll-mt-24"
                >
                  <div className="flex items-center gap-2 border-b-2 border-brutal-border pb-4">
                    <span className="w-2.5 h-2.5 bg-brutal-accent" />
                    <h2 className="font-display font-black text-xl md:text-2xl text-white uppercase tracking-tight">
                      {section.categoryLabel}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {section.items.map((item, idx) => (
                      <div
                        key={item.id}
                        id={item.id}
                        className="space-y-3 pb-6 border-b border-zinc-800 last:border-b-0 last:pb-0"
                      >
                        <h3 className="font-display font-bold text-base md:text-lg text-white flex items-start gap-2.5">
                          <span className="text-brutal-accent font-black text-xs font-mono px-1.5 py-0.5 bg-black border border-zinc-800 shrink-0 mt-0.5">
                            {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                          </span>
                          <span>{item.question}</span>
                        </h3>

                        <p className="font-mono text-xs md:text-sm text-zinc-300 leading-relaxed whitespace-pre-line pl-8">
                          {item.answer}
                        </p>

                        {/* Optional Interactive Command Block */}
                        {item.command && (
                          <div className="pl-8 pt-1">
                            <div className="border border-zinc-800 bg-black p-3 space-y-1">
                              {item.commandLabel && (
                                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                                  {item.commandLabel}
                                </div>
                              )}
                              <div className="flex items-center justify-between gap-2">
                                <code className="text-xs text-brutal-accent font-mono break-all">
                                  {item.command}
                                </code>
                                <button
                                  onClick={() => handleCopy(item.command, item.id)}
                                  aria-label="Copy command snippet"
                                  className="p-1 text-zinc-400 hover:text-white shrink-0 transition-colors"
                                >
                                  {copiedId === item.id ? (
                                    <Check className="w-4 h-4 text-brutal-accent" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Optional Callout / Note Box */}
                        {item.callout && (
                          <div className="pl-8 pt-1">
                            <div
                              className={`p-3 border-l-4 text-xs font-mono leading-relaxed ${
                                item.callout.type === 'tip'
                                  ? 'bg-emerald-950/20 border-emerald-400 text-emerald-200'
                                  : item.callout.type === 'alert'
                                  ? 'bg-amber-950/20 border-amber-400 text-amber-200'
                                  : 'bg-cyan-950/20 border-cyan-400 text-cyan-200'
                              }`}
                            >
                              <strong className="uppercase font-bold block mb-1">
                                {item.callout.type.toUpperCase()}:
                              </strong>
                              {item.callout.text}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              ))
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 md:px-8 py-8 border-t-2 border-brutal-border max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
        <div className="flex items-center gap-3">
          <picture>
            <source srcSet="/logo.webp" type="image/webp" />
            <img src="/logo.png" alt="Together" width="20" height="20" className="w-5 h-5 object-contain" />
          </picture>
          <span className="text-white font-bold">TOGETHER DOCUMENTATION</span>
        </div>
        <div className="flex flex-wrap gap-4 uppercase font-bold text-[11px]">
          <Link to="/" className="hover:text-brutal-accent">Home</Link>
          <Link to="/overview" className="hover:text-brutal-accent">Dashboard</Link>
          <Link to="/commands" className="hover:text-brutal-accent">Commands</Link>
          <Link to="/terms" className="hover:text-brutal-accent">Terms</Link>
          <Link to="/privacy" className="hover:text-brutal-accent">Privacy</Link>
          <a href={SUPPORT_SERVER_URL} target="_blank" rel="noopener noreferrer" className="hover:text-brutal-accent">Support</a>
        </div>
        <div>
          <span>Crafted by <strong className="text-white">KAJU🦋</strong></span>
        </div>
      </footer>
    </div>
  );
}
