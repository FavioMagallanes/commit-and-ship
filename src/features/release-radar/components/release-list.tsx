import { connection } from "next/server";

import { getLatestReleases } from "@/features/release-radar/api/get-latest-releases";
import { isRecentRelease } from "@/features/release-radar/model/is-recent-release";
import type { Release } from "@/features/release-radar/model/release";
import { sortReleasesByDate } from "@/features/release-radar/model/sort-releases";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { ErrorBanner } from "@/shared/ui/error-banner";

import { RadarRow } from "./radar-row";

type ReleaseListProps = {
  loadReleases?: () => Promise<Release[]>;
  now?: Date;
};

const loadOrNull = async (loadReleases: () => Promise<Release[]>) => {
  try {
    return await loadReleases();
  } catch {
    return null;
  }
};

/** Every tracked release, most recent first: the full version of the home radar. */
export const ReleaseList = async ({ loadReleases = getLatestReleases, now }: ReleaseListProps) => {
  const releases = await loadOrNull(loadReleases);
  // "New" and the relative times depend on the clock, so the list renders per request.
  if (!now) await connection();
  const reference = now ?? new Date();

  if (releases === null) {
    return (
      <ErrorBanner title="No pudimos cargar las versiones">
        Probá de nuevo en unos minutos.
      </ErrorBanner>
    );
  }

  if (releases.length === 0) {
    return <p className="text-base text-muted">Todavía no hay versiones para mostrar.</p>;
  }

  return (
    <ul className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-6">
      {sortReleasesByDate(releases).map((release) => (
        <RadarRow
          key={release.repo}
          name={release.name}
          version={release.version}
          href={release.url}
          publishedAt={release.publishedAt}
          publishedLabel={formatRelativeTime(release.publishedAt, reference)}
          isNew={isRecentRelease(release.publishedAt, reference)}
        />
      ))}
    </ul>
  );
};
