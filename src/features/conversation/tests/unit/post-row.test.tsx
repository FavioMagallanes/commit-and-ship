import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PostRow } from "@/features/conversation/components/post-row";

const baseProps = {
  handle: "@usuario",
  network: "Mastodon",
  text: "Migré un proyecto a monolito modular y la complejidad bajó muchísimo.",
  href: "https://mastodon.social/@usuario/1",
};

const renderRow = () =>
  render(
    <ul>
      <PostRow {...baseProps} />
    </ul>,
  );

describe("PostRow", () => {
  it("shows the handle and the network", () => {
    renderRow();

    expect(screen.getByRole("listitem")).toBeInTheDocument();
    expect(screen.getByText("@usuario")).toBeInTheDocument();
    expect(screen.getByText("· Mastodon")).toBeInTheDocument();
  });

  it("links the post text to its original", () => {
    renderRow();

    expect(screen.getByRole("link", { name: baseProps.text })).toHaveAttribute(
      "href",
      baseProps.href,
    );
  });

  it("uses the first letter of the handle as a decorative avatar", () => {
    renderRow();

    expect(screen.getByText("U")).toHaveAttribute("aria-hidden", "true");
  });
});
