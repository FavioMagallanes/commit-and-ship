import { expect, test } from "@playwright/test";

// These checks never depend on what the live sources return: they only look at the control and url.
test.describe("feed controls", () => {
  test("opening a shared link restores the order", async ({ page }) => {
    await page.goto("/?sort=popular&limit=20");

    await expect(page.getByRole("button", { name: /Ordenar.*Populares/ })).toBeVisible();
  });

  test("choosing an order puts it in the url and survives a reload", async ({ page }) => {
    await page.goto("/");
    const sortButton = page.getByRole("button", { name: /^Ordenar/ });
    const listbox = page.getByRole("listbox", { name: "Ordenar" });

    // The control only reacts after hydration. Each attempt opens the listbox only when it is
    // closed, so a retry never toggles shut what the previous attempt opened.
    await expect(async () => {
      if (!(await listbox.isVisible())) await sortButton.click();
      await expect(listbox).toBeVisible({ timeout: 1000 });
    }).toPass();

    await listbox.getByRole("option", { name: "Populares" }).click();
    await expect(page).toHaveURL(/[?&]sort=popular/);

    await page.reload();

    await expect(page.getByRole("button", { name: /Ordenar.*Populares/ })).toBeVisible();
  });
});
