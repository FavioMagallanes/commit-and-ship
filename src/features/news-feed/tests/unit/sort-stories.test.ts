import { describe, expect, it } from "vitest";

import type { NewsStory } from "@/features/news-feed/model/news-story";
import { sortStories } from "@/features/news-feed/model/sort-stories";

const story = (id: string, publishedAt: string, points = 1): NewsStory => ({
  id,
  source: "hn",
  sourceName: "Hacker News",
  title: `Story ${id}`,
  url: "https://example.com",
  publishedAt,
  points,
  commentsCount: 0,
});

const ids = (stories: NewsStory[]) => stories.map((item) => item.id);

describe("sortStories", () => {
  it("puts the newest story first when sorting by recent", () => {
    const stories = [
      story("mid", "2026-10-10T10:00:00.000Z"),
      story("new", "2026-10-10T12:00:00.000Z"),
      story("old", "2026-10-09T10:00:00.000Z"),
    ];

    expect(ids(sortStories(stories, "recent"))).toEqual(["new", "mid", "old"]);
  });

  it("puts the story with most points first when sorting by popular", () => {
    const stories = [
      story("low", "2026-10-10T12:00:00.000Z", 5),
      story("high", "2026-10-09T10:00:00.000Z", 300),
      story("mid", "2026-10-10T10:00:00.000Z", 40),
    ];

    expect(ids(sortStories(stories, "popular"))).toEqual(["high", "mid", "low"]);
  });

  it("breaks popularity ties with the newest story first", () => {
    const stories = [
      story("old", "2026-10-09T10:00:00.000Z", 100),
      story("new", "2026-10-10T10:00:00.000Z", 100),
    ];

    expect(ids(sortStories(stories, "popular"))).toEqual(["new", "old"]);
  });

  it("sends stories with an invalid date to the end", () => {
    const stories = [
      story("broken", "not a date"),
      story("old", "2026-10-09T10:00:00.000Z"),
      story("new", "2026-10-10T10:00:00.000Z"),
    ];

    expect(ids(sortStories(stories, "recent"))).toEqual(["new", "old", "broken"]);
    expect(ids(sortStories(stories, "popular"))).toEqual(["new", "old", "broken"]);
  });

  it("does not mutate its input", () => {
    const stories = [
      story("old", "2026-10-09T10:00:00.000Z", 1),
      story("new", "2026-10-10T10:00:00.000Z", 2),
    ];

    sortStories(stories, "recent");
    sortStories(stories, "popular");

    expect(ids(stories)).toEqual(["old", "new"]);
  });
});
