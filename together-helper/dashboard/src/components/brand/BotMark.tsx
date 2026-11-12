import { useState } from "react";
import { cn } from "@/lib/cn";

export function BotMark({
	src,
	name,
	size = 22,
	className,
}: {
	src: string | null | undefined;
	name: string | null;
	size?: number;
	className?: string;
}): React.JSX.Element {
	const [broken, setBroken] = useState<string | null>(null);

	if (src === null || src === undefined || broken === src) {
		const initial = name === null ? "" : (Array.from(name.trim())[0]?.toLocaleUpperCase() ?? "");
		return (
			<span
				aria-hidden="true"
				className={cn(
					"bg-accent-wash text-accent border-border rounded-tile inline-flex shrink-0 items-center justify-center border-2 font-mono font-bold",
					className,
				)}
				style={{ width: size, height: size, fontSize: Math.round(size * 0.45) }}
			>
				{initial}
			</span>
		);
	}

	return (
		<img
			src={src}
			alt=""
			width={size}
			height={size}
			onError={() => {
				setBroken(src);
			}}
			className={cn("border-border rounded-tile max-w-none shrink-0 border-2 object-cover", className)}
			style={{ width: size, height: size }}
		/>
	);
}
