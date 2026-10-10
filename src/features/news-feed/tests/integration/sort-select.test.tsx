import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { SortSelect } from "@/features/news-feed/components/sort-select";

describe("SortSelect", () => {
  it("is a labelled select that starts on the most recent order", () => {
    render(<SortSelect />, { wrapper: withNuqsTestingAdapter() });

    expect(screen.getByText("Ordenar:")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Ordenar" })).toHaveDisplayValue("Recientes");
  });

  it("restores the order from the url", () => {
    render(<SortSelect />, { wrapper: withNuqsTestingAdapter({ searchParams: "?sort=popular" }) });

    expect(screen.getByRole("combobox", { name: "Ordenar" })).toHaveDisplayValue("Populares");
  });

  it("writes the chosen order to the url", async () => {
    const onUrlUpdate = vi.fn();
    render(<SortSelect />, { wrapper: withNuqsTestingAdapter({ onUrlUpdate }) });

    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Ordenar" }), "Populares");

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get("sort")).toBe("popular");
  });

  it("removes the parameter when going back to the default order", async () => {
    const onUrlUpdate = vi.fn();
    render(<SortSelect />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?sort=popular", onUrlUpdate }),
    });

    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Ordenar" }), "Recientes");

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.has("sort")).toBe(false);
  });
});
