import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NewsList } from "@/features/news-feed/components/news-list";
import type { NewsStory } from "@/features/news-feed/model/news-story";

const NOW = new Date("2026-10-10T18:30:00Z");

const story = (overrides: Partial<NewsStory> = {}): NewsStory => ({
  id: "hn-1",
  source: "hn",
  sourceName: "Hacker News",
  title: "A story",
  url: "https://example.com/story",
  publishedAt: "2026-10-10T15:30:00.000Z",
  points: 120,
  commentsCount: 8,
  ...overrides,
});

describe("NewsList", () => {
  it("renders one article per story inside a named list", () => {
    render(<NewsList now={NOW} stories={[story(), story({ id: "hn-2", title: "Another" })]} />);

    const list = screen.getByRole("list", { name: "Novedades" });
    expect(within(list).getAllByRole("article")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /A story/ })).toHaveAttribute(
      "href",
      "https://example.com/story",
    );
  });

  it("shows points, comments and the relative publication time", () => {
    render(<NewsList now={NOW} stories={[story()]} />);

    expect(screen.getByText(/Hacker News · 120 pts · 8 comentarios ·/)).toBeInTheDocument();
    expect(screen.getByText("hace 3 h")).toHaveAttribute("datetime", "2026-10-10T15:30:00.000Z");
  });

  it("shows an empty state instead of an empty list", () => {
    render(<NewsList now={NOW} stories={[]} />);

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No encontramos novedades" })).toBeInTheDocument();
  });
});
