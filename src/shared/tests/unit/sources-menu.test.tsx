import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ACTIVE_SOURCES } from "@/shared/lib/active-sources";
import { SourcesMenu } from "@/shared/ui/sources-menu";

const renderMenu = () => {
  render(
    <div>
      <p>Afuera</p>
      <SourcesMenu />
    </div>,
  );
  return userEvent.setup();
};

const getTrigger = () => screen.getByRole("button", { name: "Menú de fuentes" });

describe("SourcesMenu", () => {
  it("renders a closed trigger without the sources navigation", () => {
    renderMenu();

    expect(getTrigger()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("opens a navigation with a link to each active source", async () => {
    const user = renderMenu();

    await user.click(getTrigger());

    expect(getTrigger()).toHaveAttribute("aria-expanded", "true");
    const navigation = screen.getByRole("navigation", { name: "Fuentes" });
    expect(getTrigger()).toHaveAttribute("aria-controls", navigation.id);
    for (const source of ACTIVE_SOURCES) {
      const link = screen.getByRole("link", { name: source.name });
      expect(navigation).toContainElement(link);
      expect(link).toHaveAttribute("href", source.url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
      expect(link.getAttribute("rel")).toContain("noreferrer");
    }
    expect(screen.getAllByRole("link")).toHaveLength(ACTIVE_SOURCES.length);
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = renderMenu();
    await user.click(getTrigger());
    await user.tab();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(getTrigger()).toHaveFocus();
    expect(getTrigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when clicking outside", async () => {
    const user = renderMenu();
    await user.click(getTrigger());

    await user.click(screen.getByText("Afuera"));

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("closes when a source is chosen", async () => {
    const user = renderMenu();
    await user.click(getTrigger());
    // jsdom cannot open new tabs; the menu only needs to see the click.
    const link = screen.getByRole("link", { name: "GitHub" });
    link.addEventListener("click", (event) => event.preventDefault());

    await user.click(link);

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("toggles closed on a second click of the trigger", async () => {
    const user = renderMenu();

    await user.click(getTrigger());
    await user.click(getTrigger());

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(getTrigger()).toHaveAttribute("aria-expanded", "false");
  });
});
