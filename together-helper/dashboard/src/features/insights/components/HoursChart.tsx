import { busiestHour } from "@together-helper/shared";
import { useTranslation } from "react-i18next";
import { barHeight, hourLabel } from "@/features/insights/insights.utils";
import { formatNumber } from "@/lib/intl";

export function HoursChart({ hours }: { hours: number[] }): React.JSX.Element {
	const { t } = useTranslation();
	const max = Math.max(0, ...hours);
	const busiest = busiestHour(hours);

	return (
		<figure className="flex flex-col gap-3">
			<p className="text-sm">
				{busiest === null ? t("insights.noBusiestHour") : t("insights.busiestHour", { hour: hourLabel(busiest) })}
			</p>
			<div className="border-border bg-background flex h-20 items-end gap-px border-b-2 pt-2" aria-hidden="true">
				{hours.map((count, hour) => (
					<span
						key={hour}
						title={`${hourLabel(hour)}: ${formatNumber(count)}`}
						className={`min-h-px flex-1 rounded-t-chip ${hour === busiest ? "bg-accent" : "bg-primary"}`}
						style={{ height: `${String(barHeight(count, max))}%` }}
					/>
				))}
			</div>
			<div className="text-muted-foreground flex justify-between font-mono text-xs" aria-hidden="true">
				<span>{hourLabel(0)}</span>
				<span>{hourLabel(12)}</span>
				<span>{hourLabel(23)}</span>
			</div>
			<figcaption className="sr-only">
				<table>
					<caption>{t("insights.perHour")}</caption>
					<tbody>
						{hours.map((count, hour) => (
							<tr key={hour}>
								<th scope="row">{hourLabel(hour)}</th>
								<td>{count}</td>
							</tr>
						))}
					</tbody>
				</table>
			</figcaption>
		</figure>
	);
}
