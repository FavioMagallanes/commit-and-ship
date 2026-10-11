import { connection } from "next/server";

import { getHackerNewsSnapshot } from "@/features/news-feed/api/get-hacker-news-stories";
import type { NewsSnapshot } from "@/features/news-feed/model/news-story";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";

type UpdatedStatusProps = {
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

/** Mobile replacement for the intro stats: a single line with the last update. */
export const UpdatedStatus = async ({
  loadSnapshot = getHackerNewsSnapshot,
  now,
}: UpdatedStatusProps) => {
  const snapshot = await loadOrNull(loadSnapshot);
  if (snapshot === null) return null;
  // The elapsed time depends on the clock, so this renders per request.
  if (!now) await connection();
  const elapsed = formatRelativeTime(snapshot.fetchedAt, now ?? new Date());
  if (elapsed === "") return null;

  return (
    <p className="flex items-center gap-2 text-base text-muted md:hidden">
      <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
      Actualizado {elapsed}
    </p>
  );
};
