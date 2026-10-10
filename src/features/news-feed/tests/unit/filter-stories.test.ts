import { describe, expect, it } from "vitest";

import { filterStories } from "@/features/news-feed/model/filter-stories";
import type { NewsStory } from "@/features/news-feed/model/news-story";

const story = (id: string, title: string): NewsStory => ({
  id,
  source: "hn",
  sourceName: "Hacker News",
  title,
  url: "https://example.com",
  publishedAt: "2026-10-10T10:00:00.000Z",
  points: 1,
  commentsCount: 0,
});

const stories = [story("1", "Un bundler en Rust"), story("2", "Guía de programación")];

describe("filterStories", () => {
  it("returns every story for an empty query", () => {
    expect(filterStories(stories, "")).toEqual(stories);
  });

  it("filters by title without caring about accents", () => {
    expect(filterStories(stories, "programacion").map((item) => item.id)).toEqual(["2"]);
  });

  it("also searches the source name", () => {
    expect(filterStories(stories, "hacker news")).toHaveLength(2);
  });
});
