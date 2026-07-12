import { expect, test } from "@playwright/test";

/**
 * Full draft → submit happy path against a running stack:
 * - Frontend: `make run` (http://localhost:5173)
 * - API: trustbuddy-api `make run-dev` (http://localhost:8080)
 *
 * Credentials: dev-user / dev-password
 * Not part of `make verify` / CI.
 */
test.describe("quote submit happy path", () => {
  test("login through review submit lands on success", async ({ page }) => {
    const suffix = Date.now();
    const name = `E2E User ${suffix}`;
    const email = `e2e.${suffix}@example.com`;

    await page.goto("/login");
    await page.getByRole("textbox", { name: "Username" }).fill("dev-user");
    await page.getByRole("textbox", { name: "Password" }).fill("dev-password");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(
      page.getByRole("heading", { name: /^quotes$/i }),
    ).toBeVisible();

    await page.getByRole("link", { name: /new quote/i }).click();
    await expect(
      page.getByRole("heading", { name: /personal information/i }),
    ).toBeVisible();

    await page.getByLabel("Full name").fill(name);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Age").fill("40");
    await page.getByLabel("ZIP code").fill("94105");
    await page.getByRole("button", { name: /^continue$/i }).click();

    await expect(
      page.getByRole("heading", { name: /^coverage$/i }),
    ).toBeVisible();
    await page.getByRole("radio", { name: /^standard$/i }).click();
    await page
      .getByRole("button", { name: /takes prescription medication, no/i })
      .click();
    await page.getByRole("button", { name: /uses tobacco, no/i }).click();
    await page
      .getByRole("button", { name: /needs spouse coverage, no/i })
      .click();
    await page.getByRole("button", { name: /^continue$/i }).click();

    await expect(
      page.getByRole("heading", { name: /review & submit/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /^submit quote$/i }).click();

    await expect(
      page.getByRole("heading", { name: /quote submitted/i }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/success\?quoteId=/);
    await expect(
      page.getByText(new RegExp(`thanks, ${name}`, "i")),
    ).toBeVisible();
  });
});
