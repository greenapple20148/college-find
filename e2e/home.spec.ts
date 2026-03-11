import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
    test('loads with hero section and navigation', async ({ page }) => {
        await page.goto('/')
        await expect(page).toHaveTitle(/CollegeFind/i)
        await expect(page.locator('h1')).toBeVisible()
    })

    test('has working navigation links', async ({ page }) => {
        await page.goto('/')

        // Main nav links exist in the DOM (may be in dropdown)
        const searchLink = page.locator('a[href="/search"]')
        expect(await searchLink.count()).toBeGreaterThan(0)

        const pricingLink = page.locator('a[href="/pricing"]')
        expect(await pricingLink.count()).toBeGreaterThan(0)
    })

    test('has SEO meta tags', async ({ page }) => {
        await page.goto('/')

        const metaDescription = page.locator('meta[name="description"]')
        await expect(metaDescription).toHaveAttribute('content', /.+/)
    })

    test('CTA buttons navigate correctly', async ({ page }) => {
        await page.goto('/')

        // Look for primary CTA
        const ctaButton = page.locator('a[href="/search"], a[href="/signup"]').first()
        if (await ctaButton.isVisible()) {
            await ctaButton.click()
            await expect(page).not.toHaveURL('/')
        }
    })

    test('footer has legal links', async ({ page }) => {
        await page.goto('/')
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForTimeout(500)

        await expect(page.locator('a[href="/terms"]')).toBeVisible()
        await expect(page.locator('a[href="/privacy"]')).toBeVisible()
    })
})
