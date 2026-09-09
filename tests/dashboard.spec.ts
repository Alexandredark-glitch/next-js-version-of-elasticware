import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("authenticated user can access the dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/dashboard/);

    await expect(
      page.locator("body"),
    ).not.toContainText("Something went wrong");
  });

  test("agent can resolve a ticket", async ({ page, request }) => {
   const sessionId = crypto.randomUUID();
const content = `Playwright test ticket ${Date.now()}`;

    const response = await request.post("/api/tickets", {
      form: {
        org_key:
          process.env.PLAYWRIGHT_ORG_KEY || "demo",
        session_id: sessionId,
        content,
      },
    });

    const responseBody = await response.json();

console.log("Ticket API status:", response.status());
console.log("Ticket API response:", responseBody);

expect(response.ok()).toBeTruthy();

const ticketData = responseBody;

    expect(ticketData.ticket_id).toBeTruthy();

    const ticketId = ticketData.ticket_id as string;

    await page.goto("/dashboard");

    const ticket = page
      .locator('[role="button"].ticket-stub')
      .filter({ hasText: content })
      .first();

    await expect(ticket).toBeVisible();

    await ticket.click();

    const resolveButton = page.getByRole("button", {
      name: "Resolve",
    });

    await expect(resolveButton).toBeVisible();

    await resolveButton.click();

    await expect(
      page.getByRole("button", {
        name: "Resolving…",
      }),
    ).toBeVisible({ timeout: 1000 }).catch(() => {});

    await expect(
      page.getByRole("button", {
        name: "Resolve",
      }),
    ).toBeHidden();

    await page.getByRole("tab", {
      name: "Resolved",
    }).click();

    const resolvedTicket = page
      .locator('[role="button"].ticket-stub')
      .filter({ hasText: content })
      .first();

    await expect(resolvedTicket).toBeVisible();

    await expect(resolvedTicket).toContainText(
      ticketId.slice(0, 8),
    );
  });
});


test("agent can send a reply to a ticket", async ({ page, request }) => {
  const sessionId = crypto.randomUUID();
  const content = `Playwright agent test ${Date.now()}`;

  const createResponse = await request.post("/api/tickets", {
    form: {
      org_key: process.env.PLAYWRIGHT_ORG_KEY || "demo",
      session_id: sessionId,
      content,
    },
  });

  expect(createResponse.ok()).toBeTruthy();

  const { ticket_id: ticketId } =
    await createResponse.json();

  expect(ticketId).toBeTruthy();

  await page.goto("/dashboard");

  const ticket = page
    .locator('[role="button"].ticket-stub')
    .filter({ hasText: content })
    .first();

  await expect(ticket).toBeVisible();
  await ticket.click();

  const composer = page.getByPlaceholder(
    "Type your reply…",
  );

  await expect(composer).toBeVisible();

  const reply = `Agent reply ${Date.now()}`;

  await composer.fill(reply);

  await page.getByRole("button", {
    name: "Send",
  }).click();

  await expect(
    page.getByText(reply, { exact: true }),
  ).toBeVisible();

  await expect(
    composer,
  ).toHaveValue("");
});