import { SELECTED } from "@/components/primitives/stateStyles";
import { Tooltip } from "@/components/primitives/Tooltip";
import { cn } from "@/lib/cn";

export interface Segment<Value extends string | number> {
	value: Value;
	label: string;
	hint?: string;
}

export function SegmentedControl<Value extends string | number>({
	label,
	segments,
	value,
	onChange,
	className,
}: {
	label: string;
	segments: readonly Segment<Value>[];
	value: Value;
	onChange: (value: Value) => void;
	className?: string;
}): React.JSX.Element {
	return (
		<div
			role="group"
			aria-label={label}
			className={cn("border-border bg-card brutal-shadow-sm flex max-w-full flex-wrap gap-1 rounded-field border-2 p-1", className)}
		>
			{segments.map((segment) => {
				const control = (
					<button
						key={segment.value}
						type="button"
						aria-pressed={value === segment.value}
						onClick={() => {
							onChange(segment.value);
						}}
						className={cn(
							"rounded-chip cursor-pointer px-3 py-1 font-mono text-xs font-bold tracking-wider uppercase transition-all duration-100",
							"focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
							value === segment.value ? SELECTED : "text-muted-foreground hover:bg-muted hover:text-foreground",
						)}
					>
						{segment.label}
					</button>
				);

				return segment.hint === undefined ? (
					control
				) : (
					<Tooltip key={segment.value} label={segment.hint}>
						{control}
					</Tooltip>
				);
			})}
		</div>
	);
}
