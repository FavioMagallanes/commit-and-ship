import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExternalLink } from "@/shared/ui/external-link";

describe("ExternalLink", () => {
  it("opens in a new tab without leaking the opener", () => {
    render(<ExternalLink href="https://example.com/post">Leer</ExternalLink>);

    const link = screen.getByRole("link", { name: "Leer" });
    expect(link).toHaveAttribute("href", "https://example.com/post");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("allows extra classes", () => {
    render(
      <ExternalLink href="https://example.com" className="font-bold">
        Leer
      </ExternalLink>,
    );

    expect(screen.getByRole("link")).toHaveClass("font-bold");
  });
});
