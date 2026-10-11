import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FeaturedStory } from "@/features/news-feed/components/featured-story";
import type { NewsStory } from "@/features/news-feed/model/news-story";

const NOW = new Date("2026-10-10T18:30:00Z");

const story = (id: string, points: number): NewsStory => ({
  id,
  source: "hn",
  sourceName: "Hacker News",
  title: `Story ${id}`,
  url: `https://example.com/${id}`,
  publishedAt: "2026-10-10T15:30:00.000Z",
  points,
  commentsCount: 12,
});

const loadStories = vi.fn<() => Promise<NewsStory[]>>();

describe("FeaturedStory", () => {
  it("highlights the most upvoted story as an article with a linked heading", async () => {
    loadStories.mockResolvedValueOnce([story("low", 10), story("top", 90)]);

    render(await FeaturedStory({ loadStories, now: NOW }));

    expect(screen.getByRole("article")).toBeInTheDocument();
    expect(screen.getByText("Destacado")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Story top" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Story top" })).toHaveAttribute(
      "href",
      "https://example.com/top",
    );
  });

  it("shows the source, points, comments and how long ago it was published", async () => {
    loadStories.mockResolvedValueOnce([story("top", 90)]);

    render(await FeaturedStory({ loadStories, now: NOW }));

    expect(screen.getByText(/Hacker News · 90 pts · 12 comentarios ·/)).toBeInTheDocument();
    expect(screen.getByText("hace 3 h")).toHaveAttribute("datetime", "2026-10-10T15:30:00.000Z");
  });

  it("offers a distinguishable link to read it at the source", async () => {
    loadStories.mockResolvedValueOnce([story("top", 90)]);

    render(await FeaturedStory({ loadStories, now: NOW }));

    expect(screen.getByRole("link", { name: "Leer en la fuente: Story top" })).toHaveAttribute(
      "href",
      "https://example.com/top",
    );
  });

  it("shows the topic pill right after the Destacado pill", async () => {
    loadStories.mockResolvedValueOnce([
      { ...story("top", 90), title: "A critical vulnerability in OpenSSH" },
    ]);

    render(await FeaturedStory({ loadStories, now: NOW }));

    const topicPill = screen.getByText("Seguridad");
    expect(screen.getByText("Destacado").nextElementSibling).toBe(topicPill);
  });

  it("shows no topic pill when the story has no topic", async () => {
    loadStories.mockResolvedValueOnce([story("top", 90)]);

    render(await FeaturedStory({ loadStories, now: NOW }));

    expect(
      screen.queryByText(/^(IA|Frontend|Backend|DevOps|Seguridad|Lenguajes)$/),
    ).not.toBeInTheDocument();
  });

  it("highlights the most upvoted story of the chosen topic", async () => {
    loadStories.mockResolvedValueOnce([
      { ...story("top", 900), title: "Triple-A Minesweeper" },
      { ...story("rust", 50), title: "Rust 1.90 is out" },
      { ...story("python", 10), title: "Python packaging" },
    ]);

    render(await FeaturedStory({ loadStories, now: NOW, topic: Promise.resolve("lenguajes") }));

    expect(screen.getByRole("heading", { level: 2, name: "Rust 1.90 is out" })).toBeInTheDocument();
    expect(screen.getByText("Lenguajes")).toBeInTheDocument();
  });

  it("renders nothing when no story has the chosen topic", async () => {
    loadStories.mockResolvedValueOnce([story("top", 90)]);

    const { container } = render(
      await FeaturedStory({ loadStories, now: NOW, topic: Promise.resolve("ia") }),
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing while searching", async () => {
    loadStories.mockResolvedValueOnce([story("top", 90)]);

    const { container } = render(
      await FeaturedStory({ loadStories, now: NOW, query: Promise.resolve("rust") }),
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the source fails (the list shows the error)", async () => {
    loadStories.mockRejectedValueOnce(new Error("boom"));

    const { container } = render(await FeaturedStory({ loadStories, now: NOW }));

    expect(container).toBeEmptyDOMElement();
  });
});
