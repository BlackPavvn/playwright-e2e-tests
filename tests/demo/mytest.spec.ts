import { test, expect } from "@playwright/test";
import { createFilteredCsv } from "../utils/csvHelper";
import path from "path";

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
  await page.waitForLoadState("networkidle");

  // 8. Contexto dinámico
  const contextContainer = page.locator(
    ".ContextSelector-module__contextselector___1YiuW",
  );

  await expect(contextContainer).toBeVisible({
    timeout: 15000,
  });

  const contextButton = contextContainer.locator("button.dropdown-toggle");

  const selectedContext = contextButton.locator("span.filter-option");

  await expect(selectedContext).toBeVisible();

  const currentContext = (await selectedContext.textContent())?.trim() ?? "";

  console.log("Contexto actual:", currentContext);

  // Cambiar contexto si no contiene Administration
  if (!currentContext.includes("Administration")) {
    await contextButton.click();

    const option = page
      .locator(".dropdown-menu li a")
      .filter({ hasText: /Administration/ })
      .first();

    await expect(option).toBeVisible({
      timeout: 5000,
    });

    await option.click();

    // Validar cambio
    await expect(selectedContext).toContainText("Administration");
  }

  // 9. Monitoring
  const monitoringLink = page.getByRole("link", {
    name: "Monitoring",
  });

  await expect(monitoringLink).toBeVisible();

  await expect(async () => {
    await monitoringLink.click();

    await expect(page.getByRole("link", { name: "Log Console" })).toBeVisible({
      timeout: 3000,
    });
  }).toPass();

  // 10. Log Console
  const logConsoleLink = page.getByRole("link", {
    name: "Log Console",
  });

  await expect(async () => {
    await logConsoleLink.click();

    const frame = page.frameLocator("#genFrame");

    const logsDropdown = frame.locator('input[name="logs_files_combo"]');

    await expect(logsDropdown).toBeVisible({
      timeout: 10000,
    });
  }).toPass();

  // 11. Captura de frame para el dropdown
  const frame = page.frameLocator("#genFrame");

  const logsDropdown = frame.locator('input[name="logs_files_combo"]');

  await expect(logsDropdown).toBeVisible();

  await logsDropdown.click();
  await logsDropdown.fill("pci-expresso");
  await logsDropdown.press("Enter");

  // 12. Verificar toolbar del grid
  const headerBar = frame.locator(".headerBar");

  await expect(headerBar).toBeVisible({
    timeout: 10000,
  });

  // 13. Validar headers principales
  await expect(headerBar.getByText("Line")).toBeVisible();

  await expect(headerBar.getByText("Message")).toBeVisible();

  // 14. Verificar botón Export Excel
  const exportExcelButton = frame.locator('img[src*="page_excel.png"]');

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    exportExcelButton.click(),
  ]);

  const filePath = `./downloads/pci-expresso/${await download.suggestedFilename()}`;

  await download.saveAs(filePath);

  console.log("Archivo descargado en:", filePath);

  // 15. Filtrar CSV
  const inputFile = filePath;

  const outputFile = path.resolve(
    "./downloads/pci-expresso",
    "pci-expresso-filtered.csv",
  );

  const result = createFilteredCsv(inputFile, outputFile, "Message", "error");

  console.log("CSV original:", result.totalOriginal);
  console.log("CSV filtrado:", result.totalFiltered);
  console.log("Archivo generado en:", result.outputFilePath);
});
