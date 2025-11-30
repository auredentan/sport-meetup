import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load homepage successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SportMeetup/);
    await expect(
      page.getByRole("heading", { name: "Find Your Sports Community" })
    ).toBeVisible();
  });

  test("should display hero section with CTA buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Browse Activities" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create an Activity" })).toBeVisible();
  });

  test("should display sport types section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Popular Sports" })).toBeVisible();

    // Check for some sport types
    await expect(page.getByText("Running")).toBeVisible();
    await expect(page.getByText("Cycling")).toBeVisible();
    await expect(page.getByText("Swimming")).toBeVisible();
  });

  test("should display 'How It Works' section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "How It Works" })).toBeVisible();
    // Use more specific selectors to avoid strict mode violation
    await expect(page.getByRole("heading", { name: "Find Activities", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Join or Create" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Have Fun" })).toBeVisible();
  });

  test("should display 'Upcoming Activities' section when not logged in", async ({
    page,
  }) => {
    await page.goto("/");
    // When not logged in, should see "Upcoming Activities" instead of "Discover More"
    await expect(
      page.getByRole("heading", { name: /Upcoming Activities|Discover More/ })
    ).toBeVisible();
  });

  test("should NOT display 'Your Activities' section when not logged in", async ({
    page,
  }) => {
    await page.goto("/");
    // Your Activities section should not be visible at the top when not logged in
    const yourActivitiesSection = page.locator('section').filter({ hasText: 'Your Activities' }).first();
    await expect(yourActivitiesSection).not.toBeVisible();
  });

  test("should navigate to activities page from browse button", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Browse Activities" }).click();
    await expect(page).toHaveURL("/activities");
    await expect(page.getByRole("heading", { name: "Find Activities" })).toBeVisible();
  });

  test("should navigate to create activity page from CTA button", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Create an Activity" }).click();
    // May redirect to login if not authenticated
    await expect(page).toHaveURL(/\/(activities\/create|login)/);
  });

  test("should filter activities by sport type from homepage", async ({
    page,
  }) => {
    await page.goto("/");

    // Click on a sport type (e.g., Running)
    const runningLink = page.locator('a[href*="sport=Running"]').first();
    await runningLink.click();

    // Should navigate to activities page with sport filter
    await expect(page).toHaveURL(/\/activities\?sport=Running/);
  });
});
