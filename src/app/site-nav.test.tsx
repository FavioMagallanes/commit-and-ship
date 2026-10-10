import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SiteNav } from "@/app/site-nav";

vi.stubGlobal(
  "matchMedia",
  vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
);

describe("SiteNav", () => {
  it("is the page banner with a navigation to the home", () => {
    render(<SiteNav />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Commit & Ship, ir al inicio" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("offers the theme toggle", () => {
    render(<SiteNav />);

    expect(screen.getByRole("button", { name: /Tema/ })).toBeInTheDocument();
  });
});
