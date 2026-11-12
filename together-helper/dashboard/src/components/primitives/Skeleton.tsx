import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }): React.JSX.Element {
	return <div className={cn("bg-muted border-border skeleton-sheen rounded-card border-2", className)} aria-hidden="true" />;
}
