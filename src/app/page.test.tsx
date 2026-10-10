import { render, screen } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

const props = { params: Promise.resolve({}), searchParams: Promise.resolve({}) };

describe("Home page", () => {
  it("renders the tagline as the only main heading", () => {
    render(<Home {...props} />, { wrapper: withNuqsTestingAdapter() });

    expect(
      screen.getByRole("heading", { level: 1, name: "Novedades tech, sin ruido." }),
    ).toBeInTheDocument();
  });

  it("explains what the product aggregates", () => {
    render(<Home {...props} />, { wrapper: withNuqsTestingAdapter() });

    expect(
      screen.getByText(/lo que publican Hacker News y GitHub, ordenado por hora/),
    ).toBeInTheDocument();
  });
});
