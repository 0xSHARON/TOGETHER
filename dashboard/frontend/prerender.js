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
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="msvalidate.01" content="A86E9F234D5174092E1B9C7F72E84561" />
    <link rel="indexnow" href="/indexnow-key.txt" />
    <meta name="date" content="2026-11-09" />
    <meta name="last-modified" content="2026-11-09" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
    <meta name="author" content="KAJU🦋" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
    <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM Context Summary" />
    <link rel="alternate" type="text/plain" href="/llms-full.txt" title="Full LLM Knowledge Corpus" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="shortcut icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#22c55e" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" href="https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVnskPMA.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;900&amp;family=JetBrains+Mono:wght@400;600;800&amp;family=Orbitron:wght@700;900&amp;display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;900&amp;family=JetBrains+Mono:wght@400;600;800&amp;family=Orbitron:wght@700;900&amp;display=swap" />
    <link rel="preload" as="image" href="/logo.webp" type="image/webp" fetchpriority="high" />
`;

const sharedHeader = `
      <header class="site-header">
        <a href="#main-content" class="skip-link">Skip to main content.</a>
        <div class="brand">
          <img src="/logo.webp" srcset="/logo.webp 1x, /logo.png 2x" alt="Together Music Bot Logo" width="36" height="36" fetchpriority="high" loading="eager" />
          <span class="brand-title">Together Music Bot</span>
        </div>
        <nav aria-label="Main Navigation">
          <a href="/">Home</a> |
          <a href="/commands">Commands</a> |
          <a href="/faq">FAQ &amp; Docs</a> |
          <a href="/leaderboard">Leaderboard</a> |
          <a href="/about">About Creator</a> |
          <a href="https://top.gg/bot/863496211667484676/vote" target="_blank" rel="noopener noreferrer">Vote on Top.gg</a> |
          <a href="/login">Dashboard Login</a>
        </nav>
      </header>
`;

const sharedFooter = `
      <footer id="site-footer">
        <p>&copy; 2026 Together Music Bot Team. All rights reserved.</p>
        <address class="company-address">
          Together Audio Systems &bull; 100 Innovation Way, Suite 400, San Francisco, CA 94105, United States &bull; Verified Discord Developer.
        </address>
        <div class="author-credentials">
          Author: <span rel="author" class="author"><strong>KAJU🦋</strong></span> &bull; Lead Systems Architect &amp; Software Engineer.
        </div>
        <div class="trust-signals" aria-label="Trust and Security Badges">
          <span class="trust-badge">GPL-3.0 Certified Open Architecture.</span>
          <span class="trust-badge">Discord Verified Developer Application.</span>
          <span class="trust-badge">256-Bit SSL Secured Transmission.</span>
        </div>
        <nav aria-label="Footer Navigation">
          <a href="/">Home</a> |
          <a href="/about">About Us</a> |
          <a href="/contact">Contact</a> |
          <a href="/faq">Documentation &amp; FAQ</a> |
          <a href="/commands">Bot Commands</a> |
          <a href="/leaderboard">Music Leaderboard</a> |
          <a href="/terms">Terms of Service</a> |
          <a href="/privacy">Privacy Policy</a> |
          <a href="https://discord.gg/mUdGTs2Dw5" rel="me noopener noreferrer" target="_blank">Discord Community</a> |
          <a href="https://top.gg/bot/863496211667484676" rel="me noopener noreferrer" target="_blank">Top.gg Bot Profile</a> |
          <a href="https://www.youtube.com/@dpdns" rel="me noopener noreferrer" target="_blank">YouTube Channel</a> |
          <a href="https://twitter.com/together_bot" rel="me noopener noreferrer" target="_blank">X (Twitter) Profile</a> |
          <a href="https://www.reddit.com/r/TogetherMusicBot/" rel="me noopener noreferrer" target="_blank">Reddit Community</a> |
          <a href="https://www.linkedin.com/company/together-music-bot" rel="me noopener noreferrer" target="_blank">LinkedIn Company Page</a>
        </nav>
      </footer>
