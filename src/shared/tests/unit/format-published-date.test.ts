import { describe, expect, it } from "vitest";

import { formatPublishedDate } from "@/shared/lib/format-published-date";

describe("formatPublishedDate", () => {
  it("formats a UTC instant as a short Spanish date", () => {
    expect(formatPublishedDate("2026-10-10T15:30:00.000Z")).toBe("10 oct");
  });

  it("does not shift the day for late-evening UTC instants", () => {
    expect(formatPublishedDate("2026-10-10T23:59:00.000Z")).toBe("10 oct");
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatPublishedDate("not-a-date")).toBe("");
  });
});
