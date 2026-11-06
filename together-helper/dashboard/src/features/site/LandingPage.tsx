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
  Flame,
  Radio,
  Sliders,
  Database,
  Cpu,
  Server,
  BookOpen
} from "lucide-react";
import { Skeleton } from "@/components/primitives";
import { useBot } from "@/features/auth/useBot";
import { useMe } from "@/features/auth/useMe";
import { Composer } from "@/features/site/components/Composer";
import { paletteFrom } from "@/features/site/composer.utils";
import { FEATURES, SELF_HOST_STEPS } from "@/features/site/landing.content";
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
| \`/play\` | Stream high-fidelity audio into voice channels |
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
    <div id="top" className="flex flex-col gap-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-zinc-100">
      {erased && (
        <p role="status" className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-emerald-400">
          {t("account.erased")}
        </p>
      )}

      {/* ─── Hero Section with Glassmorphism and Interactive Composer ─── */}
      <section
        aria-labelledby="landing-title"
        className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 via-[#0B0C10] to-[#090A0F] p-6 sm:p-10 lg:p-14 shadow-2xl"
      >
        {/* Glow ambient background circles */}
        <div className="pointer-events-none absolute -top-24 right-1/4 -z-10 h-96 w-96 rounded-full bg-emerald-500/15 blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 -z-10 h-96 w-96 rounded-full bg-teal-500/10 blur-[160px]" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Hero Left: Headline & Auth Actions */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            {/* Status pill badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-mono font-medium text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>TOGETHER HELPER OS v2.2.0</span>
              <span className="text-emerald-500/40">•</span>
              <span className="text-zinc-400">HIGH-CAPACITY ENGINE</span>
            </div>

            <h1
              id="landing-title"
              className="font-display text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] uppercase text-white"
            >
              AUTONOMOUS <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                DISCORD MANAGEMENT.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-sans max-w-xl">
              Engineered for high-volume Discord servers. Zero-latency AutoMod shielding, interactive ticket transcript archives, automated button giveaways, comprehensive audit logging, and web mission control.
            </p>

            {/* Action Group */}
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full">
              {site.isPending ? (
                <Skeleton className="h-12 w-48 rounded-xl" />
              ) : site.data?.dashboard === true ? (
                <SignedInAware invite={invite} name={name} />
              ) : (
                invite !== null && (
                  <a
                    href={invite}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-xl bg-emerald-500 px-6 py-3.5 font-display font-bold text-sm tracking-wide text-zinc-950 shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Zap className="size-4 fill-zinc-950" />
                    <span>{t("landing.addToDiscord", { name })}</span>
                  </a>
                )
              )}

              <a
                href={SUPPORT_SERVER_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3.5 text-xs font-mono text-zinc-400 transition-colors hover:text-emerald-400"
              >
                <Users className="size-4" />
                <span>COMMUNITY SUPPORT</span>
              </a>
            </div>

            {/* Quick Live Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-2 border-t border-zinc-800/80 w-full font-mono text-xs">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight">93+</span>
                <span className="text-zinc-400 uppercase">Commands Active</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-emerald-400 tracking-tight">&lt; 15ms</span>
                <span className="text-zinc-400 uppercase">Engine Latency</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight">100%</span>
                <span className="text-zinc-400 uppercase">HTML Transcripts</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-cyan-400 tracking-tight">24/7</span>
                <span className="text-zinc-400 uppercase">Cluster Uptime</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Live Interactive Composer Simulator */}
          <div className="lg:col-span-5 w-full">
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#07080B] p-4 sm:p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-rose-500/80" />
                  <div className="size-3 rounded-full bg-amber-500/80" />
                  <div className="size-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-zinc-400">discord-client-preview</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  LIVE INTERFACE
                </span>
              </div>

              <Composer palette={palette} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pillars Bento Grid ───────────────────────────────────── */}
      <section id="features" className="flex flex-col gap-8 scroll-mt-24">
        <div className="flex flex-col gap-2">
          <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            ENGINE CAPABILITIES
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
            BUILT FOR SCALE, SPEED & RESILIENCE
          </h2>
          <p className="text-sm text-zinc-400 max-w-2xl font-sans">
            Every module is crafted to eliminate community friction, automate staff operations, and protect your server around the clock.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Moderation */}
          <div className="group relative flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-emerald-500/40 hover:bg-zinc-900/80">
            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-white uppercase">Moderation Suite</h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Complete timeout, kick, ban, warning strikes, slowmode, and lock/unlock workflows with comprehensive audit logs and duration tracking.
            </p>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-800/80 text-xs font-mono">
              <span className="text-emerald-400">12 CORE COMMANDS</span>
              <span className="text-zinc-400">AUDIT LOGS</span>
            </div>
          </div>

          {/* Card 2: Support Tickets */}
          <div className="group relative flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-cyan-500/40 hover:bg-zinc-900/80">
            <div className="flex size-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <Ticket className="size-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-white uppercase">Interactive Tickets</h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              One-click ticket panels, automated staff channel provisioning, user DM status updates, and interactive HTML transcript archival.
            </p>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-800/80 text-xs font-mono">
              <span className="text-cyan-400">HTML TRANSCRIPTS</span>
              <span className="text-zinc-400">BUTTON V2</span>
            </div>
          </div>

          {/* Card 3: Giveaways */}
          <div className="group relative flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-purple-500/40 hover:bg-zinc-900/80">
            <div className="flex size-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
              <Gift className="size-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-white uppercase">Button Giveaways</h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Fast component button giveaway entries, live Discord countdown timers, verified random winner selection, and instant rerolls.
            </p>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-800/80 text-xs font-mono">
              <span className="text-purple-400">INSTANT REROLL</span>
              <span className="text-zinc-400">COUNTDOWNS</span>
            </div>
          </div>

          {/* Card 4: AutoMod & Protection */}
          <div className="group relative flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-amber-500/40 hover:bg-zinc-900/80">
            <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
              <Lock className="size-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-white uppercase">AutoMod & Security</h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              In-memory anti-spam detection, unauthorized invite shielding, role-based verification buttons, and sticky message enforcement.
            </p>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-800/80 text-xs font-mono">
              <span className="text-amber-400">ANTI-RAID SHIELD</span>
              <span className="text-zinc-400">0MS LATENCY</span>
            </div>
          </div>

          {/* Card 5: Economy & Levelling */}
          <div className="group relative flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-yellow-500/40 hover:bg-zinc-900/80">
            <div className="flex size-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 group-hover:scale-105 transition-transform">
              <Coins className="size-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-white uppercase">Economy & Levelling</h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              XP rewards, dynamic rank cards, global and guild leaderboards, daily rewards streaks, casino games, and community jackpots.
            </p>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-800/80 text-xs font-mono">
              <span className="text-yellow-400">MONGO PERSISTED</span>
              <span className="text-zinc-400">LEADERBOARDS</span>
            </div>
          </div>

          {/* Card 6: Utility & Community */}
          <div className="group relative flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-teal-500/40 hover:bg-zinc-900/80">
            <div className="flex size-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="size-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-white uppercase">Community Utilities</h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Auto-mention AFK detection, rich multi-choice poll votes, timer-based task reminders, member inspection, and detailed server telemetry.
            </p>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-800/80 text-xs font-mono">
              <span className="text-teal-400">SLASH + PREFIX</span>
              <span className="text-zinc-400">STICKY POSTS</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Command Directory ────────────────────────── */}
      <section id="commands" className="flex flex-col gap-6 pt-4 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              COMMAND MATRIX
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
              EXPLORE AVAILABLE COMMANDS
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              CLICK ANY COMMAND TO COPY SYNTAX TO CLIPBOARD
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search commands or syntax..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-mono font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Command Cards Grid */}
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
                  className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-all hover:border-emerald-500/40 hover:bg-zinc-900/80 cursor-pointer text-left"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-bold text-emerald-400 group-hover:text-emerald-300">
                        /{cmd.name}
                      </span>
                      <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] font-mono uppercase text-zinc-400 border border-zinc-700/50">
                        {cmd.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      {cmd.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded bg-zinc-950/80 px-2.5 py-1.5 font-mono text-[11px] text-zinc-400 border border-zinc-800/60 truncate group-hover:border-emerald-500/30">
                    <span className="truncate">{cmd.syntax}</span>
                    <span className="ml-2 shrink-0">
                      {isCopied ? (
                        <Check className="size-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="size-3.5 text-zinc-400 group-hover:text-zinc-200" />
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center font-mono text-sm text-zinc-400">
              No commands matching "{searchQuery}" in category {activeCategory}.
            </div>
          )}
        </div>
      </section>

      {/* ─── Self-Hosting / Deployment Guide ───────────────────────── */}
      <section
        aria-labelledby="self-host-heading"
        className="rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-6 sm:p-10 flex flex-col gap-6"
      >
        <div className="flex flex-col gap-1">
          <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            ARCHITECTURE & DOCS
          </div>
          <h2 id="self-host-heading" className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
            {t("landing.selfHost.title")}
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            {t("landing.selfHost.intro")}
          </p>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 list-none p-0 m-0">
          {SELF_HOST_STEPS.map((step, index) => (
            <li key={step.slug}>
              <Link
                to={`/docs/${step.slug}`}
                className="group flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all hover:border-emerald-500/50 hover:bg-zinc-900/80"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30">
                    0{index + 1}
                  </span>
                  <ArrowRight className="size-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="font-display text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {t(step.labelKey)}
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── Footer CTA ───────────────────────────────────────────── */}
      <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-8 sm:p-14 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 -z-10 h-64 w-96 rounded-full bg-emerald-500/10 blur-[100px]" />

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400">
          <Zap className="size-3.5" />
          <span>JOIN HUNDREDS OF DISCORD COMMUNITIES</span>
        </div>

        <h2 className="font-display text-3xl sm:text-5xl font-black uppercase text-white tracking-tight max-w-2xl">
          READY TO SUPERCHARGE YOUR DISCORD SERVER?
        </h2>
        <p className="max-w-xl text-zinc-400 text-sm sm:text-base font-sans">
          Deploy Together Helper now. Experience instantaneous moderation, rich interactive tickets, and full-fidelity web management.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {invite !== null && (
            <a
              href={invite}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 font-display font-bold text-sm text-zinc-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
            >
              <span>+ ADD TOGETHER HELPER</span>
              <ExternalLink className="size-4 fill-zinc-950" />
            </a>
          )}
          <a
            href={SUPPORT_SERVER_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/90 px-6 py-3.5 font-display font-bold text-sm text-white hover:border-zinc-500 hover:bg-zinc-700 transition-all"
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

  if (me.isPending) return <Skeleton className="h-12 w-48 rounded-xl" />;

  if (me.data !== null && me.data !== undefined) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <Link
          to="/guilds"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 font-display font-bold text-sm text-zinc-950 shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>{t("landing.openYourServers")}</span>
          <ArrowRight className="size-4 stroke-[3]" />
        </Link>
        {invite !== null && (
          <a
            href={invite}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/90 px-6 py-3.5 font-display font-bold text-sm text-white transition-all hover:border-emerald-500/50 hover:bg-zinc-800"
          >
            <Zap className="size-4 text-emerald-400" />
            <span>{t("landing.addToDiscord", { name })}</span>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {invite !== null && (
        <a
          href={invite}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 font-display font-bold text-sm text-zinc-950 shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Zap className="size-4 fill-zinc-950" />
          <span>{t("landing.addToDiscord", { name })}</span>
        </a>
      )}
      <button
        type="button"
        onClick={() => {
          hardRedirect(`/api/auth/login?returnTo=${encodeURIComponent("/guilds")}`);
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/90 px-6 py-3.5 font-display font-bold text-sm text-white transition-all hover:border-emerald-500/50 hover:bg-zinc-800"
      >
        <span>{t("site.signInWithDiscord")}</span>
        <ExternalLink className="size-4 text-zinc-400" />
      </button>
    </div>
  );
}