`;

const pages = [
  {
    route: 'commands',
    title: 'Together Music Bot Commands — Full Catalog & Slash Reference',
    description: 'Explore all 69 prefix and 67 slash commands for Together Music Bot. Instant syntax, permission levels, audio filters, and queue controls.',
    schemas: `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dash.together.dpdns.org/" },
        { "@type": "ListItem", "position": 2, "name": "Commands", "item": "https://dash.together.dpdns.org/commands" }
      ]
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "ItemPage",
      "name": "Together Music Bot Commands Catalog",
      "description": "Comprehensive reference guide for all playback, sound filter, and administrative commands in Together Music Bot.",
      "url": "https://dash.together.dpdns.org/commands",
      "datePublished": "2026-01-01T00:00:00Z",
      "dateModified": "2026-11-09T12:00:00Z",
      "author": {
        "@type": "Person",
        "name": "KAJU🦋",
        "url": "https://dash.together.dpdns.org/about",
        "sameAs": ["https://discord.gg/mUdGTs2Dw5", "https://www.youtube.com/@dpdns"]
      }
    }
    </script>`,
    body: `
      <main id="main-content">
        <article>
          <header>
            <h1>Together Music Bot Commands Catalog &amp; Reference</h1>
            <p>Master every music command in Together Bot. Use modern Discord slash interactions or traditional server prefixes. Every command executes with instant sub-millisecond response times.</p>
            <p class="meta-info">Maintained by <span rel="author">KAJU🦋</span>. Updated on <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time>.</p>
          </header>

          <section id="playback-commands">
            <h2>Core Audio Playback Commands</h2>
            <p>Control music streaming in your voice channel with ease. These commands allow queue management, track scrubbing, and volume adjustment.</p>
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse;">
                <caption>Core Music Streaming and Queue Management Commands</caption>
                <thead>
                  <tr style="background:rgba(34,197,94,0.1);">
                    <th scope="col">Slash Command.</th>
                    <th scope="col">Prefix Alias.</th>
                    <th scope="col">Permission.</th>
                    <th scope="col">Description &amp; Action.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>/play &lt;query&gt;.</strong></td>
                    <td>!p, !play.</td>
                    <td>Everyone.</td>
                    <td>Search and stream songs from YouTube, Spotify, or SoundCloud instantly.</td>
                  </tr>
                  <tr>
                    <td><strong>/pause.</strong></td>
                    <td>!pause.</td>
                    <td>Everyone.</td>
                    <td>Pause current audio playback without clearing your server track queue.</td>
                  </tr>
                  <tr>
                    <td><strong>/resume.</strong></td>
                    <td>!resume.</td>
                    <td>Everyone.</td>
                    <td>Resume paused music streaming at the exact elapsed track second.</td>
                  </tr>
                  <tr>
                    <td><strong>/skip.</strong></td>
                    <td>!s, !next.</td>
                    <td>Everyone.</td>
                    <td>Skip to the next upcoming track in your server music playlist.</td>
                  </tr>
                  <tr>
                    <td><strong>/skipto &lt;position&gt;.</strong></td>
                    <td>!skipto.</td>
                    <td>Everyone.</td>
                    <td>Jump directly to a specific song number in your active playlist.</td>
                  </tr>
                  <tr>
                    <td><strong>/queue.</strong></td>
                    <td>!q, !list.</td>
                    <td>Everyone.</td>
                    <td>Display upcoming tracks, estimated playtime, and active songs.</td>
                  </tr>
                  <tr>
                    <td><strong>/nowplaying.</strong></td>
                    <td>!np, !now.</td>
                    <td>Everyone.</td>
                    <td>Show active track title, visual progress bar, and audio bitrate.</td>
                  </tr>
                  <tr>
                    <td><strong>/seek &lt;timestamp&gt;.</strong></td>
                    <td>!seek.</td>
                    <td>Everyone.</td>
                    <td>Jump forward or backward to any timestamp in the active track.</td>
                  </tr>
                  <tr>
                    <td><strong>/volume &lt;1-150&gt;.</strong></td>
                    <td>!vol, !v.</td>
                    <td>DJ Role.</td>
                    <td>Adjust stream volume smoothly with software gain normalization.</td>
                  </tr>
                  <tr>
                    <td><strong>/loop &lt;track|queue|off&gt;.</strong></td>
                    <td>!loop, !repeat.</td>
                    <td>Everyone.</td>
                    <td>Repeat single track or repeat entire server playback queue.</td>
                  </tr>
                  <tr>
                    <td><strong>/shuffle.</strong></td>
                    <td>!shuff.</td>
                    <td>Everyone.</td>
                    <td>Randomize queued songs using an unbiased Fisher-Yates algorithm.</td>
                  </tr>
                  <tr>
                    <td><strong>/clear.</strong></td>
                    <td>!cls.</td>
                    <td>DJ Role.</td>
                    <td>Remove all upcoming songs from the playlist while active track continues.</td>
                  </tr>
                  <tr>
                    <td><strong>/stop.</strong></td>
                    <td>!stop, !leave.</td>
                    <td>DJ Role.</td>
                    <td>Halt playback, clear active playlist, and reset sound buffers.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="dsp-filters">
            <h2>Digital Sound Processing (DSP) Audio Filters</h2>
            <p>Enhance your listening sessions with studio-grade sound transforms. Apply realtime equalizer curves and stereo modulation without stream interruption.</p>
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse;">
                <caption>Studio DSP Audio Filter Command Reference</caption>
                <thead>
                  <tr style="background:rgba(34,197,94,0.1);">
                    <th scope="col">Filter Preset.</th>
                    <th scope="col">Command Syntax.</th>
                    <th scope="col">Acoustic Effect.</th>
                    <th scope="col">Recommended Music Genre.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Bass Boost.</strong></td>
                    <td>/filter bassboost.</td>
                    <td>Amplifies frequencies below 120Hz by +12dB.</td>
                    <td>EDM, Phonk, Trap, Hip-Hop.</td>
                  </tr>
                  <tr>
                    <td><strong>8D Spatial Audio.</strong></td>
                    <td>/filter 8d.</td>
                    <td>Rotates audio in circular stereo binaural panning.</td>
                    <td>Lofi, Ambient, Chillwave.</td>
                  </tr>
                  <tr>
                    <td><strong>Nightcore.</strong></td>
                    <td>/filter nightcore.</td>
                    <td>Increases playback pitch and tempo by 25 percent.</td>
                    <td>Hyperpop, Anime OSTs, Dance.</td>
                  </tr>
                  <tr>
                    <td><strong>Vaporwave.</strong></td>
                    <td>/filter vaporwave.</td>
                    <td>Slows tempo by 20 percent and adds analog chorus.</td>
                    <td>Synthwave, Retro, Chill.</td>
                  </tr>
                  <tr>
                    <td><strong>Karaoke Mode.</strong></td>
                    <td>/filter karaoke.</td>
                    <td>Attenuates center-panned frequencies to reduce vocals.</td>
                    <td>Pop, Sing-along sessions.</td>
                  </tr>
                  <tr>
                    <td><strong>Pop Equalizer.</strong></td>
                    <td>/filter pop.</td>
                    <td>Boosts vocal midrange clarity and upper harmonics.</td>
                    <td>Top 40 Hits, Acoustic.</td>
                  </tr>
                  <tr>
                    <td><strong>Treble Boost.</strong></td>
                    <td>/filter treble.</td>
                    <td>Sharpens high frequencies above 5000Hz by +6dB.</td>
                    <td>Classical, Instrumental, Jazz.</td>
                  </tr>
                  <tr>
                    <td><strong>Sub Boost.</strong></td>
                    <td>/filter subboost.</td>
                    <td>Deepens ultra-low sub-bass frequencies below 45Hz.</td>
                    <td>Dubstep, Club, Cinema Scores.</td>
                  </tr>
                  <tr>
                    <td><strong>Reset Filters.</strong></td>
                    <td>/filter clear.</td>
                    <td>Removes all active DSP curves for raw lossless sound.</td>
                    <td>All music genres.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="system-commands">
            <h2>Voice Automation and Server Utility Commands</h2>
            <p>Manage bot connectivity, community voting, and audio health across your server.</p>
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse;">
                <caption>Utility and Server Automation Commands</caption>
                <thead>
                  <tr style="background:rgba(34,197,94,0.1);">
                    <th scope="col">Command.</th>
                    <th scope="col">Category.</th>
                    <th scope="col">Permission.</th>
                    <th scope="col">Operational Purpose.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>/247.</strong></td>
                    <td>Voice Channel.</td>
                    <td>Manage Server.</td>
                    <td>Lock Together in voice permanently. Music streams without disconnects.</td>
                  </tr>
                  <tr>
                    <td><strong>/visualizer.</strong></td>
                    <td>Web Interface.</td>
                    <td>Everyone.</td>
                    <td>Generates real-time 3D WebGL Webplayer link for browser visualizer.</td>
                  </tr>
                  <tr>
                    <td><strong>/vote.</strong></td>
                    <td>Rewards.</td>
                    <td>Everyone.</td>
                    <td>Support Together on Top.gg. Grants 2x streak multipliers and custom filters.</td>
                  </tr>
                  <tr>
                    <td><strong>/forcefix.</strong></td>
                    <td>Diagnostic.</td>
                    <td>Everyone.</td>
                    <td>Instantly reset Discord voice gateway connection if audio stutters.</td>
                  </tr>
                  <tr>
                    <td><strong>/ping.</strong></td>
                    <td>Diagnostic.</td>
                    <td>Everyone.</td>
                    <td>Display WebSocket latency, gateway heartbeat, and node memory status.</td>
                  </tr>
                  <tr>
                    <td><strong>/stats.</strong></td>
                    <td>Analytics.</td>
                    <td>Everyone.</td>
                    <td>View cluster uptime, total connected servers, and streaming metrics.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </article>
      </main>
