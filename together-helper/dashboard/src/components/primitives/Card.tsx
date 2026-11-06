import { type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

const PADDING = {
	none: "p-0",
	compact: "px-5 py-3.5",
	default: "p-6",
} as const;

type CardPadding = keyof typeof PADDING;

const SURFACE =
	"bg-card/85 backdrop-blur-xl border border-border/70 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-200";

export function cardClass(padding: CardPadding = "default", ...extra: string[]): string {
	return cn(SURFACE, PADDING[padding], ...extra);
}

export function Card({
	padding = "default",
	className,
	...props
}: ComponentPropsWithoutRef<"div"> & { padding?: CardPadding }): React.JSX.Element {
	return <div className={cardClass(padding, className ?? "")} {...props} />;
}
