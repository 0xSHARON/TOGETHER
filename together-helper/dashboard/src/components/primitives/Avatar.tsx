import { useState } from "react";
import { cn } from "@/lib/cn";
import { tintFor } from "@/lib/tint";

export function Avatar({
	name,
	url,
	size = 40,
	seed,
}: {
	name: string;
	url: string | null;
	size?: number;
	seed?: string;
}): React.JSX.Element {
	const style = { width: size, height: size };
	const [broken, setBroken] = useState<string | null>(null);

	if (url === null || broken === url) {
		return (
			<div
				className={cn(
					"border-border rounded-tile flex shrink-0 items-center justify-center border-2 font-mono font-bold",
					size < 32 ? "text-xs" : "text-sm",
					tintFor(seed ?? name),
				)}
				style={style}
				aria-hidden="true"
			>
				{[...name][0]?.toUpperCase() ?? "?"}
			</div>
		);
	}

	// `max-w-none`, because preflight caps an image at its container's width and a narrow slot then squashed it.
	return (
		<img
			src={url}
			alt=""
			width={size}
			height={size}
			className="border-border rounded-tile max-w-none shrink-0 border-2 object-cover"
			style={style}
			loading="lazy"
			onError={() => {
				setBroken(url);
			}}
		/>
	);
}
