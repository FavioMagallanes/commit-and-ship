import { expect, test } from "@playwright/test";

// The "Ver todo" link and the page shell render even when GitHub fails, so this never
// depends on what the live source returns.
test("Ver todo opens the releases page, which links back home", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("region", { name: "Radar de versiones" })
    .getByRole("link", { name: "Ver todo" })
    .click();

  await expect(page).toHaveURL(/\/releases$/);
  await expect(page).toHaveTitle("Versiones · Commit & Ship");
  await expect(page.getByRole("heading", { level: 1, name: "Versiones" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute("href", "/");
});
