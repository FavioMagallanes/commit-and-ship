import { cacheLife, cacheTag } from "next/cache";

import type { SourceSnapshot } from "@/features/news-feed/api/get-news-snapshot";
import { fetchHackerNewsFrontPage } from "@/features/news-feed/api/hacker-news";
import { keepLastGoodStories } from "@/features/news-feed/api/keep-last-good-stories";
import type { NewsStory } from "@/features/news-feed/model/news-story";

/**
 * Reads Hacker News once and never throws: a failure comes back as the error branch, because an
 * error thrown inside a "use cache" scope fails the prerender, and with it the whole build.
 */
export const readHackerNewsSnapshot = async (
  fetchFn: typeof fetch = fetch,
  now: () => Date = () => new Date(),
): Promise<SourceSnapshot> => {
  try {
    const stories = await fetchHackerNewsFrontPage(fetchFn);
    return { status: "ok", stories, fetchedAt: now().toISOString() };
  } catch {
    return { status: "error", fetchedAt: now().toISOString() };
  }
};

/**
 * Front page of Hacker News, cached on the server and revalidated every 10 minutes; a failed read
 * is retried after a minute instead. `fetchedAt` is taken when the cache entry is filled, so it
 * tells how stale the data really is.
 */
const getCachedHackerNewsSnapshot = async (): Promise<SourceSnapshot> => {
  "use cache";
  cacheTag("news", "hacker-news");

  const snapshot = await readHackerNewsSnapshot();
  cacheLife({ revalidate: snapshot.status === "ok" ? 600 : 60 });
  return snapshot;
};

/** The cached read, plus the last good stories when the latest refill failed. */
export const getHackerNewsSnapshot = keepLastGoodStories(
  "hacker-news",
  getCachedHackerNewsSnapshot,
);

export const getHackerNewsStories = async (): Promise<NewsStory[]> => {
  const snapshot = await getHackerNewsSnapshot();
  if (snapshot.status === "error") throw new Error("Hacker News could not be read");
  return snapshot.stories;
};
