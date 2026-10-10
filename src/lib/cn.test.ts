import { describe, expect, it } from "vitest";

import { cn } from "@/lib/cn";

describe("cn", () => {
  it("joins class names and skips falsy values", () => {
    const hidden = false;

    expect(cn("flex", hidden && "hidden", undefined, null, ["gap-2"], { "p-4": true })).toBe(
      "flex gap-2 p-4",
    );
  });

  it("lets the last conflicting utility win", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("bg-surface", "bg-soft")).toBe("bg-soft");
  });

  it("treats the custom type scale as font sizes and keeps text colors", () => {
    // `text-md` is our own size token: it must not be mistaken for a color.
    expect(cn("text-md", "text-ink")).toBe("text-md text-ink");
    expect(cn("text-sm", "text-md")).toBe("text-md");
  });

  it("keeps custom color tokens working with Tailwind utilities", () => {
    expect(cn("text-muted", "text-ink")).toBe("text-ink");
    expect(cn("border-line", "border-accent")).toBe("border-accent");
  });
});
