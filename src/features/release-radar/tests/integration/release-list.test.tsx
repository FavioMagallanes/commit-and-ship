import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ReleasesResult } from "@/features/release-radar/api/get-latest-releases";
import { ReleaseList } from "@/features/release-radar/components/release-list";
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

const loadReleases = vi.fn<() => Promise<ReleasesResult>>();
const mockReleases = (releases: Release[]) =>
  loadReleases.mockResolvedValueOnce({
    status: "ok",
    releases,
    fetchedAt: "2026-10-10T11:00:00.000Z",
  });

describe("ReleaseList", () => {
  it("lists every release, most recent first, without a cap", async () => {
    mockReleases(
      Array.from({ length: 8 }, (_, index) =>
        release({
          repo: `owner/repo-${index}`,
          name: `Repo ${index}`,
          version: `v${index}.0.0`,
          publishedAt: `2026-10-0${index + 1}T12:00:00.000Z`,
        }),
      ),
    );

    render(await ReleaseList({ loadReleases, now: NOW }));

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(8);
    expect(rows.map((row) => within(row).getByRole("link").textContent)).toEqual([
      "Repo 7",
      "Repo 6",
      "Repo 5",
      "Repo 4",
      "Repo 3",
      "Repo 2",
      "Repo 1",
      "Repo 0",
    ]);
    rows.forEach((row) => expect(row).not.toHaveClass("max-md:hidden"));
  });

  it("shows the version, the relative time and an external link to the release", async () => {
    mockReleases([release()]);

    render(await ReleaseList({ loadReleases, now: NOW }));

    const link = screen.getByRole("link", { name: "Node.js" });
    expect(link).toHaveAttribute("href", "https://github.com/nodejs/node/releases/tag/v26.0.1");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("v26.0.1")).toBeInTheDocument();
    expect(screen.getByText("hace 1 d")).toHaveAttribute("dateTime", "2026-10-09T12:00:00.000Z");
  });

  it("shows an error banner when the source fails", async () => {
    loadReleases.mockRejectedValueOnce(new Error("boom"));

    render(await ReleaseList({ loadReleases, now: NOW }));

    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar las versiones");
    expect(screen.getByRole("alert")).toContainElement(
      screen.getByRole("button", { name: "Reintentar" }),
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("shows saved releases under a banner when GitHub fails", async () => {
    loadReleases.mockResolvedValueOnce({
      status: "error",
      fetchedAt: "2026-10-10T11:59:00.000Z",
      stale: { releases: [release()], savedAt: "2026-10-10T09:00:00.000Z" },
    });

    render(await ReleaseList({ loadReleases, now: NOW }));

    const banner = screen.getByRole("alert");
    expect(banner).toHaveTextContent("No pudimos actualizar las versiones");
    expect(banner).toHaveTextContent("Mostramos contenido guardado de hace 3 h");
    expect(banner).toContainElement(screen.getByRole("button", { name: "Reintentar" }));
    const list = screen.getByRole("list");
    expect(banner.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(list).getByRole("link", { name: "Node.js" })).toBeInTheDocument();
  });

  it("shows only the error banner when GitHub fails with nothing saved", async () => {
    loadReleases.mockResolvedValueOnce({ status: "error", fetchedAt: "2026-10-10T11:59:00.000Z" });

    render(await ReleaseList({ loadReleases, now: NOW }));

    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar las versiones");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("says so when there are no releases", async () => {
    mockReleases([]);

    render(await ReleaseList({ loadReleases, now: NOW }));

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByText("Todavía no hay versiones para mostrar.")).toBeInTheDocument();
  });
});
