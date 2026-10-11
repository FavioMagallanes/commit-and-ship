import { expect, test } from "@playwright/test";

// These checks never depend on what the live sources return: they only look at the chips and url.
test.describe("topics", () => {
  test("opening a shared link restores the topic", async ({ page }) => {
    await page.goto("/?topic=ia");

    await expect(page.getByRole("button", { name: "IA", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByRole("button", { name: "Todo", exact: true })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("choosing a topic puts it in the url and survives a reload", async ({ page }) => {
    await page.goto("/");
    const backend = page.getByRole("button", { name: "Backend", exact: true });

    // The chips only write to the url after hydration, so retry until the change sticks. Clicking
    // a pressed chip clears it, so only click while Backend is not pressed yet.
    await expect(async () => {
      if ((await backend.getAttribute("aria-pressed")) !== "true") await backend.click();
      await expect(page).toHaveURL(/[?&]topic=backend/, { timeout: 1000 });
    }).toPass();

    await page.reload();

    await expect(backend).toHaveAttribute("aria-pressed", "true");
  });

  test("choosing Todo removes the topic from the url", async ({ page }) => {
    await page.goto("/?topic=backend");
    const all = page.getByRole("button", { name: "Todo", exact: true });

    await expect(async () => {
      await all.click();
      await expect(page).not.toHaveURL(/[?&]topic=/, { timeout: 1000 });
    }).toPass();

    await expect(all).toHaveAttribute("aria-pressed", "true");
  });
});
