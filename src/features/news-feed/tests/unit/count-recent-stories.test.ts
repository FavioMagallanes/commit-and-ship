import { describe, expect, it } from "vitest";

import { countRecentStories } from "@/features/news-feed/model/count-recent-stories";
import type { NewsStory } from "@/features/news-feed/model/news-story";

const NOW = new Date("2026-10-10T12:00:00Z");

const story = (publishedAt: string): NewsStory => ({
  id: publishedAt,
  source: "hn",
  sourceName: "Hacker News",
  title: "A story",
  url: "https://example.com",
  publishedAt,
  points: 1,
  commentsCount: 0,
});

describe("countRecentStories", () => {
  it("counts the stories published in the last 24 hours", () => {
    const stories = [
      story("2026-10-10T11:00:00Z"),
      story("2026-10-09T13:00:00Z"),
      story("2026-10-09T11:00:00Z"),
    ];

    expect(countRecentStories(stories, NOW)).toBe(2);
  });

  it("ignores invalid dates instead of counting them as recent", () => {
    expect(countRecentStories([story("nope")], NOW)).toBe(0);
  });

  it("is zero for no stories", () => {
    expect(countRecentStories([], NOW)).toBe(0);
  });
});
