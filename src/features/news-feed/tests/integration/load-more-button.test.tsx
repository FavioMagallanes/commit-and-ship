import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { LoadMoreButton } from "@/features/news-feed/components/load-more-button";

describe("LoadMoreButton", () => {
  it("raises the limit in the url to the next page", async () => {
    const onUrlUpdate = vi.fn();
    render(<LoadMoreButton nextLimit={20} />, {
      wrapper: withNuqsTestingAdapter({ onUrlUpdate }),
    });

    await userEvent.click(screen.getByRole("button", { name: "Cargar más novedades" }));

    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get("limit")).toBe("20");
  });
});
