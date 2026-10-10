import { expect, test } from "@playwright/test";

// These checks never depend on what the live sources return: they only look at the select and url.
test.describe("feed controls", () => {
  test("opening a shared link restores the order", async ({ page }) => {
    await page.goto("/?sort=popular&limit=20");

    const sortSelect = page.getByRole("combobox", { name: "Ordenar" });

    await expect(sortSelect).toHaveValue("popular");
    await expect(sortSelect.locator("option:checked")).toHaveText("Populares");
  });

  test("choosing an order puts it in the url and survives a reload", async ({ page }) => {
    await page.goto("/");
    const sortSelect = page.getByRole("combobox", { name: "Ordenar" });

    // The select only writes to the url after hydration, so retry until the change sticks.
    await expect(async () => {
      await sortSelect.selectOption({ label: "Populares" });
      await expect(page).toHaveURL(/[?&]sort=popular/, { timeout: 1000 });
    }).toPass();

    await page.reload();

    await expect(sortSelect).toHaveValue("popular");
  });
});