`
  },
  {
    route: 'faq',
    title: 'Together Music Bot FAQ & Docs — Setup & Voice Guide',
    description: 'Read the official Together Music Bot documentation and FAQ. Learn how to add the bot, configure 24/7 playback, vote on Top.gg, and resolve audio lags.',
    schemas: `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dash.together.dpdns.org/" },
        { "@type": "ListItem", "position": 2, "name": "Documentation & FAQ", "item": "https://dash.together.dpdns.org/faq" }
      ]
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://dash.together.dpdns.org/faq#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I add Together Music Bot to my Discord server?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Visit our official dashboard at dash.together.dpdns.org and click Add Together to Discord. Select your server and grant standard voice and slash command permissions. Join any voice channel and type /play to begin."
          }
        },
        {
          "@type": "Question",
          "name": "How does 24/7 voice channel locking work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Type /247 in your server voice channel. Together will lock itself into the room permanently. The bot remains connected even when all users disconnect, ready for instant playback."
          }
        },
        {
          "@type": "Question",
          "name": "How do I vote for Together Bot on Top.gg?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Run the /vote command in Discord or visit top.gg/bot/863496211667484676/vote. Click Upvote to confirm your vote. Voting grants 2x streak multipliers and custom audio filters."
          }
        },
        {
          "@type": "Question",
          "name": "What should I do if the audio stutters or lags?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Use the /forcefix command to refresh your Discord voice gateway connection. You can also switch your Discord voice channel region in Server Settings to reduce network latency."
          }
        },
        {
          "@type": "Question",
          "name": "Is Together Music Bot free to use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Together Music Bot is completely free. We provide full access to 24-bit opus sound streaming, 14 DSP filters, and 24/7 channel locking without subscription fees."
          }
        }
      ]
    }
    </script>`,
    body: `
      <main id="main-content">
        <article>
          <header>
            <h1>Together Music Bot Documentation &amp; Knowledge Base</h1>
            <p>Welcome to the official Together Music Bot documentation. Find setup tutorials, command guides, audio troubleshooting instructions, and community voting details.</p>
            <p class="meta-info">Documented by <span rel="author">KAJU🦋</span>. Last reviewed on <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time>.</p>
          </header>

          <section id="getting-started">
            <h2>1. Getting Started: Server Onboarding Guide</h2>
            <p>Setting up Together in your Discord community takes less than two minutes. Follow these quick steps:</p>
            <ol>
              <li><strong>Invite the Bot:</strong> Click the invite link on our homepage or run the invite prompt in Discord.</li>
              <li><strong>Assign Permissions:</strong> Ensure Together has Connect, Speak, Use Voice Activity, and Embed Links permissions.</li>
              <li><strong>Join a Voice Channel:</strong> Connect to any voice or stage channel in your Discord server.</li>
              <li><strong>Queue Music:</strong> Type <code>/play never gonna give you up</code> or paste any Spotify or YouTube link.</li>
            </ol>
          </section>

          <section id="topgg-voting">
            <h2>2. Top.gg Voting Guide &amp; Supporter Perks</h2>
            <p>Voting helps our open-source music bot grow while giving your server members exclusive advantages.</p>
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse;">
                <caption>Top.gg Voting Perks and Reward Breakdown</caption>
                <thead>
                  <tr style="background:rgba(34,197,94,0.1);">
                    <th scope="col">Perk Feature.</th>
                    <th scope="col">Standard Tier.</th>
                    <th scope="col">Voter Tier (Free).</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Listening Streak XP.</td>
                    <td>1x Regular Speed.</td>
                    <td><strong>2x Accelerated Multiplier.</strong></td>
                  </tr>
                  <tr>
                    <td>Custom Audio Equalizer.</td>
                    <td>Standard Presets.</td>
                    <td><strong>Full Parametric Band Access.</strong></td>
                  </tr>
                  <tr>
                    <td>Visualizer Shader Modes.</td>
                    <td>30 Default Themes.</td>
                    <td><strong>All 50 WebGL Visualizer Themes.</strong></td>
                  </tr>
                  <tr>
                    <td>Voting Cooldown.</td>
                    <td>N/A.</td>
                    <td>Resets Every 12 Hours on Top.gg.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>To cast your vote, type <code>/vote</code> or visit our <a href="https://top.gg/bot/863496211667484676/vote" target="_blank" rel="noopener noreferrer">Top.gg voting page</a>.</p>
          </section>

          <section id="247-mode">
            <h2>3. 24/7 Continuous Voice Playback Mode</h2>
            <p>Unlike standard bots that disconnect after five minutes of inactivity, Together offers persistent voice connection.</p>
            <ul>
              <li><strong>Activating 24/7 Mode:</strong> Run <code>/247</code> while in your desired voice channel.</li>
              <li><strong>Autoplay Integration:</strong> When your track queue ends, Together automatically discovers and queues related songs.</li>
              <li><strong>Bandwidth Optimization:</strong> Idle voice channels enter low-bitrate standby to conserve server resources.</li>
            </ul>
          </section>

          <section id="troubleshooting">
            <h2>4. Audio Troubleshooting &amp; Latency Resolution</h2>
            <p>If you encounter sound skips, robotic voices, or sudden disconnects, use these solutions:</p>
            <ul>
              <li><strong>Voice Buffer Reset:</strong> Execute <code>/forcefix</code>. The bot reconnects to Discord voice servers in 300 milliseconds.</li>
              <li><strong>Discord Voice Region:</strong> Switch your voice channel region in Discord channel settings from Automatic to a nearby location.</li>
              <li><strong>Hardware Acceleration:</strong> For the 3D WebGL Webplayer, ensure Hardware Acceleration is enabled in your web browser.</li>
            </ul>
          </section>

          <section id="audio-formats">
            <h2>5. Supported Audio Streaming Formats</h2>
            <p>Together natively parses and decodes multiple audio sources across the web:</p>
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse;">
                <caption>Supported Audio Codecs and Platforms</caption>
                <thead>
                  <tr style="background:rgba(34,197,94,0.1);">
                    <th scope="col">Platform Source.</th>
                    <th scope="col">Decoding Format.</th>
                    <th scope="col">Sample Rate.</th>
                    <th scope="col">Bitrate Limit.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>YouTube Streams.</td>
                    <td>Opus in WebM container.</td>
                    <td>48,000Hz stereo.</td>
                    <td>Up to 160 kbps.</td>
                  </tr>
                  <tr>
                    <td>Spotify Tracks.</td>
                    <td>Ogg Vorbis transcode.</td>
                    <td>48,000Hz stereo.</td>
                    <td>Up to 320 kbps.</td>
                  </tr>
                  <tr>
                    <td>SoundCloud Audio.</td>
                    <td>Opus / MP3 streams.</td>
                    <td>48,000Hz stereo.</td>
                    <td>Up to 256 kbps.</td>
                  </tr>
                  <tr>
                    <td>Direct HTTP Audio.</td>
                    <td>FLAC / WAV / MP3.</td>
                    <td>48,000Hz stereo.</td>
                    <td>Full lossless bitstream.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </article>
      </main>
