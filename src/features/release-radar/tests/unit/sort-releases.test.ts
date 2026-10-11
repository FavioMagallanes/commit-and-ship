import { describe, expect, it } from "vitest";

import type { Release } from "@/features/release-radar/model/release";
import { sortReleasesByDate } from "@/features/release-radar/model/sort-releases";

const release = (repo: string, publishedAt: string): Release => ({
  repo,
  name: repo,
  version: "v1.0.0",
  url: `https://github.com/${repo}/releases/tag/v1.0.0`,
  publishedAt,
});

describe("sortReleasesByDate", () => {
  it("puts the most recent release first", () => {
    const releases = [
      release("a/old", "2026-09-01T00:00:00.000Z"),
      release("b/new", "2026-10-09T00:00:00.000Z"),
      release("c/mid", "2026-10-01T00:00:00.000Z"),
    ];

    expect(sortReleasesByDate(releases).map(({ repo }) => repo)).toEqual([
      "b/new",
      "c/mid",
      "a/old",
    ]);
  });

  it("does not mutate the input", () => {
    const releases = [
      release("a/old", "2026-09-01T00:00:00.000Z"),
      release("b/new", "2026-10-09T00:00:00.000Z"),
    ];

    sortReleasesByDate(releases);

    expect(releases[0]?.repo).toBe("a/old");
  });
});
