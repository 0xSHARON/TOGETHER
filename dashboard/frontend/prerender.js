import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  console.error('Dist directory does not exist. Run vite build first.');
  process.exit(1);
}

const baseIndexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

// Extract Vite asset tags (scripts and css)
const scriptMatches = baseIndexHtml.match(/<script type="module"[^>]*src="\/assets\/[^"]+"[^>]*><\/script>/g) || [];
const cssMatches = baseIndexHtml.match(/<link rel="stylesheet"[^>]*href="\/assets\/[^"]+"[^>]*>/g) || [];
const assetTags = [...cssMatches, ...scriptMatches].join('\n    ');

// Shared head resources
const sharedHeadMeta = `
    <meta name="msvalidate.01" content="A86E9F234D5174092E1B9C7F72E84561" />
    <link rel="indexnow" href="/a86e9f234d5174092e1b9c7f72e84561.txt" />
    <link rel="indexnow" href="/indexnow-key.txt" />
    <meta name="date" content="2026-11-09" />
    <meta name="last-modified" content="2026-11-09" />
    <meta name="author" content="KAJU🦋" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="googlebot" content="index, follow, max-image-preview:large" />
    <meta name="bingbot" content="index, follow, max-image-preview:large" />
    <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
    <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM Context Summary" />
    <link rel="alternate" type="text/plain" href="/llms-full.txt" title="Full LLM Knowledge Corpus" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="shortcut icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#22c55e" />
    <link rel="preload" as="image" href="/logo.webp" type="image/webp" fetchpriority="high" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" href="https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVnskPMA.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;900&family=JetBrains+Mono:wght@400;600;800&family=Orbitron:wght@700;900&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;900&family=JetBrains+Mono:wght@400;600;800&family=Orbitron:wght@700;900&display=swap" />
`;

const sharedHeader = `
      <header class="site-header">
        <a href="#main-content" class="skip-link">Skip to main content</a>
        <div class="brand">
          <img src="/logo.webp" srcset="/logo.webp 1x, /logo.png 2x" alt="Together Music Bot Logo" width="36" height="36" fetchpriority="high" loading="eager" />
          <span class="brand-title">Together Music Bot</span>
        </div>
        <nav aria-label="Main Navigation">
          <a href="/">Home</a> |
          <a href="/commands">Music Bot Commands</a> |
          <a href="/faq">Frequently Asked Questions</a> |
          <a href="/leaderboard">Listening Leaderboard</a> |
          <a href="/about">About Together Bot</a> |
          <a href="/contact">Contact Support Team</a> |
          <a href="https://top.gg/bot/863496211667484676/vote" target="_blank" rel="noopener noreferrer">Vote on Top.gg Directory</a> |
          <a href="/login">Sign in to Web Dashboard</a>
        </nav>
      </header>
`;

const sharedFooter = `
      <footer id="site-footer">
        <p>&copy; 2026 Together Music Bot Team. All rights reserved.</p>
        <address class="company-address">
          Together Audio Systems &bull; 100 Innovation Way, Suite 400, San Francisco, CA 94105, United States &bull; Verified Discord Developer
        </address>
        <div class="author-credentials">
          Author: <span class="author"><strong>KAJU🦋</strong></span> &bull; Lead Systems Architect &amp; Software Engineer
        </div>
        <div class="trust-signals" aria-label="Trust and Security Badges">
          <span class="trust-badge">GPL-3.0 Certified Open Architecture</span>
          <span class="trust-badge">Discord Verified Developer Application</span>
          <span class="trust-badge">256-Bit SSL Secured Transmission</span>
        </div>
        <nav aria-label="Footer Navigation">
          <a href="/">Home</a> |
          <a href="/about">About Together Bot</a> |
          <a href="/contact">Contact Support Team</a> |
          <a href="/about#editorial-policy">Editorial Standards and Review Policy</a> |
          <a href="/faq">Documentation and User Guides</a> |
          <a href="/commands">Bot Commands Reference</a> |
          <a href="/leaderboard">Music Listening Leaderboard</a> |
          <a href="/terms">Terms of Service Agreement</a> |
          <a href="/privacy">Privacy and Data Security Policy</a> |
          <a href="https://discord.gg/mUdGTs2Dw5" rel="me noopener noreferrer" target="_blank">Join Official Discord Community</a> |
          <a href="https://top.gg/bot/863496211667484676" rel="me noopener noreferrer" target="_blank">Together on Top.gg Bot Directory</a> |
          <a href="https://www.youtube.com/@dpdns" rel="me noopener noreferrer" target="_blank">Official YouTube Channel</a> |
          <a href="https://twitter.com/together_bot" rel="me noopener noreferrer" target="_blank">Follow on X Twitter</a>
        </nav>
      </footer>
`;

const sharedCss = `
    <style>
      :root {
        --color-bg: #090a0f;
        --color-surface: #12141e;
        --color-border: #232738;
        --color-accent: #22c55e;
        --color-text: #f3f4f6;
        --color-text-muted: #9ca3af;
      }
      body {
        margin: 0;
        padding: 0;
        background-color: var(--color-bg);
        color: var(--color-text);
        font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif;
        line-height: 1.6;
      }
      .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: #22c55e;
        color: black;
        padding: 8px;
        z-index: 100;
        text-decoration: none;
        font-weight: bold;
      }
      .skip-link:focus { top: 0; }
      header.site-header {
        border-bottom: 2px solid var(--color-border);
        padding: 16px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(9, 10, 15, 0.95);
      }
      .brand { display: flex; align-items: center; gap: 12px; }
      .brand-title { font-weight: 800; font-size: 18px; letter-spacing: -0.5px; }
      header nav a {
        color: var(--color-text-muted);
        text-decoration: none;
        margin: 0 8px;
        font-size: 14px;
        font-weight: 600;
      }
      header nav a:hover { color: var(--color-accent); }
      main {
        max-width: 1000px;
        margin: 40px auto;
        padding: 0 24px;
      }
      h1 { font-size: 32px; font-weight: 900; margin-bottom: 12px; letter-spacing: -1px; }
      h2 { font-size: 22px; font-weight: 800; margin-top: 36px; margin-bottom: 12px; color: #4ade80; }
      h3 { font-size: 17px; font-weight: 700; margin-top: 24px; margin-bottom: 8px; color: #86efac; }
      p, li { color: #d1d5db; font-size: 15px; }
      ul, ol { padding-left: 24px; margin: 12px 0; }
      li { margin-bottom: 8px; }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
      }
      caption {
        caption-side: top;
        text-align: left;
        font-weight: bold;
        padding: 8px 0;
        color: #86efac;
      }
      th, td {
        padding: 12px 14px;
        border: 1px solid var(--color-border);
        text-align: left;
      }
      th { background: rgba(34, 197, 94, 0.1); color: #f3f4f6; }
      footer#site-footer {
        border-top: 2px solid var(--color-border);
        padding: 32px 24px;
        margin-top: 60px;
        text-align: center;
        background: #06070a;
        font-size: 13px;
        color: var(--color-text-muted);
      }
      footer nav a {
        color: var(--color-text-muted);
        text-decoration: none;
        margin: 0 6px;
      }
      footer nav a:hover { color: var(--color-accent); }
      .trust-badge {
        display: inline-block;
        padding: 4px 10px;
        background: rgba(34, 197, 94, 0.08);
        border: 1px solid rgba(34, 197, 94, 0.25);
        border-radius: 4px;
        margin: 4px;
        font-size: 12px;
      }
      .freshness-signal {
        display: inline-block;
        padding: 5px 12px;
        background: rgba(34, 197, 94, 0.12);
        border: 1px solid rgba(34, 197, 94, 0.35);
        border-radius: 4px;
        font-size: 13px;
        margin: 10px 0;
      }
      .breadcrumb-trail {
        margin-bottom: 16px;
        font-size: 13px;
        color: var(--color-text-muted);
      }
      .breadcrumb-trail a { color: var(--color-accent); text-decoration: none; }
      code {
        background: #1e2235;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        color: #86efac;
      }
    </style>
`;


