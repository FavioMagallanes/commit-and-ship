import { expect, type Locator, type Page, test } from "@playwright/test";

// These checks only look at where the blocks sit, never at what the live sources return.
const radarOf = (page: Page) => page.getByRole("region", { name: "Radar de versiones" });

const latestHeadingOf = (page: Page) =>
  page.getByRole("heading", { level: 2, name: "Más recientes" });

const boxOf = async (locator: Locator) => {
  const box = await locator.boundingBox();
  if (box === null) throw new Error("Expected the element to be rendered");
  return box;
};

const hasHorizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

test.describe("home layout", () => {
  test.describe("below md", () => {
    test.use({ viewport: { width: 390, height: 800 } });

    test("stacks search, radar and latest stories in one column", async ({ page }) => {
      await page.goto("/");
      const radar = radarOf(page);
      const latestHeading = latestHeadingOf(page);

      await expect(
        page.getByRole("main").getByRole("searchbox", { name: "Buscar novedades" }),
      ).toBeVisible();
      await expect(radar).toBeVisible();
      await expect(latestHeading).toBeVisible();
      expect((await boxOf(radar)).y).toBeLessThan((await boxOf(latestHeading)).y);

      await expect(page.getByText("Lo más hablado hoy")).toBeHidden();
      await expect(page.getByText("En conversación")).toBeHidden();
      await expect(page.getByRole("list", { name: "Estadísticas" })).toBeHidden();
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });
  });

  test.describe("from lg up", () => {
    test.use({ viewport: { width: 1440, height: 800 } });

    test("keeps the sidebar to the right of the latest stories", async ({ page }) => {
      await page.goto("/");
      const radar = radarOf(page);
      const latestHeading = latestHeadingOf(page);

      await expect(radar).toBeVisible();
      await expect(latestHeading).toBeVisible();
      expect((await boxOf(radar)).x).toBeGreaterThan((await boxOf(latestHeading)).x);

      await expect(page.getByRole("region", { name: "Lo más hablado hoy" })).toBeVisible();
      await expect(page.getByRole("region", { name: "En conversación" })).toBeVisible();
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });
  });
});
