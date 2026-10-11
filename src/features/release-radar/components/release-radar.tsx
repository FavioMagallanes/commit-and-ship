import { connection } from "next/server";

import { retryReleases } from "@/features/release-radar/actions/retry-releases";
import { getLatestReleases } from "@/features/release-radar/api/get-latest-releases";
import { filterReleases } from "@/features/release-radar/model/filter-releases";
import { isRecentRelease } from "@/features/release-radar/model/is-recent-release";
import type { Release } from "@/features/release-radar/model/release";
import { sortReleasesByDate } from "@/features/release-radar/model/sort-releases";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { CardHeader } from "@/shared/ui/card-header";
import { ErrorBanner } from "@/shared/ui/error-banner";
import { RetryButton } from "@/shared/ui/retry-button";

import { RadarRow } from "./radar-row";

type ReleaseRadarProps = {
  loadReleases?: () => Promise<Release[]>;
  now?: Date;
  /** Search text; resolves from the url on the server. */
  query?: Promise<string>;
};

// The design shows six rows on desktop and four on small screens; the rest live in /releases.
const RADAR_SIZE = 6;
const MOBILE_RADAR_SIZE = 4;

const loadOrNull = async (loadReleases: () => Promise<Release[]>) => {
  try {
    return await loadReleases();
  } catch {
    return null;
  }
};

export const ReleaseRadar = async ({
  loadReleases = getLatestReleases,
  now,
  query = Promise.resolve(""),
}: ReleaseRadarProps) => {
  const [releases, searchText] = await Promise.all([loadOrNull(loadReleases), query]);
  const visibleReleases =
    releases === null
      ? null
      : sortReleasesByDate(filterReleases(releases, searchText)).slice(0, RADAR_SIZE);
  // "New" depends on the current time, so the radar renders per request (the data stays cached).
  if (!now) await connection();
  const reference = now ?? new Date();

  return (
    <section
      aria-labelledby="release-radar-heading"
      className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-6"
    >
      <CardHeader id="release-radar-heading" title="Radar de versiones" href="/releases" />
      {visibleReleases === null ? (
        <ErrorBanner
          title="No pudimos cargar el radar de versiones"
          action={<RetryButton action={retryReleases} />}
        >
          El resto de las fuentes funciona con normalidad.
        </ErrorBanner>
      ) : visibleReleases.length === 0 ? (
        <p className="text-base text-muted">Ninguna versión coincide con la búsqueda.</p>
      ) : (
        <ul className="flex flex-col gap-5">
          {visibleReleases.map((release, index) => (
            <RadarRow
              key={release.repo}
              name={release.name}
              version={release.version}
              href={release.url}
              publishedAt={release.publishedAt}
              publishedLabel={formatRelativeTime(release.publishedAt, reference)}
              isNew={isRecentRelease(release.publishedAt, reference)}
              className={index >= MOBILE_RADAR_SIZE ? "max-md:hidden" : undefined}
            />
          ))}
        </ul>
      )}
    </section>
  );
};
