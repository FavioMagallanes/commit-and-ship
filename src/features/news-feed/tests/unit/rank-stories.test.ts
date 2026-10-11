import { describe, expect, it } from "vitest";

import type { NewsStory } from "@/features/news-feed/model/news-story";
import { rankStories } from "@/features/news-feed/model/rank-stories";

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

describe("rankStories", () => {
  it("orders stories by points, highest first, and keeps the top five", () => {
    const stories = [10, 50, 30, 20, 60, 40, 5].map((points) => story(`s${points}`, points));

    expect(rankStories(stories).map((item) => item.points)).toEqual([60, 50, 40, 30, 20]);
  });

  it("breaks ties with the most recent story first", () => {
    const older = story("old", 100, "2026-10-09T10:00:00.000Z");
    const newer = story("new", 100, "2026-10-10T10:00:00.000Z");

    expect(rankStories([older, newer]).map((item) => item.id)).toEqual(["new", "old"]);
  });

  it("ignores stories without points", () => {
    expect(rankStories([story("a", 0), story("b", 3)]).map((item) => item.id)).toEqual(["b"]);
  });

  it("ranks the top story of each source alongside each other, not by raw points", () => {
    const stories = [
      story("hn-100", 100),
      story("hn-900", 900),
      story("dev-5", 5, undefined, "dev"),
      story("hn-400", 400),
      story("dev-30", 30, undefined, "dev"),
    ];

    expect(rankStories(stories).map((item) => item.id)).toEqual([
      "hn-900",
      "dev-30",
      "hn-400",
      "hn-100",
      "dev-5",
    ]);
  });

  it("does not let stories without points inflate a source's percentiles", () => {
    const stories = [
      story("hn-900", 900),
      story("hn-400", 400),
      story("dev-20", 20, undefined, "dev"),
      story("dev-10", 10, undefined, "dev"),
      story("dev-zero-a", 0, undefined, "dev"),
      story("dev-zero-b", 0, undefined, "dev"),
      story("dev-zero-c", 0, undefined, "dev"),
    ];

    expect(rankStories(stories).map((item) => item.id)).toEqual([
      "hn-900",
      "dev-20",
      "hn-400",
      "dev-10",
    ]);
  });

  it("returns nothing for an empty list", () => {
    expect(rankStories([])).toEqual([]);
  });

  it("does not mutate its input", () => {
    const stories = [story("a", 1), story("b", 2)];

    rankStories(stories);

    expect(stories.map((item) => item.id)).toEqual(["a", "b"]);
  });
});
