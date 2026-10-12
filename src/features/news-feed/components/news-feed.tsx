import { connection } from "next/server";

import { retryNews } from "@/features/news-feed/actions/retry-news";
import { getNewsSnapshot } from "@/features/news-feed/api/get-news-snapshot";
import { filterByTopic } from "@/features/news-feed/model/filter-by-topic";
import { filterStories } from "@/features/news-feed/model/filter-stories";
import type { NewsSnapshot, StaleSource } from "@/features/news-feed/model/news-story";
import { paginateStories } from "@/features/news-feed/model/paginate-stories";
import { pickFeaturedStory } from "@/features/news-feed/model/pick-featured-story";
import { type SortOrder, sortStories } from "@/features/news-feed/model/sort-stories";
import type { TopicFilter } from "@/features/topics/model/topics";
import { ErrorBanner, StaleContentBanner } from "@/shared/ui/error-banner";
import { RetryButton } from "@/shared/ui/retry-button";

import { LoadMoreButton } from "./load-more-button";
import { NewsList } from "./news-list";

type NewsFeedProps = {
  loadSnapshot?: () => Promise<NewsSnapshot>;
  now?: Date;
  /** Search text; resolves from the url on the server. */
  query?: Promise<string>;
  /** List order; resolves from the url on the server. */
  sort?: Promise<SortOrder>;
  /** How many stories the list shows; resolves from the url on the server. */
  limit?: Promise<number>;
  /** Chosen topic or the Blogs source filter; resolves from the url on the server. */
  topic?: Promise<TopicFilter | null>;
};

const listFormat = new Intl.ListFormat("es", { type: "conjunction" });

const toTime = (isoInstant: string) => new Date(isoInstant).getTime();

/** The banner over saved stories: every failed source by name, and the age of the oldest save. */
const StaleSourcesBanner = ({ sources, now }: { sources: StaleSource[]; now: Date }) => {
  const [first, ...rest] = sources;
  if (first === undefined) return null;
  const oldest = rest.reduce(
    (current, source) => (toTime(source.savedAt) < toTime(current.savedAt) ? source : current),
    first,
  );

  return (
    <StaleContentBanner
      title={`No pudimos actualizar ${listFormat.format(sources.map((source) => source.name))}`}
      savedAt={oldest.savedAt}
      now={now}
      action={<RetryButton action={retryNews} />}
    />
  );
};

const loadOrNull = async (loadSnapshot: () => Promise<NewsSnapshot>) => {
  try {
    return await loadSnapshot();
  } catch {
    return null;
  }
};

export const NewsFeed = async ({
  loadSnapshot = getNewsSnapshot,
  now,
  query = Promise.resolve(""),
  sort = Promise.resolve("recent"),
  limit = Promise.resolve(10),
  topic = Promise.resolve(null),
}: NewsFeedProps) => {
  const [loaded, searchText, order, pageLimit, selectedTopic] = await Promise.all([
    loadOrNull(loadSnapshot),
    query,
    sort,
    limit,
    topic,
  ]);
  // Relative times depend on the current time, so this renders per request (the data stays cached).
  if (!now) await connection();

  if (loaded === null) {
    return (
      <ErrorBanner
        title="No pudimos cargar las noticias"
        action={<RetryButton action={retryNews} />}
      >
        El resto de las fuentes funciona con normalidad.
      </ErrorBanner>
    );
  }

  // The topic narrows every story first, so the featured one and the list both respect it.
  const stories = filterByTopic(loaded.stories, selectedTopic);
  // The featured story has its own card above the list, so the list leaves it out, unless it is
  // the only story: an empty list would wrongly say there is nothing to show.
  const featured = stories.length > 1 ? pickFeaturedStory(stories, searchText) : null;
  const listed = filterStories(stories, searchText).filter((story) => story.id !== featured?.id);
  const { visible, hasMore, nextLimit } = paginateStories(sortStories(listed, order), pageLimit);

  const reference = now ?? new Date();

  return (
    <>
      <StaleSourcesBanner sources={loaded.staleSources} now={reference} />
      <NewsList
        stories={visible}
        now={reference}
        isFiltering={searchText.trim() !== "" || selectedTopic !== null}
      />
      {hasMore ? (
        <div className="flex justify-center">
          <LoadMoreButton nextLimit={nextLimit} />
        </div>
      ) : null}
    </>
  );
};
