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
  BookOpen, 
  Check, 
  Copy, 
  Layers,
  ChevronRight,
  Sparkles,
  Volume2,
  LifeBuoy,
  Star,
  Music,
  Heart,
  Settings,
  BarChart2,
  ListMusic,
  Wrench
} from 'lucide-react';
import SEO from '../components/SEO';

const BOT_INVITE_URL = "https://discord.com/oauth2/authorize?client_id=863496211667484676&permissions=8&integration_type=0&scope=bot+applications.commands";
const SUPPORT_SERVER_URL = "https://discord.gg/mUdGTs2Dw5";
const WEBPLAYER_URL = "https://together.dpdns.org/visualizer/";
const TOPGG_VOTE_URL = "https://top.gg/bot/863496211667484676/vote";

const DOC_CATEGORIES = [
  { id: 'quickstart', label: 'Quickstart & Adding Bot', icon: Zap },
  { id: 'music-playback', label: 'Music Playback Commands', icon: Music },
  { id: 'queue-mgmt', label: 'Queue & Controls', icon: ListMusic },
  { id: 'dsp-filters', label: '14 DSP Audio Filters', icon: Sliders },
  { id: 'voting-perks', label: 'Voting & Top.gg Perks', icon: Star },
  { id: 'favourite-playlists', label: 'Favorites & Playlists', icon: Heart },
  { id: 'config-settings', label: 'Server Config & 24/7', icon: Settings },
  { id: 'webplayer-visualizer', label: '3D WebGL Webplayer', icon: Sparkles },
  { id: 'info-leaderboard', label: 'Profiles, Stats & XP', icon: BarChart2 },
  { id: 'troubleshooting', label: 'Troubleshooting & Fixes', icon: Wrench },
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
    category: 'music-playback',
    categoryLabel: 'Music Playback Commands',
    items: [
      {
        id: 'cmd-play',
        question: 'How do I play a song, album, or playlist?',
        answer: 'Use /play or .play followed by a song title, artist, or direct URL. Together supports Spotify tracks, albums, playlists, YouTube, SoundCloud, Apple Music, Deezer, and direct HTTP audio streams.',
        command: '/play query: blinding lights the weeknd',
        commandLabel: 'Play Track by Title or URL'
      },
      {
        id: 'cmd-pause-resume',
        question: 'How do I pause and resume playback?',
        answer: 'Type /pause (or .pause) to freeze the stream without losing your position. Type /resume or .r to continue playback seamlessly.',
        command: '/resume',
        commandLabel: 'Resume Audio Stream'
      },
      {
        id: 'cmd-skip',
        question: 'How do I skip the current playing song?',
        answer: 'Type /skip or .s to immediately skip to the next song in the queue. Administrators and DJs can also use /forceskip (.fs) to bypass any voting requirements.',
        command: '/skip',
        commandLabel: 'Skip Current Track'
      },
      {
        id: 'cmd-stop',
        question: 'How do I stop music and disconnect the player?',
        answer: 'Type /stop (or .stop) to stop playback, flush the audio transcoder, and clear the queue.',
        command: '/stop',
        commandLabel: 'Stop Audio & Clear'
      },
      {
        id: 'cmd-volume',
        question: 'How do I adjust the volume of the stream?',
        answer: 'Type /volume or .vol followed by a number between 1 and 150. Studio normalization protects audio from clipping at higher volumes.',
        command: '/volume level: 85',
        commandLabel: 'Set Stream Volume'
      },
      {
        id: 'cmd-seek',
        question: 'How do I seek or jump to a specific timestamp?',
        answer: 'Use /seek or .seek followed by a timestamp (e.g. 1:30 or 90) to fast-travel to that exact point in the track.',
        command: '/seek timestamp: 2:15',
        commandLabel: 'Seek to Track Timestamp'
      },
      {
        id: 'cmd-forward-rewind',
        question: 'How do I fast-forward or rewind playback?',
        answer: 'Use /forward (.ff) to jump forward by seconds (e.g. .ff 15), or /rewind (.rw) to jump backward.',
        command: '.ff 30',
        commandLabel: 'Forward 30 Seconds'
      },
      {
        id: 'cmd-speed',
        question: 'Can I change the playback speed of songs?',
        answer: 'Yes! Use /speed or .speed followed by a multiplier between 0.5x and 2.0x (e.g. 1.25x or 0.8x for slow reverb).',
        command: '/speed rate: 1.25',
        commandLabel: 'Change Playback Tempo'
      },
      {
        id: 'cmd-replay-previous',
        question: 'How do I restart the current song or play the previous one?',
        answer: 'Type /replay (.rp) to restart the current song from 0:00. Type /previous (.prev, .back) to play the previous song stored in your session history.',
        command: '/replay',
        commandLabel: 'Restart Track'
      },
      {
        id: 'cmd-search',
        question: 'How do I search for a track and select from results?',
        answer: 'Use /search or .search followed by a query. Together will return the top 5 matching tracks with interactive buttons to choose your selection.',
        command: '/search query: daft punk get lucky',
        commandLabel: 'Interactive Track Search'
      },
      {
        id: 'cmd-sleep',
        question: 'How do I set a sleep timer to stop playing automatically?',
        answer: 'Use /sleep or .sleep followed by a duration (e.g. 30m, 1h, 45m). Together will automatically stop and leave the channel once the timer expires.',
        command: '/sleep duration: 45m',
        commandLabel: 'Set Inactivity Sleep Timer'
      },
      {
        id: 'cmd-nowplaying-grab',
        question: 'How do I view track details or save a song to my DMs?',
        answer: 'Type /nowplaying (.np) to view high-resolution album art, live progress, and audio codecs. Type /grab (.save) to have Together DM you the song link directly.',
        command: '/nowplaying',
        commandLabel: 'Inspect Currently Playing Track'
      }
    ]
  },
  {
    category: 'queue-mgmt',
    categoryLabel: 'Queue & Controls',
    items: [
      {
        id: 'cmd-queue',
        question: 'How do I view the upcoming music queue?',
        answer: 'Type /queue or .q to display the upcoming song list, total duration, and remaining tracks with interactive pagination controls.',
        command: '/queue',
        commandLabel: 'Inspect Queue'
      },
      {
        id: 'cmd-shuffle',
        question: 'How do I randomize and shuffle the queue?',
        answer: 'Use /shuffle or .shuffle to instantly randomize the order of all upcoming songs in your queue.',
        command: '/shuffle',
        commandLabel: 'Randomize Queue Order'
      },
      {
        id: 'cmd-loop',
        question: 'How do I loop a single song or the entire queue?',
        answer: 'Type /loop or .loop to toggle between three modes: Track Loop (repeats current song), Queue Loop (cycles whole list), or Disabled.',
        command: '/loop mode: track',
        commandLabel: 'Toggle Repeat Loop'
      },
      {
        id: 'cmd-remove',
        question: 'How do I remove a song from the queue?',
        answer: 'Use /remove or .rm followed by the track number in the queue (e.g. .rm 3 to remove the third song).',
        command: '/remove position: 3',
        commandLabel: 'Remove Track from Queue'
      },
      {
        id: 'cmd-skipto',
        question: 'How do I jump directly to a track further down in the queue?',
        answer: 'Use /skipto or .jump followed by the track index (e.g. .jump 5) to skip directly to that track and discard previous ones.',
        command: '/skipto position: 5',
        commandLabel: 'Jump to Queue Position'
      },
      {
        id: 'cmd-clear',
        question: 'How do I clear the entire queue at once?',
        answer: 'Type /clear or .cq to empty all upcoming tracks while keeping the currently playing track active.',
        command: '/clear',
        commandLabel: 'Clear Upcoming Queue'
      },
      {
        id: 'cmd-leavecleanup',
        question: 'How do I remove songs queued by users who left the voice channel?',
        answer: 'Use /leavecleanup or .lc to scan the queue and automatically purge all songs requested by members who are no longer in voice.',
        command: '/leavecleanup',
        commandLabel: 'Clean Absent User Tracks'
      }
    ]
  },
  {
    category: 'dsp-filters',
    categoryLabel: '14 DSP Studio Audio Filters',
    items: [
      {
        id: 'how-to-use-filters',
        question: 'How do I enable 8D Audio, Bass Boost, or Nightcore?',
        answer: 'You can enable any audio filter using slash commands (/filters), text prefix (.filter <name>), or through the Web Dashboard. DSP filters apply live without restarting your stream.',
        command: '/filters mode: bassboost level: extreme',
        commandLabel: 'Apply Studio Audio DSP'
      },
      {
        id: 'list-of-filters',
        question: 'What 14 audio filters are included in the DSP engine?',
        answer: 'Together includes:\n• Bass Boost (Low, Med, Extreme): Custom frequency amplification.\n• 8D Audio: 360-degree circular panning spatial sound.\n• Nightcore: High pitch & speed boost.\n• Vaporwave: Slowed tempo with vintage reverb.\n• Pop / Soft / Treble: Acoustic equalization curves.\n• Tremolo & Vibrato: Rapid volume and frequency modulation.\n• Karaoke: Vocal frequency attenuation.\n• Mono: Downmix stereo to single balanced channel.\n• Clear: Reset all filters to default flat EQ.',
        command: '.filter 8d',
        commandLabel: 'Enable 8D Spatial Audio'
      },
      {
        id: 'reset-filters',
        question: 'How do I turn off all audio filters?',
        answer: 'Type /filters mode: clear or .filter clear to immediately reset the sound engine to pure lossless studio flat EQ.',
        command: '/filters mode: clear',
        commandLabel: 'Reset Audio Equalizer'
      }
    ]
  },
  {
    category: 'voting-perks',
    categoryLabel: 'Voting & Top.gg Voter Commands',
    items: [
      {
        id: 'how-to-vote',
        question: 'How do I vote and check my vote status?',
        answer: 'You can check your vote status and remaining perk duration directly inside Discord using /vote or .vote. If expired, the command provides a direct link to the Top.gg vote portal.',
        command: '/vote',
        commandLabel: 'Check Vote Status in Discord'
      },
      {
        id: 'vote-command-syntax',
        question: 'What are the aliases for the vote command?',
        answer: 'You can use /vote, .vote, .voted, or .vo. You can also inspect another user\'s vote status by passing their mention or user ID (e.g. /vote user: @username or .vote <userID>).',
        command: '.vote @user',
        commandLabel: 'Inspect User Vote Status'
      },
      {
        id: 'voter-exclusive-perks',
        question: 'What exclusive commands are unlocked by voting?',
        answer: 'Voting on Top.gg instantly unlocks premium features for 12 hours without any payments:\n\n• /247 (.247): 24/7 Channel Locking to keep the bot permanently in voice.\n• /autoplay (.autoplay / .ap): Algorithmic song recommendation that keeps music playing endlessly when the queue ends.\n• /lyrics (.lyrics / .ly): Real-time interactive lyrics search and display.\n• Leaderboard Streaks: Earn bonus listening streaks and verified voter indicators.',
        callout: {
          type: 'tip',
          text: 'Only one person in the voice channel needs an active vote for the server to benefit from 24/7 channel locking and Autoplay!'
        }
      },
      {
        id: 'vote-refresh-interval',
        question: 'How long does a vote last and when can I vote again?',
        answer: 'Top.gg allows users to vote once every 12 hours. Every time you cast a vote, all voter commands remain active for the full 12-hour duration. On Top.gg weekends, votes count double toward community milestones.',
        command: 'https://top.gg/bot/863496211667484676/vote',
        commandLabel: 'Direct Top.gg Bot Vote Portal'
      }
    ]
  },
  {
    category: 'favourite-playlists',
    categoryLabel: 'Favorites & Personal Playlists',
    items: [
      {
        id: 'cmd-like-favorites',
        question: 'How do I save songs to my personal Favorites library?',
        answer: 'Type /like (or .fav) while listening to save the current song to your private library. To favorite every song currently in queue at once, use /likeall (.likequeue).',
        command: '/like',
        commandLabel: 'Favorite Current Song'
      },
      {
        id: 'cmd-playliked',
        question: 'How do I play my saved favorite songs?',
        answer: 'Type /playliked or .playfav to instantly load and stream all your favorite tracks into your voice channel.',
        command: '/playliked',
        commandLabel: 'Stream Favorite Tracks'
      },
      {
        id: 'cmd-showliked-unlike',
        question: 'How do I view or remove songs from my favorites?',
        answer: 'Type /showliked (.liked) to view your library. To remove a track, use /unlike (.delfav) followed by the track index or title.',
        command: '/showliked',
        commandLabel: 'Browse Saved Favorites'
      },
      {
        id: 'cmd-playlist',
        question: 'How do I create and manage custom playlists?',
        answer: 'Use /playlist (.pl) to build custom playlists. Commands include:\n• .pl create <name>: Create a new playlist.\n• .pl add <name> <song/url>: Add track to playlist.\n• .pl play <name>: Stream your custom playlist.\n• .pl list: View all your created playlists.\n• .pl delete <name>: Delete a playlist.',
        command: '.pl create ChillVibes',
        commandLabel: 'Scaffold Custom Playlist'
      }
    ]
  },
  {
    category: 'config-settings',
    categoryLabel: 'Server Config & 24/7 Channel Locking',
    items: [
      {
        id: 'cmd-247',
        question: 'How do I lock Together into a voice channel 24/7?',
        answer: 'Join your voice channel and type /247 or .247. The bot will lock to that room and stay connected indefinitely, automatically resuming playback if the Discord gateway disconnects.',
        command: '/247 status: enable',
        commandLabel: 'Activate 24/7 Voice Channel Locking'
      },
      {
        id: 'cmd-setprefix',
        question: 'How do I change the bot prefix for my server?',
        answer: 'Server managers can use /setprefix or .setprefix followed by a new prefix (e.g. .setprefix ! or .setprefix ?). Slash commands always work regardless of custom prefix.',
        command: '/setprefix prefix: !',
        commandLabel: 'Configure Custom Prefix'
      },
      {
        id: 'cmd-djrole',
        question: 'How do I set up a DJ Role to restrict player controls?',
        answer: 'Use /djrole (.dj) followed by a role mention or ID to designate a DJ role. When DJ mode is active, only users with that role or server managers can skip, stop, or seek songs.',
        command: '/djrole role: @DJ',
        commandLabel: 'Assign DJ Permission Role'
      },
      {
        id: 'cmd-source',
        question: 'How do I set the default audio search platform?',
        answer: 'Use /source to choose your server\'s preferred search engine (Spotify, YouTube, or SoundCloud) when queries are entered without a direct link.',
        command: '/source platform: spotify',
        commandLabel: 'Set Default Search Source'
      },
      {
        id: 'cmd-ignore',
        question: 'Can I prevent the bot from responding in specific channels?',
        answer: 'Yes! Use /ignore (.ig) in a text channel to toggle command processing on or off for that room.',
        command: '/ignore channel: #general',
        commandLabel: 'Ignore Channel Commands'
      }
    ]
  },
  {
    category: 'webplayer-visualizer',
    categoryLabel: '3D WebGL Webplayer Visualizer',
    items: [
      {
        id: 'what-is-webplayer',
        question: 'What is the 3D WebGL Webplayer and how do I open it?',
        answer: 'Together features an interactive real-time browser visualizer at together.dpdns.org/visualizer/. It captures live synchronized audio frequencies from your Discord voice channel and renders reactive 3D soundstages, animated waveforms, particle meshes, and full track controls in your browser.',
        command: 'https://together.dpdns.org/visualizer/',
        commandLabel: 'Open 3D Webplayer Visualizer'
      },
      {
        id: 'cmd-visualizer',
        question: 'Can I launch the 3D visualizer from Discord?',
        answer: 'Yes! Type /visualizer or .vz in any server where music is playing to receive a quick-launch invite link with live session syncing.',
        command: '/visualizer',
        commandLabel: 'Get Visualizer Stage Link'
      },
      {
        id: 'visualizer-modes',
        question: 'How many visualizer modes are available?',
        answer: 'Over 50 distinct 3D visual styles are available, including Cyber Tunnel, Neon Spectrum, Retro Grid, Audio Bloom, Hologram Matrix, and Particle Nebula. All modes sync in real time to the current playing track.'
      }
    ]
  },
  {
    category: 'info-leaderboard',
    categoryLabel: 'Profiles, Stats & Listening XP',
    items: [
      {
        id: 'cmd-profile',
        question: 'How do I view my music profile and listening stats?',
        answer: 'Type /profile or .profile to generate a brutalist music card displaying your total songs listened, favorite genre, hours streamed, and custom bio banner.',
        command: '/profile',
        commandLabel: 'Generate Music Profile Card'
      },
      {
        id: 'cmd-leaderboard',
        question: 'How do I check the music leaderboard rankings?',
        answer: 'Type /lb or .lb to view server and global listener rankings, streak leaderboards, and most played tracks.',
        command: '/lb type: listening_time',
        commandLabel: 'View Server Music Leaderboard'
      },
      {
        id: 'cmd-stats-ping',
        question: 'How do I check bot latency and node health?',
        answer: 'Type /ping to inspect Discord gateway and Audio Engine round-trip latency in milliseconds. Type /stats (.bi) for CPU, memory, and cluster health.',
        command: '/ping',
        commandLabel: 'Check Gateway & Audio Latency'
      }
    ]
  },
  {
    category: 'troubleshooting',
    categoryLabel: 'Troubleshooting & Audio Fixes',
    items: [
      {
        id: 'cmd-forcefix',
        question: 'What should I do if the bot is lagging or stuck in a voice channel?',
        answer: 'Use /forcefix (.fix) to force Together to re-establish the voice connection, reset the audio pipeline, and re-sync Lavalink frames without clearing your queue.',
        command: '/forcefix',
        commandLabel: 'Force Fix Voice Gateway Connection'
      },
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
        title="Documentation & FAQ — Together Music Bot"
        description="Comprehensive documentation and command FAQ for Together Music Bot: 24-bit lossless opus audio, 3D webplayer visualizer, playback controls, DSP filters, and 24/7 channel locking."
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
                  COMMANDS & PROTOCOL DOCS
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
            <span>COMMAND REGISTRY & COMPREHENSIVE PROTOCOL FAQ</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
            COMMANDS & FAQ DIRECTORY.
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Detailed guides for all 59+ commands: audio playback, queue manipulations, 14 DSP filters, 24/7 channel locking, playlists, and server configuration.
          </p>

          {/* Search Bar */}
          <div className="pt-2 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <label htmlFor="doc-search-input" className="sr-only">Search all commands and FAQs</label>
              <input
                id="doc-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search commands (e.g. play, skip, 247, bassboost, lyrics, djrole)..."
                className="w-full bg-brutal-surface border-2 border-brutal-border pl-10 pr-4 py-2.5 font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brutal-accent shadow-brutal-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear command search"
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
                COMMAND GROUPS
              </span>
              <span className="text-[10px] bg-black text-brutal-accent px-1.5 py-0.5 border border-zinc-800">
                {DOC_CATEGORIES.length} CATEGORIES
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
                href={TOPGG_VOTE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-amber-400 hover:bg-amber-300 border-2 border-black text-center text-xs font-black uppercase transition-all flex items-center justify-center gap-2 text-black shadow-brutal-sm"
              >
                <Star className="w-3.5 h-3.5 fill-black" />
                <span>VOTE ON TOP.GG</span>
              </a>
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
                <div className="font-display font-black text-lg text-white uppercase">No Commands or FAQs Found</div>
                <p className="text-xs text-zinc-400">
                  No commands matched "{searchQuery}". Try searching for command names like "play", "skip", "volume", "247", or "lyrics".
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

                        {/* Interactive Command Block */}
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
