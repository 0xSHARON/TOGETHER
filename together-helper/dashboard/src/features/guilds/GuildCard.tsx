import { inviteUrl, type ManageableGuild } from "@together-helper/shared";
import { Lock, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Avatar, Card, CARD_ROW, cardClass, HoverChevron, Tooltip } from "@/components/primitives";
import { type GuildGroupKey } from "@/features/guilds/guilds.utils";

export function GuildCard({
	guild,
	group,
	clientId,
}: {
	guild: ManageableGuild;
	group: GuildGroupKey;
	clientId: string | undefined;
}): React.JSX.Element {
	const { t } = useTranslation();
	const body = (
		<>
			<Avatar name={guild.name} url={guild.iconUrl} seed={guild.id} />
			<span className="min-w-0 flex-1">
				<span className="font-display block truncate font-bold tracking-tight uppercase">{guild.name}</span>
				<span className="text-muted-foreground block font-mono text-xs tabular-nums">
					{guild.memberCount === null ? t("guilds.notHereYet") : t("common.memberCount", { count: guild.memberCount })}
				</span>
			</span>
		</>
	);

	if (group === "configurable") {
		return (
			<Link
				to={`/guilds/${guild.id}`}
				className={cardClass(
					"compact",
					CARD_ROW,
					"hover:border-accent transition-transform duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 group",
				)}
			>
				{body}
				<HoverChevron />
			</Link>
		);
	}

	if (group === "invitable" && clientId !== undefined) {
		return (
			<a
				href={inviteUrl(clientId, guild.id)}
				target="_blank"
				rel="noreferrer"
				className={cardClass(
					"compact",
					CARD_ROW,
					"hover:border-accent transition-transform duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 group",
				)}
			>
				{body}
				<span className="border-border bg-accent-wash text-accent rounded-chip flex shrink-0 items-center gap-1 border-2 px-2 py-0.5 font-mono text-xs font-bold uppercase">
					<Plus size={14} aria-hidden="true" />
					{t("guilds.add")}
				</span>
			</a>
		);
	}

	return (
		<Card padding="compact" className={`${CARD_ROW} brutal-stripe border-dashed opacity-80`}>
			{body}
			<Tooltip label={t("guilds.noPermissionHint")}>
				<span tabIndex={0} className="border-border bg-muted text-muted-foreground rounded-chip flex shrink-0 items-center gap-2 border-2 px-2 py-0.5 font-mono text-xs uppercase">
					<Lock size={14} aria-hidden="true" />
					{t("guilds.noPermission")}
				</span>
			</Tooltip>
		</Card>
	);
}
