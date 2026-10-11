import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { SearchBox } from "@/features/search-filters/components/search-box";

// jsdom has no layout, so offsetParent is always null; stub it to model a rendered field.
const markVisible = (element: HTMLElement) => {
  Object.defineProperty(element, "offsetParent", { configurable: true, value: document.body });
};

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
    markVisible(screen.getByRole("searchbox"));

    await userEvent.keyboard("{Control>}k{/Control}");

    expect(screen.getByRole("searchbox")).toHaveFocus();
  });

  it("leaves Ctrl K to the visible field when another one is hidden", async () => {
    // A field hidden with CSS keeps the jsdom default offsetParent (null), as in a browser.
    render(
      <>
        <SearchBox />
        <SearchBox />
      </>,
      { wrapper: withNuqsTestingAdapter() },
    );
    const [visibleField, hiddenField] = screen.getAllByRole("searchbox");
    if (!visibleField || !hiddenField) throw new Error("Expected two search fields");
    markVisible(visibleField);

    await userEvent.keyboard("{Control>}k{/Control}");

    expect(visibleField).toHaveFocus();
    expect(hiddenField).not.toHaveFocus();
  });

  it("lets Ctrl K through untouched while hidden", () => {
    render(<SearchBox />, { wrapper: withNuqsTestingAdapter() });

    const notPrevented = fireEvent.keyDown(window, { key: "k", ctrlKey: true });

    expect(notPrevented).toBe(true);
    expect(screen.getByRole("searchbox")).not.toHaveFocus();
  });
});
