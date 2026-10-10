import { describe, expect, it } from "vitest";

import type { NewsStory } from "@/features/news-feed/model/news-story";
import { rankStories } from "@/features/trending/model/rank-stories";

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

  it("does not mutate its input", () => {
    const stories = [story("a", 1), story("b", 2)];

    rankStories(stories);

    expect(stories.map((item) => item.id)).toEqual(["a", "b"]);
  });
});
