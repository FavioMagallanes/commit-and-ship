import { describe, expect, it } from "vitest";

import { nextTheme } from "@/features/theme/model/theme";

describe("nextTheme", () => {
  it("flips between light and dark", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("light");
  });
});
