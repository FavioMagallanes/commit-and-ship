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

    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar las noticias");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "El resto de las fuentes funciona con normalidad.",
    );
    expect(screen.getByRole("alert")).toContainElement(
      screen.getByRole("button", { name: "Reintentar" }),
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

  it("explains that nothing matched and offers to clear the filters", async () => {
    loadStories.mockResolvedValueOnce([STORY]);

    render(await NewsFeed({ loadStories, now: NOW, query: Promise.resolve("zzz") }));

    expect(screen.getByRole("heading", { name: "No encontramos novedades" })).toBeInTheDocument();
    expect(
      screen.getByText("Probá con otro término o quitá algún filtro para ver más resultados."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Limpiar filtros" })).toHaveAttribute("href", "/");
  });

  it("keeps only the stories of the chosen topic, each with its topic pill", async () => {
    loadStories.mockResolvedValueOnce([
      { ...STORY, id: "hn-1", title: "Triple-A Minesweeper", points: 900 },
      { ...STORY, id: "hn-2", title: "Rust 1.90 is out", points: 500 },
      { ...STORY, id: "hn-3", title: "A new LLM benchmark", points: 300 },
      { ...STORY, id: "hn-4", title: "Python packaging in 2026", points: 5 },
      { ...STORY, id: "hn-5", title: "Zig without a garbage collector", points: 4 },
    ]);

    render(await NewsFeed({ loadStories, now: NOW, topic: Promise.resolve("lenguajes") }));

    // The most upvoted story of the topic is the featured one, so it leaves the list.
    expect(listTitles()).toEqual(["Python packaging in 2026", "Zig without a garbage collector"]);
    const list = screen.getByRole("list", { name: "Novedades" });
    expect(within(list).getAllByText("Lenguajes")).toHaveLength(2);
  });

  it("shows the topic pill of each story when no topic is chosen", async () => {
    loadStories.mockResolvedValueOnce([
      { ...STORY, id: "hn-1", title: "Featured", points: 900 },
      { ...STORY, id: "hn-2", title: "A new LLM benchmark" },
      { ...STORY, id: "hn-3", title: "Triple-A Minesweeper" },
    ]);

    render(await NewsFeed({ loadStories, now: NOW }));

    const llmStory = screen.getByRole("link", { name: "A new LLM benchmark" }).closest("article");
    const otherStory = screen
      .getByRole("link", { name: "Triple-A Minesweeper" })
      .closest("article");
    expect(llmStory).toHaveTextContent("IA");
    expect(otherStory).not.toHaveTextContent("IA");
  });

  it("offers to clear the filters when the topic leaves the list empty", async () => {
    loadStories.mockResolvedValueOnce([
      { ...STORY, id: "hn-1", title: "Rust 1.90 is out", points: 500 },
      { ...STORY, id: "hn-2", title: "Python packaging", points: 5 },
    ]);

    render(await NewsFeed({ loadStories, now: NOW, topic: Promise.resolve("devops") }));

    expect(screen.getByRole("heading", { name: "No encontramos novedades" })).toBeInTheDocument();
    expect(
      screen.getByText("Probá con otro término o quitá algún filtro para ver más resultados."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Limpiar filtros" })).toHaveAttribute("href", "/");
  });

  it("keeps only the blog posts for Blogs, with their topic pill and no featured story", async () => {
    loadStories.mockResolvedValueOnce([
      { ...STORY, id: "hn-1", title: "Top story", points: 900 },
      { ...STORY, id: "dev-1", source: "dev", sourceName: "dev.to", title: "React tips" },
      {
        ...STORY,
        id: "blog-1",
        source: "blog",
        sourceName: "React · Blog oficial",
        title: "React 19.2",
        points: 0,
        publishedAt: "2026-10-08T10:00:00.000Z",
      },
      {
        ...STORY,
        id: "blog-2",
        source: "blog",
        sourceName: "Rust · Blog oficial",
        title: "Announcing the 2026 survey",
        points: 0,
        publishedAt: "2026-10-09T10:00:00.000Z",
      },
    ]);

    render(await NewsFeed({ loadStories, now: NOW, topic: Promise.resolve("blogs") }));

    // Blog posts have no points, so none is featured and every one stays in the list.
    expect(listTitles()).toEqual(["Announcing the 2026 survey", "React 19.2"]);
    const reactPost = screen.getByRole("link", { name: "React 19.2" }).closest("article");
    expect(reactPost).toHaveTextContent("Frontend");
  });

  it("applies the search on top of the Blogs filter", async () => {
    loadStories.mockResolvedValueOnce([
      { ...STORY, id: "hn-1", title: "React news", points: 900 },
      { ...STORY, id: "blog-1", source: "blog", title: "React Compiler v1.0", points: 0 },
      { ...STORY, id: "blog-2", source: "blog", title: "Rust survey", points: 0 },
    ]);

    render(
      await NewsFeed({
        loadStories,
        now: NOW,
        query: Promise.resolve("react"),
        topic: Promise.resolve("blogs"),
      }),
    );

    expect(listTitles()).toEqual(["React Compiler v1.0"]);
  });

  it("offers to clear the filters when there are no blog posts", async () => {
    loadStories.mockResolvedValueOnce([
      { ...STORY, id: "hn-1", title: "Rust 1.90 is out", points: 500 },
      { ...STORY, id: "hn-2", title: "Python packaging", points: 5 },
    ]);

    render(await NewsFeed({ loadStories, now: NOW, topic: Promise.resolve("blogs") }));

    expect(screen.getByRole("heading", { name: "No encontramos novedades" })).toBeInTheDocument();
    expect(
      screen.getByText("Probá con otro término o quitá algún filtro para ver más resultados."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Limpiar filtros" })).toHaveAttribute("href", "/");
  });

  it("suggests trying later, without a clear link, when no filter is active", async () => {
    loadStories.mockResolvedValueOnce([]);

    render(await NewsFeed({ loadStories, now: NOW }));

    expect(screen.getByText("Probá de nuevo en unos minutos.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Limpiar filtros" })).not.toBeInTheDocument();
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
