import { describe, expect, it } from "vitest";

import { filterByTopic } from "@/features/news-feed/model/filter-by-topic";
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

  it("finds a story by the topic of its tags when the title names none", () => {
    const devToStory: NewsStory = {
      ...story("5", "Ten lessons from my first year"),
      source: "dev",
      sourceName: "dev.to",
      tags: ["docker"],
    };

    expect(filterByTopic([...stories, devToStory], "devops").map((item) => item.id)).toEqual(["5"]);
  });

  it("keeps only the blog posts for blogs, whatever their topic, in order", () => {
    const blogPost = (id: string, title: string): NewsStory => ({
      ...story(id, title),
      source: "blog",
      sourceName: "Next.js · Blog oficial",
      points: 0,
    });
    const mixed = [
      ...stories,
      blogPost("b1", "Next.js 16.1"),
      { ...story("d1", "Blogs I read"), source: "dev" as const, sourceName: "dev.to" },
      blogPost("b2", "Node.js security release"),
    ];

    expect(filterByTopic(mixed, "blogs").map((item) => item.id)).toEqual(["b1", "b2"]);
    expect(filterByTopic(stories, "blogs")).toEqual([]);
    // Blog posts still belong to their keyword topic.
    expect(filterByTopic(mixed, "seguridad").map((item) => item.id)).toEqual(["b2"]);
    // The search applies on top of the source filter.
    const blogs = filterByTopic(mixed, "blogs");
    expect(filterStories(blogs, "security").map((item) => item.id)).toEqual(["b2"]);
  });

  it("does not mutate the given stories", () => {
    const copy = structuredClone(stories);

    filterByTopic(stories, "ia");

    expect(stories).toEqual(copy);
  });
});
