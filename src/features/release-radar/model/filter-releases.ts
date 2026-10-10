import type { Release } from "@/features/release-radar/model/release";
import { matchesQuery } from "@/features/search-filters/model/matches-query";

export const filterReleases = (releases: Release[], query: string): Release[] =>
  releases.filter((release) => matchesQuery(query, [release.name, release.version]));
