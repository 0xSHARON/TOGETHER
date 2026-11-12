import { type ReactNode } from "react";
import { CARD_HEADING } from "@/components/primitives/textStyles";

export function EmptyState({
	icon,
	title,
	body,
	action,
}: {
	icon: ReactNode;
	title: string;
	body: string;
	action?: ReactNode;
}): React.JSX.Element {
	return (
		<div className="brutal-stripe border-border rounded-card flex flex-col items-center gap-3 border-2 border-dashed px-6 py-8 text-center">
			<div
				className="border-border bg-card text-foreground rounded-card brutal-shadow-sm border-2 p-3"
				aria-hidden="true"
			>
				{icon}
			</div>
			<h2 className={CARD_HEADING}>{title}</h2>
			<p className="text-muted-foreground max-w-sm text-sm font-medium">{body}</p>
			{action}
		</div>
	);
}
