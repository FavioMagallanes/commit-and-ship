import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReleaseRadar } from "@/features/release-radar/components/release-radar";
import type { Release } from "@/features/release-radar/model/release";

const NOW = new Date("2026-10-10T12:00:00Z");

const release = (overrides: Partial<Release> = {}): Release => ({
  repo: "nodejs/node",
  name: "Node.js",
  version: "v26.0.1",
  url: "https://github.com/nodejs/node/releases/tag/v26.0.1",
  publishedAt: "2026-10-09T12:00:00.000Z",
  ...overrides,
});

const loadReleases = vi.fn<() => Promise<Release[]>>();

describe("ReleaseRadar", () => {
  it("lists each release with its version under a named section", async () => {
    loadReleases.mockResolvedValueOnce([
      release(),
      release({ repo: "facebook/react", name: "React", version: "v20.1.0" }),
    ]);

    render(await ReleaseRadar({ loadReleases, now: NOW }));

    const section = screen.getByRole("region", { name: "Radar de versiones" });
    expect(within(section).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Node.js" })).toHaveAttribute(
      "href",
      "https://github.com/nodejs/node/releases/tag/v26.0.1",
    );
    expect(screen.getByText("v26.0.1")).toBeInTheDocument();
    expect(screen.getAllByText("hace 1 d")).toHaveLength(2);
  });

  it("marks only recent releases as new", async () => {
    loadReleases.mockResolvedValueOnce([
      release(),
      release({ name: "React", repo: "facebook/react", publishedAt: "2026-09-01T00:00:00.000Z" }),
    ]);

    render(await ReleaseRadar({ loadReleases, now: NOW }));

    expect(screen.getAllByText("Nuevo")).toHaveLength(1);
  });

  it("shows an error banner when the source fails", async () => {
    loadReleases.mockRejectedValueOnce(new Error("boom"));

    render(await ReleaseRadar({ loadReleases, now: NOW }));

    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar el radar de versiones");
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
