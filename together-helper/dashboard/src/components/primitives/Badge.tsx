import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

const TONES = {
	muted: "border-border bg-muted text-foreground",
	success: "border-success bg-card text-success",
	warning: "border-warning bg-card text-warning",
	danger: "border-destructive-text bg-card text-destructive-text",
} as const;

export type BadgeTone = keyof typeof TONES;

export function Badge({ tone = "muted", children }: { tone?: BadgeTone; children: ReactNode }): React.JSX.Element {
	return (
		<span
			className={cn(
				"rounded-chip shrink-0 border-2 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase whitespace-nowrap",
				TONES[tone],
			)}
		>
			{children}
		</span>
	);
}
