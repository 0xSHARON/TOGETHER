import { ChevronDown } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { SidebarLink } from "@/app/layout/SidebarLink";
import { ICON_SLOT } from "@/app/layout/sidebarStyles";
import { type NavSection, sectionHolds } from "@/config/navigation";
import { cn } from "@/lib/cn";

export function SidebarSection({
	section,
	expanded = false,
}: {
	section: NavSection;
	expanded?: boolean;
}): React.JSX.Element {
	const { t } = useTranslation();
	const { pathname } = useLocation();
	const listId = useId();
	const holdsCurrent = sectionHolds(section, pathname);
	const [open, setOpen] = useState(holdsCurrent);

	useEffect(() => {
		if (holdsCurrent) setOpen(true);
	}, [holdsCurrent]);

	const Icon = section.icon;
	const collapsible = expanded || undefined;

	return (
		<li>
			<button
				type="button"
				aria-expanded={open}
				aria-controls={listId}
				onClick={() => {
					setOpen((was) => !was);
				}}
				className={cn(
					"rounded-field text-muted-foreground hover:text-foreground hover:bg-muted border-2 border-transparent hover:border-border flex w-full items-center gap-3 px-3 py-2 text-sm font-bold transition-colors duration-100",
					expanded ? "flex" : "hidden lg:flex",
				)}
			>
				<span aria-hidden="true" className={ICON_SLOT}>
					<Icon size={18} />
				</span>
				<span className="flex-1 truncate text-left">{t(section.labelKey)}</span>
				<ChevronDown
					size={14}
					aria-hidden="true"
					className={cn("shrink-0 transition-transform duration-200 ease-out", open ? "rotate-180" : "")}
				/>
			</button>

			<ul
				id={listId}
				className={cn(
					"flex flex-col gap-1",
					expanded
						? "ml-[9px] border-l-2 border-border pl-3"
						: "lg:ml-[9px] lg:border-l-2 lg:border-border lg:pl-3",
					open ? "" : collapsible === true ? "hidden" : "lg:hidden",
				)}
			>
				{section.items.map((item) => (
					<li key={item.to}>
						<SidebarLink item={item} expanded={expanded} />
					</li>
				))}
			</ul>
		</li>
	);
}
