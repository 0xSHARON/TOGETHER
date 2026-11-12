import { type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { type TranslationKey } from "@/i18n";
import { cn } from "@/lib/cn";

interface StripEdges {
	start: boolean;
	end: boolean;
}

export function edgesOf(node: { scrollLeft: number; clientWidth: number; scrollWidth: number }): StripEdges {
	return {
		start: node.scrollLeft > 1,
		end: Math.ceil(node.scrollLeft + node.clientWidth) < node.scrollWidth - 1,
	};
}

export interface TabDefinition<Key extends string = string> {
	key: Key;
	label: TranslationKey;
	icon: LucideIcon;
}

function tabIds(label: string, key: string): { tabId: string; panelId: string } {
	const group = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
	return { tabId: `${group}-tab-${key}`, panelId: `${group}-panel-${key}` };
}

/** The rule is on a wrapper rather than the scroller: `overflow-x` also computes `overflow-y` to `auto`, which clips a marker hung past the edge. */
export function TabBar<Key extends string>({
	label,
	tabs,
	active,
	onSelect,
}: {
	label: string;
	tabs: readonly TabDefinition<Key>[];
	active: Key;
	onSelect: (tab: Key) => void;
}): React.JSX.Element {
	const { t } = useTranslation();
	const strip = useRef<HTMLDivElement>(null);
	const [edges, setEdges] = useState<StripEdges>({ start: false, end: false });

	useEffect(() => {
		const node = strip.current;
		if (node === null) return;

		const measure = (): void => {
			setEdges(edgesOf(node));
		};

		measure();
		node.addEventListener("scroll", measure, { passive: true });
		const observer = new ResizeObserver(measure);
		observer.observe(node);

		return () => {
			node.removeEventListener("scroll", measure);
			observer.disconnect();
		};
	}, [tabs.length]);

	// Scroll the current tab into view; `nearest` cannot move the page itself.
	useEffect(() => {
		document.getElementById(tabIds(label, active).tabId)?.scrollIntoView({ block: "nearest", inline: "nearest" });
	}, [label, active]);

	function onKeyDown(event: React.KeyboardEvent): void {
		const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
		const jump = { Home: 0, End: tabs.length - 1 }[event.key];
		if (step === undefined && jump === undefined) return;

		const at = tabs.findIndex((tab) => tab.key === active);
		const next = jump ?? (at + (step ?? 0) + tabs.length) % tabs.length;
		const chosen = tabs[next];
		if (chosen === undefined) return;

		event.preventDefault();
		onSelect(chosen.key);
		document.getElementById(tabIds(label, chosen.key).tabId)?.focus();
	}

	return (
		<div className="border-border border-b-2 pb-2">
			<div
				ref={strip}
				role="tablist"
				aria-label={label}
				onKeyDown={onKeyDown}
				className={cn(
					"scrollbar-none flex gap-2 overflow-x-auto pb-1",
					edges.end && "mask-r-from-[calc(100%-2rem)]",
					edges.start && "mask-l-from-[calc(100%-2rem)]",
				)}
			>
				{tabs.map(({ key, label: labelKey, icon: Icon }) => {
					const { tabId, panelId } = tabIds(label, key);

					return (
						<button
							key={key}
							id={tabId}
							type="button"
							role="tab"
							aria-selected={active === key}
							aria-controls={panelId}
							tabIndex={active === key ? 0 : -1}
							onClick={() => {
								onSelect(key);
							}}
							className={cn(
								"relative flex shrink-0 cursor-pointer items-center gap-2 rounded-field border-2 px-4 py-2 font-mono text-xs font-bold tracking-wider uppercase",
								"transition-all duration-100",
								active === key
									? "bg-primary text-primary-foreground border-border brutal-shadow-sm"
									: "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
							)}
						>
							<Icon size={14} aria-hidden="true" />
							{t(labelKey)}
						</button>
					);
				})}
			</div>
		</div>
	);
}

export function TabContent({
	label,
	active,
	className,
	children,
}: {
	label: string;
	active: string;
	className?: string;
	children: React.ReactNode;
}): React.JSX.Element {
	const { tabId, panelId } = tabIds(label, active);

	return (
		<div id={panelId} role="tabpanel" aria-labelledby={tabId} tabIndex={-1} className={className}>
			{children}
		</div>
	);
}
