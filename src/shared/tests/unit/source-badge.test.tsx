import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SourceBadge } from "@/shared/ui/source-badge";

describe("SourceBadge", () => {
  it.each([
    ["hn", "Hacker News"],
    ["gh", "GitHub"],
    ["dev", "dev.to"],
    ["blog", "Blog"],
  ] as const)("shows the full name of the %s source", (source, name) => {
    render(<SourceBadge source={source} />);

    expect(screen.getByText(name)).toBeInTheDocument();
  });

  it("keeps the logo decorative so the name is read only once", () => {
    const { container } = render(<SourceBadge source="gh" />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("allows extra classes", () => {
    render(<SourceBadge source="hn" className="w-fit" />);

    expect(screen.getByText("Hacker News").closest("span")).toHaveClass("w-fit");
  });
});
