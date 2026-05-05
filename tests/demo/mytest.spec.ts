import { test, expect } from "@playwright/test";

test("Testing Login", async ({ page }) => {
  // 1. Ir a URL
  await page.goto("https://ogedev.powercosts.com/login/login.jsp");

  // 2. Verificar título
  await expect(page).toHaveTitle("PCI Generation Supply Management System");

  // 3. Verificar header
  await expect(page.locator(".title")).toHaveText("ENERGY PLATFORM");

  // 4. Credenciales
  await page.getByLabel("Username").fill("emiranda");
  await page.getByLabel("Password").fill("s7WLw8q4D3");

  // 5. Login
  await page.getByRole("button", { name: "Log In" }).click();

  // 6. Confirmar salida de login
  await expect(page).not.toHaveURL(/login/);

  // 7. Esperar app lista
  const contextButton = page
    .locator("button:has-text('Administration')")
    .first();

  await expect(contextButton).toBeVisible();

  // 8. Contexto dinámico
  const correctContext = page.getByRole("button", {
    name: /System Administration/,
  });

  const isCorrectContext = await correctContext.isVisible();

  if (!isCorrectContext) {
    const dropdownButton = page.locator("button.dropdown-toggle");

    if ((await dropdownButton.count()) > 0) {
      await dropdownButton.click();

      const option = page.getByText(/System Administration/);
      await expect(option).toBeVisible();
      await option.click();
    }
  }

  // 9. Monitoring
  const monitoringLink = page.getByRole("link", { name: "Monitoring" });
  await expect(monitoringLink).toBeVisible();

  await expect(async () => {
    await monitoringLink.click();

    await expect(page.getByRole("link", { name: "Log Console" })).toBeVisible({
      timeout: 3000,
    });
  }).toPass();

  // 10. Log Console
  const logConsoleLink = page.getByRole("link", { name: "Log Console" });

  await expect(async () => {
    await logConsoleLink.click();

    const frame = page.frameLocator("#genFrame");

    const logsDropdown = frame.locator('input[name="logs_files_combo"]');

    await expect(logsDropdown).toBeVisible({ timeout: 10000 });
  }).toPass();
});
