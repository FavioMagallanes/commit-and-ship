import { describe, expect, it } from "vitest";

import type { NewsStory } from "@/features/news-feed/model/news-story";
import { pickFeaturedStory } from "@/features/news-feed/model/pick-featured-story";

const story = (
  id: string,
  points: number,
  publishedAt = "2026-10-10T10:00:00.000Z",
  source: NewsStory["source"] = "hn",
): NewsStory => ({
  id,
  source,
  sourceName: source,
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

  it("picks the most voted of the top stories of each source in a mixed list", () => {
    const stories = [
      story("dev-top", 40, "2026-10-10T12:00:00.000Z", "dev"),
      story("hn-low", 100),
      story("hn-top", 900, "2026-10-09T10:00:00.000Z"),
    ];

    expect(pickFeaturedStory(stories, "")?.id).toBe("hn-top");
  });

  it("picks a source's top story when other sources have no points", () => {
    const stories = [story("hn-zero", 0), story("dev-low", 3, undefined, "dev")];

    expect(pickFeaturedStory(stories, "")?.id).toBe("dev-low");
  });

  it("never features an official blog post, which has no points", () => {
    const stories = [
      story("blog", 0, "2026-10-10T12:00:00.000Z", "blog"),
      story("hn", 4, "2026-10-09T10:00:00.000Z"),
    ];

    expect(pickFeaturedStory(stories, "")?.id).toBe("hn");
    expect(pickFeaturedStory([story("blog", 0, undefined, "blog")], "")).toBeNull();
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
