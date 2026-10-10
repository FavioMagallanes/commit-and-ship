import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Chip } from "@/shared/ui/chip";

describe("Chip", () => {
  it("exposes its pressed state to assistive technology", () => {
    const { rerender } = render(<Chip active={false}>React</Chip>);
    expect(screen.getByRole("button", { name: "React" })).toHaveAttribute("aria-pressed", "false");

    rerender(<Chip active>React</Chip>);
    expect(screen.getByRole("button", { name: "React" })).toHaveAttribute("aria-pressed", "true");
  });

  it("styles the active and inactive variants differently", () => {
    const { rerender } = render(<Chip active={false}>IA</Chip>);
    expect(screen.getByRole("button")).toHaveClass("bg-surface");

    rerender(<Chip active>IA</Chip>);
    expect(screen.getByRole("button")).toHaveClass("bg-accent-soft", "text-accent-text");
  });

  it("calls onClick when pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Chip active={false} onClick={onClick}>
        Web
      </Chip>,
    );

    await user.click(screen.getByRole("button", { name: "Web" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
