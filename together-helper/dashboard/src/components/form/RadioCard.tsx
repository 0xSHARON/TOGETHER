import { cn } from "@/lib/cn";

export function RadioCard({
	name,
	label,
	description,
	checked,
	disabled = false,
	onChange,
}: {
	name: string;
	label: string;
	description: string;
	checked: boolean;
	disabled?: boolean;
	onChange: () => void;
}): React.JSX.Element {
	return (
		<label
			className={cn(
				"rounded-card flex flex-col gap-1 border-2 p-3 transition-all duration-100",
				disabled ? "border-border/50 opacity-50" : "cursor-pointer",
				checked
					? "border-accent bg-accent-wash brutal-shadow-sm"
					: !disabled && "border-border/60 bg-card hover:border-border hover:bg-muted",
			)}
		>
			<span className="flex items-center gap-2">
				<input type="radio" name={name} checked={checked} disabled={disabled} onChange={onChange} />
				<span className="text-sm font-bold">{label}</span>
			</span>
			<span className="text-muted-foreground text-xs">{description}</span>
		</label>
	);
}
