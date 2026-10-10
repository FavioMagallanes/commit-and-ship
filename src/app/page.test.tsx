import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

const props = { params: Promise.resolve({}), searchParams: Promise.resolve({}) };

describe("Home page", () => {
  it("renders the product name as the main heading", () => {
    render(<Home {...props} />);

    expect(screen.getByRole("heading", { level: 1, name: "Commit & Ship" })).toBeInTheDocument();
  });

  it("states what the product is", () => {
    render(<Home {...props} />);

    expect(screen.getByText("Novedades de desarrollo de software, sin ruido.")).toBeInTheDocument();
  });
});
