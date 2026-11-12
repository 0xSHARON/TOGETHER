import { inboxCount } from "@together-helper/shared";
import { Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { HoverChevron } from "@/components/primitives";
import { inboxSummary } from "@/features/inbox/inbox.utils";
import { useInbox } from "@/features/inbox/useInbox";

export function InboxLine({ guildId }: { guildId: string }): React.JSX.Element | null {
	const { t } = useTranslation();
	const inbox = useInbox(guildId);
	if (inbox.data === undefined || inboxCount(inbox.data) === 0) return null;

	return (
		<Link
			to={`/guilds/${guildId}/inbox`}
			className="bg-card border-accent rounded-card brutal-shadow hover:bg-muted group flex items-center gap-3 border-2 px-6 py-4 transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5"
		>
			<span className="border-border bg-accent-wash rounded-chip border-2 p-1.5" aria-hidden="true">
				<Inbox size={16} className="text-accent shrink-0" />
			</span>
			<span className="min-w-0 flex-1">
				<span className="font-bold">{inboxSummary(inbox.data, t)}</span>{" "}
				<span className="text-muted-foreground font-mono text-xs uppercase">{t("inbox.open")}</span>
			</span>
			<HoverChevron />
		</Link>
	);
}
