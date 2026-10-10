import { describe, expect, it, vi } from "vitest";

import {
  fetchLatestReleases,
  parseLatestRelease,
} from "@/features/release-radar/api/github-releases";
import type { TrackedRepo } from "@/features/release-radar/model/release";

import { GITHUB_LATEST_RELEASE } from "../fixtures/github-latest-release";

const NODE: TrackedRepo = { repo: "nodejs/node", name: "Node.js" };
const REACT: TrackedRepo = { repo: "facebook/react", name: "React" };

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe("parseLatestRelease", () => {
  it("maps a GitHub release to a Release", () => {
    expect(parseLatestRelease(NODE, GITHUB_LATEST_RELEASE)).toEqual({
      repo: "nodejs/node",
      name: "Node.js",
      version: "v26.0.1",
      url: "https://github.com/nodejs/node/releases/tag/v26.0.1",
      publishedAt: "2026-10-08T12:00:00.000Z",
    });
  });

  it("rejects a response without a tag", () => {
    expect(() => parseLatestRelease(NODE, { ...GITHUB_LATEST_RELEASE, tag_name: "" })).toThrow();
  });

  it("rejects a response with a missing publication date", () => {
    expect(() =>
      parseLatestRelease(NODE, { ...GITHUB_LATEST_RELEASE, published_at: null }),
    ).toThrow();
  });

  it("rejects a non-http release url", () => {
    expect(() =>
      parseLatestRelease(NODE, { ...GITHUB_LATEST_RELEASE, html_url: "javascript:alert(1)" }),
    ).toThrow();
  });
});

describe("fetchLatestReleases", () => {
  it("requests the latest release of every repository", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => jsonResponse(GITHUB_LATEST_RELEASE));

    const releases = await fetchLatestReleases([NODE, REACT], fetchFn);

    expect(releases).toHaveLength(2);
    const urls = fetchFn.mock.calls.map(([url]) => String(url));
    expect(urls).toEqual([
      "https://api.github.com/repos/nodejs/node/releases/latest",
      "https://api.github.com/repos/facebook/react/releases/latest",
    ]);
  });

  it("keeps the repositories that answered when another one fails", async () => {
    const fetchFn = vi.fn(async (url: string | URL | Request) =>
      String(url).includes("react") ? jsonResponse({}, 404) : jsonResponse(GITHUB_LATEST_RELEASE),
    );

    const releases = await fetchLatestReleases([NODE, REACT], fetchFn);

    expect(releases.map((release) => release.repo)).toEqual(["nodejs/node"]);
  });

  it("throws when no repository answered", async () => {
    const fetchFn = vi.fn(async () => jsonResponse({}, 403));

    await expect(fetchLatestReleases([NODE, REACT], fetchFn)).rejects.toThrow();
  });
});
