import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardHeader } from "@/shared/ui/card-header";

describe("CardHeader", () => {
  it("renders the title as a heading", () => {
    render(<CardHeader title="Radar de versiones" />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Radar de versiones" }),
    ).toBeInTheDocument();
  });

  it("has no link when no href is given", () => {
    render(<CardHeader title="Lo más hablado hoy" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the link with the default label", () => {
    render(<CardHeader title="Radar de versiones" href="/radar" />);

    expect(screen.getByRole("link", { name: "Ver todo" })).toHaveAttribute("href", "/radar");
  });

  it("accepts a custom link label", () => {
    render(<CardHeader title="Radar" href="/radar" linkLabel="Ver releases" />);

    expect(screen.getByRole("link", { name: "Ver releases" })).toBeInTheDocument();
  });
});
