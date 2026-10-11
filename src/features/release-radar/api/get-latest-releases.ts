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

/**
 * Latest releases of the tracked repositories, cached on the server for 30 minutes.
 * Unauthenticated GitHub allows 60 requests per hour per IP: 8 repos every 30 minutes is 16.
 */
export const getLatestReleases = async (): Promise<Release[]> => {
  "use cache";
  cacheLife({ revalidate: 1800 });
  cacheTag("releases", "github");

  return fetchLatestReleases(TRACKED_REPOS);
};
