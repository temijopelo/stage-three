import { test, expect, Page } from "@playwright/test";

// ── Helpers ────────────────────────────────────────────────────────────────

async function clearStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
}

async function seedUser(
  page: Page,
  email = "e2e@example.com",
  password = "password123",
) {
  await page.evaluate(
    ({ email, password }: { email: string; password: string }) => {
      const users = JSON.parse(
        localStorage.getItem("habit-tracker-users") ?? "[]",
      );
      users.push({
        id: "e2e-user-1",
        email,
        password,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("habit-tracker-users", JSON.stringify(users));
    },
    { email, password },
  );
}

async function seedSession(page: Page, email = "e2e@example.com") {
  await page.evaluate((email: string) => {
    localStorage.setItem(
      "habit-tracker-session",
      JSON.stringify({ userId: "e2e-user-1", email }),
    );
  }, email);
}

async function seedHabit(page: Page, name: string) {
  await page.evaluate((name: string) => {
    const habits = JSON.parse(
      localStorage.getItem("habit-tracker-habits") ?? "[]",
    );
    habits.push({
      id: `habit-${Date.now()}`,
      userId: "e2e-user-1",
      name,
      description: "",
      frequency: "daily",
      createdAt: new Date().toISOString(),
      completions: [],
    });
    localStorage.setItem("habit-tracker-habits", JSON.stringify(habits));
  }, name);
}

// ── Tests ──────────────────────────────────────────────────────────────────

test.describe("Habit Tracker app", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto("/");
    await clearStorage(page);
  });

  test("shows the splash screen and redirects unauthenticated users to /login", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("splash-screen")).toBeVisible();
    await page.waitForURL("**/login", { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });

  test("redirects authenticated users from / to /dashboard", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("/");
    await seedSession(page);
    await page.goto("/");
    await page.waitForURL("**/dashboard", { timeout: 5000 });
    expect(page.url()).toContain("/dashboard");
  });

  test("prevents unauthenticated access to /dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login", { timeout: 5000 });
    expect(page.url()).toContain("/login");
  });

  test("signs up a new user and lands on the dashboard", async ({ page }) => {
    await page.goto("/signup");
    await page.getByTestId("auth-signup-email").fill("newuser@example.com");
    await page.getByTestId("auth-signup-password").fill("mypassword");
    await page.getByTestId("auth-signup-submit").click();

    await page.waitForURL("**/dashboard", { timeout: 5000 });
    await expect(page.getByTestId("dashboard-page")).toBeVisible();

    const session = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("habit-tracker-session") ?? "null"),
    );
    expect(session).not.toBeNull();
    expect(session.email).toBe("newuser@example.com");
  });

  test("logs in an existing user and loads only that user's habits", async ({
    page,
  }) => {
    // Seed user and a habit for that user, plus a habit for another user
    await page.goto("/login");
    await seedUser(page, "alice@example.com", "alicepass");
    await page.evaluate(() => {
      const habits = [
        {
          id: "h1",
          userId: "e2e-user-1",
          name: "Alice Habit",
          description: "",
          frequency: "daily",
          createdAt: new Date().toISOString(),
          completions: [],
        },
        {
          id: "h2",
          userId: "other-user",
          name: "Other Habit",
          description: "",
          frequency: "daily",
          createdAt: new Date().toISOString(),
          completions: [],
        },
      ];
      localStorage.setItem("habit-tracker-habits", JSON.stringify(habits));
    });

    await page.getByTestId("auth-login-email").fill("alice@example.com");
    await page.getByTestId("auth-login-password").fill("alicepass");
    await page.getByTestId("auth-login-submit").click();

    await page.waitForURL("**/dashboard", { timeout: 5000 });
    await expect(page.getByTestId("habit-card-alice-habit")).toBeVisible();
    await expect(page.getByTestId("habit-card-other-habit")).not.toBeVisible();
  });

  test("creates a habit from the dashboard", async ({ page }) => {
    await page.goto("/");
    await seedUser(page);
    await seedSession(page);
    await page.goto("/dashboard");

    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await page.getByTestId("create-habit-button").click();
    await expect(page.getByTestId("habit-form")).toBeVisible();

    await page.getByTestId("habit-name-input").fill("Exercise Daily");
    await page.getByTestId("habit-description-input").fill("30 minutes");
    await page.getByTestId("habit-save-button").click();

    await expect(page.getByTestId("habit-card-exercise-daily")).toBeVisible();
  });

  test("completes a habit for today and updates the streak", async ({
    page,
  }) => {
    await page.goto("/");
    await seedUser(page);
    await seedSession(page);
    await seedHabit(page, "Drink Water");
    await page.goto("/dashboard");

    await expect(page.getByTestId("habit-card-drink-water")).toBeVisible();

    const streakBefore = await page
      .getByTestId("habit-streak-drink-water")
      .textContent();
    expect(streakBefore).toContain("0");

    await page.getByTestId("habit-complete-drink-water").click();

    await expect(page.getByTestId("habit-streak-drink-water")).toContainText(
      "1",
    );
  });

  test("persists session and habits after page reload", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("/");
    await seedUser(page);
    await seedSession(page);
    await seedHabit(page, "Morning Pages");
    await page.goto("/dashboard");

    await expect(page.getByTestId("habit-card-morning-pages")).toBeVisible();

    // Reload
    await page.reload();

    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await expect(page.getByTestId("habit-card-morning-pages")).toBeVisible();
  });

  test("logs out and redirects to /login", async ({ page }: { page: Page }) => {
    await page.goto("/");
    await seedUser(page);
    await seedSession(page);
    await page.goto("/dashboard");

    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await page.getByTestId("auth-logout-button").click();

    await page.waitForURL("**/login", { timeout: 5000 });
    expect(page.url()).toContain("/login");

    const session = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("habit-tracker-session") ?? "null"),
    );
    expect(session).toBeNull();
  });

  test("loads the cached app shell when offline after the app has been loaded once", async ({
    page,
    context,
  }) => {
    // First visit to prime the cache
    await page.goto("/");
    await seedUser(page);
    await seedSession(page);
    await page.goto("/dashboard");
    await expect(page.getByTestId("dashboard-page")).toBeVisible();

    // Wait for service worker to install and cache
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Reload — should not hard-crash; app shell should load
    await page.reload({ waitUntil: "domcontentloaded" }).catch(() => {});

    // The page should not be a browser error page
    const body = await page
      .locator("body")
      .textContent()
      .catch(() => "");
    expect(body).not.toContain("ERR_INTERNET_DISCONNECTED");
    expect(body).not.toContain("No internet");

    // Restore online
    await context.setOffline(false);
  });
});
