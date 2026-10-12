import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ReleasesPage, { metadata } from "@/app/releases/page";

// The page shell must not reach GitHub; the list itself is covered by the ReleaseList tests.
vi.mock("@/features/release-radar/api/get-latest-releases", () => ({
  getLatestReleasesResult: () => new Promise(() => {}),
  releasesToShow: () => null,
}));

describe("Releases page", () => {
  it("has a single main heading and an intro", () => {
    render(<ReleasesPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Versiones" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("La última versión publicada");
  });

  it("links back to the home page", () => {
    render(<ReleasesPage />);

    expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute("href", "/");
  });

  it("shows a skeleton while the releases load", () => {
    render(<ReleasesPage />);

    expect(screen.getByRole("status", { name: "Cargando versiones" })).toBeInTheDocument();
  });

  it("titles the document", () => {
    expect(metadata.title).toBe("Versiones");
  });
});
