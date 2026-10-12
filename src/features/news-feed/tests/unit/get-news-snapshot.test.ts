import { describe, expect, it } from "vitest";

import {
  getNewsSnapshot,
  getNewsStories,
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

const okSource =
  (stories: NewsStory[], fetchedAt: string) => async (): Promise<SourceSnapshot> => ({
    status: "ok",
    stories,
    fetchedAt,
  });

const failedSource = async (): Promise<SourceSnapshot> => ({
  status: "error",
  fetchedAt: "2026-10-10T09:00:00.000Z",
});

const rejectingSource = async (): Promise<SourceSnapshot> => {
  throw new Error("source down");
};

const hn = okSource([story("hn-1", "hn")], "2026-10-10T10:05:00.000Z");
const devTo = okSource([story("devto-1", "dev")], "2026-10-10T10:00:00.000Z");
const blogs = okSource(
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
    });
  });

  it("keeps dev.to when Hacker News fails", async () => {
    const snapshot = await getNewsSnapshot([failedSource, devTo]);

    expect(snapshot).toEqual({
      stories: [story("devto-1", "dev")],
      fetchedAt: "2026-10-10T10:00:00.000Z",
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

describe("getNewsStories", () => {
  it("returns only the combined stories", async () => {
    const stories = await getNewsStories([hn, failedSource]);

    expect(stories.map((item) => item.id)).toEqual(["hn-1"]);
  });
});
