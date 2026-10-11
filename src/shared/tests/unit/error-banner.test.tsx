import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ErrorBanner } from "@/shared/ui/error-banner";

describe("ErrorBanner", () => {
  it("announces the title and the detail as an alert", () => {
    render(<ErrorBanner title="No pudimos cargar las noticias">Probá más tarde.</ErrorBanner>);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("No pudimos cargar las noticias");
    expect(alert).toHaveTextContent("Probá más tarde.");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders the action inside the banner when given one", () => {
    render(
      <ErrorBanner
        title="No pudimos cargar las noticias"
        action={<button type="button">Reintentar</button>}
      >
        Probá más tarde.
      </ErrorBanner>,
    );

    expect(screen.getByRole("alert")).toContainElement(
      screen.getByRole("button", { name: "Reintentar" }),
    );
  });
});
