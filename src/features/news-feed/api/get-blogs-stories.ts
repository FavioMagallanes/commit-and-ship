import { cacheLife, cacheTag } from "next/cache";

import { fetchBlogFeeds } from "@/features/news-feed/api/blogs";
import type { SourceSnapshot } from "@/features/news-feed/api/get-news-snapshot";
import { keepLastGoodStories } from "@/features/news-feed/api/keep-last-good-stories";

/**
 * Reads every official blog once and never throws: a failure comes back as the error branch,
 * because an error thrown inside a "use cache" scope fails the prerender, and with it the whole
 * build. It is ok while at least one feed has posts, and an error only when every feed failed.
 */
export const readBlogSnapshot = async (
  fetchFn: typeof fetch = fetch,
  now: () => Date = () => new Date(),
): Promise<SourceSnapshot> => {
  try {
    const stories = await fetchBlogFeeds(fetchFn);
    return { status: "ok", stories, fetchedAt: now().toISOString() };
  } catch {
    return { status: "error", fetchedAt: now().toISOString() };
  }
};

/**
 * Newest posts of the official blogs, cached on the server and revalidated every 30 minutes,
 * since blogs publish a few times a week; a failed read is retried after a minute instead.
 */
const getCachedBlogSnapshot = async (): Promise<SourceSnapshot> => {
  "use cache";
  cacheTag("news", "blogs");

  const snapshot = await readBlogSnapshot();
  cacheLife({ revalidate: snapshot.status === "ok" ? 1_800 : 60 });
  return snapshot;
};

/** The cached read, plus the last good stories when the latest refill failed. */
export const getBlogSnapshot = keepLastGoodStories("blogs", getCachedBlogSnapshot);
