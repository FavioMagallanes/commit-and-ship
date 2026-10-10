import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home page", () => {
  it("renders the product name as the main heading", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { level: 1, name: "Commit & Ship" })).toBeInTheDocument();
  });

  it("states what the product is", () => {
    render(<Home />);

    expect(screen.getByText("Novedades de desarrollo de software, sin ruido.")).toBeInTheDocument();
  });
});
