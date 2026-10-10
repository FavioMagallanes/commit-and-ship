import { describe, expect, it } from "vitest";

import type { NewsStory } from "@/features/news-feed/model/news-story";
import { pickFeaturedStory } from "@/features/news-feed/model/pick-featured-story";

const story = (
  id: string,
  points: number,
  publishedAt = "2026-10-10T10:00:00.000Z",
): NewsStory => ({
  id,
  source: "hn",
  sourceName: "Hacker News",
  title: `Story ${id}`,
  url: "https://example.com",
  publishedAt,
  points,
  commentsCount: 0,
});

describe("pickFeaturedStory", () => {
  it("picks the story with the most points", () => {
    const stories = [story("a", 10), story("b", 90), story("c", 40)];

    expect(pickFeaturedStory(stories, "")?.id).toBe("b");
  });

  it("breaks ties with the most recent story", () => {
    const stories = [
      story("old", 50, "2026-10-09T10:00:00.000Z"),
      story("new", 50, "2026-10-10T10:00:00.000Z"),
    ];

    expect(pickFeaturedStory(stories, "")?.id).toBe("new");
  });

  it("picks nothing while the user is searching", () => {
    expect(pickFeaturedStory([story("a", 10)], "rust")).toBeNull();
    expect(pickFeaturedStory([story("a", 10)], "   ")?.id).toBe("a");
  });

  it("picks nothing when no story has points", () => {
    expect(pickFeaturedStory([story("a", 0)], "")).toBeNull();
    expect(pickFeaturedStory([], "")).toBeNull();
  });
});