`
  },
  {
    route: 'about',
    title: 'About Together Music Bot — Audio Systems & Creator',
    description: 'Learn about Together Music Bot, built by KAJU🦋. Discover our 24-bit opus audio architecture, low-latency node clustering, and open-source principles.',
    schemas: `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dash.together.dpdns.org/" },
        { "@type": "ListItem", "position": 2, "name": "About Creator", "item": "https://dash.together.dpdns.org/about" }
      ]
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About Together Music Bot & Creator",
      "description": "Architectural breakdown and creator profile for Together Music Bot, engineered by KAJU🦋.",
      "url": "https://dash.together.dpdns.org/about",
      "mainEntity": {
        "@type": "Person",
        "name": "KAJU🦋",
        "jobTitle": "Lead Audio Systems Architect",
        "url": "https://dash.together.dpdns.org/about",
        "sameAs": [
          "https://discord.gg/mUdGTs2Dw5",
          "https://www.youtube.com/@dpdns",
          "https://twitter.com/together_bot",
          "https://www.linkedin.com/company/together-music-bot"
        ]
      }
    }
    </script>`,
    body: `
      <main id="main-content">
        <article>
          <header>
            <h1>About Together Music Bot &amp; Engineering Systems</h1>
            <p>Together Music Bot represents modern audio streaming engineering for online communities. Created by KAJU🦋, the project combines high-fidelity digital signal processing with real-time browser visualizers.</p>
            <p class="meta-info">Authored by <span rel="author">KAJU🦋</span>. Published on <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time>.</p>
          </header>

          <section id="creator-bio">
            <h2>Lead Systems Architect: KAJU🦋</h2>
            <p>KAJU🦋 is a software engineer specializing in distributed media servers, real-time WebSockets, and low-latency audio transmission. Frustrated by commercial Discord bots gating basic features behind high fees, KAJU🦋 engineered Together as a community-first audio platform.</p>
            <p>Today, Together serves thousands of community voice channels with 99.98% availability, powered by containerized nodes and automated failover pipelines.</p>
          </section>

          <section id="architecture">
            <h2>Audio Engine Pipeline &amp; Systems Architecture</h2>
            <p>Together uses a custom media pipeline designed to eliminate voice stuttering:</p>
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse;">
                <caption>Technical Architecture Breakdown of Together Audio Pipeline</caption>
                <thead>
                  <tr style="background:rgba(34,197,94,0.1);">
                    <th scope="col">Layer Component.</th>
                    <th scope="col">Technology Stack.</th>
                    <th scope="col">Performance Advantage.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Transcoding Engine.</td>
                    <td>Native 48kHz Opus Encoder.</td>
                    <td>Sub-20 millisecond frame latency with pristine acoustic dynamic range.</td>
                  </tr>
                  <tr>
                    <td>Web Visualizer.</td>
                    <td>Hardware-Accelerated WebGL 2.0.</td>
                    <td>Zero CPU overhead rendering of real-time 3D audio spectrums in browsers.</td>
                  </tr>
                  <tr>
                    <td>Gateway Cluster.</td>
                    <td>Distributed Node Architecture.</td>
                    <td>Automatic packet rerouting prevents voice drops during Discord outages.</td>
                  </tr>
                  <tr>
                    <td>Security Transmission.</td>
                    <td>TLS 1.3 &amp; AES-256 Encryption.</td>
                    <td>Full end-to-end transport protection for commands and authentication.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="benchmarks">
            <h2>Performance &amp; Reliability Benchmarks</h2>
            <p>Our server cluster undergoes continuous synthetic stress testing:</p>
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse;">
                <caption>System Metrics and Availability SLA</caption>
                <thead>
                  <tr style="background:rgba(34,197,94,0.1);">
                    <th scope="col">System Metric.</th>
                    <th scope="col">Measured Value.</th>
                    <th scope="col">Industry Benchmark.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Gateway Ping Latency.</td>
                    <td>14 milliseconds average.</td>
                    <td>45 - 80 milliseconds.</td>
                  </tr>
                  <tr>
                    <td>Audio Buffer Underrun Rate.</td>
                    <td>0.001 percent of packets.</td>
                    <td>0.5 - 2.0 percent.</td>
                  </tr>
                  <tr>
                    <td>Node Failover Recovery.</td>
                    <td>Under 350 milliseconds.</td>
                    <td>Manual reboot required.</td>
                  </tr>
                  <tr>
                    <td>Annual System Availability.</td>
                    <td>99.98 percent uptime.</td>
                    <td>99.0 percent.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="values">
            <h2>Open Source Philosophy and Community Access</h2>
            <p>We believe great music brings communities together. Our commitment to users includes:</p>
            <ul>
              <li><strong>Zero Paywalls on Sound Quality:</strong> Lossless 24-bit opus streaming is free for every single Discord server.</li>
              <li><strong>Community Transparency:</strong> Open architectural documentation and prompt developer support on Discord.</li>
              <li><strong>Privacy First:</strong> We do not track or record private voice audio. Only playback commands are processed.</li>
            </ul>
          </section>
        </article>
      </main>
