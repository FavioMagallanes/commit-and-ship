import { cacheLife, cacheTag } from "next/cache";

import { fetchHackerNewsFrontPage } from "@/features/news-feed/api/hacker-news";
import type { NewsSnapshot, NewsStory } from "@/features/news-feed/model/news-story";

/**
 * Front page of Hacker News, cached on the server and revalidated every 10 minutes. `fetchedAt`
 * is taken when the cache entry is filled, so it tells how stale the data really is.
 */
export const getHackerNewsSnapshot = async (): Promise<NewsSnapshot> => {
  "use cache";
  cacheLife({ revalidate: 600 });
  cacheTag("news", "hacker-news");

  return { stories: await fetchHackerNewsFrontPage(), fetchedAt: new Date().toISOString() };
};

export const getHackerNewsStories = async (): Promise<NewsStory[]> =>
  (await getHackerNewsSnapshot()).stories;
