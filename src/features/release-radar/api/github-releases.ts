import { z } from "zod";

import type { Release, TrackedRepo } from "@/features/release-radar/model/release";

const API_URL = "https://api.github.com/repos";
const REQUEST_TIMEOUT_MS = 8_000;

const isHttpUrl = (value: string) => {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
};

const releaseSchema = z.object({
  tag_name: z.string().min(1),
  html_url: z.string().refine(isHttpUrl, "Expected an http(s) url"),
  published_at: z.iso.datetime(),
});

export const parseLatestRelease = (repo: TrackedRepo, data: unknown): Release => {
  const { tag_name, html_url, published_at } = releaseSchema.parse(data);

  return {
    repo: repo.repo,
    name: repo.name,
    version: tag_name,
    url: html_url,
    publishedAt: new Date(published_at).toISOString(),
  };
};

const fetchLatestRelease = async (repo: TrackedRepo, fetchFn: typeof fetch): Promise<Release> => {
  const response = await fetchFn(`${API_URL}/${repo.repo}/releases/latest`, {
    headers: { Accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`GitHub request for ${repo.repo} failed with status ${response.status}`);
  }

  return parseLatestRelease(repo, await response.json());
};

/**
 * Latest release of each repository. A repository that fails (for example one that publishes
 * tags instead of releases) is skipped; it only throws when none of them answered.
 */
export const fetchLatestReleases = async (
  repos: TrackedRepo[],
  fetchFn: typeof fetch = fetch,
): Promise<Release[]> => {
  const results = await Promise.allSettled(repos.map((repo) => fetchLatestRelease(repo, fetchFn)));

  const releases = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
  if (releases.length === 0) {
    throw new Error("GitHub returned no releases for any tracked repository");
  }

  return releases;
};
