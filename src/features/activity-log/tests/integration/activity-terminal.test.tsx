import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ActivityTerminal } from "@/features/activity-log/components/activity-terminal";
import type { NewsStory } from "@/features/news-feed/model/news-story";
import type { Release } from "@/features/release-radar/model/release";

const NOW = new Date("2026-10-10T12:00:00Z");

const STORY: NewsStory = {
  id: "hn-1",
  source: "hn",
  sourceName: "Hacker News",
  title: "A bundler in Rust",
  url: "https://example.com",
  publishedAt: "2026-10-10T09:00:00Z",
  points: 1,
  commentsCount: 0,
};

const RELEASE: Release = {
  repo: "microsoft/TypeScript",
  name: "TypeScript",
  version: "v5.8",
  url: "https://github.com/microsoft/TypeScript/releases/tag/v5.8",
  publishedAt: "2026-10-10T11:00:00Z",
};

const loadStories = vi.fn<() => Promise<NewsStory[]>>();
const loadReleases = vi.fn<() => Promise<Release[]>>();

describe("ActivityTerminal", () => {
  it("prints the latest stories and releases with how long ago they happened", async () => {
    loadStories.mockResolvedValueOnce([STORY]);
    loadReleases.mockResolvedValueOnce([RELEASE]);

    const { container } = render(await ActivityTerminal({ loadStories, loadReleases, now: NOW }));

    expect(container).toHaveTextContent("$ tail -f novedades.log");
    expect(container).toHaveTextContent("1 hGHTypeScript v5.8 publicada");
    expect(container).toHaveTextContent("3 hHNA bundler in Rust");
  });

  it("keeps four entries but hides the oldest one below md", async () => {
    const stories = ["a", "b", "c"].map((id, index) => ({
      ...STORY,
      id,
      title: `Story ${id}`,
      publishedAt: `2026-10-10T0${index + 6}:00:00Z`,
    }));
    loadStories.mockResolvedValueOnce(stories);
    loadReleases.mockResolvedValueOnce([RELEASE]);

    const { container } = render(await ActivityTerminal({ loadStories, loadReleases, now: NOW }));
    const entries = Array.from(container.querySelectorAll("li"));

    expect(entries).toHaveLength(4);
    expect(entries.slice(0, 3).map((entry) => entry.className)).not.toContainEqual(
      expect.stringMatching(/(^|\s)hidden(\s|$)/),
    );
    expect(entries[3]).toHaveClass("hidden", "md:grid");
    expect(entries[3]).toHaveTextContent("Story a");
  });

  it("still prints what it can when one source fails", async () => {
    loadStories.mockRejectedValueOnce(new Error("boom"));
    loadReleases.mockResolvedValueOnce([RELEASE]);

    const { container } = render(await ActivityTerminal({ loadStories, loadReleases, now: NOW }));

    expect(container).toHaveTextContent("TypeScript v5.8 publicada");
  });

  it("says so when no source answered", async () => {
    loadStories.mockRejectedValueOnce(new Error("boom"));
    loadReleases.mockRejectedValueOnce(new Error("boom"));

    const { container } = render(await ActivityTerminal({ loadStories, loadReleases, now: NOW }));

    expect(container).toHaveTextContent("sin novedades por ahora");
  });

  it("is decorative: hidden from assistive technology", async () => {
    loadStories.mockResolvedValueOnce([STORY]);
    loadReleases.mockResolvedValueOnce([RELEASE]);

    const { container } = render(await ActivityTerminal({ loadStories, loadReleases, now: NOW }));

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
