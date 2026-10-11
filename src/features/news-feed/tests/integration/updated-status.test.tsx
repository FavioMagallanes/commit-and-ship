import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UpdatedStatus } from "@/features/news-feed/components/updated-status";
import type { NewsSnapshot } from "@/features/news-feed/model/news-story";

const NOW = new Date("2026-10-10T12:00:00Z");

const loadSnapshot = vi.fn<() => Promise<NewsSnapshot>>();

const snapshotFetchedAt = (fetchedAt: string): NewsSnapshot => ({ stories: [], fetchedAt });

describe("UpdatedStatus", () => {
  it("tells how long ago the stories were updated", async () => {
    loadSnapshot.mockResolvedValueOnce(snapshotFetchedAt("2026-10-10T11:57:00Z"));

    render(await UpdatedStatus({ loadSnapshot, now: NOW }));

    expect(screen.getByText("Actualizado hace 3 min")).toBeInTheDocument();
  });

  it("rounds a fresh update up to one minute", async () => {
    loadSnapshot.mockResolvedValueOnce(snapshotFetchedAt("2026-10-10T11:59:40Z"));

    render(await UpdatedStatus({ loadSnapshot, now: NOW }));

    expect(screen.getByText("Actualizado hace 1 min")).toBeInTheDocument();
  });

  it("renders nothing when the stories cannot be loaded", async () => {
    loadSnapshot.mockRejectedValueOnce(new Error("boom"));

    const { container } = render(await UpdatedStatus({ loadSnapshot, now: NOW }));

    expect(container).toBeEmptyDOMElement();
  });
});
