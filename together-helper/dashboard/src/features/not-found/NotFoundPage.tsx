import { Compass } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { BackLink, Card, EmptyState, PageHeader, PublicPage } from "@/components/primitives";
import { INLINE_TARGET } from "@/components/primitives/targetStyles";
import { usePageTitle } from "@/hooks/usePageTitle";
import { cn } from "@/lib/cn";

export function NotFoundContent(): React.JSX.Element {
	const { t } = useTranslation();
	usePageTitle(t("notFound.title"));
	const { pathname } = useLocation();

	return (
		<>
			<BackLink to="/guilds">{t("notFound.backToDashboard")}</BackLink>

			<PageHeader title={t("notFound.title")} subtitle={t("notFound.subtitle")} />

			<Card>
				<EmptyState
					icon={<Compass size={28} />}
					title={t("notFound.emptyTitle")}
					body={t("notFound.emptyBody")}
					action={
						<Link to="/guilds" className={cn(INLINE_TARGET, "text-accent hover:text-foreground text-sm")}>
							{t("notFound.toServers")}
						</Link>
					}
				/>
			</Card>

			{/* The address is the one thing that makes a bug report actionable, so it is printed rather than guessed at. */}
			<p className="border-border bg-card text-muted-foreground rounded-field brutal-shadow-sm border-2 px-3 py-2 font-mono text-xs font-bold break-all">
				<span>PATH // </span>
				<span>{pathname}</span>
			</p>
		</>
	);
}

export function NotFoundPage(): React.JSX.Element {
	return (
		<PublicPage>
			<NotFoundContent />
		</PublicPage>
	);
}
