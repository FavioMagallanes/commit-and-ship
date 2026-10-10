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

// The badge shows only the logo, so the icon carries the source name as its accessible label.
export const SourceBadge = ({ source, className, ...props }: SourceBadgeProps) => (
  <span
    className={cn(
      "inline-flex size-10 items-center justify-center rounded-md border border-line bg-soft text-muted",
      className,
    )}
    {...props}
  >
    <Icon name={SOURCES[source].icon} label={SOURCES[source].name} />
  </span>
);
