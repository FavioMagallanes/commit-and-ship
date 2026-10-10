import { createLoader, createParser, parseAsString, parseAsStringLiteral } from "nuqs/server";

/** The search text lives in the url as `?q=` so a search can be shared and survives a reload. */
export const searchParsers = {
  q: parseAsString.withDefault(""),
};

const loadSearchParams = createLoader(searchParsers);

export const loadSearchQuery = async (
  searchParams: Promise<Record<string, string | string[] | undefined>>,
): Promise<string> => (await loadSearchParams(searchParams)).q;

export const sortOrders = ["recent", "popular"] as const;

export type SortOrder = (typeof sortOrders)[number];

export const DEFAULT_LIMIT = 10;

// Only whole numbers from 1 up are valid; anything else falls back to the default page size.
const parseAsPageLimit = createParser({
  parse: (value) => (/^\d+$/.test(value) && Number(value) >= 1 ? Number(value) : null),
  serialize: (value: number) => String(value),
});

/** Order (`?sort=`) and page size (`?limit=`) of the news list, shareable like the search. */
export const feedControlParsers = {
  sort: parseAsStringLiteral(sortOrders).withDefault("recent"),
  limit: parseAsPageLimit.withDefault(DEFAULT_LIMIT),
};

const loadFeedControlParams = createLoader(feedControlParsers);

export const loadFeedControls = async (
  searchParams: Promise<Record<string, string | string[] | undefined>>,
): Promise<{ sort: SortOrder; limit: number }> => {
  const { sort, limit } = await loadFeedControlParams(searchParams);
  return { sort, limit };
};
