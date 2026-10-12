import { describe, expect, it } from "vitest";

import type { NewsStory } from "@/features/news-feed/model/news-story";
import { popularityScores } from "@/features/news-feed/model/popularity-score";

const story = (id: string, source: NewsStory["source"], points: number): NewsStory => ({
  id,
  source,
  sourceName: source,
  title: `Story ${id}`,
  url: "https://example.com",
  publishedAt: "2026-10-10T10:00:00.000Z",
  points,
  commentsCount: 0,
});

const scoresById = (stories: NewsStory[]) => {
  const scores = popularityScores(stories);
  return Object.fromEntries(stories.map((item) => [item.id, scores.get(item)]));
};

describe("popularityScores", () => {
  it("scores each story by its percentile within its own source", () => {
    const stories = [
      story("hn-low", "hn", 50),
      story("hn-mid", "hn", 200),
      story("hn-top", "hn", 900),
      story("dev-low", "dev", 2),
      story("dev-top", "dev", 30),
    ];

    expect(scoresById(stories)).toEqual({
      "hn-low": 0,
      "hn-mid": 0.5,
      "hn-top": 1,
      "dev-low": 0,
      "dev-top": 1,
    });
  });

  it("gives stories with equal points the same score", () => {
    const stories = [
      story("a", "hn", 10),
      story("b", "hn", 40),
      story("c", "hn", 40),
      story("d", "hn", 90),
    ];

    expect(scoresById(stories)).toEqual({ a: 0, b: 1 / 3, c: 1 / 3, d: 1 });
  });

  it("gives the only story of a source the top score", () => {
    const stories = [story("hn-a", "hn", 300), story("hn-b", "hn", 100), story("dev", "dev", 1)];

    expect(scoresById(stories)).toEqual({ "hn-a": 1, "hn-b": 0, dev: 1 });
  });

  it("scores a story without points at 0, even when it is the only one of its source", () => {
    const stories = [story("hn", "hn", 10), story("blog", "blog", 0)];

    expect(scoresById(stories)).toEqual({ hn: 1, blog: 0 });
  });

  it("keeps every score between 0 and 1", () => {
    const stories = [5, 5, 0, 12, 7, 300].map((points, index) => story(`s${index}`, "dev", points));

    for (const score of popularityScores(stories).values()) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });

  it("returns no scores for an empty list", () => {
    expect(popularityScores([]).size).toBe(0);
  });

  it("does not mutate its input", () => {
    const stories = [story("b", "hn", 2), story("a", "hn", 1)];

    popularityScores(stories);

    expect(stories.map((item) => item.id)).toEqual(["b", "a"]);
  });
});
