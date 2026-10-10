import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/shared/ui/button";

describe("Button", () => {
  it("renders an accessible button that does not submit forms by default", () => {
    render(<Button>Cargar más novedades</Button>);

    expect(screen.getByRole("button", { name: "Cargar más novedades" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("uses the primary variant by default", () => {
    render(<Button>Guardar</Button>);

    expect(screen.getByRole("button")).toHaveClass("bg-accent", "text-on-accent");
  });

  it.each([
    ["secondary", "border-line"],
    ["danger", "bg-danger-bg"],
  ] as const)("applies the %s variant", (variant, expectedClass) => {
    render(<Button variant={variant}>Acción</Button>);

    expect(screen.getByRole("button")).toHaveClass(expectedClass);
  });

  it("calls onClick when pressed and not when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Ir</Button>);

    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button onClick={onClick} disabled>
        Ir
      </Button>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("lets the caller extend the classes without losing the variant", () => {
    render(<Button className="w-full">Ancho</Button>);

    expect(screen.getByRole("button")).toHaveClass("w-full", "bg-accent");
  });
});
