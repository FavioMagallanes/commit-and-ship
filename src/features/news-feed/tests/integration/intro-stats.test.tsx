import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IntroStats } from "@/features/news-feed/components/intro-stats";
import type { NewsStory } from "@/features/news-feed/model/news-story";

const NOW = new Date("2026-10-10T12:00:00Z");

const story = (id: string, publishedAt: string): NewsStory => ({
  id,
  source: "hn",
  sourceName: "Hacker News",
  title: id,
  url: "https://example.com",
  publishedAt,
  points: 1,
  commentsCount: 0,
});

const loadStories = vi.fn<() => Promise<NewsStory[]>>();

describe("IntroStats", () => {
  it("shows how many sources are aggregated and how many stories are from today", async () => {
    loadStories.mockResolvedValueOnce([
      story("a", "2026-10-10T10:00:00Z"),
      story("b", "2026-10-10T09:00:00Z"),
      story("c", "2026-10-01T09:00:00Z"),
    ]);

    render(await IntroStats({ loadStories, now: NOW }));

    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "2 fuentes",
      "2 novedades hoy",
    ]);
  });

  it("uses the singular for a single story", async () => {
    loadStories.mockResolvedValueOnce([story("a", "2026-10-10T10:00:00Z")]);

    render(await IntroStats({ loadStories, now: NOW }));

    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toContain(
      "1 novedad hoy",
    );
  });

  it("still shows the sources when the stories cannot be loaded", async () => {
    loadStories.mockRejectedValueOnce(new Error("boom"));

    render(await IntroStats({ loadStories, now: NOW }));

    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["2 fuentes"]);
  });
});
