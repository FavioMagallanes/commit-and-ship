import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Pill } from "@/shared/ui/pill";

describe("Pill", () => {
  it("renders its text as non-interactive content", () => {
    render(<Pill>Nuevo</Pill>);

    expect(screen.getByText("Nuevo")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it.each([
    ["neutral", "bg-soft"],
    ["accent", "bg-accent-soft"],
    ["solid", "bg-accent"],
  ] as const)("applies the %s tone", (tone, expectedClass) => {
    render(<Pill tone={tone}>Etiqueta</Pill>);

    expect(screen.getByText("Etiqueta")).toHaveClass(expectedClass);
  });

  it("uses the padding from the design", () => {
    render(<Pill>Etiqueta</Pill>);

    expect(screen.getByText("Etiqueta")).toHaveClass("px-3", "py-1");
  });

  it("uses the neutral tone by default", () => {
    render(<Pill>Etiqueta</Pill>);

    expect(screen.getByText("Etiqueta")).toHaveClass("bg-soft");
  });
});
