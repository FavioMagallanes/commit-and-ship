const RECENT_WINDOW_MS = 48 * 60 * 60 * 1000;

/** A release counts as new for 48 hours. An invalid date is never new. */
export const isRecentRelease = (publishedAt: string, now: Date): boolean => {
  const published = new Date(publishedAt).getTime();
  if (Number.isNaN(published)) return false;

  return now.getTime() - published < RECENT_WINDOW_MS;
};
