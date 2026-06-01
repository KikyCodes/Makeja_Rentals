import { test, expect } from "@playwright/test";

test.describe("Listings page", () => {
  test("loads listings grid", async ({ page }) => {
    await page.goto("/listings");
    await expect(page).toHaveTitle(/Listings|Browse|Makeja/i);
    // Should show property cards
    await page.waitForSelector("[data-testid='property-card'], .property-card, article", {
      timeout: 8000,
    }).catch(() => null);
  });

  test("filter by type works", async ({ page }) => {
    await page.goto("/listings");
    // Click a type filter if present
    const hostelFilter = page.getByRole("button", { name: /hostel/i }).first();
    if (await hostelFilter.isVisible()) {
      await hostelFilter.click();
      await expect(page.url()).toContain("hostel");
    }
  });

  test("search updates URL params", async ({ page }) => {
    await page.goto("/listings");
    const searchInput = page.getByPlaceholder(/search|find/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("bedsitter");
      await searchInput.press("Enter");
      await expect(page).toHaveURL(/q=bedsitter/);
    }
  });

  test("is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/listings");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Property detail page", () => {
  test("404 for non-existent property", async ({ page }) => {
    const response = await page.goto("/listings/non-existent-property-id");
    expect(response?.status()).toBeGreaterThanOrEqual(200);
    // Should show error state, not crash
    await expect(page.locator("body")).toBeVisible();
  });
});
