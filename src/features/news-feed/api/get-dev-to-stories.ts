import { cacheLife, cacheTag } from "next/cache";

import { fetchDevToTopArticles } from "@/features/news-feed/api/dev-to";
import type { SourceSnapshot } from "@/features/news-feed/api/get-news-snapshot";
import type { NewsStory } from "@/features/news-feed/model/news-story";

/**
 * Reads dev.to once and never throws: a failure comes back as the error branch, because an error
 * thrown inside a "use cache" scope fails the prerender, and with it the whole build.
 */
export const readDevToSnapshot = async (
  fetchFn: typeof fetch = fetch,
  now: () => Date = () => new Date(),
): Promise<SourceSnapshot> => {
  try {
    const stories = await fetchDevToTopArticles(fetchFn);
    return { status: "ok", stories, fetchedAt: now().toISOString() };
  } catch {
    return { status: "error", fetchedAt: now().toISOString() };
  }
};

/**
 * Top dev.to articles of the day, cached on the server and revalidated every 10 minutes; a failed
 * read is retried after a minute instead. `fetchedAt` is taken when the cache entry is filled, so
 * it tells how stale the data really is.
 */
export const getDevToSnapshot = async (): Promise<SourceSnapshot> => {
  "use cache";
  cacheTag("news", "dev-to");

  const snapshot = await readDevToSnapshot();
  cacheLife({ revalidate: snapshot.status === "ok" ? 600 : 60 });
  return snapshot;
};

export const getDevToStories = async (): Promise<NewsStory[]> => {
  const snapshot = await getDevToSnapshot();
  if (snapshot.status === "error") throw new Error("dev.to could not be read");
  return snapshot.stories;
};
