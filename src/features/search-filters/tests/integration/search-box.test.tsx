import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { SearchBox } from "@/features/search-filters/components/search-box";

describe("SearchBox", () => {
  it("is a labelled search landmark with a search field", () => {
    render(<SearchBox />, { wrapper: withNuqsTestingAdapter() });

    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Buscar novedades" })).toBeInTheDocument();
  });

  it("restores the query from the url", () => {
    render(<SearchBox />, { wrapper: withNuqsTestingAdapter({ searchParams: "?q=rust" }) });

    expect(screen.getByRole("searchbox")).toHaveValue("rust");
  });

  it("shows what is typed right away and writes it to the url", async () => {
    const onUrlUpdate = vi.fn();
    render(<SearchBox />, { wrapper: withNuqsTestingAdapter({ onUrlUpdate }) });

    await userEvent.type(screen.getByRole("searchbox"), "next");

    expect(screen.getByRole("searchbox")).toHaveValue("next");
    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled(), { timeout: 2000 });
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get("q")).toBe("next");
  });

  it("removes the parameter when the field is emptied", async () => {
    const onUrlUpdate = vi.fn();
    render(<SearchBox />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?q=rust", onUrlUpdate }),
    });

    await userEvent.clear(screen.getByRole("searchbox"));

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled(), { timeout: 2000 });
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.has("q")).toBe(false);
  });

  it("focuses the field with Ctrl K", async () => {
    render(<SearchBox />, { wrapper: withNuqsTestingAdapter() });

    await userEvent.keyboard("{Control>}k{/Control}");

    expect(screen.getByRole("searchbox")).toHaveFocus();
  });
});
