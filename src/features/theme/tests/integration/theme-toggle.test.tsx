import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeToggle } from "@/features/theme/components/theme-toggle";

const mockSystemTheme = (prefersDark: boolean) => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: prefersDark && query.includes("dark"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
};

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the system theme when none was chosen", () => {
    mockSystemTheme(true);

    render(<ThemeToggle />);

    expect(screen.getByRole("button", { name: /Oscuro/ })).toHaveTextContent("Oscuro");
  });

  it("forces the other theme on click and remembers it", async () => {
    mockSystemTheme(false);
    render(<ThemeToggle />);

    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /Claro/ }));
    });

    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement).not.toHaveClass("light");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(screen.getByRole("button", { name: /Oscuro/ })).toBeInTheDocument();
  });

  it("respects a theme already forced on the page", () => {
    mockSystemTheme(false);
    document.documentElement.classList.add("dark");

    render(<ThemeToggle />);

    expect(screen.getByRole("button")).toHaveTextContent("Oscuro");
  });
});
