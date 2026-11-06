import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  Zap,
  Ticket,
  Gift,
  Coins,
  Users,
  Search,
  ArrowRight,
  ExternalLink,
  Lock,
  CheckCircle2,
  Sparkles,
  Terminal,
  Activity,
  Layers,
  Clock,
  MessageSquare,
  Copy,
  Check,
  Radio,
  Sliders,
  Database,
  Cpu,
  Server
} from "lucide-react";
import { Skeleton } from "@/components/primitives";
import { useBot } from "@/features/auth/useBot";
import { useMe } from "@/features/auth/useMe";
import { Composer } from "@/features/site/components/Composer";
import { paletteFrom } from "@/features/site/composer.utils";
import { useSite } from "@/features/site/useSite";
import { usePageTitle } from "@/hooks/usePageTitle";
import { rememberedBotName } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { hardRedirect } from "@/lib/redirect";

const BOT_INVITE_URL =
  "https://discord.com/oauth2/authorize?client_id=1568056736424792185&permissions=8&integration_type=0&scope=bot+applications.commands";
const SUPPORT_SERVER_URL = "https://discord.gg/mUdGTs2Dw5";

const commandList = `
| Command | Description |
|:---|:---|
| \`/help\` | View all available bot commands and categories |
| \`/ban\` | Ban a disruptive user from the server |
| \`/kick\` | Kick a user from the server |
| \`/timeout\` | Time out a user for a given duration |
| \`/warn\` | Issue a formal warning to a member |
| \`/clear\` | Purge multiple messages from a channel |
| \`/ticket\` | Open a support ticket |
| \`/giveaway\` | Start an interactive giveaway |
| \`/rank\` | Check your level and XP rank |
| \`/leaderboard\` | View the server leaderboard |
| \`/verify\` | Role-based member verification |
| \`/automod\` | Configure automated anti-spam and moderation |
| \`/remind\` | Schedule intelligent automated reminders |
`;

interface PublicCommand {
  name: string;
  category: "Moderation" | "Support" | "Giveaways" | "Economy" | "Admin" | "Utility";
  description: string;
  syntax: string;
}

