import { describe, expect, it, vi } from "vitest";

import { fetchDevToTopArticles, parseDevToArticles } from "@/features/news-feed/api/dev-to";

import { DEV_TO_TOP_ARTICLES } from "../fixtures/dev-to-top-articles";

const [firstArticle] = DEV_TO_TOP_ARTICLES;

describe("parseDevToArticles", () => {
  it("maps articles to news stories", () => {
    const [first] = parseDevToArticles(DEV_TO_TOP_ARTICLES);

    expect(first).toEqual({
      id: "devto-2901234",
      source: "dev",
      sourceName: "dev.to",
      title: "Building a RAG pipeline with pgvector",
      url: "https://dev.to/someone/building-a-rag-pipeline-with-pgvector-1a2b",
      publishedAt: "2026-10-09T15:51:05.000Z",
      points: 212,
      commentsCount: 14,
      tags: ["ai", "postgres", "tutorial"],
    });
  });

  it("defaults missing counts to zero and missing tags to an empty list", () => {
    const article = {
      id: 7,
      title: "Untagged",
      url: "https://dev.to/x/untagged",
      published_timestamp: "2026-10-10T09:00:00Z",
    };

    expect(parseDevToArticles([article])[0]).toMatchObject({
      points: 0,
      commentsCount: 0,
      tags: [],
    });
  });

  it.each(["javascript:alert(1)", "ftp://dev.to/x", "not a url"])(
    "skips articles whose url is not http(s): %s",
    (url) => {
      expect(parseDevToArticles([{ ...firstArticle, url }])).toEqual([]);
    },
  );

  it("skips articles that are incomplete instead of failing the whole list", () => {
    const articles = [
      { id: 1, title: null, url: "https://dev.to/a", published_timestamp: "2026-10-10T09:00:00Z" },
      { ...firstArticle, published_timestamp: "yesterday" },
      { ...firstArticle, id: "not-a-number" },
      firstArticle,
    ];

    expect(parseDevToArticles(articles)).toHaveLength(1);
  });

  it("returns an empty list when there are no articles", () => {
    expect(parseDevToArticles([])).toEqual([]);
  });

  it.each([null, "nope", {}, { articles: [] }])("throws on an unexpected response %j", (value) => {
    expect(() => parseDevToArticles(value)).toThrow();
  });
});

describe("fetchDevToTopArticles", () => {
  it("requests the top articles and parses the body", async () => {
    const fetchFn = vi.fn(async () => Response.json(DEV_TO_TOP_ARTICLES));

    const stories = await fetchDevToTopArticles(fetchFn);

    expect(stories).toHaveLength(2);
    const [url] = fetchFn.mock.calls[0] as unknown as [string];
    expect(url).toContain("dev.to/api/articles");
    expect(url).toContain("top=1");
  });

  it("throws when the source answers with an error status", async () => {
    const fetchFn = vi.fn(async () => new Response("down", { status: 503 }));

    await expect(fetchDevToTopArticles(fetchFn)).rejects.toThrow(/503/);
  });
});
