import { connection } from "next/server";

import { getHackerNewsStories } from "@/features/news-feed/api/get-hacker-news-stories";
import { filterStories } from "@/features/news-feed/model/filter-stories";
import type { NewsStory } from "@/features/news-feed/model/news-story";
import { ErrorBanner } from "@/shared/ui/error-banner";

import { NewsList } from "./news-list";

type NewsFeedProps = {
  loadStories?: () => Promise<NewsStory[]>;
  now?: Date;
  /** Search text; resolves from the url on the server. */
  query?: Promise<string>;
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
}: NewsFeedProps) => {
  const [stories, searchText] = await Promise.all([loadOrNull(loadStories), query]);
  // Relative times depend on the current time, so this renders per request (the data stays cached).
  if (!now) await connection();

  if (stories === null) {
    return (
      <ErrorBanner title="No pudimos cargar Hacker News">
        El resto de las fuentes funciona con normalidad.
      </ErrorBanner>
    );
  }

  return (
    <NewsList
      stories={filterStories(stories, searchText)}
      now={now ?? new Date()}
      isSearching={searchText.trim() !== ""}
    />
  );
};
