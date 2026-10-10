import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FIXTURE_TITLE } from "@/shared/tests/fixtures";

function Title({ children }: { children: string }) {
  return <h1>{children}</h1>;
}

describe("test environment", () => {
  it("renders React components in jsdom and exposes jest-dom matchers", () => {
    render(<Title>{FIXTURE_TITLE}</Title>);

    expect(screen.getByRole("heading", { level: 1, name: FIXTURE_TITLE })).toBeInTheDocument();
  });

  it("resolves the @/ path alias", () => {
    expect(FIXTURE_TITLE).toBe("Commit & Ship");
  });
});
