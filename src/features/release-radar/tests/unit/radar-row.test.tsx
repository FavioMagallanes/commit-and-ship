import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RadarRow } from "@/features/release-radar/components/radar-row";

const baseProps = {
  name: "Node.js",
  version: "v24.0",
  href: "https://github.com/nodejs/node/releases/tag/v24.0.0",
  publishedAt: "2026-10-08T12:00:00Z",
  publishedLabel: "hace 2 d",
};

const renderRow = (props: Partial<Parameters<typeof RadarRow>[0]> = {}) =>
  render(
    <ul>
      <RadarRow {...baseProps} {...props} />
    </ul>,
  );

describe("RadarRow", () => {
  it("is a list item with the name linking to the release", () => {
    renderRow();

    expect(screen.getByRole("listitem")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Node.js" })).toHaveAttribute("href", baseProps.href);
  });

  it("shows the version and a machine-readable publication time", () => {
    renderRow();

    expect(screen.getByText("v24.0")).toBeInTheDocument();
    expect(screen.getByText("hace 2 d")).toHaveAttribute("datetime", baseProps.publishedAt);
  });

  it("marks the release as new only when asked", () => {
    const { unmount } = renderRow();
    expect(screen.queryByText("Nuevo")).not.toBeInTheDocument();
    unmount();

    renderRow({ isNew: true });
    expect(screen.getByText("Nuevo")).toBeInTheDocument();
  });
});
