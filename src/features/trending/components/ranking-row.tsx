import { cn } from "@/shared/lib/cn";
import { ExternalLink } from "@/shared/ui/external-link";

type RankingRowProps = {
  rank: number;
  title: string;
  href: string;
  points: number;
};

export const RankingRow = ({ rank, title, href, points }: RankingRowProps) => (
  <li className="flex gap-4">
    <span className={cn("font-mono text-xl font-bold", rank === 1 ? "text-accent" : "text-faint")}>
      {rank}
    </span>
    <div className="flex flex-col gap-1">
      <ExternalLink href={href} className="text-base font-semibold text-ink">
        {title}
      </ExternalLink>
      <span className="text-xs text-faint">{points} pts</span>
    </div>
  </li>
);
