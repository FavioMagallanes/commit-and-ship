import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  type LucideIcon,
  Menu,
  Moon,
  Rss,
  Search,
  SearchX,
  Sun,
  TriangleAlert,
} from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";
import { BRAND_ICON_PATHS } from "@/shared/ui/brand-icon-paths";

const LUCIDE_ICONS = {
  search: Search,
  menu: Menu,
  sun: Sun,
  moon: Moon,
  "arrow-up-right": ArrowUpRight,
  "arrow-right": ArrowRight,
  "chevron-down": ChevronDown,
  alert: TriangleAlert,
  "search-x": SearchX,
  rss: Rss,
} satisfies Record<string, LucideIcon>;

type LucideIconName = keyof typeof LUCIDE_ICONS;
type BrandIconName = keyof typeof BRAND_ICON_PATHS;

export type IconName = LucideIconName | BrandIconName;

type IconProps = Omit<ComponentProps<"svg">, "children"> & {
  name: IconName;
  size?: number;
  /** Accessible name. Without it the icon is decorative and hidden from screen readers. */
  label?: string;
};

const isBrandIcon = (name: IconName): name is BrandIconName => name in BRAND_ICON_PATHS;

export const Icon = ({ name, size = 16, label, className, ...props }: IconProps) => {
  const accessibility = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);
  const classes = cn("shrink-0", className);

  if (isBrandIcon(name)) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className={classes}
        {...accessibility}
        {...props}
      >
        <path d={BRAND_ICON_PATHS[name]} />
      </svg>
    );
  }

  const LucideComponent = LUCIDE_ICONS[name];

  return <LucideComponent size={size} className={classes} {...accessibility} {...props} />;
};
