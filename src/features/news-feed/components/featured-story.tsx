import { connection } from "next/server";

import { getNewsStories } from "@/features/news-feed/api/get-news-snapshot";
import { filterByTopic } from "@/features/news-feed/model/filter-by-topic";
import { formatStoryMeta } from "@/features/news-feed/model/format-story-meta";
import type { NewsStory } from "@/features/news-feed/model/news-story";
import { pickFeaturedStory } from "@/features/news-feed/model/pick-featured-story";
import { classifyStoryTopic, type Topic, topicLabels } from "@/features/topics/model/topics";
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
  /** Chosen topic; the highlight is the top story of that topic. */
  topic?: Promise<Topic | null>;
};

const loadOrNull = async (loadStories: () => Promise<NewsStory[]>) => {
  try {
    return await loadStories();
  } catch {
    return null;
  }
};

export const FeaturedStory = async ({
  loadStories = getNewsStories,
  now,
  query = Promise.resolve(""),
  topic = Promise.resolve(null),
}: FeaturedStoryProps) => {
  const [stories, searchText, selectedTopic] = await Promise.all([
    loadOrNull(loadStories),
    query,
    topic,
  ]);
  // The list below already reports a failing source, so there is nothing to show here.
  const featured =
    stories === null ? null : pickFeaturedStory(filterByTopic(stories, selectedTopic), searchText);
  if (featured === null) return null;

  const featuredTopic = classifyStoryTopic(featured);

  // Relative times depend on the clock, so this renders per request (the data stays cached).
  if (!now) await connection();
  const reference = now ?? new Date();

  return (
    <article className="flex flex-col gap-6 rounded-xl border border-line bg-surface p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="solid">Destacado</Pill>
        {featuredTopic === null ? null : <Pill tone="accent">{topicLabels[featuredTopic]}</Pill>}
      </div>
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
