import { connection } from "next/server";

import { buildActivityLog } from "@/features/activity-log/model/build-activity-log";
import { getHackerNewsStories } from "@/features/news-feed/api/get-hacker-news-stories";
import type { NewsStory } from "@/features/news-feed/model/news-story";
import { getLatestReleases } from "@/features/release-radar/api/get-latest-releases";
import type { Release } from "@/features/release-radar/model/release";
import { formatElapsedTime } from "@/shared/lib/format-relative-time";

type ActivityTerminalProps = {
  loadStories?: () => Promise<NewsStory[]>;
  loadReleases?: () => Promise<Release[]>;
  now?: Date;
};

const loadOrEmpty = async <T,>(load: () => Promise<T[]>): Promise<T[]> => {
  try {
    return await load();
  } catch {
    return [];
  }
};

const Dot = () => <span className="size-2.5 rounded-full bg-terminal-muted/40" />;

/** Decorative panel: the same events the page lists, written as a log. */
export const ActivityTerminal = async ({
  loadStories = getHackerNewsStories,
  loadReleases = getLatestReleases,
  now,
}: ActivityTerminalProps) => {
  const [stories, releases] = await Promise.all([
    loadOrEmpty(loadStories),
    loadOrEmpty(loadReleases),
  ]);
  // Elapsed times depend on the clock, so this renders per request (the data stays cached).
  if (!now) await connection();
  const reference = now ?? new Date();
  const log = buildActivityLog(stories, releases);

  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-3 rounded-xl bg-terminal p-5 font-mono text-sm text-terminal-text"
    >
      <div className="flex items-center gap-2 text-xs text-terminal-muted">
        <Dot />
        <Dot />
        <Dot />
        <span className="ml-2">novedades.log</span>
      </div>
      <p className="text-terminal-muted">$ tail -f novedades.log</p>
      {log.length === 0 ? (
        <p className="text-terminal-muted">sin novedades por ahora</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {log.map((entry) => (
            <li
              key={`${entry.source}-${entry.publishedAt}-${entry.text}`}
              className="grid grid-cols-[3rem_1.5rem_1fr] gap-x-2"
            >
              <span className="text-terminal-accent">
                {formatElapsedTime(entry.publishedAt, reference)}
              </span>
              <span>{entry.source}</span>
              <span className="truncate">{entry.text}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-terminal-muted">
        $ buscar <span className="text-terminal-accent">_</span>
      </p>
    </div>
  );
};
