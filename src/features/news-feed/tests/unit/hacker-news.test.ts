import { describe, expect, it, vi } from "vitest";

import {
  fetchHackerNewsFrontPage,
  parseHackerNewsFrontPage,
} from "@/features/news-feed/api/hacker-news";

import { HACKER_NEWS_FRONT_PAGE } from "../fixtures/hacker-news-front-page";

describe("parseHackerNewsFrontPage", () => {
  it("maps hits to news stories", () => {
    const [first] = parseHackerNewsFrontPage(HACKER_NEWS_FRONT_PAGE);

    expect(first).toEqual({
      id: "hn-50022292",
      source: "hn",
      sourceName: "Hacker News",
      title: "Triple-A Minesweeper",
      url: "https://minesweeper.mikelacher.com/",
      publishedAt: "2026-10-09T15:51:05.000Z",
      points: 1316,
      commentsCount: 261,
    });
  });

  it("links posts without an external url to their Hacker News discussion", () => {
    const stories = parseHackerNewsFrontPage(HACKER_NEWS_FRONT_PAGE);

    expect(stories[1]?.url).toBe("https://news.ycombinator.com/item?id=50031111");
  });

  it("never links to non-http urls", () => {
    const response = {
      hits: [{ ...HACKER_NEWS_FRONT_PAGE.hits[0], url: "javascript:alert(1)" }],
    };

    expect(parseHackerNewsFrontPage(response)[0]?.url).toBe(
      "https://news.ycombinator.com/item?id=50022292",
    );
  });

  it("skips hits that are incomplete instead of failing the whole list", () => {
    const response = {
      hits: [{ objectID: "1", title: null }, HACKER_NEWS_FRONT_PAGE.hits[0]],
    };

    expect(parseHackerNewsFrontPage(response)).toHaveLength(1);
  });

  it("returns an empty list when there are no hits", () => {
    expect(parseHackerNewsFrontPage({ hits: [] })).toEqual([]);
  });

  it.each([null, "nope", {}, { hits: "x" }])("throws on an unexpected response %j", (value) => {
    expect(() => parseHackerNewsFrontPage(value)).toThrow();
  });
});

describe("fetchHackerNewsFrontPage", () => {
  it("requests the front page and parses the body", async () => {
    const fetchFn = vi.fn(async () => Response.json(HACKER_NEWS_FRONT_PAGE));

    const stories = await fetchHackerNewsFrontPage(fetchFn);

    expect(stories).toHaveLength(2);
    const [url] = fetchFn.mock.calls[0] as unknown as [string];
    expect(url).toContain("hn.algolia.com/api/v1/search");
    expect(url).toContain("tags=front_page");
  });

  it("throws when the source answers with an error status", async () => {
    const fetchFn = vi.fn(async () => new Response("down", { status: 503 }));

    await expect(fetchHackerNewsFrontPage(fetchFn)).rejects.toThrow(/503/);
  });
});
