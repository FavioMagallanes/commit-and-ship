import type { Release } from "@/features/release-radar/model/release";

/** Most recent release first. Returns a new array. */
export const sortReleasesByDate = (releases: Release[]): Release[] =>
  releases.toSorted((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
