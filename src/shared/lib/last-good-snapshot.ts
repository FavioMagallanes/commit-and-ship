/**
 * Last good read of each source, kept in this server process so a failed refill can still show
 * the previous data instead of only an error. It lives in memory: a restart or a cold start
 * empties it, and separate instances (for example serverless functions) do not share it.
 */

/** Every source that keeps a last good read; the store never grows past these. */
export type SnapshotKey = "hacker-news" | "dev-to" | "blogs" | "releases" | "conversation";

export type SavedSnapshot<T> = {
  /** The value as it was remembered; callers must treat it as read-only. */
  value: T;
  /** ISO 8601 instant in UTC when the value was read from its source. */
  savedAt: string;
};

/** Older data is too stale to stand in for a source, so it is dropped instead of shown. */
export const MAX_SNAPSHOT_AGE_MS = 24 * 60 * 60 * 1000;

const clearers = new Set<() => void>();

/**
 * The slot of one source. Each slot is typed by its own value, so reading it back needs no cast.
 * Slots are meant to be created once per module, at load time.
 */
export const lastGoodSnapshot = <T>(key: SnapshotKey) => {
  let saved: Readonly<SavedSnapshot<T>> | null = null;
  clearers.add(() => {
    saved = null;
  });

  return {
    key,
    remember: (value: T, savedAt: string): void => {
      saved = Object.freeze({ value, savedAt });
    },
    /** The last good value, or null when there is none or it is older than the max age. */
    recall: (now: Date): Readonly<SavedSnapshot<T>> | null => {
      if (saved === null) return null;
      const age = now.getTime() - new Date(saved.savedAt).getTime();
      if (Number.isNaN(age) || age > MAX_SNAPSHOT_AGE_MS) {
        saved = null;
        return null;
      }
      return saved;
    },
  };
};

/** Forgets every remembered value. Meant for tests. */
export const resetLastGoodSnapshots = (): void => {
  clearers.forEach((clear) => clear());
};
