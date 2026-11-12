import { type WatchedPermission } from "@together-helper/shared";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/primitives";
import { MISSING_LABELS } from "@/features/guild-overview/featureStatus.labels";

export function MissingPermissions({ permissions }: { permissions: WatchedPermission[] }): React.JSX.Element | null {
	const { t } = useTranslation();
	if (permissions.length === 0) return null;

	return (
		<Card className="border-warning flex flex-col gap-3">
			<h2 className="text-warning flex items-center gap-2 font-display font-black tracking-tight uppercase">
				<AlertTriangle className="text-warning shrink-0" size={18} aria-hidden="true" />
				{t("overview.missingTitle")}
			</h2>
			<p className="text-muted-foreground text-sm font-medium">{t("overview.missingBody")}</p>
			<ul className="flex list-disc flex-col gap-1 pl-5 font-mono text-xs font-bold">
				{permissions.map((permission) => (
					<li key={permission}>{t(MISSING_LABELS[permission])}</li>
				))}
			</ul>
		</Card>
	);
}
