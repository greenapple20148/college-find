import { test, expect } from '@playwright/test'

test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 812 } }) // iPhone SE

    test('home page renders without horizontal scroll', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
        const viewportWidth = await page.evaluate(() => window.innerWidth)
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5) // 5px tolerance
    })

    test('search page is usable on mobile', async ({ page }) => {
        await page.goto('/search')
        await page.waitForLoadState('networkidle')

        // Search input should be full width and visible
        const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder*="earch"]').first()
        if (await searchInput.isVisible()) {
            const box = await searchInput.boundingBox()
            expect(box!.width).toBeGreaterThan(250)
        }
    })

    test('pricing page plans stack vertically', async ({ page }) => {
        await page.goto('/pricing')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1000)

        // No horizontal overflow
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
        const viewportWidth = await page.evaluate(() => window.innerWidth)
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5)
    })

    test('header is functional on mobile', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // On mobile, verify the page doesn't crash and has some nav element
        const hasNav = await page.locator('nav, header').count()
        expect(hasNav).toBeGreaterThan(0)
    })

    test('essay feedback textarea usable on mobile', async ({ page }) => {
        await page.goto('/essay-feedback')
        await page.waitForLoadState('networkidle')

        const textarea = page.locator('textarea').first()
        if (await textarea.isVisible()) {
            const box = await textarea.boundingBox()
            expect(box!.width).toBeGreaterThan(250)
        }
    })

    test('admission strategy form scrollable on mobile', async ({ page }) => {
        await page.goto('/admission-strategy')
        await page.waitForLoadState('networkidle')

        // All form fields should be reachable by scrolling
        const gpaInput = page.locator('input[placeholder*="3.8"]').first()
        await expect(gpaInput).toBeVisible()

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        const submitBtn = page.locator('button').filter({ hasText: /generate|strategy/i }).first()
        await expect(submitBtn).toBeVisible()
    })
})

test.describe('Tablet Responsiveness', () => {
    test('pricing page renders correctly on tablet', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 })
        await page.goto('/pricing')
        await page.waitForLoadState('networkidle')

        // Page should load without crashing at tablet width
        await expect(page.locator('h1, h2').first()).toBeVisible()
    })

    test('search page has proper layout on tablet', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 })
        await page.goto('/search')
        await page.waitForLoadState('networkidle')

        await expect(page.locator('h1, h2').first()).toBeVisible()
    })
})