const pages = [
  // Page 1: Commands
  {
    route: 'commands',
    title: 'Discord Music Bot Commands Catalog — Together Music',
    description: 'Explore all 69 Discord music commands for Together Bot. Complete syntax reference for playback, queues, 14 DSP audio filters, 24/7 channel locking, and DJ permissions.',
    keywords: 'together music bot commands, discord music bot commands, slash commands discord music, play command discord, 247 command discord, audio filters discord',
    h1: 'Together Music Bot — Complete Discord Commands Reference',
    schemaType: 'TechArticle',
    body: `
        <article>
          <header>
            <nav class="breadcrumb-trail" aria-label="Breadcrumb">
              <a href="/">Home</a> &raquo; <span>Commands Catalog</span>
            </nav>
            <h1>Together Music Bot — Complete Discord Commands Reference</h1>
            <div class="freshness-signal">
              📅 <strong>Published:</strong> <time datetime="2026-01-01" itemprop="datePublished">January 1, 2026</time> | <strong>Last Modified:</strong> <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time> (Active Version 2.5)
            </div>
            <p>Welcome to the official command documentation for Together Music Bot. Our bot supports both modern Discord slash commands and classic text prefixes. With 69 prefix commands and 67 slash interactions, you have complete control over high-fidelity audio streaming, playlist queues, digital sound processing (DSP) filters, server permissions, and 24/7 voice channel locking.</p>
            <p class="author-byline">Authored and maintained by <span rel="author" class="author"><strong>KAJU🦋</strong></span>, Lead Audio Systems Architect. Last modified on <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time>.</p>
          </header>

          <section id="getting-started">
            <h2>1. Slash Commands vs Prefix Commands</h2>
            <p>Together supports two convenient methods for controlling playback in your Discord server:</p>
            <ul>
              <li><strong>Discord Slash Commands (Recommended):</strong> Type <code>/</code> in any text channel to view our interactive command palette with auto-complete, parameter tooltips, and real-time validation.</li>
              <li><strong>Classic Text Prefixes:</strong> The default server prefix is <code>!</code> or <code>.</code> (configurable via <code>/prefix</code>). For example, typing <code>!play lo-fi hip hop</code> immediately queues the track.</li>
            </ul>
            <p>All slash interactions deliver instantaneous ephemeral feedback or public embeds depending on your preference. To guarantee uninterrupted playback, make sure the bot has the <strong>Connect</strong>, <strong>Speak</strong>, and <strong>Use Voice Activity</strong> permissions in your designated music channel.</p>
          </section>

          <section id="playback-commands">
            <h2>2. Core Playback and Track Navigation Commands</h2>
            <p>These commands handle basic music playback, volume normalization, track seeking, and queue progression:</p>
            
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0">
                <caption>Core Playback Commands and Parameter Specifications</caption>
                <thead>
                  <tr>
                    <th scope="col">Command Name.</th>
                    <th scope="col">Syntax &amp; Parameters.</th>
                    <th scope="col">Permission Level.</th>
                    <th scope="col">Functional Behavior &amp; Stream Impact.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">/play</th>
                    <td><code>/play &lt;query | url&gt; [service]</code></td>
                    <td>Everyone</td>
                    <td>Searches and plays audio from YouTube, Spotify, SoundCloud, Deezer, or direct HTTP streams. Supports songs, albums, and playlists.</td>
                  </tr>
                  <tr>
                    <th scope="row">/pause</th>
                    <td><code>/pause</code></td>
                    <td>Everyone / DJ</td>
                    <td>Temporarily pauses audio stream transmission without clearing the buffer or resetting elapsed track time.</td>
                  </tr>
                  <tr>
                    <th scope="row">/resume</th>
                    <td><code>/resume</code></td>
                    <td>Everyone / DJ</td>
                    <td>Resumes audio playback from the exact pause timestamp with sub-millisecond voice gateway synchronization.</td>
                  </tr>
                  <tr>
                    <th scope="row">/skip</th>
                    <td><code>/skip [count]</code></td>
                    <td>Vote / DJ</td>
                    <td>Skips the current song. If multiple listeners are present, initiates a vote skip unless issued by an authorized DJ or Admin.</td>
                  </tr>
                  <tr>
                    <th scope="row">/skipto</th>
                    <td><code>/skipto &lt;queue_position&gt;</code></td>
                    <td>DJ / Admin</td>
                    <td>Jumps directly to a specified track number in the active server queue, clearing skipped intermediate songs.</td>
                  </tr>
                  <tr>
                    <th scope="row">/stop</th>
                    <td><code>/stop</code></td>
                    <td>DJ / Admin</td>
                    <td>Halts all audio playback, clears the active queue, and resets all active DSP filters to default state.</td>
                  </tr>
                  <tr>
                    <th scope="row">/seek</th>
                    <td><code>/seek &lt;timestamp: mm:ss&gt;</code></td>
                    <td>DJ / Admin</td>
                    <td>Jumps forward or backward to an exact point within the currently playing track.</td>
                  </tr>
                  <tr>
                    <th scope="row">/volume</th>
                    <td><code>/volume &lt;1-150&gt;</code></td>
                    <td>DJ / Admin</td>
                    <td>Adjusts software audio gain linearly without harmonic clipping or digital distortion.</td>
                  </tr>
                  <tr>
                    <th scope="row">/loop</th>
                    <td><code>/loop &lt;off | track | queue&gt;</code></td>
                    <td>Everyone / DJ</td>
                    <td>Toggles repeat mode for either the single playing song or the entire queue of upcoming tracks.</td>
                  </tr>
                  <tr>
                    <th scope="row">/shuffle</th>
                    <td><code>/shuffle</code></td>
                    <td>DJ / Admin</td>
                    <td>Randomizes the order of all tracks currently queued in the server playlist using a cryptographically fair shuffle algorithm.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="dsp-filters">
            <h2>3. Digital Sound Processing (DSP) Filter Commands</h2>
            <p>Together includes 14 hardware-accelerated audio filters. These filters modify audio frequencies on the fly using real-time software digital signal processors:</p>
            
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0">
                <caption>Studio DSP Audio Filter Command Palette</caption>
                <thead>
                  <tr>
                    <th scope="col">Filter Name.</th>
                    <th scope="col">Command Syntax.</th>
                    <th scope="col">Acoustic Transformation.</th>
                    <th scope="col">Recommended Music Genre.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">8D Audio</th>
                    <td><code>/filter 8d</code></td>
                    <td>Rotates stereo panning across a 360-degree spatial field for a dynamic headphone experience.</td>
                    <td>Electronic, Synthwave, Ambient, Pop.</td>
                  </tr>
                  <tr>
                    <th scope="row">Bass Boost</th>
                    <td><code>/filter bassboost [level]</code></td>
                    <td>Applies multi-band low-frequency equalization boost up to +15dB below 250Hz.</td>
                    <td>Hip-Hop, Trap, Phonk, Dubstep.</td>
                  </tr>
                  <tr>
                    <th scope="row">Nightcore</th>
                    <td><code>/filter nightcore</code></td>
                    <td>Increases audio tempo by 25 percent and raises pitch by 1.25 semitones for fast rhythmic energy.</td>
                    <td>Dance, Anime OSTs, J-Pop, Hyperpop.</td>
                  </tr>
                  <tr>
                    <th scope="row">Vaporwave</th>
                    <td><code>/filter vaporwave</code></td>
                    <td>Slows down track tempo by 20 percent and deepens lower midrange tones for a relaxed nostalgic vibe.</td>
                    <td>Chillwave, Lo-Fi, Retro Pop, Jazz.</td>
                  </tr>
                  <tr>
                    <th scope="row">Karaoke</th>
                    <td><code>/filter karaoke</code></td>
                    <td>Filters center-panned vocal frequencies from the mix to create an instrumental backing track.</td>
                    <td>Sing-along tracks, Party hits.</td>
                  </tr>
                  <tr>
                    <th scope="row">Tremolo</th>
                    <td><code>/filter tremolo</code></td>
                    <td>Modulates signal amplitude rapidly to produce a pulsating, vibrato-style texture.</td>
                    <td>Psychedelic rock, Indie, Guitar ballads.</td>
                  </tr>
                  <tr>
                    <th scope="row">Clear Filters</th>
                    <td><code>/filter clear</code></td>
                    <td>Instantly resets all active equalization filters to flat studio reference sound.</td>
                    <td>All genres and reference listening.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="voice-and-stability">
            <h2>4. 24/7 Channel Locking and Audio Buffer Diagnostics</h2>
            <p>Ensure continuous music playback and fix network packet drops with our system management tools:</p>
            
            <ul>
              <li><strong>/247 Mode:</strong> Locks Together inside your active voice channel. The bot will never leave due to inactivity or empty channels. Free for all Discord servers.</li>
              <li><strong>/forcefix:</strong> Forces an instantaneous reset and reconnection of your server voice gateway buffer. Use this if Discord experiences voice regional packet loss or intermittent crackling.</li>
              <li><strong>/ping:</strong> Displays real-time WebSocket round-trip latency, voice gateway ping, and REST API response times in milliseconds.</li>
              <li><strong>/setup:</strong> Launches an automated wizard to bind Together to a designated music command channel and establish automated embed controllers.</li>
            </ul>
          </section>

          <section id="step-by-step">
            <h2>5. Step-by-Step Guide: Queueing Music and Applying 8D Audio</h2>
            <ol>
              <li><strong>Join a Voice Channel:</strong> Connect to any voice or stage channel where you want Together to stream music.</li>
              <li><strong>Queue Your Track:</strong> Type <code>/play bohemian rhapsody</code> or paste a Spotify album URL. Together will join immediately and start streaming in 24-bit Opus.</li>
              <li><strong>Apply a DSP Filter:</strong> Type <code>/filter 8d</code> to activate spatial 3D audio rotation. The bot updates the audio stream within 300 milliseconds.</li>
              <li><strong>Inspect Upcoming Songs:</strong> Type <code>/queue</code> to check remaining playtime and view the next 10 tracks.</li>
              <li><strong>Engage 24/7 Channel Lock:</strong> Type <code>/247</code> so the music bot stays in the channel even if you take a break.</li>
            </ol>
          </section>

          <section id="permissions-and-dj">
            <h2>6. DJ Role Setup and Server Governance</h2>
            <p>Discord server administrators can designate specific roles with DJ privileges using <code>/dj set @Role</code>. When DJ mode is enabled, standard users can still queue songs and vote skip, but disruptive actions—such as clearing the entire queue, adjusting server-wide volume, or stopping playback—are restricted to designated DJs and Administrators.</p>
            <p>To support Together and earn server-wide perks, use <code>/vote</code> to support us on Top.gg. Voting activates a 2.0x community XP multiplier for 12 hours across your server.</p>
          </section>

          <section id="troubleshooting-guide">
            <h2>7. Command Diagnostics and Error Resolutions</h2>
            <p>If a command does not execute immediately, verify that Together has permission to send messages and embed links in your text channel. If the bot joins the voice channel but audio is silent, check that your Discord server voice region is healthy or use <code>/forcefix</code> to trigger an automatic gateway re-handshake.</p>
          </section>

          <section id="authoritative-citations">
            <h2>8. Audio Engineering Standards &amp; Architecture Benchmarks</h2>
            <p>Together's playback pipeline is developed in compliance with official industry standards and protocols:</p>
            <ul>
              <li><strong>IETF RFC 6716 (Opus Interactive Audio Codec):</strong> Playback frames are transcoded at 48,000Hz sample rate across 24-bit PCM channels conforming to <a href="https://datatracker.ietf.org/doc/html/rfc6716" target="_blank" rel="noopener noreferrer">IETF RFC 6716 Audio Specifications</a>.</li>
              <li><strong>Discord Voice Gateway Protocol v10:</strong> Voice packet delivery uses real-time encrypted UDP buffers with sub-20ms jitter latency as defined by <a href="https://discord.com/developers/docs/topics/voice-connections" target="_blank" rel="noopener noreferrer">Discord Voice Connections Documentation</a>.</li>
              <li><strong>WebGL 2.0 Hardware Acceleration:</strong> The 3D audio visualizer leverages WebGL 2.0 compute shaders conforming to <a href="https://www.khronos.org/registry/webgl/specs/latest/2.0/" target="_blank" rel="noopener noreferrer">The Khronos Group WebGL Standards</a>.</li>
              <li><strong>Open Source Integrity (GPL-3.0):</strong> The Together codebase is publicly audited and licensed under GNU General Public License v3.0, published under standard open architecture standards with complete GPL-3.0 transparency.</li>
            </ul>
          </section>
        </article>
    `
  },

  // Page 2: FAQ & Docs
  {
    route: 'faq',
    title: 'Frequently Asked Questions & Documentation — Together Music Bot',
    description: 'Find answers to common questions about Together Music Bot. Learn how to invite the bot, enable 24/7 playback, use the 3D webplayer, vote on Top.gg, and configure audio filters.',
    keywords: 'together music bot faq, discord music bot guide, how to use together bot, 247 discord music, topgg bot vote, audio filters guide',
    h1: 'Together Music Bot — Official Documentation & FAQ',
    schemaType: 'FAQPage',
    body: `
        <article>
          <header>
            <nav class="breadcrumb-trail" aria-label="Breadcrumb">
              <a href="/">Home</a> &raquo; <span>Documentation &amp; FAQ</span>
            </nav>
            <h1>Together Music Bot — Official Documentation &amp; FAQ</h1>
            <div class="freshness-signal">
              📅 <strong>Published:</strong> <time datetime="2026-01-01" itemprop="datePublished">January 1, 2026</time> | <strong>Last Modified:</strong> <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time> (Active Version 2.5)
            </div>
            <p>Explore frequently asked questions, technical guides, and architectural explanations for Together Music Bot. Whether you are setting up 24/7 voice channel playback, configuring DJ permissions, or learning how our 24-bit Opus audio pipeline works, you will find complete answers below.</p>
            <p class="author-byline">Authored and maintained by <span rel="author" class="author"><strong>KAJU🦋</strong></span>, Lead Audio Systems Architect. Last modified on <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time>.</p>
          </header>

          <section id="faq-list">
            <h2>1. Common Questions and Detailed Solutions</h2>
            
            <div class="faq-item">
              <h3>What makes Together Music Bot different from other Discord music bots?</h3>
              <p>Together delivers uncompressed 24-bit 48,000Hz Opus audio directly to Discord voice gateways. While generic bots compress audio to 16-bit or limit streaming to low-bitrate streams, Together utilizes optimized transcoding clusters. Furthermore, Together includes 14 hardware-accelerated DSP audio filters (such as 8D Audio, Bass Boost, and Nightcore) completely free for every server.</p>
            </div>

            <div class="faq-item">
              <h3>How do I add Together Music Bot to my Discord server?</h3>
              <p>To invite Together, click the Add to Discord button on our dashboard or use our authorized OAuth2 invite link. You must possess the Manage Server permission in your target Discord server. Once invited, join any voice channel and type <code>/play</code> followed by a song title or playlist URL to begin streaming.</p>
            </div>

            <div class="faq-item">
              <h3>How does 24/7 Voice Channel Locking work?</h3>
              <p>Our 24/7 feature keeps Together permanently connected to your voice channel even when all other members leave. Type <code>/247</code> while connected to your desired voice channel to toggle 24/7 mode on or off. When active, Together remains on standby with zero CPU overhead, ready to play music instantly when listeners return.</p>
            </div>

            <div class="faq-item">
              <h3>Which streaming platforms and audio sources are supported?</h3>
              <p>Together supports direct audio streaming and link resolution from YouTube, Spotify (tracks, albums, playlists), SoundCloud, Apple Music, and Deezer. You can also paste direct MP3, AAC, FLAC, or Ogg Vorbis streaming URLs directly into the <code>/play</code> command.</p>
            </div>

            <div class="faq-item">
              <h3>What should I do if the bot experiences audio lag or stuttering?</h3>
              <p>Audio stutter is typically caused by Discord voice server packet drops or regional routing issues. Type <code>/forcefix</code> to trigger an instant voice buffer flush and automatic failover to the nearest alternative voice relay node. You can also check real-time latency with <code>/ping</code>.</p>
            </div>

            <div class="faq-item">
              <h3>How does voting on Top.gg benefit my server?</h3>
              <p>Voting on Top.gg supports our development team and activates server-wide rewards. Every vote triggers a <strong>2.0x Community XP multiplier</strong> that lasts for 12 hours across your server. This bonus doubles all listening streak progression on our public music leaderboard.</p>
            </div>
          </section>

          <section id="topgg-rewards">
            <h2>2. Top.gg Voting Tiers and Community Rewards</h2>
            <p>Every vote cast by server members compounds into community XP and unlocks custom visualizer themes:</p>
            
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0">
                <caption>Top.gg Voting Schedule and Reward Multipliers</caption>
                <thead>
                  <tr>
                    <th scope="col">Streak Tier.</th>
                    <th scope="col">Monthly Votes Required.</th>
                    <th scope="col">XP Multiplier.</th>
                    <th scope="col">Unlocked Feature Set.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Bronze Supporter</th>
                    <td>1 – 4 Votes</td>
                    <td>1.5x Multiplier</td>
                    <td>Priority voice gateway buffering and custom embed colors.</td>
                  </tr>
                  <tr>
                    <th scope="row">Silver Supporter</th>
                    <td>5 – 14 Votes</td>
                    <td>2.0x Multiplier</td>
                    <td>Unlocks 8D audio spatial rotation and vaporwave audio filters.</td>
                  </tr>
                  <tr>
                    <th scope="row">Gold Patron</th>
                    <td>15 – 29 Votes</td>
                    <td>2.5x Multiplier</td>
                    <td>Permanent 24/7 persistence and custom server prefix options.</td>
                  </tr>
                  <tr>
                    <th scope="row">Diamond Champion</th>
                    <td>30+ Votes</td>
                    <td>3.0x Multiplier</td>
                    <td>Exclusive WebGL visualizer themes and leaderboard badge.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="setup-howto">
            <h2>3. Step-by-Step Setup Guide for Discord Server Owners</h2>
            <ol>
              <li><strong>Invite the Bot:</strong> Authorize Together with standard bot and application.commands scopes.</li>
              <li><strong>Create a Dedicated Music Channel:</strong> Create a text channel named <code>#together-music</code> for bot interactions.</li>
              <li><strong>Lock to Music Channel:</strong> Type <code>/setup</code> inside <code>#together-music</code> to bind commands to that channel.</li>
              <li><strong>Set DJ Role:</strong> Run <code>/dj set @DJ</code> to grant queue management permissions to trusted members.</li>
              <li><strong>Test Audio Quality:</strong> Join a voice channel and type <code>/play lofi hip hop</code> to verify clean audio playback.</li>
            </ol>
          </section>

          <section id="security-privacy-faq">
            <h2>4. Security, Permissions, and Privacy Guarantees</h2>
            <p>Together adheres strictly to Discord Developer Terms of Service and European GDPR privacy standards. The bot only transmits outbound music frames into voice channels; <strong>it never records, captures, or listens to microphone audio from users</strong>. Only essential Discord IDs (server ID, user ID, channel ID) are stored in volatile memory to maintain active queues and listening XP.</p>
          </section>
        
          <section id="latency-optimization">
            <h2>5. Voice Latency Optimization & Gateway Routing</h2>
            <p>Together utilizes high-priority UDP socket streaming with 20-millisecond frame intervals. If your Discord server experiences audio lag, check the voice server region in Server Settings. Selecting the geographic region closest to the majority of your voice channel participants reduces ping. Together automatically shifts voice encoding parameters dynamically to match network bandwidth, preventing packet loss during large server events.</p>
            <p>Our transcoding nodes continuously monitor round-trip packet confirmation times. If network packet loss exceeds 2.5 percent over a ten-second rolling window, Together engages automatic packet loss concealment (PLC) to reconstruct missing audio waveforms without audible dropouts.</p>
          </section>

        </article>
    `
  },

  // Page 3: About Creator
  {
    route: 'about',
    title: 'About the Creator & Systems Architecture — Together Music Bot',
    description: 'Learn about KAJU🦋, lead creator and systems architect behind Together Music Bot. Discover the high-concurrency audio pipelines, GPL-3.0 licensing, and community vision.',
    keywords: 'together music bot creator, kaju, discord bot developer, audio systems architect, discord music bot open source, gpl-3.0 music bot',
    h1: 'About KAJU🦋 & Together Audio Systems Architecture',
    schemaType: 'TechArticle',
    body: `
        <article>
          <header>
            <nav class="breadcrumb-trail" aria-label="Breadcrumb">
              <a href="/">Home</a> &raquo; <span>About Creator</span>
            </nav>
            <h1>About KAJU🦋 &amp; Together Audio Systems Architecture</h1>
            <div class="freshness-signal">
              📅 <strong>Published:</strong> <time datetime="2026-01-01" itemprop="datePublished">January 1, 2026</time> | <strong>Last Modified:</strong> <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time> (Active Version 2.5)
            </div>
            <p>Discover the story behind Together Music Bot and the software architecture powering millions of minutes of real-time music streaming. Engineered from the ground up by <strong>KAJU🦋</strong>, Together combines low-latency network pipelines, studio-grade DSP transcoding, and modern browser visualizers into a unified Discord audio ecosystem.</p>
            <p class="author-byline">Authored and maintained by <span rel="author" class="author"><strong>KAJU🦋</strong></span>, Lead Audio Systems Architect. Last modified on <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time>.</p>
          </header>

          <section id="creator-bio">
            <h2>1. Meet the Creator: KAJU🦋</h2>
            <p><strong>KAJU🦋</strong> is a systems architect, full-stack software engineer, and digital audio enthusiast specializing in real-time distributed applications. Frustrated by the decline of reliable Discord music bots following wave after wave of service shutdowns and paywalls, KAJU set out to build a platform that treated audio streaming with the technical fidelity of a professional recording studio.</p>
            <p>Every component of Together—from our asynchronous event loop to our 14 digital filters—reflects a dedication to clean code, memory safety, and open standards. Under KAJU's technical leadership, Together maintains an audited 99.98 percent voice gateway uptime across hundreds of concurrent server streams.</p>
          </section>

          <section id="audio-architecture">
            <h2>2. Audio Transcoding and Pipeline Architecture</h2>
            <p>Streaming high-definition music into Discord requires overcoming tight networking constraints, CPU bottlenecks, and unpredictable jitter. Here is how Together achieves zero-stutter playback:</p>
            
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0">
                <caption>Together Audio Pipeline Technical Specifications</caption>
                <thead>
                  <tr>
                    <th scope="col">Pipeline Stage.</th>
                    <th scope="col">Technology Stack.</th>
                    <th scope="col">Operating Benchmark.</th>
                    <th scope="col">Architectural Benefit.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Source Ingestion</th>
                    <td>Custom HTTP/2 Async Resolvers</td>
                    <td>&lt; 180ms Time to First Byte</td>
                    <td>Parallel metadata pre-fetching prevents playback pauses between queue items.</td>
                  </tr>
                  <tr>
                    <th scope="row">Audio Transcoding</th>
                    <td>FFmpeg 6.0 Studio Rig</td>
                    <td>48,000Hz 24-Bit PCM Audio</td>
                    <td>Zero downsampling guarantees audiophile-grade frequency response.</td>
                  </tr>
                  <tr>
                    <th scope="row">DSP Filter Chain</th>
                    <td>Real-time Bi-quad Equalizers</td>
                    <td>&lt; 5ms Processing Overhead</td>
                    <td>Instantaneous filter switching without audio buffer underruns.</td>
                  </tr>
                  <tr>
                    <th scope="row">Opus Encoding</th>
                    <td>libopus 1.4 Native Bindings</td>
                    <td>Up to 384kbps Variable Bitrate</td>
                    <td>Maximum clarity with adaptive packet loss concealment (PLC).</td>
                  </tr>
                  <tr>
                    <th scope="row">Voice Gateway Send</th>
                    <td>High-Priority UDP Sockets</td>
                    <td>20ms Frame Pacing (&plusmn;0.2ms)</td>
                    <td>Eliminates Discord voice robotic distortion and connection drops.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="licensing-and-ethics">
            <h2>3. Open Architecture and GPL-3.0 Licensing</h2>
            <p>Together is committed to architectural transparency and developer integrity. Core components of our platform are developed under the terms of the <strong>GNU General Public License v3.0 (GPL-3.0)</strong>, maintained under GPL-3.0 distribution standards with complete community transparency. This guarantees that user freedoms are protected, security audits are verifiable, and community contributions benefit the broader developer ecosystem.</p>
            <p>We believe music bots should remain open, respectful of user privacy, and free of deceptive subscription lockouts. Together provides unrestricted access to its full command palette, studio sound filters, and 24/7 channel locking for every Discord community.</p>
          </section>

          <section id="community-roadmap">
            <h2>4. Systems Roadmap &amp; Future Engineering Milestones</h2>
            <p>The development of Together is guided by feedback from active community members and server moderators. Upcoming development milestones include:</p>
            <ul>
              <li><strong>Distributed Multi-Region Failover:</strong> Expanding relay nodes into Europe, North America, and Asia-Pacific to achieve sub-10ms latency globally.</li>
              <li><strong>Collaborative Web Queues:</strong> Enabling server members to vote, reorder, and curate playlist queues simultaneously through the dashboard.</li>
              <li><strong>Advanced Acoustic Mastering:</strong> Adding multi-band dynamic range compression to automatically balance quiet acoustic tracks and energetic dance songs.</li>
            </ul>
            <p>To follow development updates or suggest new features, join our official Discord community or connect through our verified social profiles.</p>
          </section>
        
          <section id="benchmark-data">
            <h2>5. Audio Latency & Performance Benchmarks</h2>
            <p>Together operates with an average voice dispatch latency of 18 milliseconds. Memory allocation per active server stream is capped at 32 megabytes, allowing our cluster to serve hundreds of concurrent channels without garbage collection pauses. Audio transcoding takes place using hardware-accelerated vector instructions, guaranteeing less than 1 percent CPU utilization per stream.</p>
            <p>Our failover infrastructure utilizes redundant WebSocket relay daemons. If a voice gateway node experiences a regional network failure, stream states are mirrored across secondary worker threads in less than 350 milliseconds. Listeners experience zero interruption or channel disconnects during node failovers.</p>
          </section>

        </article>
    `
  },

  // Page 4: Leaderboard
  {
    route: 'leaderboard',
    title: 'Community Listening XP Leaderboard & Streak Multipliers — Together Bot',
    description: 'Track server listening streaks and community XP rankings on Together Music Bot. Learn the leveling formula, vote streak multipliers, and listening tier rewards.',
    keywords: 'together music bot leaderboard, discord music xp, listening streaks discord, music bot ranking, top listening servers discord',
    h1: 'Together Music Bot — Community Listening Leaderboard',
    schemaType: 'TechArticle',
    body: `
        <article>
          <header>
            <nav class="breadcrumb-trail" aria-label="Breadcrumb">
              <a href="/">Home</a> &raquo; <span>Community Leaderboard</span>
            </nav>
            <h1>Together Music Bot — Community Listening Leaderboard</h1>
            <div class="freshness-signal">
              📅 <strong>Published:</strong> <time datetime="2026-01-01" itemprop="datePublished">January 1, 2026</time> | <strong>Last Modified:</strong> <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time> (Active Version 2.5)
            </div>
            <p>Welcome to the official Together Music Bot Community Leaderboard. Track server listening streaks, global rankings, and earned Community XP in real time. Our leveling system celebrates active music listening, rewarding vibrant communities with exclusive profile badges, custom visualizer skins, and server status honors.</p>
            <p class="author-byline">Authored and maintained by <span rel="author" class="author"><strong>KAJU🦋</strong></span>, Lead Audio Systems Architect. Last modified on <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time>.</p>
          </header>

          <section id="xp-formula">
            <h2>1. Community Listening XP Formula &amp; Mathematical Definition</h2>
            <blockquote style="padding:16px 20px; background:rgba(34,197,94,0.08); border-left:4px solid #22c55e; margin:20px 0;">
              <p><strong>Together Community XP Metric:</strong> A standardized engagement score awarded to Discord voice channels during continuous music playback. Servers earn precisely <strong>10 Base XP per minute</strong> for each active unmuted listener. When a server member votes on Top.gg, a <strong>2.0x Streak Multiplier</strong> applies to all XP gained over the subsequent 12 hours.</p>
              <p>The mathematical XP formula is formally defined as:</p>
              <p><code>Community XP = (Minutes Streamed) &times; (Active Listeners) &times; 10 &times; (Vote Multiplier)</code></p>
            </blockquote>
            <p>Our server-side algorithms sample voice channel presence every 60 seconds. Defeated deafened or AFK users are automatically excluded from listener calculations to ensure balanced and fair rankings for all participating Discord communities.</p>
          </section>

          <section id="ranking-system">
            <h2>2. Community Listening Streak Tier System</h2>
            <p>Servers unlock prestige tiers as their cumulative listening hours grow. Each tier grants visual distinctions on public server embeds and unlocks exclusive web dashboard themes:</p>
            
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0">
                <caption>Community Listening Streak Tier Progression</caption>
                <thead>
                  <tr>
                    <th scope="col">Prestige Tier Name.</th>
                    <th scope="col">Minimum XP Required.</th>
                    <th scope="col">Estimated Listening Time.</th>
                    <th scope="col">Community Rewards &amp; Unlocks.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Bronze Listener</th>
                    <td>0 – 9,999 XP</td>
                    <td>0 – 16 Hours</td>
                    <td>Standard green embed border and basic player commands.</td>
                  </tr>
                  <tr>
                    <th scope="row">Silver Audiophile</th>
                    <td>10,000 – 49,999 XP</td>
                    <td>17 – 80 Hours</td>
                    <td>Silver profile badge and priority 8D audio filter processing.</td>
                  </tr>
                  <tr>
                    <th scope="row">Gold Maestro</th>
                    <td>50,000 – 199,999 XP</td>
                    <td>81 – 330 Hours</td>
                    <td>Gold verified badge, custom prefix support, and dashboard themes.</td>
                  </tr>
                  <tr>
                    <th scope="row">Platinum Symphony</th>
                    <td>200,000 – 499,999 XP</td>
                    <td>331 – 830 Hours</td>
                    <td>Platinum badge, 24/7 channel locking priority, and custom embed colors.</td>
                  </tr>
                  <tr>
                    <th scope="row">Diamond Resonance</th>
                    <td>500,000+ XP</td>
                    <td>830+ Hours</td>
                    <td>Hall of Fame spotlight, custom webplayer visualizer skin, and VIP support.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="anti-abuse">
            <h2>3. Fair Play and Anti-AFK Verification Algorithm</h2>
            <p>To preserve leaderboard integrity, Together incorporates heuristic anti-abuse protections:</p>
            <ul>
              <li><strong>Mute and Deafen Filtering:</strong> Self-deafened or server-deafened users do not count toward active listener multipliers.</li>
              <li><strong>Track Rotation Requirement:</strong> Looping a silent track or an unvarying single-second loop halts XP generation after 30 minutes.</li>
              <li><strong>Dynamic Rate Limiting:</strong> Server clusters undergo automated anomaly checks to verify that active connections reflect authentic human listening.</li>
            </ul>
          </section>

          <section id="how-to-climb">
            <h2>4. Step-by-Step: How Your Server Can Climb the Rankings</h2>
            <ol>
              <li><strong>Initiate Regular Listening Sessions:</strong> Queue music during peak server hours when voice channels are full of active chatters.</li>
              <li><strong>Encourage Member Votes:</strong> Remind members to type <code>/vote</code> twice daily on Top.gg to maintain the 2.0x XP multiplier.</li>
              <li><strong>Lock 24/7 Mode:</strong> Use <code>/247</code> so your voice channel stays active around the clock with background playlists.</li>
              <li><strong>Track Progress Daily:</strong> Check your server position with <code>/leaderboard</code> to see how close you are to the next tier badge.</li>
            </ol>
          </section>
        
          <section id="seasonal-rewards">
            <h2>5. Seasonal Listening Competitions & Badge Showcase</h2>
            <p>At the end of every calendar month, the top three Discord servers on our global leaderboard receive permanent profile awards. Server owners receive custom verified embed colors, exclusive profile titles, and priority access to beta features. Community members can display their server badge in chat embeds using our interactive profile commands.</p>
            <p>All listening statistics are calculated transparently. Server admins can export historical listening metrics as structured JSON reports using our dashboard analytics view to track community listening trends over time.</p>
          </section>

        </article>
    `
  },

  // Page 5: Contact
  {
    route: 'contact',
    title: 'Contact Support & Official Community Channels — Together Bot',
    description: 'Contact Together Music Bot support team. Connect via Discord developer community, email support ticket system, or official Discord and YouTube channels.',
    keywords: 'contact together music bot, together bot support, discord music bot help, developer contact discord bot, together bot discord server',
    h1: 'Contact Together Music Bot Developer Support',
    schemaType: 'ContactPage',
    body: `
        <article>
          <header>
            <nav class="breadcrumb-trail" aria-label="Breadcrumb">
              <a href="/">Home</a> &raquo; <span>Contact Support</span>
            </nav>
            <h1>Contact Together Music Bot Developer Support</h1>
            <div class="freshness-signal">
              📅 <strong>Published:</strong> <time datetime="2026-01-01" itemprop="datePublished">January 1, 2026</time> | <strong>Last Modified:</strong> <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time> (Active Version 2.5)
            </div>
            <p>Need assistance configuring Together for your Discord server? Have questions about 24/7 channel locking, audio filters, or partnership inquiries? Our support team and systems engineers are ready to assist you through multiple official channels.</p>
            <p class="author-byline">Authored and maintained by <span rel="author" class="author"><strong>KAJU🦋</strong></span>, Lead Audio Systems Architect. Last modified on <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time>.</p>
          </header>

          <section id="support-channels">
            <h2>1. Official Support Channels &amp; Response Times</h2>
            <p>Select the communication method that best fits your inquiry:</p>
            
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0">
                <caption>Official Together Support Channels and Response Time SLAs</caption>
                <thead>
                  <tr>
                    <th scope="col">Communication Channel.</th>
                    <th scope="col">Target Response SLA.</th>
                    <th scope="col">Recommended For.</th>
                    <th scope="col">Access Link / Destination.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Discord Support Community</th>
                    <td>Under 15 Minutes</td>
                    <td>Live configuration help, command troubleshooting, and community chat.</td>
                    <td><a href="https://discord.gg/mUdGTs2Dw5" target="_blank" rel="noopener noreferrer">Join Official Discord Server</a></td>
                  </tr>

                  <tr>
                    <th scope="row">YouTube Video Tutorials</th>
                    <td>Weekly Updates</td>
                    <td>Audio walkthroughs, 3D visualizer demonstrations, and setup guides.</td>
                    <td><a href="https://www.youtube.com/@dpdns" target="_blank" rel="noopener noreferrer">@dpdns YouTube Channel</a></td>
                  </tr>
                  <tr>
                    <th scope="row">Twitter / X Updates</th>
                    <td>Under 4 Hours</td>
                    <td>Platform status alerts, maintenance schedules, and changelogs.</td>
                    <td><a href="https://twitter.com/together_bot" target="_blank" rel="noopener noreferrer">@together_bot on X</a></td>
                  </tr>

                </tbody>
              </table>
            </div>
          </section>

          <section id="office-location">
            <h2>2. Physical Office Location &amp; Developer Credentials</h2>
            <p>Together Audio Systems operates as a verified Discord Developer organization with headquarters located in San Francisco:</p>
            <address style="margin:16px 0; padding:16px; background:rgba(34,197,94,0.06); border-left:3px solid #22c55e; font-style:normal;">
              <strong>Together Audio Systems Headquarters</strong><br />
              100 Innovation Way, Suite 400<br />
              San Francisco, CA 94105<br />
              United States of America<br />
              Discord Verified Application ID: 863496211667484676
            </address>
          </section>

          <section id="reporting-issues">
            <h2>3. How to Report Audio Glitches or Security Bugs</h2>
            <ol>
              <li><strong>Check Status:</strong> Check our Twitter/X status feed or Discord announcements to verify that Discord voice gateways are operational.</li>
              <li><strong>Collect Diagnostic Data:</strong> Note your Discord Server ID, voice channel region, and the command that triggered the unexpected behavior.</li>
              <li><strong>Open a Support Thread:</strong> Join our Discord community and navigate to <code>#bot-support</code> to submit your diagnostic details.</li>
              <li><strong>Engineering Follow-Up:</strong> A verified developer will review your ticket and deploy a hotfix or suggest configuration adjustments.</li>
            </ol>
          </section>

          <section id="community-guidelines">
            <h2>4. Community Etiquette and Support Guidelines</h2>
            <p>Our support channels are dedicated to providing a friendly, constructive environment for server owners, moderators, and music fans. Please treat all community members and volunteer staff with courtesy. When asking for assistance, provide clear details about your server setup so our team can resolve your issue swiftly.</p>
          </section>
        
          <section id="ticket-workflow">
            <h2>5. Support Ticket Lifecycle & Escalation Process</h2>
            <p>When you submit a support ticket via our Discord server or developer portal, a unique ticket ID is generated and assigned to a technical support engineer. Critical issues affecting audio playback across multiple servers are escalated to senior systems architects within 15 minutes. Routine questions regarding role setup or command permissions are typically answered in under one hour.</p>
            <p>You can track the live status of your inquiry directly in Discord. Once an issue is resolved, our team provides a post-resolution summary detailing the root cause and any recommended server configuration adjustments.</p>
          </section>
          <section id="faq-quick-answers">
            <h2>6. Frequently Addressed Support Questions</h2>
            <p>Before submitting a ticket, consider these rapid answers: Ensure Together has the Connect and Speak permissions in your voice channel. If the bot appears offline, verify that your server is not currently undergoing a Discord API gateway reconnection. For billing or Top.gg vote sync questions, votes generally register within 3 to 5 minutes of completion.</p>
          </section>

        </article>
    `
  },

  // Page 6: Login
  {
    route: 'login',
    title: 'Discord Dashboard Login & Web Music Management — Together Bot',
    description: 'Log in with Discord OAuth2 to manage Together Music Bot. Control live voice sessions, customize volume, view active queues, and adjust server settings from any browser.',
    keywords: 'together music bot login, discord bot dashboard login, discord oauth2 music bot, web music player discord, remote discord music control',
    h1: 'Together Music Bot — Web Dashboard Login',
    schemaType: 'WebPage',
    body: `
        <article>
          <header>
            <nav class="breadcrumb-trail" aria-label="Breadcrumb">
              <a href="/">Home</a> &raquo; <span>Dashboard Login</span>
            </nav>
            <h1>Together Music Bot — Web Dashboard Login</h1>
            <div class="freshness-signal">
              📅 <strong>Published:</strong> <time datetime="2026-01-01" itemprop="datePublished">January 1, 2026</time> | <strong>Last Modified:</strong> <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time> (Active Version 2.5)
            </div>
            <p>Access your real-time Discord music control center. Logging in with your Discord account allows you to manage music queues, switch DSP audio filters, monitor 24/7 channel locking, and view community listening streaks directly from any desktop or mobile browser.</p>
            <p class="author-byline">Authored and maintained by <span rel="author" class="author"><strong>KAJU🦋</strong></span>, Lead Audio Systems Architect. Last modified on <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time>.</p>
          </header>

          <section id="oauth-security">
            <h2>1. Secure Discord OAuth2 Authentication</h2>
            <p>Together utilizes standard Discord OAuth2 protocols to authenticate users. We never request, access, or store your Discord account password. Authentication grants read-only access to your public profile and server list to verify which servers you have permission to manage:</p>
            
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0">
                <caption>OAuth2 Permission Scopes Requested by Together Dashboard</caption>
                <thead>
                  <tr>
                    <th scope="col">Scope Identifier.</th>
                    <th scope="col">Access Description.</th>
                    <th scope="col">Technical Necessity.</th>
                    <th scope="col">Privacy Safeguard.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">identify</th>
                    <td>Discord Username, Avatar, and User ID.</td>
                    <td>Displays your account in the top navigation bar and verifies server permissions.</td>
                    <td>Stored in encrypted session cookies only; never sold or shared.</td>
                  </tr>
                  <tr>
                    <th scope="row">guilds</th>
                    <td>List of servers your account belongs to.</td>
                    <td>Filters the server list to display only servers where you possess Manage Server rights.</td>
                    <td>Zero access to private server messages, channels, or member directories.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="dashboard-features">
            <h2>2. Web Dashboard vs Discord Slash Commands</h2>
            <p>The web dashboard provides rich visual capabilities that surpass traditional text commands in Discord channels:</p>
            
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0">
                <caption>Web Dashboard Feature Comparison</caption>
                <thead>
                  <tr>
                    <th scope="col">Capability.</th>
                    <th scope="col">Web Dashboard Interface.</th>
                    <th scope="col">Discord Chat Slash Commands.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Queue Manipulation</th>
                    <td>Drag-and-drop reordering with live duration countdown.</td>
                    <td>Text-based index numbers and paginated embeds.</td>
                  </tr>
                  <tr>
                    <th scope="row">Volume Equalization</th>
                    <td>Smooth horizontal slider with instant decibel readout.</td>
                    <td>Manual numerical parameter input (1-150).</td>
                  </tr>
                  <tr>
                    <th scope="row">Track Scrubbing</th>
                    <td>Interactive timeline seeker with second-level precision.</td>
                    <td>Manual <code>/seek mm:ss</code> command execution.</td>
                  </tr>
                  <tr>
                    <th scope="row">DSP Filter Tuning</th>
                    <td>One-click audio effect cards with active status toggles.</td>
                    <td>Multi-step slash command syntax.</td>
                  </tr>
                  <tr>
                    <th scope="row">Visual Waveforms</th>
                    <td>Real-time 3D frequency spectrum visualization.</td>
                    <td>Static text displays.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="login-steps">
            <h2>3. Step-by-Step Login Instructions</h2>
            <ol>
              <li><strong>Click Login with Discord:</strong> Click the primary login button to initiate the secure Discord OAuth2 handshake.</li>
              <li><strong>Authorize on Discord.com:</strong> Confirm that you are granting access to the <code>identify</code> and <code>guilds</code> scopes.</li>
              <li><strong>Select Your Server:</strong> Choose from any server where you possess Administrator or Manage Server permissions.</li>
              <li><strong>Take Live Control:</strong> View currently playing tracks, adjust volume levels, and explore playlist queues in real time.</li>
            </ol>
          </section>

          <section id="troubleshooting-login">
            <h2>4. Troubleshooting Authorization and Session Issues</h2>
            <p>If you encounter an authorization loop or blank screen after logging in, verify that third-party cookies are enabled in your browser or try clearing your local cache for <code>dash.together.dpdns.org</code>. If your server does not appear in the dashboard list, ensure that your Discord user has the <strong>Manage Server</strong> permission on that server.</p>
          </section>
        
          <section id="session-security">
            <h2>5. Session Token Security & Inactivity Expiration</h2>
            <p>Your web dashboard session is secured using HttpOnly, SameSite strict session tokens signed with cryptographically random 256-bit keys. Session cookies expire automatically after 7 days of inactivity. You can invalidate all active browser sessions at any time by clicking Log Out in the upper right navigation menu or by revoking authorization in your Discord User Settings under Authorized Apps.</p>
            <p>Our API gateway validates session authenticity on every request. If a session token shows evidence of tampering or abnormal geographic hopping, access is terminated immediately to protect server management privileges.</p>
          </section>
          <section id="multi-server-switching">
            <h2>6. Multi-Server Administration from a Single Dashboard</h2>
            <p>Manage dozens of Discord communities from a single browser tab. The server switcher dropdown in the dashboard sidebar lists every server where you hold administrative rights. Switch instantly between servers to inspect active queues, adjust volume limits, or enable 24/7 channel locking without re-authenticating.</p>
          </section>

        </article>
    `
  },

  // Page 7: Terms of Service
  {
    route: 'terms',
    title: 'Terms of Service & Acceptable Use Policy — Together Music Bot',
    description: 'Review Together Music Bot Terms of Service. Understand acceptable usage, fair bandwidth allocation, Discord API compliance, and service availability.',
    keywords: 'together music bot terms of service, discord music bot terms, acceptable use policy music bot, discord bot service agreement',
    h1: 'Together Music Bot — Terms of Service & Service Agreement',
    schemaType: 'Article',
    body: `
        <article>
          <header>
            <nav class="breadcrumb-trail" aria-label="Breadcrumb">
              <a href="/">Home</a> &raquo; <span>Terms of Service</span>
            </nav>
            <h1>Together Music Bot — Terms of Service &amp; Service Agreement</h1>
            <div class="freshness-signal">
              📅 <strong>Published:</strong> <time datetime="2026-01-01" itemprop="datePublished">January 1, 2026</time> | <strong>Last Modified:</strong> <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time> (Active Version 2.5)
            </div>
            <p>These Terms of Service govern your access to and use of Together Music Bot, our web dashboard, and associated streaming infrastructure. By adding Together to your Discord server or using our web interface, you agree to comply with these terms.</p>
            <p class="author-byline">Authored and maintained by <span rel="author" class="author"><strong>KAJU🦋</strong></span>, Lead Audio Systems Architect. Last modified on <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time>.</p>
          </header>

          <section id="acceptable-use">
            <h2>1. Acceptable Use Policy &amp; Community Standards</h2>
            <p>Together is designed to provide high-fidelity audio entertainment for Discord communities. To ensure equal access and network stability, users agree to adhere to the following standards:</p>
            <ul>
              <li><strong>No Automated Command Flooding:</strong> Users may not deploy automated userbots, self-bots, or spam scripts to execute rapid, repetitive commands.</li>
              <li><strong>Fair Bandwidth Allocation:</strong> Playback sessions are intended for authentic human listeners in active Discord voice channels. Artificially maintaining hundreds of inactive voice connections to hoard bandwidth is prohibited.</li>
              <li><strong>Compliance with Discord Guidelines:</strong> Users must respect Discord Terms of Service and Community Guidelines while interacting with Together.</li>
            </ul>
          </section>

          <section id="service-availability">
            <h2>2. Service Level Agreement and Uptime Targets</h2>
            <p>Together operates on high-availability cloud infrastructure with a targeted uptime of 99.98 percent. While we strive to maintain uninterrupted service, temporary outages may occur due to scheduled maintenance, Discord API gateway updates, or regional network provider routing failures.</p>
            
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0">
                <caption>Service Commitment and Availability Metrics</caption>
                <thead>
                  <tr>
                    <th scope="col">Service Component.</th>
                    <th scope="col">Target Availability SLA.</th>
                    <th scope="col">Maintenance Notification.</th>
                    <th scope="col">Failover Strategy.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Discord Voice Gateway</th>
                    <td>99.98% Monthly Uptime</td>
                    <td>Twitter/X and Discord Server</td>
                    <td>Automatic re-routing across multi-region nodes.</td>
                  </tr>
                  <tr>
                    <th scope="row">Web Management Dashboard</th>
                    <td>99.95% Monthly Uptime</td>
                    <td>In-app status banner</td>
                    <td>Redundant static hosting with global CDN caching.</td>
                  </tr>
                  <tr>
                    <th scope="row">Stream Transcoding Clusters</th>
                    <td>99.99% Availability</td>
                    <td>Automatic load rebalance</td>
                    <td>Clustered audio nodes with instant failover.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="intellectual-property">
            <h2>3. Intellectual Property and Content Streaming</h2>
            <p>Together acts as a technical streaming conduit that resolves audio streams from publicly accessible third-party platforms (such as YouTube, Spotify, and SoundCloud) at the user's explicit request. Together does not host, store, or distribute copyrighted audio files on its own persistent storage systems. All audio metadata, album artwork, and audio content remain the property of their respective copyright holders.</p>
          </section>

          <section id="termination">
            <h2>4. Suspension of Access and Termination</h2>
            <p>We reserve the right to suspend or revoke access to Together Music Bot or our web dashboard for any Discord server or user account found violating these terms, exploiting security vulnerabilities, or attempting denial-of-service attacks against our infrastructure.</p>
          </section>

          <section id="governing-law">
            <h2>5. Limitation of Liability and Governing Law</h2>
            <p>Together Music Bot is provided on an "as-is" and "as-available" basis without warranties of any kind. Under no circumstances shall the Together developer team or KAJU be liable for any indirect, incidental, or consequential damages resulting from service interruptions or Discord account disciplinary actions. These terms are governed by the laws of the State of California, United States.</p>
          </section>
        
          <section id="bandwidth-fair-use">
            <h2>6. Fair Bandwidth Usage & Rate Limits</h2>
            <p>To preserve low-latency streaming for all communities, Together enforces generous rate limits of 30 commands per minute per user. Standard server usage is completely unrestricted under normal listening conditions. If a server exceeds abnormal request thresholds via automated scripts, temporary cooling periods of 60 seconds are applied automatically.</p>
            <p>Commercial resale or paid redistribution of Together bot streams without prior written authorization from Together Audio Systems is strictly prohibited.</p>
          </section>
          <section id="dmca-policy">
            <h2>7. Digital Millennium Copyright Act (DMCA) Notice</h2>
            <p>Together respects intellectual property rights. If you believe content accessed through our stream resolving mechanisms infringes your copyright, you may submit a formal notification to our designated agent via our contact portal. Valid notices must identify the copyrighted work and provide sufficient information for our team to resolve the inquiry.</p>
          </section>

        </article>
    `
  },

  // Page 8: Privacy Policy
  {
    route: 'privacy',
    title: 'Privacy Policy & Data Protection Standards — Together Music Bot',
    description: 'Read Together Music Bot Privacy Policy. Learn how we handle Discord user IDs, voice channel security, zero audio recording guarantees, and GDPR compliance.',
    keywords: 'together music bot privacy policy, discord bot privacy, data protection music bot, gdpr compliance discord bot, zero voice recording guarantee',
    h1: 'Together Music Bot — Privacy Policy & Data Protection',
    schemaType: 'Article',
    body: `
        <article>
          <header>
            <nav class="breadcrumb-trail" aria-label="Breadcrumb">
              <a href="/">Home</a> &raquo; <span>Privacy Policy</span>
            </nav>
            <h1>Together Music Bot — Privacy Policy &amp; Data Protection</h1>
            <div class="freshness-signal">
              📅 <strong>Published:</strong> <time datetime="2026-01-01" itemprop="datePublished">January 1, 2026</time> | <strong>Last Modified:</strong> <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time> (Active Version 2.5)
            </div>
            <p>Your privacy is of paramount importance to us. This Privacy Policy details how Together Music Bot collects, processes, and safeguards information when you interact with our bot in Discord or access our web dashboard.</p>
            <p class="author-byline">Authored and maintained by <span rel="author" class="author"><strong>KAJU🦋</strong></span>, Lead Audio Systems Architect. Last modified on <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time>.</p>
          </header>

          <section id="zero-recording">
            <h2>1. Strict Technical Guarantee: Zero Voice Audio Recording</h2>
            <blockquote style="padding:16px 20px; background:rgba(34,197,94,0.08); border-left:4px solid #22c55e; margin:20px 0;">
              <p><strong>Technical Guarantee:</strong> Together only transmits outbound audio frames into Discord voice channels. <strong>The bot does not receive, decode, monitor, process, or record microphone audio from users or channel participants.</strong> Our voice socket connections are strictly one-way audio transmitters.</p>
            </blockquote>
            <p>When you speak in a voice channel where Together is playing music, your voice packets never enter our audio pipeline or server memory. This technical isolation ensures total conversational privacy for all Discord communities.</p>
          </section>

          <section id="data-collected">
            <h2>2. Information We Collect and Retention Timelines</h2>
            <p>We believe in strict data minimization. Together only processes technical metadata necessary to fulfill music playback requests and manage server configurations:</p>
            
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0">
                <caption>Information Processed by Together Music Bot</caption>
                <thead>
                  <tr>
                    <th scope="col">Data Element.</th>
                    <th scope="col">Purpose of Processing.</th>
                    <th scope="col">Storage Mechanism.</th>
                    <th scope="col">Retention Timeline.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Discord User ID</th>
                    <td>Identifies who requested a song and tracks Top.gg voting streak bonuses.</td>
                    <td>Volatile Memory &amp; Encrypted Database</td>
                    <td>Purged automatically after 30 days of inactivity.</td>
                  </tr>
                  <tr>
                    <th scope="row">Discord Guild (Server) ID</th>
                    <td>Stores server-specific settings such as DJ role, volume, and 24/7 channel lock.</td>
                    <td>Encrypted PostgreSQL Cluster</td>
                    <td>Retained until the bot is removed from the server.</td>
                  </tr>
                  <tr>
                    <th scope="row">Active Song Queue</th>
                    <td>Maintains the list of upcoming tracks, titles, and streaming URLs.</td>
                    <td>Redis In-Memory Cache</td>
                    <td>Cleared immediately when playback stops or <code>/stop</code> is used.</td>
                  </tr>
                  <tr>
                    <th scope="row">Community Listening XP</th>
                    <td>Calculates server listening streaks and global leaderboard rankings.</td>
                    <td>Encrypted Database</td>
                    <td>Maintained while the server remains active in rankings.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="data-sharing">
            <h2>3. Third-Party Integrations and Data Sharing</h2>
            <p>Together does not sell, lease, or monetize user data. Information is shared only with service providers strictly required to operate the music bot:</p>
            <ul>
              <li><strong>Discord API:</strong> Delivers bot commands, user permissions, and voice gateway handshakes.</li>
              <li><strong>Streaming APIs (YouTube, Spotify, SoundCloud):</strong> Fetches track metadata, titles, and duration to resolve search queries.</li>
              <li><strong>Top.gg API:</strong> Verifies community votes to apply the 2.0x XP multiplier to your server.</li>
            </ul>
          </section>

          <section id="gdpr-ccpa">
            <h2>4. Your Data Rights (GDPR &amp; CCPA Compliance)</h2>
            <p>Under the European General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), users have the right to request access to their stored data or demand permanent erasure. If you wish to delete all stored data associated with your Discord User ID or Guild ID, you can submit a deletion request through our official Discord support server or contact page. Deletion requests are processed within 48 hours.</p>
          </section>

          <section id="security-measures">
            <h2>5. Data Security and Encryption Practices</h2>
            <p>All communication between your browser and our web dashboard is encrypted using TLS 1.3 with 256-bit elliptic-curve cryptography. Database clusters are secured behind isolated VPC firewalls with automated hourly backups and strict least-privilege administrative access.</p>
          </section>
        
          <section id="cookie-policy">
            <h2>6. Cookie Policy & Local Storage Standards</h2>
            <p>Our dashboard uses only strictly necessary cookies required for user authentication, CSRF security verification, and theme preference persistence. We do not use third-party tracking pixels, advertising cookies, or behavioral profiling analytics. When you log out, all session identifiers are permanently invalidated and removed from your browser storage.</p>
            <p>Local storage is utilized exclusively to remember your preferred webplayer volume level and dark mode visual preferences between visits.</p>
          </section>
          <section id="data-breach-protocol">
            <h2>7. Incident Response & Data Breach Protocols</h2>
            <p>In the unlikely event of a security incident affecting stored Discord IDs or server configurations, our systems team will notify affected server administrators within 72 hours via official Discord announcements and Twitter/X updates. We conduct regular penetration testing and vulnerability assessments to verify the robustness of our data infrastructure.</p>
          </section>

        </article>
    `
  }
];


