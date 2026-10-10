import { ExternalLink } from "@/shared/ui/external-link";
import { Pill } from "@/shared/ui/pill";
import { type NewsSource, SourceBadge } from "@/shared/ui/source-badge";

type NewsItemProps = {
  source: NewsSource;
  /** Display name of the origin, for example "dev.to" or the name of a blog. */
  sourceName: string;
  title: string;
  href: string;
  tag: string;
  publishedAt: string;
  publishedLabel: string;
};

export const NewsItem = ({
  source,
  sourceName,
  title,
  href,
  tag,
  publishedAt,
  publishedLabel,
}: NewsItemProps) => (
  <article className="flex gap-4 p-5 md:px-8 md:py-6">
    <SourceBadge source={source} />
    <div className="flex min-w-0 flex-col gap-3">
      <h3 className="text-md font-bold text-ink md:font-heading md:text-lg">
        <ExternalLink href={href}>{title}</ExternalLink>
      </h3>
      <div className="flex items-center gap-2">
        <Pill>{tag}</Pill>
        <p className="text-sm text-faint">
          {sourceName} · <time dateTime={publishedAt}>{publishedLabel}</time>
        </p>
      </div>
    </div>
  </article>
);
