import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and shows hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Makeja Rentals/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("hero search navigates to listings", async ({ page }) => {
    await page.goto("/");
    // Find search input and submit
    const searchInput = page.getByPlaceholder(/search|area|location/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("Machakos");
      await searchInput.press("Enter");
      await expect(page).toHaveURL(/\/listings/);
    }
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /listings|browse/i }).first().click();
    await expect(page).toHaveURL(/\/listings/);
  });

  test("skip-to-content link exists for accessibility", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByText("Skip to main content");
    await expect(skipLink).toBeAttached();
  });

  test("has correct OpenGraph meta tags", async ({ page }) => {
    await page.goto("/");
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    expect(ogTitle).toContain("Makeja");
  });
});
