import { describe, expect, it } from "vitest";

import type { NewsStory } from "@/features/news-feed/model/news-story";
import { paginateStories } from "@/features/news-feed/model/paginate-stories";

const stories: NewsStory[] = Array.from({ length: 25 }, (_, index) => ({
  id: `hn-${index + 1}`,
  source: "hn",
  sourceName: "Hacker News",
  title: `Story ${index + 1}`,
  url: "https://example.com",
  publishedAt: "2026-10-10T10:00:00.000Z",
  points: 1,
  commentsCount: 0,
}));

describe("paginateStories", () => {
  it("shows the first page and says there is more", () => {
    const page = paginateStories(stories, 10);

    expect(page.visible.map((item) => item.id)).toEqual(
      stories.slice(0, 10).map((item) => item.id),
    );
    expect(page.hasMore).toBe(true);
    expect(page.nextLimit).toBe(20);
  });

  it("says there is nothing more once every story is visible", () => {
    const page = paginateStories(stories, 25);

    expect(page.visible).toHaveLength(25);
    expect(page.hasMore).toBe(false);
  });

  it("shows every story when the limit is larger than the list", () => {
    const page = paginateStories(stories, 40);

    expect(page.visible).toHaveLength(25);
    expect(page.hasMore).toBe(false);
    expect(page.nextLimit).toBe(50);
  });

  it("falls back to the first page when the limit is below 1", () => {
    const page = paginateStories(stories, 0);

    expect(page.visible).toHaveLength(10);
    expect(page.hasMore).toBe(true);
    expect(page.nextLimit).toBe(20);
  });

  it("falls back to the first page when the limit is not an integer", () => {
    expect(paginateStories(stories, 2.5).visible).toHaveLength(10);
  });
});
