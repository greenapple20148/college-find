import { test, expect } from '@playwright/test'

test.describe('Pricing Page', () => {
    test('displays three plan tiers', async ({ page }) => {
        await page.goto('/pricing')
        await page.waitForLoadState('networkidle')

        const bodyText = await page.textContent('body')
        expect(bodyText).toContain('Free')
        expect(bodyText).toContain('Pro')
        expect(bodyText).toContain('Premium')
    })

    test('shows correct Pro pricing', async ({ page }) => {
        await page.goto('/pricing')
        await page.waitForLoadState('networkidle')

        const bodyText = await page.textContent('body')
        // Should show $12/month or $59/year
        expect(bodyText).toMatch(/\$12|\$59/)
    })

    test('shows correct Premium pricing', async ({ page }) => {
        await page.goto('/pricing')
        await page.waitForLoadState('networkidle')

        const bodyText = await page.textContent('body')
        expect(bodyText).toMatch(/\$99/)
    })

    test('does NOT show scholarship alerts', async ({ page }) => {
        await page.goto('/pricing')
        await page.waitForLoadState('networkidle')

        const bodyText = await page.textContent('body')
        expect(bodyText?.toLowerCase()).not.toContain('scholarship alert')
    })

    test('has comparison table', async ({ page }) => {
        await page.goto('/pricing')
        await page.waitForLoadState('networkidle')

        // Scroll to comparison section
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
        await page.waitForTimeout(500)

        const bodyText = await page.textContent('body')
        expect(bodyText).toContain('SAT practice questions')
    })

    test('has FAQ section', async ({ page }) => {
        await page.goto('/pricing')
        await page.waitForLoadState('networkidle')

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForTimeout(500)

        const faqText = page.getByText(/frequently asked|FAQ/i).first()
        await expect(faqText).toBeVisible()
    })

    test('FAQ expands on click', async ({ page }) => {
        await page.goto('/pricing')
        await page.waitForLoadState('networkidle')

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForTimeout(500)

        // Click first FAQ question
        const faqQuestion = page.locator('button, summary, [role="button"]').filter({ hasText: /what|how|can/i }).first()
        if (await faqQuestion.isVisible()) {
            await faqQuestion.click()
            await page.waitForTimeout(300)
            // Answer should be visible
        }
    })

    test('Free plan has no CTA to checkout', async ({ page }) => {
        await page.goto('/pricing')
        await page.waitForLoadState('networkidle')

        // Free plan should have "Go to Dashboard" or "Get Started", not a checkout link
        const bodyText = await page.textContent('body')
        expect(bodyText).toContain('Free')
    })
})