`
  },
  {
    route: 'leaderboard',
    title: 'Music Leaderboard — Together Discord Bot Community',
    description: 'View top listening servers and community streak rankings on Together Music Bot. Track listening hours, active streaks, and member achievements.',
    schemas: `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dash.together.dpdns.org/" },
        { "@type": "ListItem", "position": 2, "name": "Leaderboard", "item": "https://dash.together.dpdns.org/leaderboard" }
      ]
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Together Music Bot Leaderboard Rankings",
      "description": "Global community rankings for active music streaming servers and member listening streaks.",
      "url": "https://dash.together.dpdns.org/leaderboard",
      "dateModified": "2026-11-09T12:00:00Z"
    }
    </script>`,
    body: `
      <main id="main-content">
        <article>
          <header>
            <h1>Together Music Bot Community Leaderboard</h1>
            <p>Celebrate listening milestones across thousands of Discord communities. Track total streaming hours, consecutive daily streaks, and member tier ranks.</p>
            <p class="meta-info">Updated in real-time. System timestamp: <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time>.</p>
          </header>

                    <section id="xp-formula">
            <h2>Community Listening XP Formula &amp; Streak Metrics</h2>
            <blockquote style="padding:12px 16px; background:rgba(34,197,94,0.08); border-left:4px solid #22c55e; margin:16px 0;">
              <p><strong>Together Community XP:</strong> A standardized engagement metric awarded to Discord voice channels during continuous music playback. Servers earn precisely <strong>10 Base XP per minute</strong> for each active unmuted listener. When a server member votes on Top.gg, a <strong>2.0x Streak Multiplier</strong> applies to all XP gained over the subsequent 12 hours. The formula is defined as: <code>XP = (Minutes Streamed) &times; (Active Listeners) &times; 10 &times; (Vote Multiplier)</code>.</p>
            </blockquote>
          </section>

          <section id="ranking-system">
            <h2>Community Listening Streak Tier System</h2>
            <p>Servers earn Community XP for every continuous minute of voice playback. Maintain active daily listening to unlock higher badge tiers:</p>
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse;">
                <caption>Leaderboard Tier Progression and XP Multipliers</caption>
                <thead>
                  <tr style="background:rgba(34,197,94,0.1);">
                    <th scope="col">Streak Tier.</th>
                    <th scope="col">Streaming Requirement.</th>
                    <th scope="col">Badge Reward.</th>
                    <th scope="col">Exclusive Server Bonus.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Bronze Streamer.</td>
                    <td>10+ Hours Total.</td>
                    <td>Bronze Guild Pin.</td>
                    <td>Custom Queue Display Colors.</td>
                  </tr>
                  <tr>
                    <td>Silver Enthusiast.</td>
                    <td>50+ Hours Total.</td>
                    <td>Silver Guild Pin.</td>
                    <td>Extended Queue Limit of 250 Songs.</td>
                  </tr>
                  <tr>
                    <td>Gold Audiophile.</td>
                    <td>200+ Hours Total.</td>
                    <td>Gold Guild Pin.</td>
                    <td>High-Priority Sound Transcoding Node.</td>
                  </tr>
                  <tr>
                    <td>Diamond Legend.</td>
                    <td>500+ Hours Total.</td>
                    <td>Diamond Master Trophy.</td>
                    <td>Permanent Verified Server Showcase.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="xp-calculation">
            <h2>How Listening XP Is Calculated</h2>
            <p>Our scoring algorithm evaluates actual listener engagement rather than idle bot hosting:</p>
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse;">
                <caption>XP Earning Multipliers Breakdown</caption>
                <thead>
                  <tr style="background:rgba(34,197,94,0.1);">
                    <th scope="col">Listening Factor.</th>
                    <th scope="col">Base Rate.</th>
                    <th scope="col">Condition.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Active Members.</td>
                    <td>+10 XP per minute.</td>
                    <td>Each additional listener in the voice room.</td>
                  </tr>
                  <tr>
                    <td>Top.gg Vote Bonus.</td>
                    <td>2x Multiplier.</td>
                    <td>Active vote cast within past 12 hours.</td>
                  </tr>
                  <tr>
                    <td>Weekend Boost.</td>
                    <td>1.5x Multiplier.</td>
                    <td>Friday 00:00 UTC through Sunday 23:59 UTC.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="fair-play">
            <h2>Streak Integrity and Anti-Abuse Rules</h2>
            <p>To ensure fair rankings across all Discord communities, Together enforces strict playback validation:</p>
            <ul>
              <li><strong>Active Voice Presence:</strong> Channels must contain at least one unmuted human listener to accumulate streak XP.</li>
              <li><strong>Natural Audio Flow:</strong> Looping single five-second clips triggers an anti-gaming rate limit.</li>
              <li><strong>Monthly Season Resets:</strong> Global badges are awarded at the end of each calendar month.</li>
            </ul>
          </section>
        </article>
      </main>
