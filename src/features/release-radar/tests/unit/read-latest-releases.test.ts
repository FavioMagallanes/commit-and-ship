import { describe, expect, it, vi } from "vitest";

import { readLatestReleases } from "@/features/release-radar/api/get-latest-releases";
import type { TrackedRepo } from "@/features/release-radar/model/release";

import { GITHUB_LATEST_RELEASE } from "../fixtures/github-latest-release";

const REPOS: TrackedRepo[] = [{ repo: "nodejs/node", name: "Node.js" }];

// GitHub being down must come back as a value: an error thrown inside a "use cache" scope fails
// the prerender, and with it the whole build.
describe("readLatestReleases", () => {
  it("returns the releases when GitHub answers", async () => {
    const result = await readLatestReleases(
      REPOS,
      vi.fn(async () => Response.json(GITHUB_LATEST_RELEASE)),
    );

    expect(result.status).toBe("ok");
    if (result.status === "ok") expect(result.releases.map((r) => r.version)).toEqual(["v26.0.1"]);
  });

  it("returns the error branch instead of throwing when every request fails", async () => {
    const timingOut = vi.fn(async (): Promise<Response> => {
      throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
    });

    await expect(readLatestReleases(REPOS, timingOut)).resolves.toEqual({ status: "error" });
  });
});
