import { test, expect } from "@playwright/test";

test.use({
  storageState: {
    cookies: [],
    origins: [],
  },
});

test.describe("Authentication", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/login");

    await expect(page).toHaveURL(/\/login/);

    await expect(
      page.locator("form"),
    ).toBeVisible();
  });

  test("signup page loads", async ({ page }) => {
    await page.goto("/signup");

    await expect(page).toHaveURL(/\/signup/);

    await expect(
      page.locator("form"),
    ).toBeVisible();
  });

  test("unauthenticated user is redirected from dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login/);
  });
});