import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { PAGE_TITLE } from "@/components/primitives/textStyles";

export function PageHeader({
	title,
	subtitle,
	server,
	action,
}: {
	title: string;
	subtitle?: string;
	server?: { id: string; name: string } | undefined;
	action?: ReactNode;
}): React.JSX.Element {
	const { t } = useTranslation();

	return (
		<header className="border-border flex flex-wrap items-start justify-between gap-4 border-b-2 pb-4">
			<div className="flex flex-col gap-2">
				{server !== undefined && (
					<nav aria-label={t("nav.breadcrumb")} className="flex items-center">
						<Link
							to={`/guilds/${server.id}`}
							className="border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-accent-wash hover:border-accent rounded-chip brutal-shadow-sm border-2 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase transition-all duration-100"
						>
							{server.name}
						</Link>
					</nav>
				)}
				<h1 className={PAGE_TITLE}>{title}</h1>
				{subtitle !== undefined && <p className="text-muted-foreground max-w-prose text-sm font-medium">{subtitle}</p>}
			</div>
			{action}
		</header>
	);
}
