export const LABEL = "text-foreground font-mono text-xs font-bold tracking-wider uppercase";

export const FIELD_GROUP = "flex min-w-0 flex-col gap-2";

export const FIELD =
	"bg-card border-input focus-visible:border-ring focus-visible:brutal-shadow-sm w-full rounded-field border-2 px-3 py-2 text-sm font-medium outline-none transition-all duration-100";

/** A complete `<select>`; the chevron room is a utility because base-layer padding loses to one. */
export const SELECT = `${FIELD} pr-9`;

export const SCROLL_LIST = "border-border bg-card brutal-shadow-sm max-h-56 overflow-y-auto rounded-field border-2";

export const CHECK_ROW = "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-100";
