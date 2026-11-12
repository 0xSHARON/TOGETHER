import { BarChart3 } from "lucide-react";
import { type ReactNode } from "react";
import { formatNumber } from "@/lib/intl";

/** A percentage of the busiest row, floored at 2 so a row with one use is still visibly a row. */
export function barWidth(count: number, max: number): number {
	if (max <= 0 || count <= 0) return 0;
	return Math.max(2, Math.round((count / max) * 100));
}

interface BarRow {
	id: string;
	label: ReactNode;
	sub?: string;
	count: number;
	value?: string;
}

export function UsageBars({
	rows,
	empty,
	tint = "bg-accent-wash border-r-2 border-accent",
}: {
	rows: BarRow[];
	empty: string;
	tint?: string;
}): React.JSX.Element {
	if (rows.length === 0) {
		return (
			<p className="text-muted-foreground flex items-center gap-2 py-2 text-sm">
				<BarChart3 size={16} aria-hidden="true" className="shrink-0" />
				{empty}
			</p>
		);
	}

	const max = Math.max(...rows.map((row) => row.count));

	return (
		<ol className="flex flex-col gap-2">
			{rows.map((row) => (
				<li
					key={row.id}
					className="border-border bg-card relative isolate flex items-center gap-3 overflow-hidden rounded-field border-2 px-3 py-2"
				>
					<span
						aria-hidden="true"
						className={`rounded-chip absolute inset-y-0 left-0 -z-10 transition-[width] duration-300 ${tint}`}
						style={{ width: `${String(barWidth(row.count, max))}%` }}
					/>
					<span className="min-w-0 flex-1">
						<span className="block truncate text-sm font-bold">{row.label}</span>
						{row.sub !== undefined && <span className="text-muted-foreground block truncate font-mono text-xs">{row.sub}</span>}
					</span>
					<span className="shrink-0 font-mono text-xs font-bold tabular-nums">{row.value ?? formatNumber(row.count)}</span>
				</li>
			))}
		</ol>
	);
}
