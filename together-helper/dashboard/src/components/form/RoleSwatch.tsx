/** A bordered dot, never the name's colour, which could be invisible on this background. */
export function RoleSwatch({ name, colour }: { name: string; colour: string | null }): React.JSX.Element {
	return (
		<span className="flex min-w-0 items-center gap-2">
			<span
				aria-hidden="true"
				className="border-input rounded-chip size-3 shrink-0 border-2"
				style={colour === null ? undefined : { backgroundColor: colour }}
			/>
			<span className="truncate">{name}</span>
		</span>
	);
}
