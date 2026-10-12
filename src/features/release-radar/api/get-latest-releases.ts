import { cacheLife, cacheTag } from "next/cache";

import { fetchLatestReleases } from "@/features/release-radar/api/github-releases";
import type { Release, TrackedRepo } from "@/features/release-radar/model/release";
import { lastGoodSnapshot } from "@/shared/lib/last-good-snapshot";

// Go publishes tags, not GitHub releases, so it needs another source and is left out for now.
const TRACKED_REPOS: TrackedRepo[] = [
  { repo: "nodejs/node", name: "Node.js" },
  { repo: "rust-lang/rust", name: "Rust" },
  { repo: "facebook/react", name: "React" },
  { repo: "vercel/next.js", name: "Next.js" },
  { repo: "microsoft/TypeScript", name: "TypeScript" },
  { repo: "vuejs/core", name: "Vue" },
  { repo: "denoland/deno", name: "Deno" },
  { repo: "tailwindlabs/tailwindcss", name: "Tailwind CSS" },
];

/**
 * One read of GitHub. Plain data, so it can be stored by "use cache". A failed read may carry
 * `stale`: the last good releases, with the instant they were read, while `fetchedAt` stays the
 * instant of the failed attempt.
 */
export type ReleasesResult =
  | { status: "ok"; releases: Release[]; fetchedAt: string }
  | {
      status: "error";
      fetchedAt: string;
      stale?: { releases: Release[]; savedAt: string };
    };

/**
 * Reads GitHub once and never throws: a failure comes back as the error branch, because an error
 * thrown inside a "use cache" scope fails the prerender, and with it the whole build.
 */
export const readLatestReleases = async (
  repos: TrackedRepo[],
  fetchFn: typeof fetch = fetch,
  now: () => Date = () => new Date(),
): Promise<ReleasesResult> => {
  try {
    const releases = await fetchLatestReleases(repos, fetchFn);
    return { status: "ok", releases, fetchedAt: now().toISOString() };
  } catch {
    return { status: "error", fetchedAt: now().toISOString() };
  }
};

/**
 * Cached for 30 minutes; a failed read is retried after a minute instead.
 * Unauthenticated GitHub allows 60 requests per hour per IP: 8 repos every 30 minutes is 16.
 */
const getCachedLatestReleases = async (): Promise<ReleasesResult> => {
  "use cache";
  cacheTag("releases", "github");

  const result = await readLatestReleases(TRACKED_REPOS);
  cacheLife({ revalidate: result.status === "ok" ? 1800 : 60 });
  return result;
};

const lastGoodReleases = lastGoodSnapshot<Release[]>("releases");

/**
 * The cached read, plus the last good releases when the latest refill failed. It runs outside
 * "use cache" so it sees every result the cache serves, not only the ones it fills.
 */
export const getLatestReleasesResult = async (): Promise<ReleasesResult> => {
  const result = await getCachedLatestReleases();
  if (result.status === "ok") {
    lastGoodReleases.remember(result.releases, result.fetchedAt);
    return result;
  }

  const saved = lastGoodReleases.recall(new Date(result.fetchedAt));
  return saved === null
    ? result
    : { ...result, stale: { releases: saved.value, savedAt: saved.savedAt } };
};

/** What a result has to show: fresh releases, saved ones with their instant, or nothing. */
export const releasesToShow = (
  result: ReleasesResult,
): { releases: Release[]; savedAt: string | null } | null => {
  if (result.status === "ok") return { releases: result.releases, savedAt: null };
  if (result.stale !== undefined) return result.stale;
  return null;
};

/**
 * Latest releases of the tracked repositories, the saved ones when GitHub failed. Throws,
 * outside the cache, when there is nothing to show.
 */
export const getLatestReleases = async (): Promise<Release[]> => {
  const shown = releasesToShow(await getLatestReleasesResult());
  if (shown === null) throw new Error("GitHub releases could not be read");
  return shown.releases;
};
