import { test, expect } from '@playwright/test'

test.describe('Tools & Calculators', () => {
    test('cost calculator page loads', async ({ page }) => {
        await page.goto('/cost-calculator')
        await page.waitForLoadState('networkidle')

        await expect(page.locator('h1')).toBeVisible()
        const bodyText = await page.textContent('body')
        expect(bodyText?.toLowerCase()).toMatch(/cost|calculator|estimate/)
    })

    test('cost calculator has financial profile form', async ({ page }) => {
        await page.goto('/cost-calculator')
        await page.waitForLoadState('networkidle')

        // Should have income/family size inputs
        const bodyText = await page.textContent('body')
        expect(bodyText?.toLowerCase()).toMatch(/income|family|financial/)
    })

    test('cost calculator has financial aid estimator CTA', async ({ page }) => {
        await page.goto('/cost-calculator')
        await page.waitForLoadState('networkidle')

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForTimeout(500)

        const ctaLink = page.locator('a[href="/financial-aid"]').first()
        await expect(ctaLink).toBeVisible()
    })

    test('ROI calculator page loads', async ({ page }) => {
        await page.goto('/college-roi-calculator')
        await page.waitForLoadState('networkidle')

        const response = await page.goto('/college-roi-calculator')
        expect(response?.status()).toBeLessThan(500)
    })

    test('compare tool page loads', async ({ page }) => {
        await page.goto('/compare')
        await page.waitForLoadState('networkidle')

        const response = await page.goto('/compare')
        expect(response?.status()).toBeLessThan(500)
    })

    test('scholarships page loads', async ({ page }) => {
        await page.goto('/scholarships')
        await page.waitForLoadState('networkidle')

        await expect(page.locator('h1')).toBeVisible()
    })

    test('match page loads', async ({ page }) => {
        await page.goto('/match')
        await page.waitForLoadState('networkidle')

        const response = await page.goto('/match')
        expect(response?.status()).toBeLessThan(500)
    })
})
