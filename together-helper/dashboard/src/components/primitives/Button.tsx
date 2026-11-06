import { type ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";

const VARIANTS = {
	primary:
		"bg-primary text-primary-foreground font-black border-2 border-black dark:border-zinc-700 shadow-[3px_3px_0px_0px_#000000] dark:shadow-[3px_3px_0px_0px_#00e676] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000000] dark:hover:shadow-[4px_4px_0px_0px_#00e676] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
	secondary:
		"bg-card text-foreground font-bold border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_0px_#000000] dark:shadow-[2px_2px_0px_0px_#000000] hover:border-black dark:hover:border-zinc-500 hover:shadow-[3px_3px_0px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
	ghost:
		"text-muted-foreground hover:text-foreground hover:bg-muted font-bold border border-transparent hover:border-black dark:hover:border-zinc-700",
	destructive:
		"bg-destructive text-white font-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
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
				"inline-flex min-h-11 items-center justify-center gap-2 rounded-none px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider",
				"transition-all duration-100 ease-out cursor-pointer",
				"disabled:pointer-events-none disabled:opacity-50",
				VARIANTS[variant],
				className,
			)}
			{...props}
		/>
	);
}
