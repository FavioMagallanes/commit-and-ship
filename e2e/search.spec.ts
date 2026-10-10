import { expect, test } from "@playwright/test";

// These checks never depend on what the live sources return: they only look at the field and url.
test.describe("search", () => {
  test("typing a search puts it in the url and survives a reload", async ({ page }) => {
    await page.goto("/");

    const searchBox = page.getByRole("searchbox", { name: "Buscar novedades" });
    await searchBox.fill("zzqxv");

    await expect(page).toHaveURL(/[?&]q=zzqxv/);

    await page.reload();

    await expect(searchBox).toHaveValue("zzqxv");
  });

  test("opening a shared link restores the search", async ({ page }) => {
    await page.goto("/?q=rust");

    await expect(page.getByRole("searchbox", { name: "Buscar novedades" })).toHaveValue("rust");
  });

  test("Ctrl K focuses the search field", async ({ page }) => {
    await page.goto("/");
    const searchBox = page.getByRole("searchbox", { name: "Buscar novedades" });

    // The shortcut exists only after hydration, so retry until the listener is attached.
    await expect(async () => {
      await page.keyboard.press("Control+k");
      await expect(searchBox).toBeFocused({ timeout: 300 });
    }).toPass();
  });

  test("clearing the field removes the parameter from the url", async ({ page }) => {
    await page.goto("/?q=rust");

    await page.getByRole("searchbox", { name: "Buscar novedades" }).clear();

    await expect(page).not.toHaveURL(/[?&]q=/);
  });
});
