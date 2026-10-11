import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Select } from "@/shared/ui/select";

const options = [
  { value: "recent", label: "Recientes" },
  { value: "popular", label: "Populares" },
  { value: "oldest", label: "Antiguas" },
];

const renderSelect = (value = "recent") => {
  const onChange = vi.fn();
  render(
    <div>
      <p>Afuera</p>
      <Select label="Ordenar" options={options} value={value} onChange={onChange} />
    </div>,
  );
  return { onChange, user: userEvent.setup() };
};

const getTrigger = () => screen.getByRole("button", { name: /Ordenar/ });

const activeOptionName = () => {
  const listbox = screen.getByRole("listbox", { name: "Ordenar" });
  const activeId = listbox.getAttribute("aria-activedescendant");
  return activeId ? document.getElementById(activeId)?.textContent : undefined;
};

describe("Select", () => {
  it("renders a closed button named after its label and value", () => {
    renderSelect();

    const trigger = screen.getByRole("button", { name: "Ordenar: Recientes" });
    expect(trigger).toHaveAttribute("type", "button");
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens a listbox on click that marks the selected option", async () => {
    const { user } = renderSelect("popular");

    await user.click(getTrigger());

    const listbox = screen.getByRole("listbox", { name: "Ordenar" });
    expect(getTrigger()).toHaveAttribute("aria-expanded", "true");
    expect(getTrigger()).toHaveAttribute("aria-controls", listbox.id);
    expect(listbox).toHaveFocus();
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(screen.getByRole("option", { name: "Populares" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("option", { name: "Recientes" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(activeOptionName()).toBe("Populares");
  });

  it("selects a clicked option, closes and returns focus to the button", async () => {
    const { onChange, user } = renderSelect();

    await user.click(getTrigger());
    await user.click(screen.getByRole("option", { name: "Populares" }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith("popular");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(getTrigger()).toHaveFocus();
  });

  it("does not report a change when the selected option is clicked again", async () => {
    const { onChange, user } = renderSelect();

    await user.click(getTrigger());
    await user.click(screen.getByRole("option", { name: "Recientes" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it.each(["{Enter}", " ", "{ArrowDown}", "{ArrowUp}"])("opens with %s", async (key) => {
    const { user } = renderSelect("popular");

    getTrigger().focus();
    await user.keyboard(key);

    expect(screen.getByRole("listbox", { name: "Ordenar" })).toHaveFocus();
    expect(activeOptionName()).toBe("Populares");
  });

  it("moves the active option with the arrows, Home and End without wrapping", async () => {
    const { user } = renderSelect();

    await user.click(getTrigger());
    await user.keyboard("{ArrowUp}");
    expect(activeOptionName()).toBe("Recientes");

    await user.keyboard("{ArrowDown}");
    expect(activeOptionName()).toBe("Populares");

    await user.keyboard("{End}");
    expect(activeOptionName()).toBe("Antiguas");

    await user.keyboard("{ArrowDown}");
    expect(activeOptionName()).toBe("Antiguas");

    await user.keyboard("{Home}");
    expect(activeOptionName()).toBe("Recientes");
  });

  it("selects the active option with Enter and returns focus", async () => {
    const { onChange, user } = renderSelect();

    await user.click(getTrigger());
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenCalledExactlyOnceWith("popular");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(getTrigger()).toHaveFocus();
  });

  it("selects the active option with Space", async () => {
    const { onChange, user } = renderSelect();

    await user.click(getTrigger());
    await user.keyboard("{End} ");

    expect(onChange).toHaveBeenCalledExactlyOnceWith("oldest");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(getTrigger()).toHaveFocus();
  });

  it("closes with Escape without changing the value", async () => {
    const { onChange, user } = renderSelect();

    await user.click(getTrigger());
    await user.keyboard("{ArrowDown}{Escape}");

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(getTrigger()).toHaveAttribute("aria-expanded", "false");
    expect(getTrigger()).toHaveFocus();
  });

  it("closes with Tab without changing the value", async () => {
    const { onChange, user } = renderSelect();

    await user.click(getTrigger());
    await user.tab();

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("jumps to the option that starts with the typed text", async () => {
    const { user } = renderSelect();

    await user.click(getTrigger());
    await user.keyboard("p");

    expect(activeOptionName()).toBe("Populares");
  });

  it("makes a hovered option active", async () => {
    const { user } = renderSelect();

    await user.click(getTrigger());
    await user.hover(screen.getByRole("option", { name: "Antiguas" }));

    expect(activeOptionName()).toBe("Antiguas");
  });

  it("closes when the pointer goes down outside", async () => {
    const { onChange, user } = renderSelect();

    await user.click(getTrigger());
    await user.click(screen.getByText("Afuera"));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(getTrigger()).toHaveAttribute("aria-expanded", "false");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("closes when the button is clicked again", async () => {
    const { user } = renderSelect();

    await user.click(getTrigger());
    await user.click(getTrigger());

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