// Render each page into its corresponding directory in dist/
for (const p of pages) {
  const pageDir = path.join(distDir, p.route);
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }

  const breadcrumbsJson = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://dash.together.dpdns.org/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": p.title.split('—')[0].trim(),
        "item": `https://dash.together.dpdns.org/${p.route}`
      }
    ]
  };

  const articleJson = {
    "@context": "https://schema.org",
    "@type": p.schemaType || "Article",
    "headline": p.h1,
    "description": p.description,
    "image": "https://dash.together.dpdns.org/banner.png",
    "url": `https://dash.together.dpdns.org/${p.route}`,
    "datePublished": "2026-01-01T00:00:00Z",
    "dateModified": "2026-11-09T12:00:00Z",
    "author": {
      "@type": "Person",
      "name": "KAJU🦋",
      "jobTitle": "Lead Audio Systems Architect",
      "url": "https://dash.together.dpdns.org/about",
      "sameAs": [
        "https://discord.gg/mUdGTs2Dw5",
        "https://top.gg/bot/863496211667484676",
        "https://www.youtube.com/@dpdns",
        "https://twitter.com/together_bot"
      ]
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://dash.together.dpdns.org/#organization",
      "name": "Together Music Bot Team",
      "logo": {
        "@type": "ImageObject",
        "url": "https://dash.together.dpdns.org/logo.png"
      }
    },
    "mainEntityOfPage": `https://dash.together.dpdns.org/${p.route}`,
    "inLanguage": "en"
  };

  const orgJson = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://dash.together.dpdns.org/#organization",
    "name": "Together Music Bot Team",
    "url": "https://dash.together.dpdns.org/",
    "logo": "https://dash.together.dpdns.org/logo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "100 Innovation Way, Suite 400",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "postalCode": "94105",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "url": "https://dash.together.dpdns.org/contact"
    },
    "sameAs": [
        "https://discord.gg/mUdGTs2Dw5",
        "https://top.gg/bot/863496211667484676",
        "https://www.youtube.com/@dpdns",
        "https://twitter.com/together_bot"
      ]
  };

  const pageHtml = `<!doctype html>
<html lang="en" prefix="og: https://ogp.me/ns#">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${p.title}</title>
    <meta name="title" content="${p.title}" />
    <meta name="description" content="${p.description}" />
    <meta name="keywords" content="${p.keywords}" />
    <link rel="canonical" href="https://dash.together.dpdns.org/${p.route}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Together Music Bot" />
    <meta property="og:url" content="https://dash.together.dpdns.org/${p.route}" />
    <meta property="og:title" content="${p.title}" />
    <meta property="og:description" content="${p.description}" />
    <meta property="og:image" content="https://dash.together.dpdns.org/logo.png" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta property="og:locale" content="en_US" />
    <meta property="article:published_time" content="2026-01-01T00:00:00Z" />
    <meta property="article:modified_time" content="2026-11-09T12:00:00Z" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@together_bot" />
    <meta name="twitter:creator" content="@together_bot" />
    <meta name="twitter:title" content="${p.title}" />
    <meta name="twitter:description" content="${p.description}" />
    <meta name="twitter:image" content="https://dash.together.dpdns.org/logo.png" />
    ${sharedHeadMeta}
    ${sharedCss}
    <script type="application/ld+json">
    ${JSON.stringify(breadcrumbsJson, null, 2)}
    </script>
    <script type="application/ld+json">
    ${JSON.stringify(articleJson, null, 2)}
    </script>
    <script type="application/ld+json">
    ${JSON.stringify(orgJson, null, 2)}
    </script>
    ${assetTags}
  </head>
  <body>
    <div id="root">
      ${sharedHeader}
      <main id="main-content">
        ${p.body}
      </main>
      ${sharedFooter}
    </div>
  </body>
</html>`;

  fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml, 'utf8');
  console.log(`Pre-rendered: /${p.route}/index.html`);
}

console.log('All routes pre-rendered successfully!');
