import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NewsList } from "@/features/news-feed/components/news-list";
import type { NewsStory } from "@/features/news-feed/model/news-story";

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
    render(<NewsList stories={[story(), story({ id: "hn-2", title: "Another" })]} />);

    const list = screen.getByRole("list", { name: "Novedades" });
    expect(within(list).getAllByRole("article")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /A story/ })).toHaveAttribute(
      "href",
      "https://example.com/story",
    );
  });

  it("shows the points and the publication date", () => {
    render(<NewsList stories={[story()]} />);

    expect(screen.getByText("120 puntos")).toBeInTheDocument();
    expect(screen.getByText("10 oct")).toHaveAttribute("datetime", "2026-10-10T15:30:00.000Z");
  });

  it("shows an empty state instead of an empty list", () => {
    render(<NewsList stories={[]} />);

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByText("No hay novedades para mostrar.")).toBeInTheDocument();
  });
});
