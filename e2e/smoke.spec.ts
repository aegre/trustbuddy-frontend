import { test, expect } from "@playwright/test";

/**
 * Lightweight smoke — skipped so default `npx playwright test` without a stack
 * still exits cleanly. Prefer `e2e/quote-submit-happy-path.spec.ts` for the
 * full login → submit flow (requires local FE + API).
 */
test.describe("smoke (stub)", () => {
  test.skip("app loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/trustbuddy|vite/i);
  });
});
