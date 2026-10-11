import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RetryButton } from "@/shared/ui/retry-button";

const getButton = () => screen.getByRole("button", { name: "Reintentar" });

describe("RetryButton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is a plain button named Reintentar", () => {
    render(<RetryButton action={vi.fn<() => Promise<void>>()} />);

    expect(getButton()).toHaveAttribute("type", "button");
    expect(getButton()).toBeEnabled();
  });

  it("calls the action once and shows the pending state while it runs", async () => {
    let finish = () => {};
    const action = vi.fn<() => Promise<void>>(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(<RetryButton action={action} />);

    fireEvent.click(getButton());

    const pending = screen.getByRole("button", { name: "Reintentando…" });
    expect(pending).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Reintentando…");
    fireEvent.click(pending);
    expect(action).toHaveBeenCalledTimes(1);

    await act(async () => {
      finish();
    });
  });

  it("stays disabled for 10 seconds after the retry finishes", async () => {
    const action = vi.fn<() => Promise<void>>(() => Promise.resolve());
    render(<RetryButton action={action} />);

    await act(async () => {
      fireEvent.click(getButton());
    });

    expect(getButton()).toBeDisabled();
    fireEvent.click(getButton());
    expect(action).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(9_999);
    });
    expect(getButton()).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(getButton()).toBeEnabled();
  });

  it("keeps the banner usable and still cools down when the retry fails", async () => {
    const action = vi.fn<() => Promise<void>>(() => Promise.reject(new Error("offline")));
    render(<RetryButton action={action} />);

    await act(async () => {
      fireEvent.click(getButton());
    });

    expect(getButton()).toBeDisabled();
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(getButton()).toBeEnabled();
  });
});
