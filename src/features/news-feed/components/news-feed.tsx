import { connection } from "next/server";

import { getHackerNewsStories } from "@/features/news-feed/api/get-hacker-news-stories";
import { filterStories } from "@/features/news-feed/model/filter-stories";
import type { NewsStory } from "@/features/news-feed/model/news-story";
import { paginateStories } from "@/features/news-feed/model/paginate-stories";
import { pickFeaturedStory } from "@/features/news-feed/model/pick-featured-story";
import { type SortOrder, sortStories } from "@/features/news-feed/model/sort-stories";
import { ErrorBanner } from "@/shared/ui/error-banner";

import { LoadMoreButton } from "./load-more-button";
import { NewsList } from "./news-list";

type NewsFeedProps = {
  loadStories?: () => Promise<NewsStory[]>;
  now?: Date;
  /** Search text; resolves from the url on the server. */
  query?: Promise<string>;
  /** List order; resolves from the url on the server. */
  sort?: Promise<SortOrder>;
  /** How many stories the list shows; resolves from the url on the server. */
  limit?: Promise<number>;
};

const loadOrNull = async (loadStories: () => Promise<NewsStory[]>) => {
  try {
    return await loadStories();
  } catch {
    return null;
  }
};

export const NewsFeed = async ({
  loadStories = getHackerNewsStories,
  now,
  query = Promise.resolve(""),
  sort = Promise.resolve("recent"),
  limit = Promise.resolve(10),
}: NewsFeedProps) => {
  const [stories, searchText, order, pageLimit] = await Promise.all([
    loadOrNull(loadStories),
    query,
    sort,
    limit,
  ]);
  // Relative times depend on the current time, so this renders per request (the data stays cached).
  if (!now) await connection();

  if (stories === null) {
    return (
      <ErrorBanner title="No pudimos cargar Hacker News">
        El resto de las fuentes funciona con normalidad.
      </ErrorBanner>
    );
  }

  // The featured story has its own card above the list, so the list leaves it out, unless it is
  // the only story: an empty list would wrongly say there is nothing to show.
  const featured = stories.length > 1 ? pickFeaturedStory(stories, searchText) : null;
  const listed = filterStories(stories, searchText).filter((story) => story.id !== featured?.id);
  const { visible, hasMore, nextLimit } = paginateStories(sortStories(listed, order), pageLimit);

  return (
    <>
      <NewsList stories={visible} now={now ?? new Date()} isSearching={searchText.trim() !== ""} />
      {hasMore ? (
        <div className="flex justify-center">
          <LoadMoreButton nextLimit={nextLimit} />
        </div>
      ) : null}
    </>
  );
};
