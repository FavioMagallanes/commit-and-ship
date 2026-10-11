import { cacheLife, cacheTag } from "next/cache";

import { fetchDevToTopArticles } from "@/features/news-feed/api/dev-to";
import type { NewsSnapshot, NewsStory } from "@/features/news-feed/model/news-story";

/**
 * Top dev.to articles of the day, cached on the server and revalidated every 10 minutes.
 * `fetchedAt` is taken when the cache entry is filled, so it tells how stale the data really is.
 */
export const getDevToSnapshot = async (): Promise<NewsSnapshot> => {
  "use cache";
  cacheLife({ revalidate: 600 });
  cacheTag("news", "dev-to");

  return { stories: await fetchDevToTopArticles(), fetchedAt: new Date().toISOString() };
};

export const getDevToStories = async (): Promise<NewsStory[]> => (await getDevToSnapshot()).stories;