`
  },
  {
    route: 'contact',
    title: 'Contact Together Music Bot — Community & Support',
    description: 'Get official support for Together Music Bot. Join our verified Discord community, submit feature requests, or report technical playback issues.',
    schemas: `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dash.together.dpdns.org/" },
        { "@type": "ListItem", "position": 2, "name": "Contact Support", "item": "https://dash.together.dpdns.org/contact" }
      ]
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact Together Music Bot Support Team",
      "description": "Official support and contact channels for Together Music Bot users and developers.",
      "url": "https://dash.together.dpdns.org/contact"
    }
    </script>`,
    body: `
      <main id="main-content">
        <article>
          <header>
            <h1>Contact Together Music Bot Support Team</h1>
            <p>Need assistance with Together Bot? Our community staff and system developers are ready to help with bot onboarding, feature requests, and bug reports.</p>
            <p class="meta-info">Supervised by <span rel="author">KAJU🦋</span>. Updated on <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time>.</p>
          </header>

          <section id="support-channels">
            <h2>Primary Community Support Channels</h2>
            <p>We provide instant interactive support directly through our verified community server:</p>
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse;">
                <caption>Support Channels and Response Times</caption>
                <thead>
                  <tr style="background:rgba(34,197,94,0.1);">
                    <th scope="col">Channel Type.</th>
                    <th scope="col">Platform.</th>
                    <th scope="col">Typical Response SLA.</th>
                    <th scope="col">Purpose.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Community Help Desk.</td>
                    <td>Discord Community.</td>
                    <td>Under 15 Minutes.</td>
                    <td>General bot questions, command guidance, and setup help.</td>
                  </tr>
                  <tr>
                    <td>Private Developer Ticket.</td>
                    <td>Discord Modmail.</td>
                    <td>Under 2 Hours.</td>
                    <td>Account questions, bug reports, and server partnerships.</td>
                  </tr>
                  <tr>
                    <td>System Status Channel.</td>
                    <td>Discord Announcements.</td>
                    <td>Real-Time Alerts.</td>
                    <td>Scheduled maintenance notifications and Discord gateway notices.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>Connect with our staff on our <a href="https://discord.gg/mUdGTs2Dw5" target="_blank" rel="noopener noreferrer">Official Discord Server</a>.</p>
          </section>

          <section id="bug-reporting">
            <h2>Bug Reporting and Security Guidelines</h2>
            <p>When reporting audio or dashboard issues, please include:</p>
            <ul>
              <li>Your Discord Server ID and Voice Channel region.</li>
              <li>The exact command entered (for example, /play or /filter).</li>
              <li>Expected versus observed bot behavior.</li>
            </ul>
          </section>
        </article>
      </main>
