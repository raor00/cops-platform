import { expect, test, type Page } from "@playwright/test"

async function openDashboard(page: Page) {
  await page.goto("/dashboard")
  await page.waitForURL("**/dashboard")
}

test.describe("tickets smoke", () => {
  test("carga dashboard local con auto sesión en desarrollo", async ({ page }) => {
    await openDashboard(page)
    await expect(page.getByRole("heading", { name: /buenos días|buenas tardes|buenas noches/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /nuevo servicio/i })).toBeVisible()
  })

  test("navega a tickets, pagos y mantenimiento", async ({ page }) => {
    await openDashboard(page)

    await page.goto("/dashboard/tickets?tipo=servicio")
    await expect(page.getByRole("heading", { name: "Tickets" })).toBeVisible()

    await page.goto("/dashboard/pagos")
    await expect(page.getByRole("heading", { name: /pagos a técnicos/i })).toBeVisible()

    await page.goto("/dashboard/mantenimiento")
    await expect(page.getByRole("heading", { name: /mantenimiento/i })).toBeVisible()
  })

  test("abre formulario de nuevo ticket", async ({ page }) => {
    await openDashboard(page)

    await page.goto("/dashboard/tickets/nuevo")
    await expect(page.getByRole("heading", { name: /nuevo servicio|nuevo proyecto|nueva inspección/i })).toBeVisible()
    await expect(page.getByRole("heading", { name: /información del ticket/i })).toBeVisible()
    await expect(page.getByPlaceholder(/breve descripción del servicio/i)).toBeVisible()
  })
})
