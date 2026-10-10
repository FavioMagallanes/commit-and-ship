import { createLoader, parseAsString } from "nuqs/server";

/** The search text lives in the url as `?q=` so a search can be shared and survives a reload. */
export const searchParsers = {
  q: parseAsString.withDefault(""),
};

const loadSearchParams = createLoader(searchParsers);

export const loadSearchQuery = async (
  searchParams: Promise<Record<string, string | string[] | undefined>>,
): Promise<string> => (await loadSearchParams(searchParams)).q;
