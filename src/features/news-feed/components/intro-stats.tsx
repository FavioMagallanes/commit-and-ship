import { connection } from "next/server";

import { getHackerNewsStories } from "@/features/news-feed/api/get-hacker-news-stories";
import { countRecentStories } from "@/features/news-feed/model/count-recent-stories";
import type { NewsStory } from "@/features/news-feed/model/news-story";
import { ACTIVE_SOURCES } from "@/shared/lib/active-sources";

type IntroStatsProps = {
  loadStories?: () => Promise<NewsStory[]>;
  now?: Date;
};

const loadOrNull = async (loadStories: () => Promise<NewsStory[]>) => {
  try {
    return await loadStories();
  } catch {
    return null;
  }
};

const Stat = ({ value, label }: { value: number; label: string }) => (
  <li className="flex items-baseline gap-2">
    <span className="font-mono text-md font-bold text-ink">{value}</span>{" "}
    <span className="text-base text-muted">{label}</span>
  </li>
);

export const IntroStats = async ({ loadStories = getHackerNewsStories, now }: IntroStatsProps) => {
  const stories = await loadOrNull(loadStories);
  // "Today" depends on the current time, so this renders per request (the data stays cached).
  if (!now) await connection();
  const reference = now ?? new Date();

  const todayCount = stories === null ? null : countRecentStories(stories, reference);

  return (
    <ul aria-label="Estadísticas" className="flex flex-wrap gap-x-8 gap-y-2">
      <Stat
        value={ACTIVE_SOURCES.length}
        label={ACTIVE_SOURCES.length === 1 ? "fuente" : "fuentes"}
      />
      {todayCount === null ? null : (
        <Stat value={todayCount} label={todayCount === 1 ? "novedad hoy" : "novedades hoy"} />
      )}
    </ul>
  );
};
