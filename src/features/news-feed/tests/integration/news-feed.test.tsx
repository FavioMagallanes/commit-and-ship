import { render, screen } from "@testing-library/react";
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

  it("keeps a single story in the list instead of showing an empty state", async () => {
    loadStories.mockResolvedValueOnce([{ ...STORY, id: "hn-1", title: "Only story", points: 500 }]);

    render(await NewsFeed({ loadStories, now: NOW }));

    expect(screen.getByRole("link", { name: /Only story/ })).toBeInTheDocument();
  });
});
