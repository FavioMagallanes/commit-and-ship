import type { NewsSource } from "@/shared/ui/source-badge";

/** A story from any source, normalized by that source's adapter. */
export type NewsStory = {
  id: string;
  source: NewsSource;
  /** Display name of the origin, for example "Hacker News". */
  sourceName: string;
  title: string;
  /** Always an http(s) url. */
  url: string;
  /** ISO 8601 instant in UTC. */
  publishedAt: string;
  points: number;
  commentsCount: number;
  /** Tags chosen by the author, when the source has them (dev.to does, Hacker News does not). */
  tags?: string[];
};

/** A source whose latest read failed, so the snapshot shows its last good stories instead. */
export type StaleSource = {
  /** Display name, for example "dev.to". */
  name: string;
  /** ISO 8601 instant in UTC when the saved stories were read. */
  savedAt: string;
};

/** A set of stories plus the instant the source was last read, for "updated N min ago". */
export type NewsSnapshot = {
  stories: NewsStory[];
  /** ISO 8601 instant in UTC when the stories were fetched from the source. */
  fetchedAt: string;
  /** Sources shown from their last good read because the latest one failed; empty when fresh. */
  staleSources: StaleSource[];
};
