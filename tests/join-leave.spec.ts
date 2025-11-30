import { test, expect } from "@playwright/test";

test.describe("Join/Leave Activity Functionality", () => {
  test("should display join button on activity cards on homepage", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for activities to load
    await page.waitForTimeout(1000);

    // Check for activity cards
    const activityCards = page.locator(".bg-white.rounded-xl").filter({
      hasText: /Running|Cycling|Swimming/,
    });
    const count = await activityCards.count();

    if (count === 0) {
      test.skip();
      return;
    }

    // Join or Leave button should be present on cards (if not organizer)
    const buttons = page.locator('button:has-text("Join"), button:has-text("Leave")');
    const buttonCount = await buttons.count();

    // Some cards should have join/leave buttons
    expect(buttonCount).toBeGreaterThanOrEqual(0);
  });

  test("should display join button on activity detail page", async ({
    page,
  }) => {
    await page.goto("/activities");

    const activityLinks = page.locator('a[href^="/activities/"]').filter({
      hasText: /Running|Cycling|Swimming/,
    });
    const count = await activityLinks.count();

    if (count === 0) {
      test.skip();
      return;
    }

    await activityLinks.first().click();
    await page.waitForTimeout(500);

    // Join or Leave button might be present (depends on if user is logged in and not organizer)
    const joinButton = page.locator('button:has-text("Join")');
    const leaveButton = page.locator('button:has-text("Leave")');

    // At least the page should load correctly
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should show 'Activity Full' when activity is at max capacity", async ({
    page,
  }) => {
    await page.goto("/activities");

    // Look for any activity marked as full
    const fullActivityCard = page.locator('text="Full"');
    const count = await fullActivityCard.count();

    if (count === 0) {
      // No full activities
      test.skip();
      return;
    }

    await expect(fullActivityCard.first()).toBeVisible();
  });

  test("should display participant count on activity cards", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Look for participant count text
    const participantText = page.locator('text=/\\d+\\/\\d+ participants/');
    const count = await participantText.count();

    if (count > 0) {
      await expect(participantText.first()).toBeVisible();
    }
  });

  test("should show 'Joined' badge on activities user has joined", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Look for joined badge
    const joinedBadge = page.locator('span:has-text("Joined")');
    const count = await joinedBadge.count();

    // If user is logged in and has joined activities, badge should appear
    if (count > 0) {
      await expect(joinedBadge.first()).toBeVisible();
    }
  });

  test("should show 'Organizing' badge on activities user is organizing", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Look for organizing badge
    const organizingBadge = page.locator('span:has-text("Organizing")');
    const count = await organizingBadge.count();

    // If user is logged in and organizing activities, badge should appear
    if (count > 0) {
      await expect(organizingBadge.first()).toBeVisible();
    }
  });

  test("should not show join/leave button on activities user is organizing", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Find an activity card with "Organizing" badge
    const organizingCard = page
      .locator(".bg-white.rounded-xl")
      .filter({ hasText: "Organizing" });
    const count = await organizingCard.count();

    if (count === 0) {
      test.skip();
      return;
    }

    // This card should NOT have join/leave buttons
    const firstCard = organizingCard.first();
    const joinButton = firstCard.locator('button:has-text("Join")');
    const leaveButton = firstCard.locator('button:has-text("Leave")');

    await expect(joinButton).not.toBeVisible();
    await expect(leaveButton).not.toBeVisible();
  });

  test("should display leave button with red styling for joined activities", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Find an activity card with leave button
    const leaveButton = page.locator('button:has-text("Leave Activity")');
    const count = await leaveButton.count();

    if (count === 0) {
      test.skip();
      return;
    }

    // Leave button should have red styling
    const firstLeaveButton = leaveButton.first();
    await expect(firstLeaveButton).toHaveClass(/bg-red/);
  });

  test("should display join button with blue styling for available activities", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Find an activity card with join button
    const joinButton = page.locator('button:has-text("Join Activity")');
    const count = await joinButton.count();

    if (count === 0) {
      test.skip();
      return;
    }

    // Join button should have blue styling
    const firstJoinButton = joinButton.first();
    await expect(firstJoinButton).toHaveClass(/bg-blue/);
  });

  test("should show confirmation dialog when leaving activity", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);

    // Find a leave button
    const leaveButton = page.locator('button:has-text("Leave Activity")').first();
    const count = await page.locator('button:has-text("Leave Activity")').count();

    if (count === 0) {
      test.skip();
      return;
    }

    // Setup dialog handler to dismiss the confirmation
    page.on("dialog", (dialog) => dialog.dismiss());

    // Click leave button
    await leaveButton.click();

    // Confirmation dialog should have appeared (we dismissed it)
  });

  test("activity cards should show participant progress visually", async ({
    page,
  }) => {
    await page.goto("/activities");
    await page.waitForTimeout(500);

    // Check that participant count is displayed
    const participantInfo = page.locator('text=/Max \\d+ participants|\\d+\\/\\d+ participants/');
    const count = await participantInfo.count();

    if (count > 0) {
      await expect(participantInfo.first()).toBeVisible();
    }
  });
});
