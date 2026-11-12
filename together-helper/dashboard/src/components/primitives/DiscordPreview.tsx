import { type ReactNode } from "react";
import { BotMark } from "@/components/brand/BotMark";

export function DiscordPreview({
	name,
	avatarUrl,
	children,
}: {
	name: string;
	avatarUrl: string | null;
	children: ReactNode;
}): React.JSX.Element {
	return (
		<div className="bg-background border-border brutal-shadow-sm rounded-card border-2 p-4">
			<div className="flex gap-3">
				<BotMark src={avatarUrl} name={name} size={36} />
				<div className="min-w-0 flex-1">
					<p className="flex items-center gap-2 text-sm font-bold">
						<span>{name}</span>
						<span className="bg-accent-wash border-border text-accent rounded-chip border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase">
							BOT
						</span>
					</p>
					{children}
				</div>
			</div>
		</div>
	);
}
