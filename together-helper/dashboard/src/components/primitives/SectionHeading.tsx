import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionHeading({
	children,
	count,
	as: Tag = "p",
	id,
	className,
}: {
	children: ReactNode;
	count?: ReactNode;
	as?: "p" | "h2" | "h3" | "span";
	id?: string;
	className?: string;
}): React.JSX.Element {
	return (
		<Tag
			id={id}
			className={cn(
				"text-foreground flex items-center gap-2 font-mono text-xs font-bold tracking-wider uppercase",
				className,
			)}
		>
			{children}
			{count !== undefined && (
				<span className="border-border bg-muted text-foreground rounded-chip border-2 px-1.5 py-0.5 text-[11px] font-bold tabular-nums">
					{count}
				</span>
			)}
		</Tag>
	);
}
