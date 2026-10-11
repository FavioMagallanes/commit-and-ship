import Link from "next/link";

import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";

type CardHeaderProps = {
  id?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
};

export const CardHeader = ({
  id,
  title,
  href,
  linkLabel = "Ver todo",
  className,
}: CardHeaderProps) => (
  <div className={cn("flex items-center justify-between", className)}>
    <h2 id={id} className="font-heading text-lg font-bold text-ink">
      {title}
    </h2>
    {href ? (
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-semibold text-accent-text"
      >
        {linkLabel}
        <Icon name="arrow-right" />
      </Link>
    ) : null}
  </div>
);
