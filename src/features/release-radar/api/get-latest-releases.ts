import { cacheLife, cacheTag } from "next/cache";

import { fetchLatestReleases } from "@/features/release-radar/api/github-releases";
import type { Release, TrackedRepo } from "@/features/release-radar/model/release";

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

/** One read of GitHub. Plain data, so it can be stored by "use cache". */
type ReleasesResult = { status: "ok"; releases: Release[] } | { status: "error" };

/**
 * Reads GitHub once and never throws: a failure comes back as the error branch, because an error
 * thrown inside a "use cache" scope fails the prerender, and with it the whole build.
 */
export const readLatestReleases = async (
  repos: TrackedRepo[],
  fetchFn: typeof fetch = fetch,
): Promise<ReleasesResult> => {
  try {
    return { status: "ok", releases: await fetchLatestReleases(repos, fetchFn) };
  } catch {
    return { status: "error" };
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

/** Latest releases of the tracked repositories. Throws, outside the cache, when GitHub failed. */
export const getLatestReleases = async (): Promise<Release[]> => {
  const result = await getCachedLatestReleases();
  if (result.status === "error") throw new Error("GitHub releases could not be read");
  return result.releases;
};
