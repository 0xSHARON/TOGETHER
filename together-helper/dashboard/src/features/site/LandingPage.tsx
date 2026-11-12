import {
	Activity,
	ArrowRight,
	Check,
	Coins,
	Copy,
	ExternalLink,
	Gift,
	Search,
	ShieldCheck,
	Ticket,
	Users,
	Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { Skeleton } from "@/components/primitives";
import { useBot } from "@/features/auth/useBot";
import { useMe } from "@/features/auth/useMe";
import { Composer } from "@/features/site/components/Composer";
import { paletteFrom } from "@/features/site/composer.utils";
import { useSite } from "@/features/site/useSite";
import { usePageTitle } from "@/hooks/usePageTitle";
import { BUILT_IN_BOT_NAME, rememberedBotName } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { hardRedirect } from "@/lib/redirect";

const FALLBACK_INVITE_URL =
	"https://discord.com/oauth2/authorize?client_id=1568056736424792185&permissions=8&integration_type=0&scope=bot+applications.commands";
const SUPPORT_SERVER_URL = "https://discord.gg/mUdGTs2Dw5";

const COMMAND_MARKDOWN = `
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

const PUBLIC_COMMANDS: readonly PublicCommand[] = [
	{ name: "ban", category: "Moderation", description: "Ban a disruptive member and wipe message history", syntax: "/ban <user> [reason] [days]" },
	{ name: "kick", category: "Moderation", description: "Kick a member from the server with audit logging", syntax: "/kick <user> [reason]" },
	{ name: "timeout", category: "Moderation", description: "Temporarily mute a user for up to 28 days", syntax: "/timeout <user> <duration> [reason]" },
	{ name: "untimeout", category: "Moderation", description: "Remove timeout punishment early from a member", syntax: "/untimeout <user> [reason]" },
	{ name: "warn", category: "Moderation", description: "Issue a formal infraction strike against a member", syntax: "/warn <user> <reason>" },
	{ name: "warnings", category: "Moderation", description: "View active and historical warning strikes for a user", syntax: "/warnings <user>" },
	{ name: "clear", category: "Moderation", description: "Bulk purge up to 100 messages from the active channel", syntax: "/clear <amount> [user]" },
	{ name: "lock", category: "Moderation", description: "Lock down channel permissions to pause public posting", syntax: "/lock [channel] [reason]" },
	{ name: "unlock", category: "Moderation", description: "Restore public posting permissions to a locked channel", syntax: "/unlock [channel]" },
	{ name: "slowmode", category: "Moderation", description: "Set message cooldown rate limiting on a channel", syntax: "/slowmode <seconds>" },
	{ name: "ticket", category: "Support", description: "Create, claim, or manage private staff support tickets", syntax: "/ticket [action]" },
	{ name: "transcript", category: "Support", description: "Export a standalone HTML transcript of a support ticket", syntax: "/transcript" },
	{ name: "close", category: "Support", description: "Gracefully resolve and archive a support ticket channel", syntax: "/close [reason]" },
	{ name: "giveaway start", category: "Giveaways", description: "Launch an interactive giveaway with countdown and entry button", syntax: "/giveaway start <duration> <winners> <prize>" },
	{ name: "giveaway reroll", category: "Giveaways", description: "Pick replacement winners for an ended giveaway", syntax: "/giveaway reroll <message_id>" },
	{ name: "giveaway end", category: "Giveaways", description: "Conclude an active giveaway immediately and pick winners", syntax: "/giveaway end <message_id>" },
	{ name: "automod", category: "Admin", description: "Configure anti-spam, invite shielding, and word filters", syntax: "/automod <setting> <value>" },
	{ name: "verify", category: "Admin", description: "Set up an interactive button or modal verification panel", syntax: "/verify setup <channel> <role>" },
	{ name: "autorole", category: "Admin", description: "Configure automatic role assignments for new members", syntax: "/autorole <role>" },
	{ name: "sticky", category: "Admin", description: "Pin persistent messages that stay at the bottom of a channel", syntax: "/sticky <message>" },
	{ name: "rank", category: "Economy", description: "View your experience points, level, and progress card", syntax: "/rank [user]" },
	{ name: "leaderboard", category: "Economy", description: "View the server top XP, balance, and activity leaderboard", syntax: "/leaderboard" },
	{ name: "balance", category: "Economy", description: "Check your wallet and bank coins balance", syntax: "/balance [user]" },
	{ name: "daily", category: "Economy", description: "Claim your 24-hour reward coins bonus streak", syntax: "/daily" },
	{ name: "lottery", category: "Economy", description: "Enter the community jackpot prize draw", syntax: "/lottery" },
	{ name: "afk", category: "Utility", description: "Set your AFK status with a custom notification note", syntax: "/afk <reason>" },
	{ name: "poll", category: "Utility", description: "Create an interactive voting poll with custom options", syntax: "/poll <question> <options>" },
	{ name: "remind", category: "Utility", description: "Schedule a reminder notification for yourself or a channel", syntax: "/remind <duration> <task>" },
	{ name: "whois", category: "Utility", description: "Inspect account info, avatar, permissions, and roles", syntax: "/whois [user]" },
	{ name: "serverinfo", category: "Utility", description: "View server owner, boosts, channels, and statistics", syntax: "/serverinfo" },
];

const CATEGORIES = ["ALL", "Moderation", "Support", "Giveaways", "Economy", "Admin", "Utility"] as const;

export function LandingPage(): React.JSX.Element {
	const { t } = useTranslation();
	usePageTitle(t("landing.pageTitle"));
	const site = useSite();
	const bot = useBot();
	const palette = useMemo(() => paletteFrom(COMMAND_MARKDOWN), []);
	const name = bot.data?.name ?? rememberedBotName() ?? BUILT_IN_BOT_NAME;
	const invite =
		bot.data?.id !== undefined
			? `https://discord.com/oauth2/authorize?client_id=${bot.data.id}&permissions=8&integration_type=0&scope=bot+applications.commands`
			: FALLBACK_INVITE_URL;
	const erased = (useLocation().state as { erased?: boolean } | null)?.erased === true;

	const [activeCategory, setActiveCategory] = useState<string>("ALL");
	const [searchQuery, setSearchQuery] = useState("");
	const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

	function handleCopy(syntax: string): void {
		void navigator.clipboard.writeText(syntax);
		setCopiedCmd(syntax);
		setTimeout(() => {
			setCopiedCmd((current) => (current === syntax ? null : current));
		}, 1800);
	}

	const filteredCommands = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();
		return PUBLIC_COMMANDS.filter((cmd) => {
			const matchCategory = activeCategory === "ALL" || cmd.category === activeCategory;
			const matchSearch =
				q === "" ||
				cmd.name.toLowerCase().includes(q) ||
				cmd.description.toLowerCase().includes(q) ||
				cmd.syntax.toLowerCase().includes(q);
			return matchCategory && matchSearch;
		});
	}, [activeCategory, searchQuery]);

	const capabilities = [
		{
			code: "01",
			icon: ShieldCheck,
			tint: "text-accent",
			title: t("landing.features.moderation"),
			body: t("landing.features.moderationBody"),
			footer: "ACTIVE RULES: 14 POLICIES",
		},
		{
			code: "02",
			icon: Ticket,
			tint: "text-hue-blue",
			title: t("landing.features.tickets"),
			body: t("landing.features.ticketsBody"),
			footer: "HTML TRANSCRIPTS: READY",
		},
		{
			code: "03",
			icon: Gift,
			tint: "text-hue-amber",
			title: "Button Giveaways",
			body: "Instant Discord button entry, live countdowns, anti-alt guards, and verifiable winner rerolls.",
			footer: "REROLL ENGINE: 1-CLICK",
		},
		{
			code: "04",
			icon: Coins,
			tint: "text-hue-green",
			title: t("landing.features.casino"),
			body: t("landing.features.casinoBody"),
			footer: "CUSTOM RANK CARDS: ENABLED",
		},
		{
			code: "05",
			icon: Users,
			tint: "text-hue-violet",
			title: t("landing.features.community"),
			body: t("landing.features.communityBody"),
			footer: "AUTOROLE & VERIFY: ACTIVE",
		},
		{
			code: "06",
			icon: Activity,
			tint: "text-hue-pink",
			title: "Audit & Live Stream",
			body: "Structured moderation cases, command telemetry, and real-time audit forwarding across channels.",
			footer: "REALTIME AUDIT TRAIL",
		},
	];

	return (
		<div id="top" className="text-foreground mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
			{erased && (
				<p role="status" className="bg-card border-border text-accent rounded-card brutal-shadow border-2 px-4 py-3 font-mono text-sm font-bold">
					{t("account.erased")}
				</p>
			)}

			{/* Neo-Brutalist High-Impact Hero */}
			<section
				aria-labelledby="landing-title"
				className="bg-card border-border rounded-card brutal-shadow-lg relative border-2 p-6 sm:p-12"
			>
				<div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
					<div className="flex flex-col items-start gap-6 lg:col-span-7">
						<div className="border-border bg-background rounded-chip brutal-shadow-sm inline-flex items-center gap-2 border-2 px-3 py-1 font-mono text-xs font-bold tracking-widest uppercase">
							<span aria-hidden="true" className="bg-success rounded-chip size-2" />
							<span>{t("landing.eyebrow")}</span>
							<span aria-hidden="true" className="text-muted-foreground">
								•
							</span>
							<span className="text-accent">
								{site.data?.version !== undefined ? t("site.version", { version: site.data.version }) : name}
							</span>
						</div>

						<h1
							id="landing-title"
							className="font-display text-4xl leading-[1.04] font-black tracking-tight uppercase sm:text-5xl lg:text-6xl"
						>
							{t("landing.title")}
							<span className="bg-primary text-primary-foreground border-border rounded-chip brutal-shadow mt-3 inline-block border-2 px-3 py-1 text-2xl sm:text-3xl">
								AUTONOMOUS DISCORD OS.
							</span>
						</h1>

						<p className="text-muted-foreground max-w-xl font-mono text-sm leading-relaxed font-medium sm:text-base">
							{t("landing.lede", { bot: name })}
						</p>

						<div className="flex w-full flex-wrap items-center gap-4 pt-2">
							{site.isPending ? (
								<Skeleton className="border-border h-11 w-44 rounded-field border-2" />
							) : site.data?.dashboard === true ? (
								<SignedInAware invite={invite} />
							) : (
								<a
									href={invite}
									target="_blank"
									rel="noreferrer"
									className="brutal-btn brutal-btn-primary inline-flex min-h-11 items-center gap-2 rounded-field px-6 py-3 font-mono text-sm"
								>
									<Zap className="size-4" aria-hidden="true" />
									<span>{t("landing.invite")}</span>
								</a>
							)}

							<a
								href={SUPPORT_SERVER_URL}
								target="_blank"
								rel="noreferrer"
								className="brutal-btn bg-background text-foreground inline-flex min-h-11 items-center gap-2 rounded-field px-4 py-3 font-mono text-xs"
							>
								<Users className="size-4" aria-hidden="true" />
								<span>SUPPORT DISCORD</span>
							</a>
						</div>

						{/* Architectural Telemetry Strip */}
						<div className="grid w-full max-w-md grid-cols-3 gap-3 pt-2 font-mono text-xs">
							<div className="border-border bg-background rounded-card brutal-shadow-sm border-2 p-3">
								<div className="text-muted-foreground text-[10px] font-bold">COMMANDS</div>
								<div className="font-display text-accent text-base font-black">{PUBLIC_COMMANDS.length}+ CORE</div>
							</div>
							<div className="border-border bg-background rounded-card brutal-shadow-sm border-2 p-3">
								<div className="text-muted-foreground text-[10px] font-bold">INTERFACE</div>
								<div className="font-display text-foreground text-base font-black">SLASH + WEB</div>
							</div>
							<div className="border-border bg-background rounded-card brutal-shadow-sm border-2 p-3">
								<div className="text-muted-foreground text-[10px] font-bold">RUNTIME</div>
								<div className="font-display text-foreground text-base font-black">OPEN SOURCE</div>
							</div>
						</div>
					</div>

					{/* Interactive Command Composer Showcase */}
					<div className="flex flex-col items-stretch justify-center lg:col-span-5">
						<Composer palette={palette} />
					</div>
				</div>
			</section>

			{/* Capabilities Bento Matrix */}
			<section id="features" aria-labelledby="features-heading" className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<p className="text-accent font-mono text-xs font-bold tracking-widest uppercase">
						[ SECTION 02 // ARCHITECTURE ]
					</p>
					<h2 id="features-heading" className="font-display text-2xl font-black tracking-tight uppercase sm:text-4xl">
						{t("landing.featuresTitle", { bot: name })}
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{capabilities.map(({ code, icon: Icon, tint, title, body, footer }) => (
						<article
							key={code}
							className="brutal-card rounded-card flex flex-col justify-between gap-4 p-6"
						>
							<div className="flex flex-col gap-3">
								<div className="flex items-center justify-between">
									<div className="border-border bg-muted rounded-field brutal-shadow-sm flex size-10 items-center justify-center border-2">
										<Icon className={cn("size-5", tint)} aria-hidden="true" />
									</div>
									<span className="text-muted-foreground font-mono text-xs font-bold uppercase">[ {code} ]</span>
								</div>
								<h3 className="font-display text-lg font-black uppercase">{title}</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
							</div>
							<div className={cn("border-border border-t-2 pt-3 font-mono text-[11px] font-bold uppercase", tint)}>
								{footer}
							</div>
						</article>
					))}
				</div>
			</section>

			{/* Interactive Command Matrix */}
			<section id="commands" aria-labelledby="commands-heading" className="flex flex-col gap-6">
				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
					<div className="flex flex-col gap-2">
						<p className="text-accent font-mono text-xs font-bold tracking-widest uppercase">
							[ SECTION 03 // COMMAND CATALOG ]
						</p>
						<h2 id="commands-heading" className="font-display text-2xl font-black tracking-tight uppercase sm:text-4xl">
							COMMAND MATRIX
						</h2>
					</div>

					<label className="relative w-full sm:w-72">
						<span className="sr-only">Search commands</span>
						<Search
							className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
							aria-hidden="true"
						/>
						<input
							type="search"
							value={searchQuery}
							onChange={(event) => {
								setSearchQuery(event.target.value);
							}}
							placeholder="SEARCH COMMANDS…"
							className="border-input bg-card text-foreground placeholder-muted-foreground focus-visible:border-ring rounded-field brutal-shadow-sm w-full border-2 py-2 pr-4 pl-9 font-mono text-xs font-bold focus-visible:outline-none"
						/>
					</label>
				</div>

				<div className="flex flex-wrap gap-2" role="group" aria-label="Filter command categories">
					{CATEGORIES.map((category) => (
						<button
							key={category}
							type="button"
							aria-pressed={activeCategory === category}
							onClick={() => {
								setActiveCategory(category);
							}}
							className={cn(
								"border-border cursor-pointer rounded-field border-2 px-3 py-1 font-mono text-xs font-bold tracking-wider uppercase transition-all duration-100",
								activeCategory === category
									? "bg-primary text-primary-foreground brutal-shadow-sm"
									: "bg-card text-muted-foreground hover:text-foreground hover:bg-muted",
							)}
						>
							[ {category} ]
						</button>
					))}
				</div>

				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{filteredCommands.length > 0 ? (
						filteredCommands.map((cmd) => {
							const isCopied = copiedCmd === cmd.syntax;
							return (
								<button
									key={cmd.name}
									type="button"
									onClick={() => {
										handleCopy(cmd.syntax);
									}}
									aria-label={`Copy ${cmd.syntax}`}
									className="brutal-card rounded-card group flex cursor-pointer flex-col justify-between gap-4 p-4 text-left"
								>
									<div className="flex flex-col gap-2">
										<div className="flex items-center justify-between gap-2">
											<span className="text-accent font-mono text-sm font-bold group-hover:underline">/{cmd.name}</span>
											<span className="border-border bg-muted text-foreground rounded-chip border px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
												{cmd.category}
											</span>
										</div>
										<p className="text-muted-foreground text-xs leading-relaxed">{cmd.description}</p>
									</div>
									<div className="border-border bg-background text-foreground rounded-field flex w-full items-center justify-between border-2 px-2.5 py-1.5 font-mono text-xs">
										<span className="truncate">{cmd.syntax}</span>
										<span className="ml-2 shrink-0">
											{isCopied ? (
												<Check className="text-success size-3.5" aria-hidden="true" />
											) : (
												<Copy className="text-muted-foreground group-hover:text-foreground size-3.5" aria-hidden="true" />
											)}
										</span>
									</div>
								</button>
							);
						})
					) : (
						<div className="brutal-stripe border-border text-muted-foreground rounded-card col-span-full border-2 border-dashed p-6 py-12 text-center font-mono text-sm font-bold">
							NO COMMANDS MATCHING &ldquo;{searchQuery}&rdquo; IN CATEGORY {activeCategory}.
						</div>
					)}
				</div>
			</section>

			{/* Bottom Deployment CTA */}
			<section className="bg-card border-border rounded-card brutal-shadow-lg flex flex-col items-center gap-6 border-2 p-8 text-center sm:p-12">
				<div className="border-border bg-accent-wash text-accent rounded-chip brutal-shadow-sm inline-flex items-center gap-2 border-2 px-3 py-1 font-mono text-xs font-bold uppercase">
					<Zap className="size-3.5" aria-hidden="true" />
					<span>{t("landing.openSource")}</span>
				</div>

				<h2 className="font-display max-w-2xl text-3xl font-black tracking-tight uppercase sm:text-4xl">
					{t("landing.selfHost.title")}
				</h2>
				<p className="text-muted-foreground max-w-xl font-mono text-xs sm:text-sm">
					{t("landing.selfHost.body", { bot: name })}
				</p>
				<div className="flex flex-wrap items-center justify-center gap-4 pt-2">
					<a
						href={invite}
						target="_blank"
						rel="noreferrer"
						className="brutal-btn brutal-btn-primary inline-flex min-h-11 items-center gap-2 rounded-field px-6 py-3 font-mono text-sm"
					>
						<span>{t("landing.invite")}</span>
						<ExternalLink className="size-4" aria-hidden="true" />
					</a>
					<Link
						to="/docs"
						className="brutal-btn bg-background text-foreground inline-flex min-h-11 items-center gap-2 rounded-field px-6 py-3 font-mono text-xs"
					>
						<span>{t("landing.runYourOwn")}</span>
						<ArrowRight className="size-4" aria-hidden="true" />
					</Link>
				</div>
			</section>
		</div>
	);
}

function SignedInAware({ invite }: { invite: string }): React.JSX.Element {
	const { t } = useTranslation();
	const me = useMe();

	if (me.isPending) return <Skeleton className="border-border h-11 w-44 rounded-field border-2" />;

	if (me.data !== null && me.data !== undefined) {
		return (
			<div className="flex flex-wrap items-center gap-3">
				<Link
					to="/guilds"
					className="brutal-btn brutal-btn-primary inline-flex min-h-11 items-center gap-2 rounded-field px-6 py-3 font-mono text-sm"
				>
					<span>{t("site.openDashboard")}</span>
					<ArrowRight className="size-4" aria-hidden="true" />
				</Link>
				<a
					href={invite}
					target="_blank"
					rel="noreferrer"
					className="brutal-btn bg-card text-foreground inline-flex min-h-11 items-center gap-2 rounded-field px-4 py-3 font-mono text-xs"
				>
					<Zap className="text-accent size-4" aria-hidden="true" />
					<span>{t("landing.invite")}</span>
				</a>
			</div>
		);
	}

	return (
		<div className="flex flex-wrap items-center gap-3">
			<button
				type="button"
				onClick={() => {
					hardRedirect(`/api/auth/login?returnTo=${encodeURIComponent("/guilds")}`);
				}}
				className="brutal-btn brutal-btn-primary inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-field px-6 py-3 font-mono text-sm"
			>
				<span>{t("auth.signInWith")}</span>
				<ArrowRight className="size-4" aria-hidden="true" />
			</button>
			<a
				href={invite}
				target="_blank"
				rel="noreferrer"
				className="brutal-btn bg-card text-foreground inline-flex min-h-11 items-center gap-2 rounded-field px-4 py-3 font-mono text-xs"
			>
				<Zap className="text-accent size-4" aria-hidden="true" />
				<span>{t("landing.invite")}</span>
			</a>
		</div>
	);
}
