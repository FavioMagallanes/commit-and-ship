import { describe, expect, it } from "vitest";

import { isRecentRelease } from "@/features/release-radar/model/is-recent-release";

const NOW = new Date("2026-10-10T12:00:00Z");

describe("isRecentRelease", () => {
  it("is true for a release published less than 48 hours ago", () => {
    expect(isRecentRelease("2026-10-09T13:00:00Z", NOW)).toBe(true);
  });

  it("is false for an older release", () => {
    expect(isRecentRelease("2026-10-08T11:00:00Z", NOW)).toBe(false);
  });

  it("is false for an invalid date instead of assuming it is new", () => {
    expect(isRecentRelease("nope", NOW)).toBe(false);
  });
});
