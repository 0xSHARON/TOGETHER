import { DEFAULT_PREFIX } from "@together-helper/shared";
import { Hash, PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	type ComposerFrame,
	type ComposerScene,
	finishedFrame,
	framesFor,
	type PaletteCommand,
	prefixLine,
} from "@/features/site/composer.utils";
import { SCENES } from "@/features/site/landing.content";
import { useDocumentVisible } from "@/hooks/useDocumentVisible";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

export function Composer({ palette }: { palette: readonly PaletteCommand[] }): React.JSX.Element | null {
	const { t } = useTranslation();
	const reduced = usePrefersReducedMotion();
	const visible = useDocumentVisible();
	const scenes = useMemo<ComposerScene[]>(
		() =>
			SCENES.map((scene) => ({
				...scene,
				options: scene.options.map((option) => ({
					name: option.name,
					value: "valueKey" in option ? t(option.valueKey) : option.value,
				})),
			})),
		[t],
	);
	const [position, setPosition] = useState({ scene: 0, frame: 0 });
	const scene = scenes[position.scene % scenes.length] ?? scenes[0];
	const frames = useMemo(() => (scene === undefined ? [] : framesFor(scene, palette)), [scene, palette]);
	const current = frames[position.frame];

	useEffect(() => {
		if (reduced || !visible || current === undefined) return;

		const timer = setTimeout(() => {
			setPosition(({ scene: at, frame }) =>
				frame + 1 < frames.length ? { scene: at, frame: frame + 1 } : { scene: (at + 1) % scenes.length, frame: 0 },
			);
		}, current.delayMs);
		return () => {
			clearTimeout(timer);
		};
	}, [reduced, visible, current, frames.length, scenes.length]);

	if (scene === undefined) return null;
	const frame = reduced || current === undefined ? finishedFrame(scene) : current;

	return (
		<figure className="flex flex-col gap-3">
			{/* The moving box is for the eye; what it types is said once, in words, below it. */}
			<div aria-hidden="true" className="bg-card border-border rounded-card brutal-shadow overflow-hidden border-2">
				<div className="bg-muted text-foreground border-border flex items-center justify-between border-b-2 px-4 py-2.5 font-mono text-xs font-bold">
					<span className="flex items-center gap-2">
						<Hash size={14} aria-hidden="true" />
						<span>{t("landing.composer.channel")}</span>
					</span>
					<span className="text-accent font-mono text-[10px] font-bold tracking-widest uppercase">LIVE</span>
				</div>

				<div className="relative flex h-64 flex-col justify-end gap-3 p-4">
					<History />
					{frame.menu.length > 0 && <Menu commands={frame.menu} typed={frame.typing ?? ""} />}
					<Line frame={frame} command={scene.command} />
				</div>
			</div>

			<figcaption className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs">
				<span className="sr-only">{t("landing.composer.example", { command: slashLine(scene) })}</span>
				<span>{t("landing.composer.twin")}</span>
				<code className="bg-card border-border text-foreground rounded-chip border-2 px-2 py-0.5 font-mono text-xs font-bold">
					{prefixLine(scene, DEFAULT_PREFIX)}
				</code>
			</figcaption>
		</figure>
	);
}

function slashLine(scene: ComposerScene): string {
	return [`/${scene.command}`, ...scene.options.map((option) => `${option.name}: ${option.value}`)].join(" ");
}

function History(): React.JSX.Element {
	return (
		<div className="flex flex-1 flex-col justify-end gap-4 overflow-hidden opacity-60">
			{[
				["w-16", "w-48"],
				["w-24", "w-56"],
				["w-20", "w-40"],
			].map(([name, text]) => (
				<div key={name} className="flex items-start gap-3">
					<span className="bg-muted size-8 shrink-0 rounded-full" />
					<span className="flex flex-col gap-2 pt-1">
						<span className={cn("bg-muted rounded-chip h-2.5", name)} />
						<span className={cn("bg-muted/70 rounded-chip h-2.5", text)} />
					</span>
				</div>
			))}
		</div>
	);
}

function Menu({ commands, typed }: { commands: readonly PaletteCommand[]; typed: string }): React.JSX.Element {
	return (
		<ul className="bg-popover border-border rounded-field brutal-shadow absolute inset-x-4 bottom-[4.5rem] flex flex-col overflow-hidden border-2 py-1 text-sm">
			{commands.map((command, index) => (
				<li
					key={command.name}
					className={cn("flex min-w-0 items-baseline gap-3 px-3 py-1.5", index === 0 && "bg-accent-wash")}
				>
					<span className="text-foreground shrink-0 font-mono font-bold">
						/<span className="text-accent">{command.name.slice(0, typed.length)}</span>
						{command.name.slice(typed.length)}
					</span>
					<span className="text-muted-foreground truncate">{command.description}</span>
				</li>
			))}
		</ul>
	);
}

function Line({ frame, command }: { frame: ComposerFrame; command: string }): React.JSX.Element {
	return (
		<div className="bg-muted border-border rounded-field flex min-h-12 flex-wrap items-center gap-2 border-2 px-3 py-2 font-mono text-sm">
			<PlusCircle size={18} aria-hidden="true" className="text-muted-foreground shrink-0" />
			{frame.typing !== null ? (
				<span className="text-foreground font-bold">/{frame.typing}</span>
			) : (
				<>
					<span className="bg-accent-wash border-border text-accent rounded-chip border px-1.5 py-0.5 font-bold">
						/{command}
					</span>
					{frame.options.map((option) => (
						<span key={option.name} className="border-border rounded-chip flex items-center overflow-hidden border">
							<span className="bg-background text-muted-foreground px-1.5 py-0.5">{option.name}</span>
							<span className="bg-card text-foreground px-1.5 py-0.5 font-bold">{option.value}</span>
						</span>
					))}
				</>
			)}
			<span className="bg-foreground animate-caret -ml-1 h-4 w-px" />
		</div>
	);
}
