import { expect, test } from "@playwright/test";

// These checks only look at the nav controls, never at what the live sources return.
test.describe("mobile nav", () => {
  test.describe("below md", () => {
    test.use({ viewport: { width: 390, height: 800 } });

    test("hides the nav search and opens the sources menu", async ({ page }) => {
      await page.goto("/");
      const banner = page.getByRole("banner");
      const menuButton = banner.getByRole("button", { name: "Menú de fuentes" });
      const sources = page.getByRole("navigation", { name: "Fuentes" });

      await expect(banner.getByRole("searchbox").filter({ visible: true })).toHaveCount(0);

      // The button reacts only after hydration; click again only while it is still closed.
      await expect(async () => {
        if ((await menuButton.getAttribute("aria-expanded")) !== "true") await menuButton.click();
        await expect(sources).toBeVisible({ timeout: 300 });
      }).toPass();

      await expect(sources.getByRole("link", { name: "Hacker News" })).toBeVisible();
      await expect(sources.getByRole("link", { name: "GitHub" })).toBeVisible();

      await page.keyboard.press("Escape");

      await expect(sources).toHaveCount(0);
      await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    });
  });

  test.describe("from md up", () => {
    test.use({ viewport: { width: 1440, height: 800 } });

    test("shows the sources menu as the Fuentes text link", async ({ page }) => {
      await page.goto("/");
      const menuButton = page.getByRole("banner").getByRole("button", { name: "Menú de fuentes" });

      await expect(menuButton).toBeVisible();
      await expect(menuButton).toHaveText("Fuentes");
    });
  });
});
