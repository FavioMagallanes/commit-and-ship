import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RankingRow } from "@/features/trending/components/ranking-row";

const baseProps = {
  rank: 2,
  title: "Vulnerabilidad crítica en una librería popular",
  href: "https://news.ycombinator.com/item?id=1",
  points: 688,
};

const renderRow = (props: Partial<Parameters<typeof RankingRow>[0]> = {}) =>
  render(
    <ol>
      <RankingRow {...baseProps} {...props} />
    </ol>,
  );

describe("RankingRow", () => {
  it("shows the rank and the title as a link", () => {
    renderRow();

    expect(screen.getByRole("listitem")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: baseProps.title })).toHaveAttribute(
      "href",
      baseProps.href,
    );
  });

  it("shows the points", () => {
    renderRow();

    expect(screen.getByText("688 pts")).toBeInTheDocument();
  });

  it("highlights only the first place", () => {
    const { unmount } = renderRow({ rank: 1 });
    expect(screen.getByText("1")).toHaveClass("text-accent");
    unmount();

    renderRow({ rank: 2 });
    expect(screen.getByText("2")).toHaveClass("text-faint");
  });
});
