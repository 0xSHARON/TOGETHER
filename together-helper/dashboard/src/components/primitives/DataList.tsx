import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface DataRow {
	label: string;
	value: ReactNode;
	mono?: boolean;
}

export function DataList({
	rows,
	mono = false,
	dense = false,
	className,
}: {
	rows: DataRow[];
	mono?: boolean;
	dense?: boolean;
	className?: string;
}): React.JSX.Element {
	return (
		<dl className={cn(dense ? "flex flex-col gap-1" : "divide-border divide-y-2", className)}>
			{rows.map((row) => (
				<div
					key={row.label}
					className={cn("flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4", !dense && "px-6 py-3")}
				>
					<dt className="text-muted-foreground w-40 shrink-0 font-mono text-xs font-bold uppercase tracking-wider">
						{row.label}
					</dt>
					<dd className={cn("min-w-0 text-sm font-medium break-words", (row.mono ?? mono) && "font-mono")}>{row.value}</dd>
				</div>
			))}
		</dl>
	);
}

export function Figure({
	label,
	value,
	tone,
	size = "lg",
	className,
}: {
	label: string;
	value: string;
	tone?: string;
	size?: "md" | "lg";
	className?: string;
}): React.JSX.Element {
	return (
		<div className={className}>
			<dt className="text-muted-foreground font-mono text-[11px] font-bold tracking-wider uppercase">{label}</dt>
			<dd className={cn("font-display mt-1 font-black tabular-nums", size === "lg" ? "text-xl" : "text-lg", tone)}>
				{value}
			</dd>
		</div>
	);
}
