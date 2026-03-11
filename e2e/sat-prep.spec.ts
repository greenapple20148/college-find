import { test, expect } from '@playwright/test'

test.describe('SAT Prep Hub', () => {
    test('SAT prep landing page loads', async ({ page }) => {
        await page.goto('/sat-prep')
        await page.waitForLoadState('networkidle')

        await expect(page.locator('h1')).toBeVisible()
        const bodyText = await page.textContent('body')
        expect(bodyText?.toLowerCase()).toMatch(/sat|practice|prep/)
    })

    test('has navigation to practice section', async ({ page }) => {
        await page.goto('/sat-prep')
        await page.waitForLoadState('networkidle')

        const practiceLink = page.locator('a[href*="practice"]').first()
        await expect(practiceLink).toBeVisible()
    })

    test('practice page loads questions', async ({ page }) => {
        await page.goto('/sat-prep/practice')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(3000)

        const bodyText = await page.textContent('body')
        // Should have some question text or prompt
        expect(bodyText!.length).toBeGreaterThan(100)
    })
})

test.describe('SAT Score Calculator', () => {
    test('calculator page loads', async ({ page }) => {
        await page.goto('/sat-prep/calculator')
        await page.waitForLoadState('networkidle')

        const bodyText = await page.textContent('body')
        expect(bodyText?.toLowerCase()).toMatch(/score|calculator|estimate/)
    })
})
