import { render, screen, within } from "@testing-library/react";
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
      screen.getByText(
        "Lo que publican Hacker News, GitHub, dev.to y Mastodon, ordenado por hora. Sin cuentas ni algoritmos.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Reunimos en un solo lugar lo que publican Hacker News, GitHub, dev.to y Mastodon, ordenado por hora. Sin cuentas ni algoritmos.",
      ),
    ).toBeInTheDocument();
  });

  it("offers the search inside the page for small screens", () => {
    render(<Home {...props} />, { wrapper: withNuqsTestingAdapter() });

    expect(
      within(screen.getByRole("main")).getByRole("searchbox", { name: "Buscar novedades" }),
    ).toBeInTheDocument();
  });

  it("places the sidebar with the radar before the latest stories", () => {
    render(<Home {...props} />, { wrapper: withNuqsTestingAdapter() });

    const sidebar = screen.getByRole("complementary", { name: "Barra lateral" });
    const latest = screen.getByRole("heading", { level: 2, name: "Más recientes" });

    expect(
      within(sidebar).getByRole("status", { name: "Cargando radar de versiones" }),
    ).toBeInTheDocument();
    expect(sidebar.compareDocumentPosition(latest) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("places the conversations under the most discussed stories, only from lg up", () => {
    render(<Home {...props} />, { wrapper: withNuqsTestingAdapter() });

    const sidebar = screen.getByRole("complementary", { name: "Barra lateral" });
    const trending = within(sidebar).getByRole("status", { name: "Cargando lo más hablado" });
    const conversation = within(sidebar).getByRole("status", {
      name: "Cargando conversaciones",
    });

    expect(conversation.closest(".hidden.lg\\:block")).not.toBeNull();
    expect(
      trending.compareDocumentPosition(conversation) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("offers the topic filter in the intro", () => {
    render(<Home {...props} />, { wrapper: withNuqsTestingAdapter() });

    expect(screen.getByRole("region", { name: "Filtrar por tema" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Todo" })).toHaveAttribute("aria-pressed", "true");
  });
});
