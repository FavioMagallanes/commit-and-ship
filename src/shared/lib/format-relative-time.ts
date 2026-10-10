const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/** Spanish elapsed-time label such as "3 h", or an empty string when the instant is invalid. */
export const formatElapsedTime = (isoInstant: string, now: Date): string => {
  const published = new Date(isoInstant).getTime();
  if (Number.isNaN(published)) return "";

  const elapsed = Math.max(0, now.getTime() - published);

  if (elapsed < HOUR) return `${Math.max(1, Math.floor(elapsed / MINUTE))} min`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)} h`;
  if (elapsed < WEEK) return `${Math.floor(elapsed / DAY)} d`;
  if (elapsed < MONTH) return `${Math.floor(elapsed / WEEK)} sem`;
  if (elapsed < YEAR) {
    const months = Math.floor(elapsed / MONTH);
    return `${months} ${months === 1 ? "mes" : "meses"}`;
  }

  const years = Math.floor(elapsed / YEAR);
  return `${years} ${years === 1 ? "año" : "años"}`;
};

/** Spanish relative label such as "hace 3 h", or an empty string when the instant is invalid. */
export const formatRelativeTime = (isoInstant: string, now: Date): string => {
  const elapsed = formatElapsedTime(isoInstant, now);
  return elapsed === "" ? "" : `hace ${elapsed}`;
};
