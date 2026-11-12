import { AlertTriangle } from "lucide-react";
import { type ReactNode } from "react";

export function Warning({ children }: { children: ReactNode }): React.JSX.Element {
	return (
		<span
			className="border-warning bg-card text-warning rounded-chip brutal-shadow-sm motion-fade mt-2 flex items-start gap-2 border-2 px-3 py-2 text-xs font-medium"
			role="status"
		>
			<AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
			<span>{children}</span>
		</span>
	);
}