const PUBLIC_COMMANDS: PublicCommand[] = [
  // Moderation
  { name: "ban", category: "Moderation", description: "Ban a disruptive member and wipe message history", syntax: "/ban <user> [reason] [days]" },
  { name: "kick", category: "Moderation", description: "Kick a member from the server with audit logging", syntax: "/kick <user> [reason]" },
  { name: "timeout", category: "Moderation", description: "Temporarily mute a user for duration up to 28 days", syntax: "/timeout <user> <duration> [reason]" },
  { name: "untimeout", category: "Moderation", description: "Remove timeout punishment early from a member", syntax: "/untimeout <user> [reason]" },
  { name: "warn", category: "Moderation", description: "Issue a formal infraction strike against a member", syntax: "/warn <user> <reason>" },
  { name: "warnings", category: "Moderation", description: "View all active and historical warning strikes for a user", syntax: "/warnings <user>" },
  { name: "clear", category: "Moderation", description: "Bulk purge up to 100 messages from the active channel", syntax: "/clear <amount> [user]" },
  { name: "lock", category: "Moderation", description: "Lock down channel permissions to prevent public posting", syntax: "/lock [channel] [reason]" },
  { name: "unlock", category: "Moderation", description: "Restore public posting permissions to a locked channel", syntax: "/unlock [channel]" },
  { name: "slowmode", category: "Moderation", description: "Set message cooldown rate limiting on a channel", syntax: "/slowmode <seconds>" },

  // Support
  { name: "ticket", category: "Support", description: "Create, claim, or manage private staff support tickets", syntax: "/ticket [action]" },
  { name: "transcript", category: "Support", description: "Export complete interactive HTML log transcript of a ticket", syntax: "/transcript" },
  { name: "close", category: "Support", description: "Gracefully resolve and archive support ticket channel", syntax: "/close [reason]" },

  // Giveaways
  { name: "giveaway start", category: "Giveaways", description: "Launch interactive giveaway with countdown and button entry", syntax: "/giveaway start <duration> <winners> <prize>" },
  { name: "giveaway reroll", category: "Giveaways", description: "Pick replacement winners for an ended giveaway", syntax: "/giveaway reroll <message_id>" },
  { name: "giveaway end", category: "Giveaways", description: "Conclude an active giveaway immediately and pick winners", syntax: "/giveaway end <message_id>" },

  // Admin & Security
  { name: "automod", category: "Admin", description: "Configure anti-spam, invite shielding, and bad-word filter", syntax: "/automod <setting> <value>" },
  { name: "verify", category: "Admin", description: "Setup interactive button or modal verification panel", syntax: "/verify setup <channel> <role>" },
  { name: "autorole", category: "Admin", description: "Configure automated role assignments for new server members", syntax: "/autorole <role>" },
  { name: "sticky", category: "Admin", description: "Pin persistent messages that auto-stay at bottom of channel", syntax: "/sticky <message>" },

  // Economy & Levelling
  { name: "rank", category: "Economy", description: "View your current experience points, level, and progress card", syntax: "/rank [user]" },
  { name: "leaderboard", category: "Economy", description: "View the server top XP, balance, and activity leaderboard", syntax: "/leaderboard" },
  { name: "balance", category: "Economy", description: "Check your wallet and bank coins balance", syntax: "/balance [user]" },
  { name: "daily", category: "Economy", description: "Claim your 24-hour reward coins bonus streak", syntax: "/daily" },
  { name: "lottery", category: "Economy", description: "Enter the community jackpot prize draw", syntax: "/lottery" },

  // Utility
  { name: "afk", category: "Utility", description: "Set your AFK status with custom notification note", syntax: "/afk <reason>" },
  { name: "poll", category: "Utility", description: "Create an interactive voting poll with customizable options", syntax: "/poll <question> <options>" },
  { name: "remind", category: "Utility", description: "Schedule a reminder notification for yourself or a channel", syntax: "/remind <duration> <task>" },
  { name: "whois", category: "Utility", description: "Inspect deep account info, avatar, permissions, and roles", syntax: "/whois [user]" },
  { name: "serverinfo", category: "Utility", description: "View server owner, boosts, channels, and statistics", syntax: "/serverinfo" }
];

