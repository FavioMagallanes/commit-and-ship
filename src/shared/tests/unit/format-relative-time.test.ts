import { describe, expect, it } from "vitest";

import { formatRelativeTime } from "@/shared/lib/format-relative-time";

const NOW = new Date("2026-10-10T12:00:00Z");
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("formatRelativeTime", () => {
  it.each([
    [5 * MIN, "hace 5 min"],
    [3 * HOUR, "hace 3 h"],
    [2 * DAY, "hace 2 d"],
    [14 * DAY, "hace 2 sem"],
    [30 * DAY, "hace 1 mes"],
    [65 * DAY, "hace 2 meses"],
    [400 * DAY, "hace 1 año"],
  ])("formats %i ms as %s", (elapsed, expected) => {
    expect(formatRelativeTime(ago(elapsed), NOW)).toBe(expected);
  });

  it("never goes below one minute, even for future instants", () => {
    expect(formatRelativeTime(ago(10_000), NOW)).toBe("hace 1 min");
    expect(formatRelativeTime(ago(-HOUR), NOW)).toBe("hace 1 min");
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatRelativeTime("nope", NOW)).toBe("");
  });
});
