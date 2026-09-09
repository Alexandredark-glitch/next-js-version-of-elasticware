import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  const email = process.env.PLAYWRIGHT_DEMO_EMAIL;
  const password = process.env.PLAYWRIGHT_DEMO_PASSWORD;

  if(!email) {
      throw new Error(
      "Missing PLAYWRIGHT_DEMO_EMAIL",
    );
  }

  if ( !password) {
    throw new Error(
      "Missing PLAYWRIGHT_DEMO_PASSWORD",
    );
  }

  await page.goto("/login");

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);

  await page.getByRole("button", { name: /log in|login|sign in/i }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  await page.context().storageState({
    path: authFile,
  });
});