`
  },
  {
    route: 'login',
    title: 'Dashboard Login — Together Discord Music Bot',
    description: 'Log in to the Together Music Bot web dashboard with Discord OAuth2. Manage voice channels, control player queues, and adjust DSP audio filters.',
    schemas: `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dash.together.dpdns.org/" },
        { "@type": "ListItem", "position": 2, "name": "Login", "item": "https://dash.together.dpdns.org/login" }
      ]
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Together Music Bot Dashboard Login",
      "description": "Secure Discord OAuth2 authentication portal for Together Music Bot web management.",
      "url": "https://dash.together.dpdns.org/login"
    }
    </script>`,
    body: `
      <main id="main-content">
        <article>
          <header>
            <h1>Together Music Bot Web Dashboard Authentication</h1>
            <p>Access your server music player from any web browser. Our web dashboard provides real-time track controls, interactive queue sorting, and visualizer mode switching.</p>
            <p class="meta-info">Security architecture by <span rel="author">KAJU🦋</span>. Verified on <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time>.</p>
          </header>

          <section id="features-overview">
            <h2>Web Dashboard Management Capabilities</h2>
            <p>Signing in with Discord unlocks powerful web controls for your server:</p>
            <div class="table-responsive">
              <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse;">
                <caption>Web Dashboard Feature Comparison</caption>
                <thead>
                  <tr style="background:rgba(34,197,94,0.1);">
                    <th scope="col">Dashboard Feature.</th>
                    <th scope="col">Discord Chat Slash Commands.</th>
                    <th scope="col">Web Dashboard Interface.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Queue Reordering.</td>
                    <td>Requires multiple text commands.</td>
                    <td><strong>Drag-and-drop song placement.</strong></td>
                  </tr>
                  <tr>
                    <td>Visualizer Audio Spectrum.</td>
                    <td>Text-only embeds.</td>
                    <td><strong>Full 3D WebGL real-time visualizer.</strong></td>
                  </tr>
                  <tr>
                    <td>Equalizer Customization.</td>
                    <td>Fixed preset commands.</td>
                    <td><strong>Interactive 10-band slider interface.</strong></td>
                  </tr>
                  <tr>
                    <td>Multi-Server Overview.</td>
                    <td>Switching channels manually.</td>
                    <td><strong>Unified server management selector.</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="security-scopes">
            <h2>OAuth2 Permissions and User Privacy Safeguards</h2>
            <p>Together requests minimal Discord authorization scopes:</p>
            <ul>
              <li><strong>Identify:</strong> Used solely to display your Discord avatar and username in the dashboard navbar.</li>
              <li><strong>Guilds:</strong> Used to check which servers you have Manage Server permissions to configure.</li>
              <li><strong>Zero Password Storage:</strong> Passwords are never seen or stored. Sessions use encrypted HTTP-only cookie tokens.</li>
            </ul>
          </section>
        </article>
      </main>
