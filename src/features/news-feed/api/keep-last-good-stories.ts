import type { SourceSnapshot } from "@/features/news-feed/api/get-news-snapshot";
import type { NewsStory } from "@/features/news-feed/model/news-story";
import { lastGoodSnapshot, type SnapshotKey } from "@/shared/lib/last-good-snapshot";

/**
 * Wraps a cached source read so a failed refill still carries the last good stories. It runs
 * outside "use cache" on purpose: a cached function only runs when its entry is filled, while
 * this wrapper runs on every render, so it remembers whatever the cache serves and recalls on
 * every error. The max age is measured from the failed attempt, which keeps the clock out of the
 * render.
 */
export const keepLastGoodStories = (
  key: SnapshotKey,
  load: () => Promise<SourceSnapshot>,
): (() => Promise<SourceSnapshot>) => {
  const lastGood = lastGoodSnapshot<NewsStory[]>(key);

  return async () => {
    const snapshot = await load();
    if (snapshot.status === "ok") {
      lastGood.remember(snapshot.stories, snapshot.fetchedAt);
      return snapshot;
    }

    const saved = lastGood.recall(new Date(snapshot.fetchedAt));
    return saved === null
      ? snapshot
      : { ...snapshot, stale: { stories: saved.value, savedAt: saved.savedAt } };
  };
};
