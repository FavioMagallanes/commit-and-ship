import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "@/shared/ui/site-footer";

describe("SiteFooter", () => {
  it("is the page's contentinfo landmark", () => {
    render(<SiteFooter />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("states what the product is", () => {
    render(<SiteFooter />);

    expect(screen.getByText("Commit & Ship · Agregador de novedades tech")).toBeInTheDocument();
  });

  it("lists only the sources that are actually aggregated", () => {
    render(<SiteFooter />);

    expect(screen.getByText("Fuentes: Hacker News · GitHub")).toBeInTheDocument();
  });
});
