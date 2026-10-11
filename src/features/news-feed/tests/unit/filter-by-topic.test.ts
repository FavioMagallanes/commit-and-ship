import { describe, expect, it } from "vitest";

import { filterByTopic } from "@/features/news-feed/model/filter-by-topic";
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

const stories = [
  story("1", "Rust 1.90 is out"),
  story("2", "A new LLM benchmark"),
  story("3", "Triple-A Minesweeper"),
  story("4", "Python packaging in 2026"),
];

describe("filterByTopic", () => {
  it("returns every story, in order, when no topic is selected", () => {
    expect(filterByTopic(stories, null)).toEqual(stories);
  });

  it("keeps only the stories of the topic, in order", () => {
    expect(filterByTopic(stories, "lenguajes").map((item) => item.id)).toEqual(["1", "4"]);
    expect(filterByTopic(stories, "ia").map((item) => item.id)).toEqual(["2"]);
    expect(filterByTopic(stories, "devops")).toEqual([]);
  });

  it("does not mutate the given stories", () => {
    const copy = structuredClone(stories);

    filterByTopic(stories, "ia");

    expect(stories).toEqual(copy);
  });
});
