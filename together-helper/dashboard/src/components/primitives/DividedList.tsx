import { type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export function DividedList({ className, ...props }: ComponentPropsWithoutRef<"ul">): React.JSX.Element {
	return (
		<ul
			className={cn("divide-border border-border bg-card rounded-field divide-y-2 border-2", className)}
			{...props}
		/>
	);
}
