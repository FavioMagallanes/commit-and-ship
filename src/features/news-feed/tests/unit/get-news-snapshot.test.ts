import { describe, expect, it } from "vitest";

import { getNewsSnapshot, getNewsStories } from "@/features/news-feed/api/get-news-snapshot";
import type { NewsSnapshot, NewsStory } from "@/features/news-feed/model/news-story";

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

const snapshotOf =
  (stories: NewsStory[], fetchedAt: string) => async (): Promise<NewsSnapshot> => ({
    stories,
    fetchedAt,
  });

const failing = async (): Promise<NewsSnapshot> => {
  throw new Error("source down");
};

const hn = snapshotOf([story("hn-1", "hn")], "2026-10-10T10:05:00.000Z");
const devTo = snapshotOf([story("devto-1", "dev")], "2026-10-10T10:00:00.000Z");

describe("getNewsSnapshot", () => {
  it("combines the stories of every source and keeps the oldest fetch time", async () => {
    const snapshot = await getNewsSnapshot([hn, devTo]);

    expect(snapshot.stories.map((item) => item.id)).toEqual(["hn-1", "devto-1"]);
    expect(snapshot.fetchedAt).toBe("2026-10-10T10:00:00.000Z");
  });

  it("still returns the other source's stories when one source fails", async () => {
    const snapshot = await getNewsSnapshot([failing, devTo]);

    expect(snapshot.stories.map((item) => item.id)).toEqual(["devto-1"]);
    expect(snapshot.fetchedAt).toBe("2026-10-10T10:00:00.000Z");
  });

  it("throws when every source fails", async () => {
    await expect(getNewsSnapshot([failing, failing])).rejects.toThrow();
  });
});

describe("getNewsStories", () => {
  it("returns only the combined stories", async () => {
    const stories = await getNewsStories([hn, failing]);

    expect(stories.map((item) => item.id)).toEqual(["hn-1"]);
  });
});
