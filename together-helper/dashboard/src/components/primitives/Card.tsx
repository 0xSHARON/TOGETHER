import { type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

const PADDING = {
	none: "p-0",
	compact: "px-5 py-3.5",
	default: "p-6",
} as const;

type CardPadding = keyof typeof PADDING;

const SURFACE =
	"bg-card border-2 border-black dark:border-zinc-800 rounded-none shadow-[3px_3px_0px_0px_#000000] dark:shadow-[3px_3px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#00e676] transition-all duration-150";

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
