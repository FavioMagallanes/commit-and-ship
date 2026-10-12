import { connection } from "next/server";

import { retryReleases } from "@/features/release-radar/actions/retry-releases";
import {
  getLatestReleasesResult,
  type ReleasesResult,
  releasesToShow,
} from "@/features/release-radar/api/get-latest-releases";
import { isRecentRelease } from "@/features/release-radar/model/is-recent-release";
import { sortReleasesByDate } from "@/features/release-radar/model/sort-releases";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { ErrorBanner, StaleContentBanner } from "@/shared/ui/error-banner";
import { RetryButton } from "@/shared/ui/retry-button";

import { RadarRow } from "./radar-row";

type ReleaseListProps = {
  loadReleases?: () => Promise<ReleasesResult>;
  now?: Date;
};

const loadOrNull = async (loadReleases: () => Promise<ReleasesResult>) => {
  try {
    return releasesToShow(await loadReleases());
  } catch {
    return null;
  }
};

/** Every tracked release, most recent first: the full version of the home radar. */
export const ReleaseList = async ({
  loadReleases = getLatestReleasesResult,
  now,
}: ReleaseListProps) => {
  const shown = await loadOrNull(loadReleases);
  // "New" and the relative times depend on the clock, so the list renders per request.
  if (!now) await connection();
  const reference = now ?? new Date();

  if (shown === null) {
    return (
      <ErrorBanner
        title="No pudimos cargar las versiones"
        action={<RetryButton action={retryReleases} />}
      >
        Probá de nuevo en unos minutos.
      </ErrorBanner>
    );
  }

  const staleBanner =
    shown.savedAt === null ? null : (
      <StaleContentBanner
        title="No pudimos actualizar las versiones"
        savedAt={shown.savedAt}
        now={reference}
        action={<RetryButton action={retryReleases} />}
      />
    );

  if (shown.releases.length === 0) {
    return (
      <>
        {staleBanner}
        <p className="text-base text-muted">Todavía no hay versiones para mostrar.</p>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {staleBanner}
      <ul className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-6">
        {sortReleasesByDate(shown.releases).map((release) => (
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
    </div>
  );
};
