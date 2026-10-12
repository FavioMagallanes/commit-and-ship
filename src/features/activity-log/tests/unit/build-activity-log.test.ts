import { describe, expect, it } from "vitest";

import { buildActivityLog } from "@/features/activity-log/model/build-activity-log";
import type { NewsStory } from "@/features/news-feed/model/news-story";
import type { Release } from "@/features/release-radar/model/release";

const story = (id: string, title: string, publishedAt: string): NewsStory => ({
  id,
  source: "hn",
  sourceName: "Hacker News",
  title,
  url: "https://example.com",
  publishedAt,
  points: 1,
  commentsCount: 0,
});

const release = (name: string, version: string, publishedAt: string): Release => ({
  repo: `owner/${name}`,
  name,
  version,
  url: "https://github.com/owner/repo/releases/tag/x",
  publishedAt,
});

describe("buildActivityLog", () => {
  it("mixes stories and releases, newest first", () => {
    const log = buildActivityLog(
      [
        story("1", "Old story", "2026-10-10T08:00:00Z"),
        story("2", "New story", "2026-10-10T11:00:00Z"),
      ],
      [release("Rust", "1.99.0", "2026-10-10T09:00:00Z")],
    );

    expect(log.map((entry) => entry.text)).toEqual([
      "New story",
      "Rust 1.99.0 publicada",
      "Old story",
    ]);
  });

  it("tags each entry with its source", () => {
    const log = buildActivityLog(
      [story("1", "A story", "2026-10-10T11:00:00Z")],
      [release("Rust", "1.99.0", "2026-10-10T09:00:00Z")],
    );

    expect(log.map((entry) => entry.source)).toEqual(["HN", "GH"]);
  });

  it("tags dev.to stories as DEV", () => {
    const devToStory: NewsStory = {
      ...story("devto-1", "A dev.to article", "2026-10-10T11:00:00Z"),
      source: "dev",
      sourceName: "dev.to",
    };

    expect(buildActivityLog([devToStory], []).map((entry) => entry.source)).toEqual(["DEV"]);
  });

  it("tags official blog posts as RSS", () => {
    const blogStory: NewsStory = {
      ...story("blog-nodejs-1", "Node.js v24.9.0 (Current)", "2026-10-10T11:00:00Z"),
      source: "blog",
      sourceName: "Node.js · Blog oficial",
      points: 0,
    };

    expect(buildActivityLog([blogStory], []).map((entry) => entry.source)).toEqual(["RSS"]);
  });

  it("keeps only the most recent entries", () => {
    const stories = Array.from({ length: 10 }, (_, index) =>
      story(`s${index}`, `Story ${index}`, `2026-10-10T0${index}:00:00Z`),
    );

    expect(buildActivityLog(stories, [])).toHaveLength(4);
  });

  it("skips entries with an invalid date", () => {
    expect(buildActivityLog([story("1", "Broken", "nope")], [])).toEqual([]);
  });

  it("works when one of the sources is missing", () => {
    expect(buildActivityLog([], [release("Rust", "1.99.0", "2026-10-10T09:00:00Z")])).toHaveLength(
      1,
    );
  });
});
