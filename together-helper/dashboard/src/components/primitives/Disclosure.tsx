import { ChevronDown } from "lucide-react";
import { type ReactNode } from "react";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { cn } from "@/lib/cn";

export function Disclosure({
	label,
	children,
	defaultOpen = true,
	className,
}: {
	label: string;
	children: ReactNode;
	defaultOpen?: boolean;
	className?: string;
}): React.JSX.Element {
	return (
		<details open={defaultOpen} className={cn("group", className)}>
			<summary className="marker:content-none border-border bg-muted hover:border-accent flex cursor-pointer list-none items-center justify-between gap-2 rounded-field border-2 px-3 py-2 select-none transition-colors duration-100">
				<SectionHeading>{label}</SectionHeading>
				<ChevronDown
					size={14}
					aria-hidden="true"
					className="text-foreground shrink-0 transition-transform duration-150 ease-out group-open:rotate-180"
				/>
			</summary>

			<div className="mt-3">{children}</div>
		</details>
	);
}
