import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SourceBadge } from "@/shared/ui/source-badge";

describe("SourceBadge", () => {
  it.each([
    ["hn", "Hacker News"],
    ["gh", "GitHub"],
    ["dev", "dev.to"],
    ["blog", "Blog"],
  ] as const)("names the %s source for assistive technology", (source, name) => {
    render(<SourceBadge source={source} />);

    expect(screen.getByRole("img", { name })).toBeInTheDocument();
  });

  it("is a 40px square box with the design border and radius", () => {
    render(<SourceBadge source="gh" />);

    expect(screen.getByRole("img", { name: "GitHub" }).parentElement).toHaveClass(
      "size-10",
      "rounded-md",
      "border-line",
      "bg-soft",
    );
  });

  it("allows extra classes", () => {
    render(<SourceBadge source="hn" className="shrink-0" />);

    expect(screen.getByRole("img", { name: "Hacker News" }).parentElement).toHaveClass("shrink-0");
  });
});
