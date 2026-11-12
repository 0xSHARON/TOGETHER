import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Tooltip } from "@/components/primitives/Tooltip";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/intl";

export function StatTile({
	label,
	value,
	icon: Icon,
	tint = "text-muted-foreground",
	hint,
}: {
	label: string;
	value: string | number;
	icon?: LucideIcon;
	tint?: string;
	hint?: string;
}): React.JSX.Element {
	const tile = (
		<Card padding="compact" className="relative flex flex-col gap-2 overflow-hidden">
			<span aria-hidden="true" className="bg-accent absolute inset-x-0 top-0 h-1" />
			<p className="text-muted-foreground flex items-center justify-between gap-2 font-mono text-[11px] font-bold tracking-wider uppercase">
				<span>{label}</span>
				{Icon !== undefined && (
					<span className="border-border bg-muted inline-flex size-6 shrink-0 items-center justify-center rounded-chip border-2">
						<Icon size={13} aria-hidden="true" className={cn("shrink-0", tint)} />
					</span>
				)}
			</p>
			{/* Two of these share a 320px row, which is WCAG 1.4.10's reflow width — the full size does not fit. */}
			<p className="font-display text-[1.35rem] leading-tight font-black tabular-nums sm:text-[1.75rem]">
				{typeof value === "number" ? formatNumber(value) : value}
			</p>
		</Card>
	);

	if (hint === undefined) return tile;

	return (
		<Tooltip label={hint}>
			<div tabIndex={0} className="rounded-card">
				{tile}
			</div>
		</Tooltip>
	);
}
