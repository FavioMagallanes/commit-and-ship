import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";
import { Icon, type IconName } from "@/shared/ui/icon";

const SOURCES = {
  hn: { name: "Hacker News", icon: "hacker-news" },
  gh: { name: "GitHub", icon: "github" },
  dev: { name: "dev.to", icon: "dev-to" },
  blog: { name: "Blog", icon: "rss" },
} satisfies Record<string, { name: string; icon: IconName }>;

export type NewsSource = keyof typeof SOURCES;

type SourceBadgeProps = ComponentProps<"span"> & {
  source: NewsSource;
};

export const SourceBadge = ({ source, className, ...props }: SourceBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-sm bg-soft px-2 py-1 text-xs font-semibold text-muted",
      className,
    )}
    {...props}
  >
    <Icon name={SOURCES[source].icon} size={14} />
    {SOURCES[source].name}
  </span>
);
