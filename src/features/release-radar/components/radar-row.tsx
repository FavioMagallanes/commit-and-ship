import { cn } from "@/shared/lib/cn";
import { ExternalLink } from "@/shared/ui/external-link";
import { Pill } from "@/shared/ui/pill";

type RadarRowProps = {
  name: string;
  version: string;
  href: string;
  publishedAt: string;
  publishedLabel: string;
  isNew?: boolean;
  className?: string;
};

export const RadarRow = ({
  name,
  version,
  href,
  publishedAt,
  publishedLabel,
  isNew = false,
  className,
}: RadarRowProps) => (
  <li className={cn("flex items-center justify-between leading-tight", className)}>
    <div className="flex flex-col gap-1">
      <ExternalLink href={href} className="text-md font-semibold text-ink">
        {name}
      </ExternalLink>
      <time dateTime={publishedAt} className="text-xs text-faint">
        {publishedLabel}
      </time>
    </div>
    <div className="flex items-center gap-2">
      {isNew ? <Pill tone="accent">Nuevo</Pill> : null}
      <span className="font-mono text-base font-semibold text-muted">{version}</span>
    </div>
  </li>
);
