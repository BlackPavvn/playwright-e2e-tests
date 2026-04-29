import { test, expect } from "@playwright/test";

test("Should load homepage with correct title", async ({ page }) => {
  // 1. Go to home page
  await page.goto("https://katalon-demo-cura.heroku.app.com/");

  // 2. Assert if the title is correct
  await expect(page).toHaveTitle("Asbury Park Press NJ | Jersey Shore & New Jersey News");

  // 3. Assert header text
  await expect(page.locator("//h1")).toHaveText("CURA Healthcare Service");
});
