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
    <div className="flex min-h-dvh flex-col bg-background text-foreground antialiased selection:bg-emerald-500 selection:text-black">
      {/* ─── Apple Frosted Glass Navigation Bar ───────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-2xl backdrop-saturate-150 transition-colors">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Apple Status Dot */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            aria-label={t("site.home")}
            className="flex items-center gap-3 transition-opacity hover:opacity-85"
          >
            <div className="relative flex items-center justify-center">
              <BotMark
                src={look.avatarUrl}
                name={name}
                size={34}
                className="rounded-2xl border border-white/10 shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                {name}
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider text-emerald-400 border border-emerald-500/20">
                  HELPER
                </span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground -mt-0.5 tracking-wider uppercase">
                Autonomous Discord OS
              </span>
            </div>
          </Link>

          {/* Apple Desktop Navigation Links */}
          <nav aria-label={t("site.nav")} className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/#top"
              className="rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted-foreground transition-all hover:bg-white/[0.06] hover:text-foreground"
            >
              OVERVIEW
            </Link>
            <a
              href="/#features"
              className="rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted-foreground transition-all hover:bg-white/[0.06] hover:text-foreground"
            >
              FEATURES
            </a>
            <a
              href="/#commands"
              className="rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted-foreground transition-all hover:bg-white/[0.06] hover:text-foreground"
            >
              COMMAND MATRIX
            </a>
            <a
              href={SUPPORT_SERVER_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted-foreground transition-all hover:bg-white/[0.06] hover:text-foreground flex items-center gap-1.5"
            >
              <Users className="size-3.5" />
              <span>SUPPORT</span>
            </a>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            <LanguageSelect className="hidden sm:inline-flex" />
            <AppearanceLink />

            {/* Apple Pill Invite CTA */}
            <a
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/60 px-4 py-1.5 text-xs font-medium text-foreground transition-all hover:border-emerald-500/40 hover:bg-card hover:scale-[1.02] active:scale-[0.98] shadow-xs"
            >
              <Zap className="size-3 text-emerald-400" />
              <span>+ INVITE</span>
            </a>

            {/* Account / Dashboard Button */}
            {site.isPending ? (
              <Skeleton className="h-8 w-28 rounded-full" />
            ) : (
              site.data?.dashboard === true && <AccountLink />
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden inline-flex size-9 items-center justify-center rounded-xl border border-border/80 bg-card/80 text-muted-foreground hover:text-foreground"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border/80 bg-background/95 px-4 py-4 backdrop-blur-2xl animate-in slide-in-from-top-4 duration-150">
            <nav className="flex flex-col gap-2 font-mono text-sm">
              <Link
                to="/#top"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-muted-foreground hover:bg-card hover:text-foreground"
              >
                OVERVIEW
              </Link>
              <a
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-muted-foreground hover:bg-card hover:text-foreground"
              >
                FEATURES
              </a>
              <a
                href="/#commands"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-muted-foreground hover:bg-card hover:text-foreground"
              >
                COMMAND MATRIX
              </a>
              <a
                href={SUPPORT_SERVER_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl px-3 py-2 text-muted-foreground hover:text-emerald-400 flex items-center justify-between"
              >
                <span>COMMUNITY SUPPORT</span>
                <ExternalLink className="size-4" />
              </a>
              <div className="pt-2 border-t border-border/80 flex flex-col gap-2">
                <a
                  href={inviteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-emerald-500 py-2.5 font-display font-semibold text-sm text-black shadow-md shadow-emerald-500/20"
                >
                  <Zap className="size-4 fill-black" />
                  <span>+ ADD TO DISCORD</span>
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ─── Main Content Canvas ──────────────────────────────────── */}
      <main
        id="main"
        className={cn(
          "flex-1",
          column && "mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-8 sm:px-6"
        )}
      >
        <Outlet />
      </main>

      {/* ─── Apple Style Minimalist Footer ────────────────────────── */}
      <SiteFooter
        version={site.data?.version}
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
            "inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-150",
            isActive
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
              : "border-border/80 bg-card/60 text-muted-foreground hover:border-border hover:text-foreground"
          )
        }
      >
        <Palette size={15} aria-hidden="true" />
      </NavLink>
    </Tooltip>
  );
}

function AccountLink(): React.JSX.Element {
  const { t } = useTranslation();
  const me = useMe();
  const signedIn = me.data !== null && me.data !== undefined;

  if (me.isPending) return <Skeleton className="h-8 w-28 rounded-full" />;

  return (
    <Link
      to={signedIn ? "/guilds" : "/sign-in"}
      className="inline-flex h-8 items-center gap-1.5 rounded-full bg-emerald-500 px-4 text-xs font-semibold tracking-wide text-black shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98]"
    >
      <span>{signedIn ? t("site.openDashboard") : t("site.signIn")}</span>
      <ChevronRight className="size-3.5 stroke-[2.5]" />
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
    <footer className="mt-20 border-t border-border/60 bg-card/40 backdrop-blur-xl pt-12 pb-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <span className="font-display text-base font-bold tracking-tight text-foreground uppercase">
                {name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm font-sans">
              Autonomous Discord management and security operating system. Built with zero-latency AutoMod shields, interactive ticket transcript archives, and comprehensive server analytics.
            </p>
            <div className="flex items-center gap-2.5 pt-1 text-xs font-mono text-muted-foreground">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>CLUSTER SYSTEM OPERATIONAL</span>
            </div>
          </div>

          {/* Column: Core Resources */}
          <div className="flex flex-col gap-2.5 font-sans text-xs">
            <div className="font-semibold uppercase tracking-wider text-foreground">PRODUCT</div>
            <a
              href="/#commands"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Command Matrix
            </a>
            <a
              href="/#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Capabilities
            </a>
            <Link to="/appearance" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.appearance")}
            </Link>
          </div>

          {/* Column: Community & Support */}
          <div className="flex flex-col gap-2.5 font-sans text-xs">
            <div className="font-semibold uppercase tracking-wider text-foreground">COMMUNITY</div>
            <a
              href={SUPPORT_SERVER_URL}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>Support Discord</span>
              <ExternalLink className="size-3" />
            </a>
            <a
              href={BOT_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>Add to Discord</span>
              <ExternalLink className="size-3" />
            </a>
            {repository && (
              <a
                href={repository}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="size-3" />
              </a>
            )}
          </div>

          {/* Column: Legal */}
          <div className="flex flex-col gap-2.5 font-sans text-xs">
            <div className="font-semibold uppercase tracking-wider text-foreground">LEGAL & TRUST</div>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("site.terms")}
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("site.privacy")}
            </Link>
            <span className="text-muted-foreground/60">GDPR & CCPA Compliant</span>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <div>
            © {new Date().getFullYear()} TOGETHER ECOSYSTEM. All rights reserved.
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            {version && <span>BUILD v{version}</span>}
            <span>NODE 24 • DISTRIBUTED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
