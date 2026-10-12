import { getBlogSnapshot } from "@/features/news-feed/api/get-blogs-stories";
import { getDevToSnapshot } from "@/features/news-feed/api/get-dev-to-stories";
import { getHackerNewsSnapshot } from "@/features/news-feed/api/get-hacker-news-stories";
import type { NewsSnapshot, NewsStory } from "@/features/news-feed/model/news-story";

/** One read of a single source. Plain data, so it can be stored by "use cache". */
export type SourceSnapshot =
  | { status: "ok"; stories: NewsStory[]; fetchedAt: string }
  | { status: "error"; fetchedAt: string };

type LoadSourceSnapshot = () => Promise<SourceSnapshot>;

const defaultLoaders: LoadSourceSnapshot[] = [
  getHackerNewsSnapshot,
  getDevToSnapshot,
  getBlogSnapshot,
];

const toTime = (isoInstant: string) => new Date(isoInstant).getTime();

/**
 * Stories of every news source in one snapshot. A failing source is left out so the others still
 * show; only when every source fails does this throw. `fetchedAt` is the oldest of the successful
 * reads, so "updated N min ago" never looks fresher than the data really is.
 */
export const getNewsSnapshot = async (
  loaders: LoadSourceSnapshot[] = defaultLoaders,
): Promise<NewsSnapshot> => {
  const results = await Promise.allSettled(loaders.map((load) => load()));
  const snapshots = results.flatMap((result) =>
    result.status === "fulfilled" && result.value.status === "ok" ? [result.value] : [],
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
  loaders: LoadSourceSnapshot[] = defaultLoaders,
): Promise<NewsStory[]> => (await getNewsSnapshot(loaders)).stories;
