import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon, type IconName } from "@/shared/ui/icon";

const ALL_ICONS: IconName[] = [
  "search",
  "menu",
  "sun",
  "moon",
  "arrow-up-right",
  "arrow-right",
  "chevron-down",
  "alert",
  "search-x",
  "rss",
  "hacker-news",
  "github",
  "dev-to",
];

describe("Icon", () => {
  it.each(ALL_ICONS)("renders the %s icon as an svg", (name) => {
    const { container } = render(<Icon name={name} />);

    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("is hidden from assistive technology when it is decorative", () => {
    const { container } = render(<Icon name="search" />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("exposes an accessible name when a label is given", () => {
    render(<Icon name="github" label="GitHub" />);

    expect(screen.getByRole("img", { name: "GitHub" })).toBeInTheDocument();
  });

  it("uses a 16px size by default and accepts a custom size", () => {
    const { container, rerender } = render(<Icon name="menu" />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "16");

    rerender(<Icon name="menu" size={24} />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "24");
    expect(container.querySelector("svg")).toHaveAttribute("height", "24");
  });

  it("inherits the text color and allows extra classes", () => {
    const { container } = render(<Icon name="sun" className="text-accent-text" />);

    expect(container.querySelector("svg")).toHaveClass("shrink-0", "text-accent-text");
  });
});
