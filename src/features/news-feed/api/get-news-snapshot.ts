import { getDevToSnapshot } from "@/features/news-feed/api/get-dev-to-stories";
import { getHackerNewsSnapshot } from "@/features/news-feed/api/get-hacker-news-stories";
import type { NewsSnapshot, NewsStory } from "@/features/news-feed/model/news-story";

type LoadSnapshot = () => Promise<NewsSnapshot>;

const defaultLoaders: LoadSnapshot[] = [getHackerNewsSnapshot, getDevToSnapshot];

const toTime = (isoInstant: string) => new Date(isoInstant).getTime();

/**
 * Stories of every news source in one snapshot. A failing source is left out so the others still
 * show; only when every source fails does this throw. `fetchedAt` is the oldest of the successful
 * reads, so "updated N min ago" never looks fresher than the data really is.
 */
export const getNewsSnapshot = async (
  loaders: LoadSnapshot[] = defaultLoaders,
): Promise<NewsSnapshot> => {
  const results = await Promise.allSettled(loaders.map((load) => load()));
  const snapshots = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );

  const [first, ...rest] = snapshots;
  if (first === undefined) {
    throw new AggregateError(
      results.map((result) => (result.status === "rejected" ? result.reason : null)),
      "Every news source failed",
    );
  }

  return {
    stories: snapshots.flatMap((snapshot) => snapshot.stories),
    fetchedAt: rest.reduce(
      (oldest, snapshot) =>
        toTime(snapshot.fetchedAt) < toTime(oldest) ? snapshot.fetchedAt : oldest,
      first.fetchedAt,
    ),
  };
};

export const getNewsStories = async (
  loaders: LoadSnapshot[] = defaultLoaders,
): Promise<NewsStory[]> => (await getNewsSnapshot(loaders)).stories;
