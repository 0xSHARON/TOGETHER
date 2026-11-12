import { type ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";

const VARIANTS = {
	primary: "brutal-btn brutal-btn-primary",
	secondary:
		"brutal-btn bg-card text-foreground hover:bg-muted",
	ghost:
		"text-muted-foreground hover:text-foreground hover:bg-muted font-bold border-2 border-transparent hover:border-border transition-colors duration-100",
	destructive: "brutal-btn brutal-btn-destructive",
} as const;

type ButtonVariant = keyof typeof VARIANTS;

export function Button({
	variant = "primary",
	className,
	...props
}: ComponentPropsWithRef<"button"> & { variant?: ButtonVariant }): React.JSX.Element {
	return (
		<button
			type="button"
			data-variant={variant}
			className={cn(
				"inline-flex min-h-11 items-center justify-center gap-2 rounded-field px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider",
				"transition-all duration-100 ease-out cursor-pointer",
				"disabled:pointer-events-none disabled:opacity-50",
				VARIANTS[variant],
				className,
			)}
			{...props}
		/>
	);
}
