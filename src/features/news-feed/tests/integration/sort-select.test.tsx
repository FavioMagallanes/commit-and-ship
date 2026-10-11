import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { SortSelect } from "@/features/news-feed/components/sort-select";

const chooseOrder = async (label: string) => {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /^Ordenar:/ }));
  await user.click(screen.getByRole("option", { name: label }));
};

describe("SortSelect", () => {
  it("is a labelled control that starts on the most recent order", () => {
    render(<SortSelect />, { wrapper: withNuqsTestingAdapter() });

    expect(screen.getByRole("button", { name: "Ordenar: Recientes" })).toHaveAttribute(
      "aria-haspopup",
      "listbox",
    );
  });

  it("restores the order from the url", () => {
    render(<SortSelect />, { wrapper: withNuqsTestingAdapter({ searchParams: "?sort=popular" }) });

    expect(screen.getByRole("button", { name: "Ordenar: Populares" })).toBeInTheDocument();
  });

  it("writes the chosen order to the url", async () => {
    const onUrlUpdate = vi.fn();
    render(<SortSelect />, { wrapper: withNuqsTestingAdapter({ onUrlUpdate }) });

    await chooseOrder("Populares");

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get("sort")).toBe("popular");
  });

  it("removes the parameter when going back to the default order", async () => {
    const onUrlUpdate = vi.fn();
    render(<SortSelect />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?sort=popular", onUrlUpdate }),
    });

    await chooseOrder("Recientes");

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.has("sort")).toBe(false);
  });
});