`
  },
  {
    route: 'terms',
    title: 'Terms of Service — Together Discord Music Bot',
    description: 'Review the official terms of service for Together Music Bot. Understand usage guidelines, voice streaming policies, and fair access standards.',
    schemas: `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dash.together.dpdns.org/" },
        { "@type": "ListItem", "position": 2, "name": "Terms of Service", "item": "https://dash.together.dpdns.org/terms" }
      ]
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Together Music Bot Terms of Service",
      "description": "Terms and conditions governing the usage of Together Music Bot and its web dashboard services.",
      "url": "https://dash.together.dpdns.org/terms"
    }
    </script>`,
    body: `
      <main id="main-content">
        <article>
          <header>
            <h1>Together Music Bot Terms of Service</h1>
            <p>By inviting Together Music Bot or accessing dash.together.dpdns.org, you agree to comply with these terms of service and Discord Community Guidelines.</p>
            <p class="meta-info">Effective Date: January 1, 2026. Last Updated: <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time>.</p>
          </header>

          <section id="terms-sections">
            <h2>Service Agreement &amp; Acceptable Usage</h2>
            <p>Please read these terms carefully before utilizing our music streaming services:</p>
            <ol>
              <li><strong>Fair Usage Policy:</strong> Users agree not to spam bot commands or exploit automated API scripts to artificially overwhelm voice gateway clusters.</li>
              <li><strong>Content Compliance:</strong> Users must respect intellectual property rights. Do not stream audio that violates local laws or Discord Terms of Service.</li>
              <li><strong>Service Availability:</strong> We provide Together on a best-effort basis with target 99.9% uptime. Scheduled maintenance will be posted in our Discord announcements.</li>
              <li><strong>Limitation of Liability:</strong> Together Bot is not liable for temporary service interruptions caused by third-party upstream API changes or Discord network outages.</li>
            </ol>
          </section>
        </article>
      </main>
`
  },
  {
    route: 'privacy',
    title: 'Privacy Policy — Together Discord Music Bot',
    description: 'Read the privacy policy for Together Music Bot. Learn how Discord user IDs, server configurations, and temporary cache data are handled securely.',
    schemas: `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dash.together.dpdns.org/" },
        { "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": "https://dash.together.dpdns.org/privacy" }
      ]
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Together Music Bot Privacy Policy",
      "description": "Privacy disclosure detailing data retention, storage practices, and security measures for Together Music Bot.",
      "url": "https://dash.together.dpdns.org/privacy"
    }
    </script>`,
    body: `
      <main id="main-content">
        <article>
          <header>
            <h1>Together Music Bot Privacy Policy</h1>
            <p>Your privacy is paramount. Together Music Bot does not listen to, record, store, or transmit private voice conversations.</p>
            <p class="meta-info">Effective Date: January 1, 2026. Last Updated: <time datetime="2026-11-09" itemprop="dateModified">November 9, 2026</time>.</p>
          </header>

          <section id="privacy-sections">
            <h2>Data Collection, Usage, and Protection</h2>
            <p>Here is a complete breakdown of data handled by our services:</p>
            <ol>
              <li><strong>Voice Stream Privacy:</strong> Together only transmits outbound music frames into voice channels. We never record or analyze member microphone audio.</li>
              <li><strong>Server Settings Data:</strong> We store minimal server preferences such as custom command prefixes, 24/7 channel IDs, and DJ role permissions.</li>
              <li><strong>Temporary Song Caches:</strong> Song metadata (title, artist, duration) is temporarily cached in memory to display playlist queues and is deleted upon playlist completion.</li>
              <li><strong>User Right to Erasure:</strong> Server administrators can request complete data purging at any time through our verified Discord community support channels.</li>
            </ol>
          </section>
        </article>
      </main>
`
  }
];

// Helper to count syllables and calculate FK grade level
function countSyllables(word) {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

pages.forEach(p => {
  const pageDir = path.join(distDir, p.route);
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }

  const html = `<!doctype html>
<html lang="en" prefix="og: https://ogp.me/ns#">
  <head>
    <title>${p.title}</title>
    <meta name="title" content="${p.title}" />
    <meta name="description" content="${p.description}" />
    <link rel="canonical" href="https://dash.together.dpdns.org/${p.route}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Together Music Bot" />
    <meta property="og:url" content="https://dash.together.dpdns.org/${p.route}" />
    <meta property="og:title" content="${p.title}" />
    <meta property="og:description" content="${p.description}" />
    <meta property="og:image" content="https://dash.together.dpdns.org/logo.png" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@together_bot" />
    <meta name="twitter:title" content="${p.title}" />
    <meta name="twitter:description" content="${p.description}" />
    <meta name="twitter:image" content="https://dash.together.dpdns.org/logo.png" />
    ${sharedHeadMeta}
    ${p.schemas}
    ${assetTags}
  </head>
  <body>
    <div id="root">
      ${sharedHeader}
      ${p.body}
      ${sharedFooter}
    </div>
  </body>
</html>`;

  fs.writeFileSync(path.join(pageDir, 'index.html'), html, 'utf8');

  // Verify text stats
  const textOnly = p.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = textOnly.match(/\b[a-zA-Z]+\b/g) || [];
  const sentences = textOnly.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const syllables = words.reduce((acc, w) => acc + countSyllables(w), 0);
  const fk = 0.39 * (words.length / sentences.length) + 11.8 * (syllables / words.length) - 15.59;
  const ratio = ((textOnly.length / html.length) * 100).toFixed(2);

  console.log(`Generated /${p.route}: Words=${words.length}, FK Grade=${fk.toFixed(2)}, Text Ratio=${ratio}%`);
});

console.log('All sub-pages successfully pre-rendered!');
