import { describe, expect, it } from "vitest";

import {
  getNewsSnapshot,
  getNewsStories,
  type NewsSourceLoader,
  type SourceSnapshot,
} from "@/features/news-feed/api/get-news-snapshot";
import type { NewsStory } from "@/features/news-feed/model/news-story";

const story = (id: string, source: NewsStory["source"]): NewsStory => ({
  id,
  source,
  sourceName: source === "hn" ? "Hacker News" : "dev.to",
  title: `Story ${id}`,
  url: `https://example.com/${id}`,
  publishedAt: "2026-10-10T09:00:00.000Z",
  points: 1,
  commentsCount: 0,
});

const named = (name: string, load: () => Promise<SourceSnapshot>): NewsSourceLoader => ({
  name,
  load,
});

const okSource = (name: string, stories: NewsStory[], fetchedAt: string) =>
  named(name, async () => ({ status: "ok", stories, fetchedAt }));

const failedSource = named("Failed", async () => ({
  status: "error",
  fetchedAt: "2026-10-10T09:00:00.000Z",
}));

const rejectingSource = named("Rejecting", async () => {
  throw new Error("source down");
});

const hn = okSource("Hacker News", [story("hn-1", "hn")], "2026-10-10T10:05:00.000Z");
const devTo = okSource("dev.to", [story("devto-1", "dev")], "2026-10-10T10:00:00.000Z");
const blogs = okSource(
  "Blogs oficiales",
  [{ ...story("blog-nodejs-1", "blog"), sourceName: "Node.js · Blog oficial", points: 0 }],
  "2026-10-10T09:50:00.000Z",
);

describe("getNewsSnapshot", () => {
  it("combines the stories of every source and keeps the oldest fetch time", async () => {
    const snapshot = await getNewsSnapshot([hn, devTo]);

    expect(snapshot.stories.map((item) => item.id)).toEqual(["hn-1", "devto-1"]);
    expect(snapshot.fetchedAt).toBe("2026-10-10T10:00:00.000Z");
  });

  it("keeps Hacker News when dev.to fails, ignoring the failed attempt's time", async () => {
    const snapshot = await getNewsSnapshot([hn, failedSource]);

    expect(snapshot).toEqual({
      stories: [story("hn-1", "hn")],
      fetchedAt: "2026-10-10T10:05:00.000Z",
      staleSources: [],
    });
  });

  it("keeps dev.to when Hacker News fails", async () => {
    const snapshot = await getNewsSnapshot([failedSource, devTo]);

    expect(snapshot).toEqual({
      stories: [story("devto-1", "dev")],
      fetchedAt: "2026-10-10T10:00:00.000Z",
      staleSources: [],
    });
  });

  it("throws when every source fails", async () => {
    await expect(getNewsSnapshot([failedSource, failedSource])).rejects.toThrow(
      "Every news source failed",
    );
  });

  it("combines three sources and keeps the oldest fetch time", async () => {
    const snapshot = await getNewsSnapshot([hn, devTo, blogs]);

    expect(snapshot.stories.map((item) => item.id)).toEqual(["hn-1", "devto-1", "blog-nodejs-1"]);
    expect(snapshot.fetchedAt).toBe("2026-10-10T09:50:00.000Z");
  });

  it("keeps the other two sources when the blogs fail", async () => {
    const snapshot = await getNewsSnapshot([hn, devTo, failedSource]);

    expect(snapshot).toEqual({
      stories: [story("hn-1", "hn"), story("devto-1", "dev")],
      fetchedAt: "2026-10-10T10:00:00.000Z",
      staleSources: [],
    });
  });

  it("keeps the blogs alone when the other sources fail", async () => {
    const snapshot = await getNewsSnapshot([failedSource, rejectingSource, blogs]);

    expect(snapshot.stories.map((item) => item.id)).toEqual(["blog-nodejs-1"]);
  });

  it("throws an AggregateError when all three sources fail", async () => {
    await expect(
      getNewsSnapshot([failedSource, rejectingSource, failedSource]),
    ).rejects.toBeInstanceOf(AggregateError);
  });

  it("treats a loader that rejects like a failed source", async () => {
    const snapshot = await getNewsSnapshot([rejectingSource, devTo]);

    expect(snapshot.stories.map((item) => item.id)).toEqual(["devto-1"]);
    await expect(getNewsSnapshot([rejectingSource, failedSource])).rejects.toThrow();
  });
});

const staleSource = (name: string, stories: NewsStory[], savedAt: string) =>
  named(name, async () => ({
    status: "error",
    fetchedAt: "2026-10-10T12:00:00.000Z",
    stale: { stories, savedAt },
  }));

describe("getNewsSnapshot with saved content", () => {
  const staleDevTo = staleSource("dev.to", [story("devto-old", "dev")], "2026-10-10T07:00:00.000Z");
  const staleBlogs = staleSource(
    "Blogs oficiales",
    [{ ...story("blog-old", "blog"), points: 0 }],
    "2026-10-10T08:00:00.000Z",
  );

  it("adds the saved stories of a failed source and names it, keeping the fresh fetch time", async () => {
    const snapshot = await getNewsSnapshot([hn, staleDevTo, blogs]);

    expect(snapshot.stories.map((item) => item.id)).toEqual(["hn-1", "devto-old", "blog-nodejs-1"]);
    expect(snapshot.fetchedAt).toBe("2026-10-10T09:50:00.000Z");
    expect(snapshot.staleSources).toEqual([
      { name: "dev.to", savedAt: "2026-10-10T07:00:00.000Z" },
    ]);
  });

  it("shows only saved stories when every source failed, dated by the oldest save", async () => {
    const snapshot = await getNewsSnapshot([failedSource, staleDevTo, staleBlogs]);

    expect(snapshot.stories.map((item) => item.id)).toEqual(["devto-old", "blog-old"]);
    expect(snapshot.fetchedAt).toBe("2026-10-10T07:00:00.000Z");
    expect(snapshot.staleSources).toEqual([
      { name: "dev.to", savedAt: "2026-10-10T07:00:00.000Z" },
      { name: "Blogs oficiales", savedAt: "2026-10-10T08:00:00.000Z" },
    ]);
  });

  it("still throws when every source failed and none has saved stories", async () => {
    await expect(
      getNewsSnapshot([failedSource, rejectingSource, failedSource]),
    ).rejects.toBeInstanceOf(AggregateError);
  });
});

describe("getNewsStories", () => {
  it("returns only the combined stories", async () => {
    const stories = await getNewsStories([hn, failedSource]);

    expect(stories.map((item) => item.id)).toEqual(["hn-1"]);
  });
});
