import { connection } from "next/server";

import { getLatestReleases } from "@/features/release-radar/api/get-latest-releases";
import { filterReleases } from "@/features/release-radar/model/filter-releases";
import { isRecentRelease } from "@/features/release-radar/model/is-recent-release";
import type { Release } from "@/features/release-radar/model/release";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { CardHeader } from "@/shared/ui/card-header";
import { ErrorBanner } from "@/shared/ui/error-banner";

import { RadarRow } from "./radar-row";

type ReleaseRadarProps = {
  loadReleases?: () => Promise<Release[]>;
  now?: Date;
  /** Search text; resolves from the url on the server. */
  query?: Promise<string>;
};

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
  const visibleReleases = releases === null ? null : filterReleases(releases, searchText);
  // "New" depends on the current time, so the radar renders per request (the data stays cached).
  if (!now) await connection();
  const reference = now ?? new Date();

  return (
    <section
      aria-labelledby="release-radar-heading"
      className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-6"
    >
      <CardHeader id="release-radar-heading" title="Radar de versiones" />
      {visibleReleases === null ? (
        <ErrorBanner title="No pudimos cargar el radar de versiones">
          El resto de las fuentes funciona con normalidad.
        </ErrorBanner>
      ) : visibleReleases.length === 0 ? (
        <p className="text-base text-muted">Ninguna versión coincide con la búsqueda.</p>
      ) : (
        <ul className="flex flex-col gap-5">
          {visibleReleases.map((release) => (
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
      )}
    </section>
  );
};
