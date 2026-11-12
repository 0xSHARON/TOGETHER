import { inboxCount } from "@together-helper/shared";
import { useTranslation } from "react-i18next";
import { useInbox } from "@/features/inbox/useInbox";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/intl";

export function InboxBadge({ guildId, expanded }: { guildId: string; expanded: boolean }): React.JSX.Element | null {
	const { t } = useTranslation();
	const inbox = useInbox(guildId);
	const count = inbox.data === undefined ? 0 : inboxCount(inbox.data);
	if (count === 0) return null;

	return (
		<>
			<span
				aria-hidden="true"
				className={cn(
					"bg-accent-wash text-accent border-border ml-auto rounded-chip border-2 px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums",
					!expanded && "hidden lg:inline",
				)}
			>
				{formatNumber(count)}
			</span>
			{!expanded && (
				<span aria-hidden="true" className="bg-accent border-border rounded-chip absolute top-1.5 left-7 size-2 border lg:hidden" />
			)}
			<span className="sr-only">{t("inbox.waiting", { count })}</span>
		</>
	);
}
