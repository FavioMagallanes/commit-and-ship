import { getBlogSnapshot } from "@/features/news-feed/api/get-blogs-stories";
import { getDevToSnapshot } from "@/features/news-feed/api/get-dev-to-stories";
import { getHackerNewsSnapshot } from "@/features/news-feed/api/get-hacker-news-stories";
import type { NewsSnapshot, NewsStory, StaleSource } from "@/features/news-feed/model/news-story";

/**
 * One read of a single source. Plain data, so it can be stored by "use cache". A failed read may
 * carry `stale`: the last good stories, with the instant they were read, while `fetchedAt` stays
 * the instant of the failed attempt.
 */
export type SourceSnapshot =
  | { status: "ok"; stories: NewsStory[]; fetchedAt: string }
  | {
      status: "error";
      fetchedAt: string;
      stale?: { stories: NewsStory[]; savedAt: string };
    };

type LoadSourceSnapshot = () => Promise<SourceSnapshot>;

/** A source loader with the name the error banner uses for it. */
export type NewsSourceLoader = { name: string; load: LoadSourceSnapshot };

const defaultLoaders: NewsSourceLoader[] = [
  { name: "Hacker News", load: getHackerNewsSnapshot },
  { name: "dev.to", load: getDevToSnapshot },
  { name: "Blogs oficiales", load: getBlogSnapshot },
];

type SourceRead =
  | { name: string; snapshot: SourceSnapshot; reason: null }
  | { name: string; snapshot: null; reason: unknown };

// A loader that rejects counts as a failed source, so it never takes the others down.
const readSource = async ({ name, load }: NewsSourceLoader): Promise<SourceRead> => {
  try {
    return { name, snapshot: await load(), reason: null };
  } catch (reason) {
    return { name, snapshot: null, reason };
  }
};

const toTime = (isoInstant: string) => new Date(isoInstant).getTime();

/**
 * Stories of every news source in one snapshot. A failing source adds its last good stories when
 * it has them and is named in `staleSources`; otherwise it is left out so the others still show.
 * Only when no source has anything to show does this throw. `fetchedAt` is the oldest of the
 * successful reads, or of the saved ones when every source failed, so "updated N min ago" never
 * looks fresher than the data really is.
 */
export const getNewsSnapshot = async (
  loaders: NewsSourceLoader[] = defaultLoaders,
): Promise<NewsSnapshot> => {
  const reads = await Promise.all(loaders.map(readSource));

  const freshTimes = reads.flatMap(({ snapshot }) =>
    snapshot?.status === "ok" ? [snapshot.fetchedAt] : [],
  );
  const staleSources: StaleSource[] = reads.flatMap(({ name, snapshot }) =>
    snapshot?.status === "error" && snapshot.stale !== undefined
      ? [{ name, savedAt: snapshot.stale.savedAt }]
      : [],
  );

  const [first, ...rest] =
    freshTimes.length > 0 ? freshTimes : staleSources.map((source) => source.savedAt);
  if (first === undefined) {
    throw new AggregateError(
      reads.map((read) => read.reason),
      "Every news source failed",
    );
  }

  return {
    stories: reads.flatMap(({ snapshot }) => {
      if (snapshot === null) return [];
      if (snapshot.status === "ok") return snapshot.stories;
      return snapshot.stale?.stories ?? [];
    }),
    fetchedAt: rest.reduce(
      (oldest, instant) => (toTime(instant) < toTime(oldest) ? instant : oldest),
      first,
    ),
    staleSources,
  };
};

export const getNewsStories = async (
  loaders: NewsSourceLoader[] = defaultLoaders,
): Promise<NewsStory[]> => (await getNewsSnapshot(loaders)).stories;
