import {
  Palette,
  Menu,
  X,
  ExternalLink,
  Shield,
  Zap,
  Users,
  ChevronRight,
  Terminal,
  Activity
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { BotMark } from "@/components/brand/BotMark";
import { LanguageSelect } from "@/components/form/LanguageSelect";
import { Skeleton, Tooltip } from "@/components/primitives";
import { INLINE_TARGET } from "@/components/primitives/targetStyles";
import { useBot, useBotLook } from "@/features/auth/useBot";
import { useMe } from "@/features/auth/useMe";
import { useSite } from "@/features/site/useSite";
import { cn } from "@/lib/cn";
import { hardRedirect } from "@/lib/redirect";

const BOT_INVITE_URL =
  "https://discord.com/oauth2/authorize?client_id=1568056736424792185&permissions=8&integration_type=0&scope=bot+applications.commands";
const SUPPORT_SERVER_URL = "https://discord.gg/mUdGTs2Dw5";

export function SiteShell({ column = false }: { column?: boolean }): React.JSX.Element {
  const { t } = useTranslation();
  const bot = useBot();
  const look = useBotLook();
  const site = useSite();
  const name = look.name ?? "TOGETHER HELPER";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const inviteUrl =
    bot.data?.id
      ? `https://discord.com/oauth2/authorize?client_id=${bot.data.id}&permissions=8&integration_type=0&scope=bot+applications.commands`
      : BOT_INVITE_URL;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground antialiased selection:bg-[#00E676] selection:text-black">
      {/* ─── Neo-Brutalist Top Broadcast Ticker ─────────────────────── */}
      <div className="w-full border-b-2 border-black dark:border-zinc-800 bg-[#00E676] text-black px-4 py-1 text-center font-mono text-xs font-black tracking-widest uppercase flex items-center justify-center gap-3">
        <span className="flex size-2 bg-black animate-pulse" />
        <span>LIVE TELEMETRY & LOG STREAM CONNECTED TO CHANNEL #1568284208533864498</span>
        <span className="hidden sm:inline">• BOT STATUS: READY // LATENCY: 14MS</span>
      </div>

      {/* ─── Neo-Brutalist Sharp High-Contrast Navigation Bar ────────── */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-black dark:border-zinc-800 bg-background transition-colors">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Sharp Status */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            aria-label={t("site.home")}
            className="flex items-center gap-3 transition-transform hover:-translate-y-0.5"
          >
            <div className="relative flex items-center justify-center">
              <BotMark
                src={look.avatarUrl}
                name={name}
                size={36}
                className="rounded-none border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#00E676]"
              />
              <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5 bg-[#00E676] border border-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-base font-black tracking-tight text-foreground flex items-center gap-2">
                {name}
                <span className="rounded-none bg-[#00E676] px-1.5 py-0.5 text-[9px] font-mono font-black tracking-widest text-black border-2 border-black">
                  HELPER
                </span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground -mt-0.5 tracking-widest uppercase font-bold">
                AUTONOMOUS DISCORD OS
              </span>
            </div>
          </Link>

          {/* Neo-Brutalist Desktop Navigation Links */}
          <nav aria-label={t("site.nav")} className="hidden md:flex items-center gap-2">
            <Link
              to="/#top"
              className="rounded-none border-2 border-transparent hover:border-black dark:hover:border-zinc-700 px-3 py-1 text-xs font-mono font-black tracking-wider text-muted-foreground transition-all hover:text-foreground hover:bg-muted"
            >
              [ OVERVIEW ]
            </Link>
            <a
              href="/#features"
              className="rounded-none border-2 border-transparent hover:border-black dark:hover:border-zinc-700 px-3 py-1 text-xs font-mono font-black tracking-wider text-muted-foreground transition-all hover:text-foreground hover:bg-muted"
            >
              [ FEATURES ]
            </a>
            <a
              href="/#commands"
              className="rounded-none border-2 border-transparent hover:border-black dark:hover:border-zinc-700 px-3 py-1 text-xs font-mono font-black tracking-wider text-muted-foreground transition-all hover:text-foreground hover:bg-muted"
            >
              [ COMMAND MATRIX ]
            </a>
            <a
              href={SUPPORT_SERVER_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-none border-2 border-transparent hover:border-black dark:hover:border-zinc-700 px-3 py-1 text-xs font-mono font-black tracking-wider text-muted-foreground transition-all hover:text-foreground hover:bg-muted flex items-center gap-1.5"
            >
              <Users className="size-3.5" />
              <span>[ SUPPORT ]</span>
            </a>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            <LanguageSelect className="hidden sm:inline-flex rounded-none border-2 border-black dark:border-zinc-700" />
            <AppearanceLink />

            {/* Brutalist Invite CTA */}
            <a
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-none border-2 border-black dark:border-zinc-700 bg-card px-3.5 py-1.5 text-xs font-mono font-black text-foreground shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#00E676] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all uppercase"
            >
              <Zap className="size-3 text-[#00E676] fill-[#00E676]" />
              <span>+ INVITE</span>
            </a>

            {/* Account / Dashboard Button */}
            {site.isPending ? (
              <Skeleton className="h-8 w-28 rounded-none border-2 border-black" />
            ) : (
              site.data?.dashboard === true && <AccountLink />
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden inline-flex size-9 items-center justify-center rounded-none border-2 border-black dark:border-zinc-700 bg-card text-foreground shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b-2 border-black dark:border-zinc-800 bg-background px-4 py-4 animate-in slide-in-from-top-2 duration-100">
            <nav className="flex flex-col gap-2 font-mono text-xs font-black uppercase">
              <Link
                to="/#top"
                onClick={() => setMobileMenuOpen(false)}
                className="border-2 border-black dark:border-zinc-800 bg-card p-2 text-foreground"
              >
                [ 01 // OVERVIEW ]
              </Link>
              <a
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="border-2 border-black dark:border-zinc-800 bg-card p-2 text-foreground"
              >
                [ 02 // FEATURES ]
              </a>
              <a
                href="/#commands"
                onClick={() => setMobileMenuOpen(false)}
                className="border-2 border-black dark:border-zinc-800 bg-card p-2 text-foreground"
              >
                [ 03 // COMMAND MATRIX ]
              </a>
              <a
                href={SUPPORT_SERVER_URL}
                target="_blank"
                rel="noreferrer"
                className="border-2 border-black dark:border-zinc-800 bg-[#00E676] p-2 text-black flex items-center justify-between"
              >
                <span>[ COMMUNITY SUPPORT DISCORD ]</span>
                <ExternalLink className="size-4" />
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1 w-full brutal-grid">
        <Outlet />
      </main>

      {/* Neo-Brutalist Site Footer */}
      <SiteFooter
        version={site.data?.version ?? bot.data?.version}
        repository={site.data?.repository ?? bot.data?.repositoryUrl}
        name={name}
      />
    </div>
  );
}

function AppearanceLink(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Tooltip label={t("nav.appearanceHint")}>
      <NavLink
        to="/appearance"
        aria-label={t("nav.appearance")}
        className={({ isActive }) =>
          cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-none border-2 border-black dark:border-zinc-700 transition-all duration-100",
            isActive
              ? "bg-[#00E676] text-black shadow-[2px_2px_0px_#000000]"
              : "bg-card text-foreground hover:bg-muted shadow-[1px_1px_0px_#000000]"
          )
        }
      >
        <Palette size={14} aria-hidden="true" />
      </NavLink>
    </Tooltip>
  );
}

function AccountLink(): React.JSX.Element {
  const { t } = useTranslation();
  const me = useMe();
  const signedIn = me.data !== null && me.data !== undefined;

  if (me.isPending) return <Skeleton className="h-8 w-28 rounded-none border-2 border-black" />;

  return (
    <Link
      to={signedIn ? "/guilds" : "/sign-in"}
      className="inline-flex h-8 items-center gap-1.5 rounded-none border-2 border-black dark:border-zinc-700 bg-primary px-3 text-xs font-mono font-black uppercase tracking-wider text-primary-foreground shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#00E676] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      <span>{signedIn ? t("site.openDashboard") : t("site.signIn")}</span>
      <ChevronRight className="size-3.5 stroke-[3]" />
    </Link>
  );
}

function SiteFooter({
  version,
  repository,
  name
}: {
  version: string | undefined;
  repository: string | undefined;
  name: string;
}): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <footer className="mt-20 border-t-2 border-black dark:border-zinc-800 bg-card pt-12 pb-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-3 bg-[#00E676] border border-black shadow-[1px_1px_0px_#000000]" />
              <span className="font-display text-lg font-black tracking-tight text-foreground uppercase">
                {name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm font-sans">
              Autonomous Discord management and security operating system. Built with zero-latency AutoMod shields, interactive ticket transcript archives, and comprehensive server analytics.
            </p>
            <div className="flex items-center gap-2.5 pt-1 text-xs font-mono font-bold text-foreground">
              <span className="flex h-2 w-2 bg-[#00E676]" />
              <span>TELEMETRY FORWARDING TO #1568284208533864498</span>
            </div>
          </div>

          {/* Column: Core Resources */}
          <div className="flex flex-col gap-2.5 font-mono text-xs">
            <div className="font-black uppercase tracking-wider text-foreground">[ SYSTEM ]</div>
            <a
              href="/#commands"
              className="text-muted-foreground hover:text-[#00E676] transition-colors"
            >
              Command Matrix
            </a>
            <a
              href="/#features"
              className="text-muted-foreground hover:text-[#00E676] transition-colors"
            >
              Core Architecture
            </a>
            <a
              href={SUPPORT_SERVER_URL}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-[#00E676] transition-colors flex items-center gap-1"
            >
              <span>Support Discord</span>
              <ExternalLink className="size-3" />
            </a>
          </div>

          {/* Column: Control Center */}
          <div className="flex flex-col gap-2.5 font-mono text-xs">
            <div className="font-black uppercase tracking-wider text-foreground">[ CONSOLE ]</div>
            <Link
              to="/guilds"
              className="text-muted-foreground hover:text-[#00E676] transition-colors"
            >
              Server Dashboard
            </Link>
            <Link
              to="/sign-in"
              className="text-muted-foreground hover:text-[#00E676] transition-colors"
            >
              Discord OAuth Login
            </Link>
            <Link
              to="/appearance"
              className="text-muted-foreground hover:text-[#00E676] transition-colors"
            >
              Theme Engine
            </Link>
          </div>

          {/* Column: Legal & Compliance */}
          <div className="flex flex-col gap-2.5 font-mono text-xs">
            <div className="font-black uppercase tracking-wider text-foreground">[ COMPLIANCE ]</div>
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-[#00E676] transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-[#00E676] transition-colors"
            >
              Privacy Policy
            </Link>
            <a
              href="https://discord.com/safety"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-[#00E676] transition-colors"
            >
              Discord TOS & Guidelines
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-black dark:border-zinc-800 pt-6 font-mono text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} TOGETHER HELPER. ALL RIGHTS RESERVED.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-muted px-2 py-0.5 border border-black dark:border-zinc-700 font-bold text-foreground">
              v{version ?? "2.2.0"}
            </span>
            <span className="text-[#00E676] font-bold">● CLUSTER OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
