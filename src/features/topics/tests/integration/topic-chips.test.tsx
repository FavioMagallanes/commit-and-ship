import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { TopicChips } from "@/features/topics/components/topic-chips";

describe("TopicChips", () => {
  it("is a labelled section with every topic and Todo pressed by default", () => {
    render(<TopicChips />, { wrapper: withNuqsTestingAdapter() });

    const section = screen.getByRole("region", { name: "Filtrar por tema" });
    const buttons = within(within(section).getByRole("list")).getAllByRole("button");
    expect(buttons.map((button) => button.textContent)).toEqual([
      "Todo",
      "IA",
      "Frontend",
      "Backend",
      "DevOps",
      "Seguridad",
      "Lenguajes",
      "Blogs",
    ]);
    expect(screen.getByRole("button", { name: "Todo" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "IA" })).toHaveAttribute("aria-pressed", "false");
  });

  it("restores the topic from the url", () => {
    render(<TopicChips />, { wrapper: withNuqsTestingAdapter({ searchParams: "?topic=ia" }) });

    expect(screen.getByRole("button", { name: "IA" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Todo" })).toHaveAttribute("aria-pressed", "false");
  });

  it("restores the Blogs filter from the url", () => {
    render(<TopicChips />, { wrapper: withNuqsTestingAdapter({ searchParams: "?topic=blogs" }) });

    expect(screen.getByRole("button", { name: "Blogs" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Todo" })).toHaveAttribute("aria-pressed", "false");
  });

  it("writes the Blogs filter to the url, keeping the search", async () => {
    const onUrlUpdate = vi.fn();
    render(<TopicChips />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?q=react", onUrlUpdate }),
    });

    await userEvent.click(screen.getByRole("button", { name: "Blogs" }));

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get("topic")).toBe("blogs");
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get("q")).toBe("react");
    expect(screen.getByRole("button", { name: "Blogs" })).toHaveAttribute("aria-pressed", "true");
  });

  it("writes the chosen topic to the url", async () => {
    const onUrlUpdate = vi.fn();
    render(<TopicChips />, { wrapper: withNuqsTestingAdapter({ onUrlUpdate }) });

    await userEvent.click(screen.getByRole("button", { name: "Frontend" }));

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get("topic")).toBe("frontend");
    expect(screen.getByRole("button", { name: "Frontend" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("removes the topic when the pressed chip is clicked again", async () => {
    const onUrlUpdate = vi.fn();
    render(<TopicChips />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?topic=frontend", onUrlUpdate }),
    });

    await userEvent.click(screen.getByRole("button", { name: "Frontend" }));

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.has("topic")).toBe(false);
  });

  it("removes the topic when Todo is clicked", async () => {
    const onUrlUpdate = vi.fn();
    render(<TopicChips />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?topic=devops&q=rust", onUrlUpdate }),
    });

    await userEvent.click(screen.getByRole("button", { name: "Todo" }));

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.has("topic")).toBe(false);
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get("q")).toBe("rust");
  });
});
