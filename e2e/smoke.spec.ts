import { expect, test } from "@playwright/test";

test("home page responds and renders the product heading", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle("Commit & Ship");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1, name: "Commit & Ship" })).toBeVisible();
});

test.describe("design tokens", () => {
  test("light scheme uses the light canvas color", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");

    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(250, 250, 249)");
  });

  test("dark scheme uses the dark canvas color", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(12, 10, 9)");
  });

  test("headings use Geist and body text uses Inter", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toHaveCSS("font-family", /Geist/);
    await expect(page.locator("body")).toHaveCSS("font-family", /Inter/);
  });
});
