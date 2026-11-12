import { Check } from "lucide-react";
import { type PresetAccent } from "@/hooks/useAccent";
import { cn } from "@/lib/cn";

export function AccentSwatch({
	accent,
	label,
	selected,
	onSelect,
}: {
	accent: PresetAccent;
	label: string;
	selected: boolean;
	onSelect: (next: PresetAccent) => void;
}): React.JSX.Element {
	return (
		<button
			type="button"
			data-accent={accent}
			aria-pressed={selected}
			onClick={() => {
				onSelect(accent);
			}}
			className={cn(
				"rounded-card group flex w-full cursor-pointer items-center gap-3 border-2 px-3 py-2 text-sm transition-all duration-100",
				"focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
				selected
					? "border-accent bg-accent-wash brutal-shadow-sm font-bold"
					: "border-border/60 bg-card hover:border-border hover:bg-muted font-medium",
			)}
		>
			<span className="bg-primary border-border rounded-chip flex size-6 shrink-0 items-center justify-center border-2">
				{selected ? <Check size={14} className="text-primary-foreground" aria-hidden="true" /> : null}
			</span>
			<span className={selected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}>
				{label}
			</span>
		</button>
	);
}
