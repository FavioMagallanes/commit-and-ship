import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ReleasesResult } from "@/features/release-radar/api/get-latest-releases";
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

const loadReleases = vi.fn<() => Promise<ReleasesResult>>();
const mockReleases = (releases: Release[]) =>
  loadReleases.mockResolvedValueOnce({
    status: "ok",
    releases,
    fetchedAt: "2026-10-10T11:00:00.000Z",
  });

describe("ReleaseRadar", () => {
  it("lists each release with its version under a named section", async () => {
    mockReleases([
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
    mockReleases([
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
    expect(screen.getByRole("alert")).toContainElement(
      screen.getByRole("button", { name: "Reintentar" }),
    );
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("shows saved releases under a banner, inside the card, when GitHub fails", async () => {
    loadReleases.mockResolvedValueOnce({
      status: "error",
      fetchedAt: "2026-10-10T11:59:00.000Z",
      stale: { releases: [release()], savedAt: "2026-10-10T09:00:00.000Z" },
    });

    render(await ReleaseRadar({ loadReleases, now: NOW }));

    const section = screen.getByRole("region", { name: "Radar de versiones" });
    const banner = within(section).getByRole("alert");
    expect(banner).toHaveTextContent("No pudimos actualizar el radar de versiones");
    expect(banner).toHaveTextContent("Mostramos contenido guardado de hace 3 h");
    expect(banner).toContainElement(screen.getByRole("button", { name: "Reintentar" }));
    const row = within(section).getByRole("listitem");
    expect(banner.compareDocumentPosition(row) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(row).getByRole("link", { name: "Node.js" })).toBeInTheDocument();
  });

  it("shows only the error banner when GitHub fails with nothing saved", async () => {
    loadReleases.mockResolvedValueOnce({ status: "error", fetchedAt: "2026-10-10T11:59:00.000Z" });

    render(await ReleaseRadar({ loadReleases, now: NOW }));

    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar el radar de versiones");
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("keeps only the releases that match the search", async () => {
    mockReleases([
      release(),
      release({ repo: "facebook/react", name: "React", version: "v20.1.0" }),
    ]);

    render(await ReleaseRadar({ loadReleases, now: NOW, query: Promise.resolve("react") }));

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "React" })).toBeInTheDocument();
  });

  it("links to the full list of releases", async () => {
    mockReleases([release()]);

    render(await ReleaseRadar({ loadReleases, now: NOW }));

    expect(screen.getByRole("link", { name: "Ver todo" })).toHaveAttribute("href", "/releases");
  });

  it("shows at most the six most recent releases, and four below md", async () => {
    mockReleases(
      Array.from({ length: 8 }, (_, index) =>
        release({
          repo: `owner/repo-${index}`,
          name: `Repo ${index}`,
          publishedAt: `2026-10-0${index + 1}T12:00:00.000Z`,
        }),
      ),
    );

    render(await ReleaseRadar({ loadReleases, now: NOW }));

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(6);
    expect(within(rows[0]).getByRole("link")).toHaveAccessibleName("Repo 7");
    expect(within(rows[5]).getByRole("link")).toHaveAccessibleName("Repo 2");
    expect(rows[3]).not.toHaveClass("max-md:hidden");
    expect(rows[4]).toHaveClass("max-md:hidden");
    expect(rows[5]).toHaveClass("max-md:hidden");
  });

  it("says so when no release matches the search", async () => {
    mockReleases([release()]);

    render(await ReleaseRadar({ loadReleases, now: NOW, query: Promise.resolve("zzz") }));

    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    expect(screen.getByText("Ninguna versión coincide con la búsqueda.")).toBeInTheDocument();
  });
});