export function LandingPage(): React.JSX.Element {
  const { t } = useTranslation();
  usePageTitle(t("landing.pageTitle") ?? "TOGETHER HELPER // Mission Control");
  const site = useSite();
  const bot = useBot();
  const palette = useMemo(() => paletteFrom(commandList), []);
  const name = bot.data?.name ?? rememberedBotName() ?? "TOGETHER HELPER";
  const invite =
    bot.data?.id
      ? `https://discord.com/oauth2/authorize?client_id=${bot.data.id}&permissions=8&integration_type=0&scope=bot+applications.commands`
      : BOT_INVITE_URL;
  const erased = (useLocation().state as { erased?: boolean } | null)?.erased === true;

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const categories = ["ALL", "Moderation", "Support", "Giveaways", "Economy", "Admin", "Utility"];

  const handleCopy = (syntax: string) => {
    navigator.clipboard.writeText(syntax);
    setCopiedCmd(syntax);
    setTimeout(() => setCopiedCmd(null), 1800);
  };

  const filteredCommands = useMemo(() => {
    return PUBLIC_COMMANDS.filter((cmd) => {
      const matchCategory = activeCategory === "ALL" || cmd.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        cmd.name.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.syntax.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div id="top" className="flex flex-col gap-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-foreground">
      {erased && (
        <p role="status" className="bg-card border-2 border-black dark:border-zinc-700 px-4 py-3 font-mono text-sm font-bold text-[#00E676] shadow-[2px_2px_0px_#000000]">
          {t("account.erased")}
        </p>
      )}

      {/* ─── Neo-Brutalist High-Impact Hero Section ─────────────────── */}
      <section
        aria-labelledby="landing-title"
        className="relative border-2 border-black dark:border-zinc-700 bg-card p-6 sm:p-12 lg:p-16 shadow-[6px_6px_0px_0px_#000000] dark:shadow-[6px_6px_0px_0px_#00E676] transition-all"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Hero Left: Headline & Auth Actions */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            {/* Brutalist Badge */}
            <div className="inline-flex items-center gap-2 border-2 border-black dark:border-zinc-700 bg-background px-3 py-1 text-xs font-mono font-black tracking-widest uppercase shadow-[2px_2px_0px_#000000]">
              <span className="flex size-2 bg-[#00E676] animate-pulse" />
              <span>TOGETHER HELPER // CLUSTER ONLINE</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-[#00E676]">v2.2.0</span>
            </div>

            <h1
              id="landing-title"
              className="font-display text-4xl sm:text-6xl font-black tracking-tight leading-[1.02] text-foreground uppercase"
            >
              AUTONOMOUS <br />
              <span className="bg-[#00E676] text-black px-2 py-0.5 border-2 border-black inline-block mt-1 shadow-[3px_3px_0px_#000000]">
                DISCORD OS.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-mono max-w-xl font-medium">
              ENGINEERED FOR UNCOMPROMISING DISCORD COMMUNITIES. ZERO-LATENCY AUTOMOD DEFENSE, INTERACTIVE TICKET TRANSCRIPTS, BUTTON GIVEAWAYS, AND LIVE LOG FORWARDING DIRECT TO DISCORD CHANNEL #1568284208533864498.
            </p>

            {/* Brutalist Action Group */}
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full">
              {site.isPending ? (
                <Skeleton className="h-12 w-48 rounded-none border-2 border-black" />
              ) : site.data?.dashboard === true ? (
                <SignedInAware invite={invite} name={name} />
              ) : (
                invite !== null && (
                  <a
                    href={invite}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-none border-2 border-black bg-[#00E676] px-6 py-3 font-mono font-black text-sm uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  >
                    <Zap className="size-4 fill-black" />
                    <span>{t("landing.addToDiscord", { name })}</span>
                  </a>
                )
              )}

              <a
                href={SUPPORT_SERVER_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-none border-2 border-black dark:border-zinc-700 bg-background px-5 py-3 font-mono font-black text-xs uppercase tracking-wider text-foreground shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                <Users className="size-4" />
                <span>SUPPORT DISCORD</span>
              </a>
            </div>

            {/* Live Metrics Pill Strip */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-md pt-4 font-mono text-xs">
              <div className="border-2 border-black dark:border-zinc-700 bg-background p-2.5 shadow-[2px_2px_0px_#000000]">
                <div className="text-muted-foreground text-[10px] font-bold">LATENCY</div>
                <div className="text-base font-black text-[#00E676]">14 MS</div>
              </div>
              <div className="border-2 border-black dark:border-zinc-700 bg-background p-2.5 shadow-[2px_2px_0px_#000000]">
                <div className="text-muted-foreground text-[10px] font-bold">COMMANDS</div>
                <div className="text-base font-black text-foreground">80+ EXEC</div>
              </div>
              <div className="border-2 border-black dark:border-zinc-700 bg-background p-2.5 shadow-[2px_2px_0px_#000000]">
                <div className="text-muted-foreground text-[10px] font-bold">UPTIME</div>
                <div className="text-base font-black text-foreground">99.98%</div>
              </div>
            </div>
          </div>

          {/* Hero Right: Interactive Terminal / Composer */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full border-2 border-black dark:border-zinc-700 bg-black text-white p-4 shadow-[5px_5px_0px_0px_#000000] dark:shadow-[5px_5px_0px_0px_#00E676]">
              {/* Terminal Window Bar */}
              <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3 mb-4 font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="size-3 bg-red-500 border border-black" />
                  <div className="size-3 bg-yellow-500 border border-black" />
                  <div className="size-3 bg-[#00E676] border border-black" />
                </div>
                <span className="font-bold text-zinc-400 uppercase tracking-widest text-[10px]">
                  TOGETHER-HELPER // CLI
                </span>
                <span className="text-[#00E676] text-[10px] font-bold">LIVE</span>
              </div>

              {/* Console Body */}
              <div className="font-mono text-xs space-y-2 text-zinc-300">
                <div className="flex items-center gap-2 text-zinc-400">
                  <span className="text-[#00E676]">$</span>
                  <span>together-helper status --verbose</span>
                </div>
                <div className="p-2 border border-zinc-800 bg-zinc-950 text-[11px] space-y-1">
                  <div className="text-[#00E676] font-bold">[OK] GATEWAY CONNECTED (42 SHARDS)</div>
                  <div className="text-zinc-300">[OK] LOG STREAM DISPATCHED TO:</div>
                  <div className="text-yellow-400 font-bold pl-2">#CHANNEL-ID: 1568284208533864498</div>
                  <div className="text-zinc-300">[OK] AUTOMOD HEURISTICS ACTIVE</div>
                  <div className="text-zinc-300">[OK] WEB DASHBOARD RUNNING AT :5090</div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[#00E676]">$</span>
                  <span className="text-white animate-pulse">/ticket create --reason="VIP Support"</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Neo-Brutalist Architecture Bento Grid ──────────────────── */}
      <section id="features" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-black tracking-widest text-[#00E676] uppercase">
            <span>[ SECTION 02 // ARCHITECTURE ]</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            POWERFUL CAPABILITIES. RAW CONTROL.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Moderation */}
          <div className="border-2 border-black dark:border-zinc-700 bg-card p-6 shadow-[4px_4px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#00E676] transition-all flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="size-10 border-2 border-black bg-[#00E676] flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                  <ShieldCheck className="size-5 text-black" />
                </div>
                <span className="font-mono text-xs font-black text-muted-foreground uppercase">[ 01 ]</span>
              </div>
              <h3 className="font-display text-lg font-black uppercase text-foreground">
                SHIELD DEFENSE & AUTOMOD
              </h3>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                Zero-tolerance antispam engine, automatic invite link destruction, bad-word filtering, anti-raid mass join shields, and tiered infraction strike enforcement.
              </p>
            </div>
            <div className="font-mono text-[10px] font-bold text-[#00E676] border-t-2 border-black dark:border-zinc-800 pt-3">
              ACTIVE RULES: 14 POLICIES
            </div>
          </div>

          {/* Card 2: Support Desk */}
          <div className="border-2 border-black dark:border-zinc-700 bg-card p-6 shadow-[4px_4px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#00E676] transition-all flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="size-10 border-2 border-black bg-cyan-400 flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                  <Ticket className="size-5 text-black" />
                </div>
                <span className="font-mono text-xs font-black text-muted-foreground uppercase">[ 02 ]</span>
              </div>
              <h3 className="font-display text-lg font-black uppercase text-foreground">
                INTERACTIVE SUPPORT DESK
              </h3>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                Multi-panel button ticket dispatch, staff claiming workflow, automated ticket closure countdowns, and permanent standalone HTML transcripts.
              </p>
            </div>
            <div className="font-mono text-[10px] font-bold text-cyan-400 border-t-2 border-black dark:border-zinc-800 pt-3">
              TRANSCRIPT GENERATOR: READY
            </div>
          </div>

          {/* Card 3: Button Giveaways */}
          <div className="border-2 border-black dark:border-zinc-700 bg-card p-6 shadow-[4px_4px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#00E676] transition-all flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="size-10 border-2 border-black bg-amber-400 flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                  <Gift className="size-5 text-black" />
                </div>
                <span className="font-mono text-xs font-black text-muted-foreground uppercase">[ 03 ]</span>
              </div>
              <h3 className="font-display text-lg font-black uppercase text-foreground">
                BUTTON GIVEAWAY ENGINE
              </h3>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                High-performance Discord button entry handlers, live countdown timers, anti-alt verification checks, and cryptographic winner selection with instant reroll.
              </p>
            </div>
            <div className="font-mono text-[10px] font-bold text-amber-400 border-t-2 border-black dark:border-zinc-800 pt-3">
              REROLL SUPPORT: 1-CLICK
            </div>
          </div>

          {/* Card 4: Economy & Levelling */}
          <div className="border-2 border-black dark:border-zinc-700 bg-card p-6 shadow-[4px_4px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#00E676] transition-all flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="size-10 border-2 border-black bg-emerald-400 flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                  <Coins className="size-5 text-black" />
                </div>
                <span className="font-mono text-xs font-black text-muted-foreground uppercase">[ 04 ]</span>
              </div>
              <h3 className="font-display text-lg font-black uppercase text-foreground">
                GAMIFIED XP & SERVER ECONOMY
              </h3>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                Message & voice XP accrual, customizable visual rank cards, streaks, daily coin claims, blackjack & roulette mini-games, and global server leaderboards.
              </p>
            </div>
            <div className="font-mono text-[10px] font-bold text-emerald-400 border-t-2 border-black dark:border-zinc-800 pt-3">
              CUSTOM RANK CARDS: ENABLED
            </div>
          </div>

          {/* Card 5: Verification & Autorole */}
          <div className="border-2 border-black dark:border-zinc-700 bg-card p-6 shadow-[4px_4px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#00E676] transition-all flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="size-10 border-2 border-black bg-violet-400 flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                  <Users className="size-5 text-black" />
                </div>
                <span className="font-mono text-xs font-black text-muted-foreground uppercase">[ 05 ]</span>
              </div>
              <h3 className="font-display text-lg font-black uppercase text-foreground">
                VERIFICATION & AUTOROLES
              </h3>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                One-click button verification panels, modal quiz filters, automated joining roles, and real-time member count voice channel trackers.
              </p>
            </div>
            <div className="font-mono text-[10px] font-bold text-violet-400 border-t-2 border-black dark:border-zinc-800 pt-3">
              CAPTCHA & BUTTON: SUPPORTED
            </div>
          </div>

          {/* Card 6: Live Discord Log Forwarding */}
          <div className="border-2 border-black dark:border-zinc-700 bg-card p-6 shadow-[4px_4px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#00E676] transition-all flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="size-10 border-2 border-black bg-pink-400 flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                  <Activity className="size-5 text-black" />
                </div>
                <span className="font-mono text-xs font-black text-muted-foreground uppercase">[ 06 ]</span>
              </div>
              <h3 className="font-display text-lg font-black uppercase text-foreground">
                DISCORD STREAM LOGGING
              </h3>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                All server events, console standard outputs, slash commands, moderation actions, and fatal errors route in real-time to channel #1568284208533864498.
              </p>
            </div>
            <div className="font-mono text-[10px] font-bold text-pink-400 border-t-2 border-black dark:border-zinc-800 pt-3">
              TARGET: #1568284208533864498
            </div>
          </div>
        </div>
      </section>

      {/* ─── Neo-Brutalist Command Matrix Section ────────────────────── */}
      <section id="commands" className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-black tracking-widest text-[#00E676] uppercase">
              <span>[ SECTION 03 // COMMAND CATALOG ]</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
              COMMAND MATRIX
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH COMMANDS..."
              className="w-full rounded-none border-2 border-black dark:border-zinc-700 bg-background pl-9 pr-4 py-2 font-mono text-xs font-bold text-foreground placeholder-muted-foreground focus:border-[#00E676] focus:outline-none shadow-[2px_2px_0px_#000000]"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-none border-2 border-black dark:border-zinc-700 px-3 py-1 font-mono text-xs font-black tracking-wider transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#00E676] text-black shadow-[2px_2px_0px_#000000]"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted shadow-[1px_1px_0px_#000000]"
              }`}
            >
              [ {cat.toUpperCase()} ]
            </button>
          ))}
        </div>

        {/* Command Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd) => {
              const isCopied = copiedCmd === cmd.syntax;
              return (
                <div
                  key={cmd.name}
                  onClick={() => handleCopy(cmd.syntax)}
                  role="button"
                  tabIndex={0}
                  className="group flex flex-col justify-between border-2 border-black dark:border-zinc-700 bg-card p-4 shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#00E676] cursor-pointer text-left transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-black text-[#00E676] group-hover:underline">
                        /{cmd.name}
                      </span>
                      <span className="border border-black dark:border-zinc-700 bg-background px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-muted-foreground">
                        {cmd.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                      {cmd.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border border-black dark:border-zinc-700 bg-background px-2.5 py-1.5 font-mono text-[11px] text-foreground truncate">
                    <span className="truncate">{cmd.syntax}</span>
                    <span className="ml-2 shrink-0">
                      {isCopied ? (
                        <Check className="size-3.5 text-[#00E676]" />
                      ) : (
                        <Copy className="size-3.5 text-muted-foreground group-hover:text-foreground" />
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center font-mono text-sm text-muted-foreground border-2 border-dashed border-border p-6">
              NO COMMANDS MATCHING "{searchQuery}" IN CATEGORY {activeCategory}.
            </div>
          )}
        </div>
      </section>

      {/* ─── Neo-Brutalist Bottom Deployment CTA ─────────────────────── */}
      <section className="border-2 border-black dark:border-zinc-700 bg-card p-8 sm:p-14 text-center flex flex-col items-center gap-6 shadow-[6px_6px_0px_0px_#000000] dark:shadow-[6px_6px_0px_0px_#00E676]">
        <div className="inline-flex items-center gap-2 border-2 border-black bg-[#00E676] px-3 py-1 text-xs font-mono font-black text-black uppercase shadow-[2px_2px_0px_#000000]">
          <Zap className="size-3.5 fill-black" />
          <span>JOIN HUNDREDS OF DISCORD COMMUNITIES</span>
        </div>

        <h2 className="font-display text-3xl sm:text-5xl font-black uppercase text-foreground tracking-tight max-w-2xl">
          READY TO SUPERCHARGE YOUR DISCORD SERVER?
        </h2>
        <p className="max-w-xl text-muted-foreground text-xs sm:text-sm font-mono">
          DEPLOY TOGETHER HELPER NOW. EXPERIENCE INSTANTANEOUS AUTOMOD DEFENSE, RICH INTERACTIVE TICKETS, AND FULL-FIDELITY WEB CONSOLE.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {invite !== null && (
            <a
              href={invite}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 rounded-none border-2 border-black bg-[#00E676] px-7 py-3.5 font-mono font-black text-sm uppercase text-black shadow-[4px_4px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <span>+ ADD TOGETHER HELPER</span>
              <ExternalLink className="size-4" />
            </a>
          )}
          <a
            href={SUPPORT_SERVER_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-none border-2 border-black dark:border-zinc-700 bg-background px-6 py-3.5 font-mono font-black text-xs uppercase text-foreground shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <Users className="size-4" />
            <span>COMMUNITY DISCORD</span>
          </a>
        </div>
      </section>
    </div>
  );
}

function SignedInAware({ invite, name }: { invite: string | null; name: string }): React.JSX.Element {
  const { t } = useTranslation();
  const me = useMe();

  if (me.isPending) return <Skeleton className="h-11 w-44 rounded-none border-2 border-black" />;

  if (me.data !== null && me.data !== undefined) {
    return (
      <div className="flex flex-wrap items-center gap-3.5">
        <Link
          to="/guilds"
          className="inline-flex items-center gap-2 rounded-none border-2 border-black bg-[#00E676] px-6 py-3 font-mono font-black text-sm uppercase text-black shadow-[4px_4px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <span>{t("landing.openYourServers")}</span>
          <ArrowRight className="size-4 stroke-[3]" />
        </Link>
        {invite !== null && (
          <a
            href={invite}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-none border-2 border-black dark:border-zinc-700 bg-card px-5 py-3 font-mono font-black text-xs uppercase text-foreground shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <Zap className="size-4 text-[#00E676] fill-[#00E676]" />
            <span>{t("landing.addToDiscord", { name })}</span>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3.5">
      {invite !== null && (
        <a
          href={invite}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2.5 rounded-none border-2 border-black bg-[#00E676] px-6 py-3 font-mono font-black text-sm uppercase text-black shadow-[4px_4px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <Zap className="size-4 fill-black" />
          <span>{t("landing.addToDiscord", { name })}</span>
        </a>
      )}
      <button
        type="button"
        onClick={() => {
          hardRedirect(`/api/auth/login?returnTo=${encodeURIComponent("/guilds")}`);
        }}
        className="inline-flex items-center gap-2 rounded-none border-2 border-black dark:border-zinc-700 bg-background px-5 py-3 font-mono font-black text-xs uppercase text-foreground shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
      >
        <span>{t("site.signInWithDiscord")}</span>
        <ExternalLink className="size-4 text-muted-foreground" />
      </button>
    </div>
  );
}
