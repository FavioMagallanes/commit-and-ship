import { describe, expect, it } from "vitest";

import { loadFeedControls, loadSearchQuery } from "@/features/search-filters/model/search-params";

const load = (params: Record<string, string | string[] | undefined>) =>
  loadFeedControls(Promise.resolve(params));

describe("loadFeedControls", () => {
  it("defaults to the most recent order and the first page", async () => {
    await expect(load({})).resolves.toEqual({ sort: "recent", limit: 10 });
  });

  it("reads the order and the limit from the url", async () => {
    await expect(load({ sort: "popular", limit: "20" })).resolves.toEqual({
      sort: "popular",
      limit: 20,
    });
  });

  it("ignores an unknown order", async () => {
    await expect(load({ sort: "random" })).resolves.toEqual({ sort: "recent", limit: 10 });
  });

  it.each(["0", "-5", "1.5", "abc", ""])(
    "falls back to the default limit for %j",
    async (limit) => {
      await expect(load({ limit })).resolves.toEqual({ sort: "recent", limit: 10 });
    },
  );
});

describe("loadSearchQuery", () => {
  it("still reads the search text", async () => {
    await expect(loadSearchQuery(Promise.resolve({ q: "rust", sort: "popular" }))).resolves.toBe(
      "rust",
    );
  });
});
