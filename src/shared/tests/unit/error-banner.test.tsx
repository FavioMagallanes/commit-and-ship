import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ErrorBanner, StaleContentBanner } from "@/shared/ui/error-banner";

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

describe("StaleContentBanner", () => {
  const NOW = new Date("2026-10-10T12:00:00.000Z");

  it("says how old the saved content is, with the action inside", () => {
    render(
      <StaleContentBanner
        title="No pudimos actualizar dev.to"
        savedAt="2026-10-10T09:00:00.000Z"
        now={NOW}
        action={<button type="button">Reintentar</button>}
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("No pudimos actualizar dev.to");
    expect(alert).toHaveTextContent("Mostramos contenido guardado de hace 3 h");
    expect(alert).toContainElement(screen.getByRole("button", { name: "Reintentar" }));
  });

  it("leaves the age out when the saved instant is invalid", () => {
    render(<StaleContentBanner title="No pudimos actualizar dev.to" savedAt="nope" now={NOW} />);

    expect(screen.getByRole("alert")).toHaveTextContent(/Mostramos contenido guardado\.$/);
  });
});
