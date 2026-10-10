import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { NewsStory } from "@/features/news-feed/model/news-story";
import { TrendingStories } from "@/features/trending/components/trending-stories";

const story = (id: string, points: number): NewsStory => ({
  id,
  source: "hn",
  sourceName: "Hacker News",
  title: `Story ${id}`,
  url: `https://example.com/${id}`,
  publishedAt: "2026-10-10T10:00:00.000Z",
  points,
  commentsCount: 0,
});

const loadStories = vi.fn<() => Promise<NewsStory[]>>();

describe("TrendingStories", () => {
  it("lists the most discussed stories under a named section, best first", async () => {
    loadStories.mockResolvedValueOnce([story("low", 10), story("high", 90)]);

    render(await TrendingStories({ loadStories }));

    const section = screen.getByRole("region", { name: "Lo más hablado hoy" });
    const items = within(section).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]!).getByRole("link", { name: "Story high" })).toHaveAttribute(
      "href",
      "https://example.com/high",
    );
    expect(within(items[0]!).getByText("90 pts")).toBeInTheDocument();
  });

  it("shows an error banner, not an empty list, when the source fails", async () => {
    loadStories.mockRejectedValueOnce(new Error("boom"));

    render(await TrendingStories({ loadStories }));

    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar lo más hablado");
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
