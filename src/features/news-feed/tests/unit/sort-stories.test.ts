import { describe, expect, it } from "vitest";

import type { NewsStory } from "@/features/news-feed/model/news-story";
import { sortStories } from "@/features/news-feed/model/sort-stories";

const story = (
  id: string,
  publishedAt: string,
  points = 1,
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

  it("interleaves sources by popularity within each source when sorting by popular", () => {
    const day = "2026-10-10T10:00:00.000Z";
    const stories = [
      story("hn-100", day, 100),
      story("dev-5", day, 5, "dev"),
      story("hn-900", day, 900),
      story("dev-30", day, 30, "dev"),
      story("hn-400", day, 400),
      story("dev-0", day, 0, "dev"),
    ];

    expect(ids(sortStories(stories, "popular"))).toEqual([
      "hn-900",
      "dev-30",
      "hn-400",
      "dev-5",
      "hn-100",
      "dev-0",
    ]);
  });

  it("orders a single source exactly as sorting by points", () => {
    const stories = [12, 300, 0, 45, 300, 7].map((points, index) =>
      story(`s${index}`, `2026-10-1${index}T10:00:00.000Z`, points),
    );
    const byPoints = stories.toSorted(
      (a, b) => b.points - a.points || b.publishedAt.localeCompare(a.publishedAt),
    );

    expect(ids(sortStories(stories, "popular"))).toEqual(ids(byPoints));
  });

  it("returns an empty list for an empty input", () => {
    expect(sortStories([], "popular")).toEqual([]);
  });

  it("sends official blog posts, which have no points, after every scored story by popular", () => {
    const day = "2026-10-10T10:00:00.000Z";
    const stories = [
      story("blog-old", "2026-10-08T10:00:00.000Z", 0, "blog"),
      story("hn-10", day, 10),
      story("blog-new", "2026-10-10T11:00:00.000Z", 0, "blog"),
      story("dev-3", day, 3, "dev"),
      story("hn-500", day, 500),
    ];

    expect(ids(sortStories(stories, "popular"))).toEqual([
      "hn-500",
      "dev-3",
      "hn-10",
      "blog-new",
      "blog-old",
    ]);
  });

  it("does not lift a lone story without points to the top by popular", () => {
    const stories = [
      story("hn-low", "2026-10-10T09:00:00.000Z", 5),
      story("hn-high", "2026-10-10T09:00:00.000Z", 50),
      story("blog", "2026-10-10T12:00:00.000Z", 0, "blog"),
    ];

    expect(ids(sortStories(stories, "popular"))).toEqual(["hn-high", "hn-low", "blog"]);
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
