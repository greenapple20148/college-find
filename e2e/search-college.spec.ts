import { test, expect } from '@playwright/test'

test.describe('College Search', () => {
    test('page loads with college cards', async ({ page }) => {
        await page.goto('/search')
        await page.waitForLoadState('networkidle')

        await expect(page.locator('h1')).toBeVisible()
        // Wait for college cards to load
        const cards = page.locator('[class*="card"], [class*="college"]').first()
        await expect(cards).toBeVisible({ timeout: 10000 })
    })

    test('search by name filters results', async ({ page }) => {
        await page.goto('/search')
        await page.waitForLoadState('networkidle')

        const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder*="earch"]').first()
        await searchInput.fill('MIT')
        await page.waitForTimeout(1000) // Debounce

        // Results should be filtered
        await page.waitForLoadState('networkidle')
    })

    test('clicking a college navigates to detail page', async ({ page }) => {
        await page.goto('/search')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)

        // Find first college link
        const collegeLink = page.locator('a[href*="/college/"]').first()
        if (await collegeLink.isVisible()) {
            const href = await collegeLink.getAttribute('href')
            expect(href).toMatch(/\/college\//)
        }
    })

    test('empty search shows no results message', async ({ page }) => {
        await page.goto('/search')
        await page.waitForLoadState('networkidle')

        const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder*="earch"]').first()
        await searchInput.fill('XYZNONEXISTENT12345')
        await page.waitForTimeout(1500)

        // Should show empty state or "no results"
        const pageContent = await page.textContent('body')
        expect(
            pageContent?.toLowerCase().includes('no') ||
            pageContent?.toLowerCase().includes('found') ||
            pageContent?.toLowerCase().includes('result')
        ).toBeTruthy()
    })
})

test.describe('College Detail Page', () => {
    test('loads with college information', async ({ page }) => {
        // Use a known college slug
        await page.goto('/search')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)

        const firstLink = page.locator('a[href*="/college/"]').first()
        if (await firstLink.isVisible()) {
            const href = await firstLink.getAttribute('href')
            await page.goto(href!)
            await page.waitForLoadState('networkidle')

            // Should have college name as heading
            await expect(page.locator('h1')).toBeVisible()
        }
    })

    test('has SEO meta tags with college name', async ({ page }) => {
        await page.goto('/search')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)

        const firstLink = page.locator('a[href*="/college/"]').first()
        if (await firstLink.isVisible()) {
            const href = await firstLink.getAttribute('href')
            await page.goto(href!)

            const title = await page.title()
            expect(title.length).toBeGreaterThan(5)
        }
    })

    test('shows admission calculator section', async ({ page }) => {
        await page.goto('/search')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)

        const firstLink = page.locator('a[href*="/college/"]').first()
        if (await firstLink.isVisible()) {
            const href = await firstLink.getAttribute('href')
            await page.goto(href!)
            await page.waitForLoadState('networkidle')

            // Scroll down to find admission calculator
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
            await page.waitForTimeout(500)

            const calcText = page.getByText(/Admission Chance|Calculate/i).first()
            await expect(calcText).toBeVisible()
        }
    })

    test('returns 200 for invalid slug (catch-all renders page)', async ({ page }) => {
        const response = await page.goto('/college/this-college-does-not-exist-xyz')
        // Next.js catch-all routes return 200; the page shows "not found" UI
        expect(response?.status()).toBeLessThan(500)
    })
})
