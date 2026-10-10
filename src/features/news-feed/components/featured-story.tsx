import { connection } from "next/server";

import { getHackerNewsStories } from "@/features/news-feed/api/get-hacker-news-stories";
import { formatStoryMeta } from "@/features/news-feed/model/format-story-meta";
import type { NewsStory } from "@/features/news-feed/model/news-story";
import { pickFeaturedStory } from "@/features/news-feed/model/pick-featured-story";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { ExternalLink } from "@/shared/ui/external-link";
import { Icon } from "@/shared/ui/icon";
import { Pill } from "@/shared/ui/pill";
import { SourceBadge } from "@/shared/ui/source-badge";

type FeaturedStoryProps = {
  loadStories?: () => Promise<NewsStory[]>;
  now?: Date;
  /** Search text; the highlight is hidden while searching. */
  query?: Promise<string>;
};

const loadOrNull = async (loadStories: () => Promise<NewsStory[]>) => {
  try {
    return await loadStories();
  } catch {
    return null;
  }
};

export const FeaturedStory = async ({
  loadStories = getHackerNewsStories,
  now,
  query = Promise.resolve(""),
}: FeaturedStoryProps) => {
  const [stories, searchText] = await Promise.all([loadOrNull(loadStories), query]);
  // The list below already reports a failing source, so there is nothing to show here.
  const featured = stories === null ? null : pickFeaturedStory(stories, searchText);
  if (featured === null) return null;

  // Relative times depend on the clock, so this renders per request (the data stays cached).
  if (!now) await connection();
  const reference = now ?? new Date();

  return (
    <article className="flex flex-col gap-6 rounded-xl border border-line bg-surface p-6 md:p-8">
      <Pill tone="solid" className="self-start">
        Destacado
      </Pill>
      <h2 className="font-heading text-2xl leading-tight font-extrabold text-ink md:text-3xl">
        <ExternalLink href={featured.url}>{featured.title}</ExternalLink>
      </h2>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SourceBadge source={featured.source} />
          <p className="text-base text-muted">
            {formatStoryMeta(featured.sourceName, featured.points, featured.commentsCount)} ·{" "}
            <time dateTime={featured.publishedAt}>
              {formatRelativeTime(featured.publishedAt, reference)}
            </time>
          </p>
        </div>
        <ExternalLink
          href={featured.url}
          aria-label={`Leer en la fuente: ${featured.title}`}
          className="inline-flex items-center gap-1 text-base font-semibold text-accent-text"
        >
          Leer en la fuente
          <Icon name="arrow-up-right" />
        </ExternalLink>
      </div>
    </article>
  );
};
