import { render, screen, within } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { NewsFeed } from "@/features/news-feed/components/news-feed";
import type { NewsStory } from "@/features/news-feed/model/news-story";

const NOW = new Date("2026-10-10T18:30:00Z");

const STORY: NewsStory = {
  id: "hn-1",
  source: "hn",
  sourceName: "Hacker News",
  title: "A story",
  url: "https://example.com/story",
  publishedAt: "2026-10-10T15:30:00.000Z",
  points: 1,
  commentsCount: 0,
};

const loadStories = vi.fn<() => Promise<NewsStory[]>>();

// The first story has the most points, so it is the featured one; the rest go from newest to
// oldest, with points growing towards the end so "popular" reverses their order.
const manyStories = (count: number): NewsStory[] =>
  Array.from({ length: count }, (_, index) => ({
    ...STORY,
    id: `hn-${index}`,
    title: `Story ${index}`,
    points: index === 0 ? 10_000 : index,
    publishedAt: new Date(Date.UTC(2026, 9, 10, 18, 0) - index * 60_000).toISOString(),
  }));

const listTitles = () =>
  within(screen.getByRole("list", { name: "Novedades" }))
    .getAllByRole("heading")
    .map((heading) => heading.textContent);

describe("NewsFeed", () => {
  it("renders the stories returned by the loader", async () => {
    loadStories.mockResolvedValueOnce([
      {
        id: "hn-1",
        source: "hn",
        sourceName: "Hacker News",
        title: "A story",
        url: "https://example.com/story",
        publishedAt: "2026-10-10T15:30:00.000Z",
        points: 1,
        commentsCount: 0,
      },
    ]);

    render(await NewsFeed({ loadStories, now: new Date("2026-10-10T18:30:00Z") }));

    expect(screen.getByRole("link", { name: /A story/ })).toBeInTheDocument();
  });

  it("shows an error banner, not an empty list, when the source fails", async () => {
    loadStories.mockRejectedValueOnce(new Error("boom"));

    render(await NewsFeed({ loadStories, now: new Date("2026-10-10T18:30:00Z") }));

    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar Hacker News");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "El resto de las fuentes funciona con normalidad.",
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("keeps only the stories that match the search", async () => {
    loadStories.mockResolvedValueOnce([
      { ...STORY, id: "hn-1", title: "Rust bundler" },
      { ...STORY, id: "hn-2", title: "Guía de programación" },
    ]);

    render(await NewsFeed({ loadStories, now: NOW, query: Promise.resolve("programacion") }));

    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /Guía de programación/ })).toBeInTheDocument();
  });

  it("explains that nothing matched and offers to clear the search", async () => {
    loadStories.mockResolvedValueOnce([STORY]);

    render(await NewsFeed({ loadStories, now: NOW, query: Promise.resolve("zzz") }));

    expect(screen.getByRole("heading", { name: "No encontramos novedades" })).toBeInTheDocument();
    expect(screen.getByText("Probá con otro término.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Limpiar búsqueda" })).toHaveAttribute("href", "/");
  });

  it("leaves the featured story out of the list so it is not shown twice", async () => {
    loadStories.mockResolvedValueOnce([
      { ...STORY, id: "hn-1", title: "Top story", points: 500 },
      { ...STORY, id: "hn-2", title: "Other story", points: 5 },
    ]);

    render(await NewsFeed({ loadStories, now: NOW }));

    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.queryByRole("link", { name: /Top story/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Other story/ })).toBeInTheDocument();
  });

  it("keeps every story in the list while searching", async () => {
    loadStories.mockResolvedValueOnce([
      { ...STORY, id: "hn-1", title: "Top story", points: 500 },
      { ...STORY, id: "hn-2", title: "Other story", points: 5 },
    ]);

    render(await NewsFeed({ loadStories, now: NOW, query: Promise.resolve("story") }));

    expect(screen.getAllByRole("article")).toHaveLength(2);
  });

  it("shows only the first 10 stories and offers to load more", async () => {
    loadStories.mockResolvedValueOnce(manyStories(26));

    render(await NewsFeed({ loadStories, now: NOW }), { wrapper: withNuqsTestingAdapter() });

    expect(screen.getAllByRole("article")).toHaveLength(10);
    expect(listTitles()[0]).toBe("Story 1");
    expect(screen.getByRole("button", { name: "Cargar más novedades" })).toBeInTheDocument();
  });

  it("hides the load more button once every story is visible", async () => {
    loadStories.mockResolvedValueOnce(manyStories(26));

    render(await NewsFeed({ loadStories, now: NOW, limit: Promise.resolve(30) }), {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(screen.getAllByRole("article")).toHaveLength(25);
    expect(screen.queryByRole("button", { name: "Cargar más novedades" })).not.toBeInTheDocument();
  });

  it("orders the list by points when sorting by popular, still without the featured story", async () => {
    loadStories.mockResolvedValueOnce(manyStories(26));

    render(await NewsFeed({ loadStories, now: NOW, sort: Promise.resolve("popular") }), {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(listTitles().slice(0, 3)).toEqual(["Story 25", "Story 24", "Story 23"]);
    expect(screen.queryByRole("link", { name: /Story 0\b/ })).not.toBeInTheDocument();
  });

  it("orders the list from newest to oldest by default", async () => {
    loadStories.mockResolvedValueOnce([
      { ...STORY, id: "hn-1", title: "Featured", points: 500 },
      { ...STORY, id: "hn-2", title: "Older", publishedAt: "2026-10-10T10:00:00.000Z" },
      { ...STORY, id: "hn-3", title: "Newer", publishedAt: "2026-10-10T17:00:00.000Z" },
    ]);

    render(await NewsFeed({ loadStories, now: NOW }));

    expect(listTitles()).toEqual(["Newer", "Older"]);
  });

  it("keeps a single story in the list instead of showing an empty state", async () => {
    loadStories.mockResolvedValueOnce([{ ...STORY, id: "hn-1", title: "Only story", points: 500 }]);

    render(await NewsFeed({ loadStories, now: NOW }));

    expect(screen.getByRole("link", { name: /Only story/ })).toBeInTheDocument();
  });
});
