import { describe, expect, it } from "vitest";

import { filterReleases } from "@/features/release-radar/model/filter-releases";
import type { Release } from "@/features/release-radar/model/release";

const release = (name: string, version: string): Release => ({
  repo: `owner/${name}`,
  name,
  version,
  url: "https://github.com/owner/repo/releases/tag/x",
  publishedAt: "2026-10-10T10:00:00.000Z",
});

const releases = [release("Node.js", "v26.0.1"), release("Rust", "1.99.0")];

describe("filterReleases", () => {
  it("returns every release for an empty query", () => {
    expect(filterReleases(releases, "")).toEqual(releases);
  });

  it("matches by name", () => {
    expect(filterReleases(releases, "node").map((item) => item.name)).toEqual(["Node.js"]);
  });

  it("matches by version", () => {
    expect(filterReleases(releases, "1.99").map((item) => item.name)).toEqual(["Rust"]);
  });
});
