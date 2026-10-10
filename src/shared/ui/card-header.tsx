import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";

type CardHeaderProps = {
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
};

export const CardHeader = ({ title, href, linkLabel = "Ver todo", className }: CardHeaderProps) => (
  <div className={cn("flex items-center justify-between", className)}>
    <h2 className="font-heading text-lg font-bold text-ink">{title}</h2>
    {href ? (
      <a
        href={href}
        className="inline-flex items-center gap-1 text-sm font-semibold text-accent-text"
      >
        {linkLabel}
        <Icon name="arrow-right" />
      </a>
    ) : null}
  </div>
);
