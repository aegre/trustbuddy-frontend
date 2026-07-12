import { test, expect } from "@playwright/test";

/**
 * Stub E2E — replace with login/wizard flows in later phases.
 * Skipped so `npx playwright test` does not require a running app yet.
 */
test.describe("smoke (stub)", () => {
  test.skip("app loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/trustbuddy|vite/i);
  });
});
