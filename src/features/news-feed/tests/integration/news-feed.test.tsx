import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NewsFeed } from "@/features/news-feed/components/news-feed";
import type { NewsStory } from "@/features/news-feed/model/news-story";

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

    render(await NewsFeed({ loadStories }));

    expect(screen.getByRole("link", { name: /A story/ })).toBeInTheDocument();
  });

  it("shows an error banner, not an empty list, when the source fails", async () => {
    loadStories.mockRejectedValueOnce(new Error("boom"));

    render(await NewsFeed({ loadStories }));

    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar Hacker News");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
