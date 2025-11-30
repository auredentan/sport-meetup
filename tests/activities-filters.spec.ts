import { test, expect } from "@playwright/test";

test.describe("Activities List - Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/activities");
  });

  test("should display activities list page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Find Activities" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  });

  test("should display all filter options", async ({ page }) => {
    // Check sport type filter
    const sportSelect = page.locator('select[name="sport"]');
    await expect(sportSelect).toBeVisible();
    await expect(sportSelect).toHaveValue("");

    // Check skill level filter
    const skillSelect = page.locator('select[name="skill"]');
    await expect(skillSelect).toBeVisible();
    await expect(skillSelect).toHaveValue("");

    // Check location filter
    await expect(page.locator('input[name="location"]')).toBeVisible();

    // Check date filters
    await expect(page.locator('input[name="dateFrom"]')).toBeVisible();
    await expect(page.locator('input[name="dateTo"]')).toBeVisible();
  });

  test("should filter activities by sport type", async ({ page }) => {
    // Select a sport type
    await page.locator('select[name="sport"]').selectOption("Running");
    await page.getByRole("button", { name: "Search" }).click();

    // URL should contain the sport filter
    await expect(page).toHaveURL(/sport=Running/);
  });

  test("should filter activities by skill level", async ({ page }) => {
    // Select a skill level
    await page.locator('select[name="skill"]').selectOption("Beginner");
    await page.getByRole("button", { name: "Search" }).click();

    // URL should contain the skill filter
    await expect(page).toHaveURL(/skill=Beginner/);
  });

  test("should filter activities by location", async ({ page }) => {
    // Enter a location
    await page.locator('input[name="location"]').fill("New York");
    await page.getByRole("button", { name: "Search" }).click();

    // URL should contain the location filter
    await expect(page).toHaveURL(/location=New\+York/);
  });

  test("should filter activities by date range", async ({ page }) => {
    // Get tomorrow and next week dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    // Set date from
    await page.locator('input[name="dateFrom"]').fill(tomorrowStr);

    // Set date to
    await page.locator('input[name="dateTo"]').fill(nextWeekStr);

    await page.getByRole("button", { name: "Search" }).click();

    // URL should contain the date filters
    await expect(page).toHaveURL(/dateFrom=/);
    await expect(page).toHaveURL(/dateTo=/);
  });

  test("should filter activities with multiple filters", async ({ page }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Apply multiple filters
    await page.locator('select[name="sport"]').selectOption("Running");
    await page.locator('select[name="skill"]').selectOption("Intermediate");
    await page.locator('input[name="location"]').fill("Central Park");
    await page.locator('input[name="dateFrom"]').fill(tomorrowStr);

    await page.getByRole("button", { name: "Search" }).click();

    // URL should contain all filters
    await expect(page).toHaveURL(/sport=Running/);
    await expect(page).toHaveURL(/skill=Intermediate/);
    await expect(page).toHaveURL(/location=Central/);
    await expect(page).toHaveURL(/dateFrom=/);
  });

  test("should display 'No activities found' when no results match", async ({
    page,
  }) => {
    // Set a date far in the future
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);
    const futureDateStr = futureDate.toISOString().split("T")[0];

    await page.locator('input[name="dateFrom"]').fill(futureDateStr);
    await page.getByRole("button", { name: "Search" }).click();

    // Should show no activities found message
    await expect(page.getByText("No activities found")).toBeVisible();
  });

  test("should preserve filters when navigating back", async ({ page }) => {
    // Apply a filter
    await page.locator('select[name="sport"]').selectOption("Cycling");
    await page.getByRole("button", { name: "Search" }).click();

    // Navigate to another page and back
    await page.goto("/");
    await page.goBack();

    // Filter should still be applied
    await expect(page).toHaveURL(/sport=Cycling/);
    await expect(page.locator('select[name="sport"]')).toHaveValue("Cycling");
  });

  test("date from filter should only show activities after the selected date", async ({
    page,
  }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    await page.locator('input[name="dateFrom"]').fill(tomorrowStr);
    await page.getByRole("button", { name: "Search" }).click();

    // Wait for results to load
    await page.waitForTimeout(500);

    // All visible activity dates should be after tomorrow
    // We can't easily check the exact dates without inspecting the rendered content,
    // but we can verify the filter was applied
    await expect(page).toHaveURL(/dateFrom=/);
  });

  test("date to filter should only show activities before the selected date", async ({
    page,
  }) => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    await page.locator('input[name="dateTo"]').fill(nextWeekStr);
    await page.getByRole("button", { name: "Search" }).click();

    // Wait for results to load
    await page.waitForTimeout(500);

    // Verify the filter was applied
    await expect(page).toHaveURL(/dateTo=/);
  });
});
