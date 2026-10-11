import { connection } from "next/server";

import { getNewsSnapshot } from "@/features/news-feed/api/get-news-snapshot";
import { countRecentStories } from "@/features/news-feed/model/count-recent-stories";
import type { NewsSnapshot } from "@/features/news-feed/model/news-story";
import { ACTIVE_SOURCES } from "@/shared/lib/active-sources";
import { formatElapsedTime } from "@/shared/lib/format-relative-time";

type IntroStatsProps = {
  loadSnapshot?: () => Promise<NewsSnapshot>;
  now?: Date;
};

const loadOrNull = async (loadSnapshot: () => Promise<NewsSnapshot>) => {
  try {
    return await loadSnapshot();
  } catch {
    return null;
  }
};

const Stat = ({ value, label }: { value: number | string; label: string }) => (
  <li className="flex items-baseline gap-2">
    <span className="font-mono text-md font-bold text-ink">{value}</span>{" "}
    <span className="text-base text-muted">{label}</span>
  </li>
);

export const IntroStats = async ({ loadSnapshot = getNewsSnapshot, now }: IntroStatsProps) => {
  const snapshot = await loadOrNull(loadSnapshot);
  // "Today" and "since the last update" depend on the clock, so this renders per request.
  if (!now) await connection();
  const reference = now ?? new Date();

  const todayCount = snapshot === null ? null : countRecentStories(snapshot.stories, reference);

  return (
    <ul aria-label="Estadísticas" className="hidden flex-wrap gap-x-8 gap-y-2 md:flex">
      <Stat
        value={ACTIVE_SOURCES.length}
        label={ACTIVE_SOURCES.length === 1 ? "fuente" : "fuentes"}
      />
      {snapshot === null || todayCount === null ? null : (
        <>
          <Stat value={todayCount} label={todayCount === 1 ? "novedad hoy" : "novedades hoy"} />
          <Stat
            value={formatElapsedTime(snapshot.fetchedAt, reference)}
            label="desde la última actualización"
          />
        </>
      )}
    </ul>
  );
};
