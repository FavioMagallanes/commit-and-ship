import type { NewsStory } from "@/features/news-feed/model/news-story";
import type { Release } from "@/features/release-radar/model/release";

const LOG_SIZE = 4;

export type ActivityEntry = {
  source: "HN" | "GH";
  text: string;
  /** ISO 8601 instant in UTC. */
  publishedAt: string;
};

const isValidInstant = (isoInstant: string) => !Number.isNaN(new Date(isoInstant).getTime());

/** The latest events across sources, newest first, as one-line log entries. */
export const buildActivityLog = (stories: NewsStory[], releases: Release[]): ActivityEntry[] =>
  [
    ...stories.map((story): ActivityEntry => ({
      source: "HN",
      text: story.title,
      publishedAt: story.publishedAt,
    })),
    ...releases.map((release): ActivityEntry => ({
      source: "GH",
      text: `${release.name} ${release.version} publicada`,
      publishedAt: release.publishedAt,
    })),
  ]
    .filter((entry) => isValidInstant(entry.publishedAt))
    .toSorted((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, LOG_SIZE);
