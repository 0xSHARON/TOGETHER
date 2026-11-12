import { ChevronRight, ExternalLink, Menu, Palette, Users, X, Zap } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet } from "react-router";
import { BotMark } from "@/components/brand/BotMark";
import { LanguageSelect } from "@/components/form/LanguageSelect";
import { Skeleton, Tooltip } from "@/components/primitives";
import { useBot, useBotLook } from "@/features/auth/useBot";
import { useMe } from "@/features/auth/useMe";
import { useSite } from "@/features/site/useSite";
import { BUILT_IN_BOT_NAME } from "@/lib/brand";
import { cn } from "@/lib/cn";

const FALLBACK_INVITE_URL =
	"https://discord.com/oauth2/authorize?client_id=1568056736424792185&permissions=8&integration_type=0&scope=bot+applications.commands";
const SUPPORT_SERVER_URL = "https://discord.gg/mUdGTs2Dw5";

export function SiteShell({ column = false }: { column?: boolean }): React.JSX.Element {
	const { t } = useTranslation();
	const bot = useBot();
	const look = useBotLook();
	const site = useSite();
	const name = look.name ?? BUILT_IN_BOT_NAME;
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const inviteUrl =
		bot.data?.id !== undefined
			? `https://discord.com/oauth2/authorize?client_id=${bot.data.id}&permissions=8&integration_type=0&scope=bot+applications.commands`
			: FALLBACK_INVITE_URL;

	return (
		<div className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground flex min-h-dvh flex-col antialiased">
			<a
				href="#content"
				className="bg-primary text-primary-foreground border-border brutal-shadow-sm sr-only rounded-chip border-2 px-3 py-2 font-mono text-xs font-bold uppercase focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
			>
				{t("nav.skipToContent")}
			</a>

			{/* Neo-Brutalist Broadcast Ticker */}
			<div className="border-border bg-primary text-primary-foreground flex w-full items-center justify-center gap-3 border-b-2 px-4 py-1 text-center font-mono text-xs font-bold tracking-widest uppercase">
				<span aria-hidden="true" className="bg-primary-foreground size-2 shrink-0" />
				<span>{name} // CONTROL SURFACE</span>
				{site.data?.version !== undefined && (
					<span className="hidden sm:inline">• {t("site.version", { version: site.data.version })}</span>
				)}
			</div>

			{/* High-Contrast Architectural Header */}
			<header className="border-border bg-background sticky top-0 z-40 w-full border-b-2">
				<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
					<Link
						to="/"
						onClick={() => {
							setMobileMenuOpen(false);
						}}
						aria-label={t("site.home", { bot: name })}
						className="flex items-center gap-3 transition-transform duration-100 hover:-translate-y-0.5"
					>
						<div className="relative flex items-center justify-center">
							<BotMark
								src={look.avatarUrl}
								name={name}
								size={36}
								className="rounded-field border-border brutal-shadow-sm border-2"
							/>
							<span
								aria-hidden="true"
								className="bg-success border-border rounded-chip absolute -right-1 -bottom-1 size-2.5 border"
							/>
						</div>
						<div className="flex flex-col">
							<span className="font-display flex items-center gap-2 text-lg leading-tight font-black tracking-tight uppercase">
								<span>{name}</span>
								<span className="rounded-chip bg-accent-wash text-accent border-border border-2 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest">
									HELPER
								</span>
							</span>
							<span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
								AUTONOMOUS DISCORD OS
							</span>
						</div>
					</Link>

					<nav aria-label={t("site.nav")} className="hidden items-center gap-2 md:flex">
						<Link
							to="/#top"
							className="rounded-field border-transparent hover:border-border text-muted-foreground hover:text-foreground hover:bg-muted border-2 px-3 py-1 font-mono text-xs font-bold tracking-wider uppercase transition-all duration-100"
						>
							[ OVERVIEW ]
						</Link>
						<a
							href="/#features"
							className="rounded-field border-transparent hover:border-border text-muted-foreground hover:text-foreground hover:bg-muted border-2 px-3 py-1 font-mono text-xs font-bold tracking-wider uppercase transition-all duration-100"
						>
							[ FEATURES ]
						</a>
						<a
							href="/#commands"
							className="rounded-field border-transparent hover:border-border text-muted-foreground hover:text-foreground hover:bg-muted border-2 px-3 py-1 font-mono text-xs font-bold tracking-wider uppercase transition-all duration-100"
						>
							[ COMMAND MATRIX ]
						</a>
						<Link
							to="/docs"
							className="rounded-field border-transparent hover:border-border text-muted-foreground hover:text-foreground hover:bg-muted border-2 px-3 py-1 font-mono text-xs font-bold tracking-wider uppercase transition-all duration-100"
						>
							[ {t("site.docs")} ]
						</Link>
						<a
							href={SUPPORT_SERVER_URL}
							target="_blank"
							rel="noreferrer"
							className="rounded-field border-transparent hover:border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2 border-2 px-3 py-1 font-mono text-xs font-bold tracking-wider uppercase transition-all duration-100"
						>
							<Users className="size-3.5" aria-hidden="true" />
							<span>[ SUPPORT ]</span>
						</a>
					</nav>

					<div className="flex items-center gap-2">
						<LanguageSelect className="hidden rounded-field border-2 sm:inline-flex" />
						<AppearanceLink />

						<a
							href={inviteUrl}
							target="_blank"
							rel="noreferrer"
							className="brutal-btn bg-card text-foreground hidden items-center gap-2 rounded-field px-3 py-1.5 font-mono text-xs sm:inline-flex"
						>
							<Zap className="text-accent size-3.5" aria-hidden="true" />
							<span>+ {t("landing.invite")}</span>
						</a>

						{site.isPending ? (
							<Skeleton className="border-border h-9 w-28 rounded-field border-2" />
						) : (
							site.data?.dashboard === true && <AccountLink />
						)}

						<button
							type="button"
							onClick={() => {
								setMobileMenuOpen((was) => !was);
							}}
							aria-expanded={mobileMenuOpen}
							aria-label={t("nav.menu")}
							className="border-border bg-card text-foreground brutal-shadow-sm inline-flex size-9 cursor-pointer items-center justify-center rounded-field border-2 md:hidden"
						>
							{mobileMenuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
						</button>
					</div>
				</div>

				{mobileMenuOpen && (
					<div className="border-border bg-background border-t-2 px-4 py-4 md:hidden">
						<nav aria-label={t("site.nav")} className="flex flex-col gap-2 font-mono text-xs font-bold uppercase">
							<Link
								to="/#top"
								onClick={() => {
									setMobileMenuOpen(false);
								}}
								className="border-border bg-card text-foreground rounded-field brutal-shadow-sm border-2 p-3"
							>
								[ 01 // OVERVIEW ]
							</Link>
							<a
								href="/#features"
								onClick={() => {
									setMobileMenuOpen(false);
								}}
								className="border-border bg-card text-foreground rounded-field brutal-shadow-sm border-2 p-3"
							>
								[ 02 // FEATURES ]
							</a>
							<a
								href="/#commands"
								onClick={() => {
									setMobileMenuOpen(false);
								}}
								className="border-border bg-card text-foreground rounded-field brutal-shadow-sm border-2 p-3"
							>
								[ 03 // COMMAND MATRIX ]
							</a>
							<Link
								to="/docs"
								onClick={() => {
									setMobileMenuOpen(false);
								}}
								className="border-border bg-card text-foreground rounded-field brutal-shadow-sm border-2 p-3"
							>
								[ 04 // {t("site.docs")} ]
							</Link>
							<a
								href={SUPPORT_SERVER_URL}
								target="_blank"
								rel="noreferrer"
								className="bg-primary text-primary-foreground border-border brutal-shadow-sm flex items-center justify-between rounded-field border-2 p-3"
							>
								<span>[ COMMUNITY SUPPORT DISCORD ]</span>
								<ExternalLink className="size-4" aria-hidden="true" />
							</a>
						</nav>
					</div>
				)}
			</header>

			{column ? (
				<div className="brutal-grid w-full flex-1">
					<Outlet />
				</div>
			) : (
				<main id="content" className="brutal-grid w-full flex-1">
					<Outlet />
				</main>
			)}

			<SiteFooter version={site.data?.version} repository={site.data?.repository} name={name} />
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
						"border-border brutal-shadow-sm inline-flex size-9 shrink-0 items-center justify-center rounded-field border-2 transition-all duration-100",
						isActive
							? "bg-primary text-primary-foreground"
							: "bg-card text-foreground hover:bg-muted",
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

	if (me.isPending) return <Skeleton className="border-border h-9 w-28 rounded-field border-2" />;

	return (
		<Link
			to={signedIn ? "/guilds" : "/sign-in"}
			className="brutal-btn brutal-btn-primary inline-flex h-9 items-center gap-2 rounded-field px-3 font-mono text-xs"
		>
			<span>{signedIn ? t("site.openDashboard") : t("site.signIn")}</span>
			<ChevronRight className="size-3.5" aria-hidden="true" />
		</Link>
	);
}

function SiteFooter({
	version,
	repository,
	name,
}: {
	version: string | undefined;
	repository: string | undefined;
	name: string;
}): React.JSX.Element {
	const { t } = useTranslation();

	return (
		<footer className="border-border bg-card mt-16 border-t-2 pt-12 pb-8">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-5">
					<div className="flex flex-col gap-3 md:col-span-2">
						<div className="flex items-center gap-2">
							<span aria-hidden="true" className="bg-primary border-border brutal-shadow-sm size-3 border-2" />
							<span className="font-display text-lg font-black tracking-tight uppercase">{name}</span>
						</div>
						<p className="text-muted-foreground max-w-sm text-xs leading-relaxed">
							{t("landing.lede", { bot: name })}
						</p>
						<div className="flex items-center gap-2 pt-1 font-mono text-xs font-bold">
							<span aria-hidden="true" className="bg-success rounded-chip size-2" />
							<span className="text-accent">CLUSTER OPERATIONAL</span>
						</div>
					</div>

					<div className="flex flex-col gap-2 font-mono text-xs">
						<p className="text-foreground font-bold tracking-wider uppercase">[ SYSTEM ]</p>
						<a href="/#commands" className="text-muted-foreground hover:text-accent transition-colors">
							Command Matrix
						</a>
						<a href="/#features" className="text-muted-foreground hover:text-accent transition-colors">
							Core Architecture
						</a>
						<Link to="/docs" className="text-muted-foreground hover:text-accent transition-colors">
							{t("site.docs")}
						</Link>
						{repository !== undefined && (
							<Link to="/source" className="text-muted-foreground hover:text-accent transition-colors">
								{t("site.source")}
							</Link>
						)}
						<a
							href={SUPPORT_SERVER_URL}
							target="_blank"
							rel="noreferrer"
							className="text-muted-foreground hover:text-accent flex items-center gap-1 transition-colors"
						>
							<span>Support Discord</span>
							<ExternalLink className="size-3" aria-hidden="true" />
						</a>
					</div>

					<div className="flex flex-col gap-2 font-mono text-xs">
						<p className="text-foreground font-bold tracking-wider uppercase">[ CONSOLE ]</p>
						<Link to="/guilds" className="text-muted-foreground hover:text-accent transition-colors">
							{t("site.openDashboard")}
						</Link>
						<Link to="/sign-in" className="text-muted-foreground hover:text-accent transition-colors">
							{t("auth.signInWith")}
						</Link>
						<Link to="/appearance" className="text-muted-foreground hover:text-accent transition-colors">
							{t("nav.appearance")}
						</Link>
						<Link to="/status" className="text-muted-foreground hover:text-accent transition-colors">
							{t("nav.status")}
						</Link>
					</div>

					<div className="flex flex-col gap-2 font-mono text-xs">
						<p className="text-foreground font-bold tracking-wider uppercase">[ COMPLIANCE ]</p>
						<Link to="/terms" className="text-muted-foreground hover:text-accent transition-colors">
							{t("site.terms")}
						</Link>
						<Link to="/privacy" className="text-muted-foreground hover:text-accent transition-colors">
							{t("site.privacy")}
						</Link>
						<a
							href="https://discord.com/safety"
							target="_blank"
							rel="noreferrer"
							className="text-muted-foreground hover:text-accent transition-colors"
						>
							Discord Terms
						</a>
					</div>
				</div>

				<div className="border-border text-muted-foreground flex flex-col items-center justify-between gap-4 border-t-2 pt-6 font-mono text-xs sm:flex-row">
					<p>
						© {new Date().getFullYear()} {name.toUpperCase()}. ALL RIGHTS RESERVED.
					</p>
					<div className="flex items-center gap-3">
						{version !== undefined && (
							<span className="bg-muted border-border text-foreground rounded-chip border-2 px-2 py-0.5 font-bold">
								{t("site.version", { version })}
							</span>
						)}
						<span className="text-accent font-bold">READY</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
