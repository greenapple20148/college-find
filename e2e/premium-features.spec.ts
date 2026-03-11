import { test, expect } from '@playwright/test'

test.describe('Premium Feature Pages — Render Check', () => {
    // All Premium pages should at minimum render without crashing,
    // even for unauthenticated users (they may show a login/upgrade prompt)

    const premiumPages = [
        { path: '/score-predictor', name: 'Score Predictor' },
        { path: '/admission-strategy', name: 'Admission Strategy' },
        { path: '/major-match', name: 'Major & Career Match' },
        { path: '/financial-aid', name: 'Financial Aid Estimator' },
        { path: '/essay-feedback', name: 'Essay Feedback' },
    ]

    for (const feature of premiumPages) {
        test(`${feature.name} page loads without 500`, async ({ page }) => {
            const response = await page.goto(feature.path)
            expect(response?.status()).toBeLessThan(500)
        })

        test(`${feature.name} shows Premium badge`, async ({ page }) => {
            await page.goto(feature.path)
            await page.waitForLoadState('networkidle')

            const bodyText = await page.textContent('body')
            expect(bodyText?.toLowerCase()).toMatch(/premium|upgrade/)
        })
    }
})

test.describe('Admission Strategy Page', () => {
    test('form has all required fields', async ({ page }) => {
        await page.goto('/admission-strategy')
        await page.waitForLoadState('networkidle')

        // GPA field
        const gpaInput = page.locator('input[placeholder*="GPA" i], input[placeholder*="3.8"]').first()
        await expect(gpaInput).toBeVisible()

        // SAT field
        const satInput = page.locator('input[placeholder*="SAT" i], input[placeholder*="1350"]').first()
        await expect(satInput).toBeVisible()

        // Target schools
        const schoolsInput = page.locator('input[placeholder*="school" i], input[placeholder*="UCLA"]').first()
        await expect(schoolsInput).toBeVisible()

        // Extracurriculars
        const extrasInput = page.locator('textarea[placeholder*="activities" i], textarea[placeholder*="leadership"]').first()
        await expect(extrasInput).toBeVisible()

        // Submit button
        const submitBtn = page.locator('button').filter({ hasText: /generate|strategy/i }).first()
        await expect(submitBtn).toBeVisible()
    })

    test('submit button disabled when form is empty', async ({ page }) => {
        await page.goto('/admission-strategy')
        await page.waitForLoadState('networkidle')

        const submitBtn = page.locator('button').filter({ hasText: /generate|strategy/i }).first()
        await expect(submitBtn).toBeDisabled()
    })

    test('submit button enabled when GPA is filled', async ({ page }) => {
        await page.goto('/admission-strategy')
        await page.waitForLoadState('networkidle')

        const gpaInput = page.locator('input[placeholder*="3.8"]').first()
        await gpaInput.fill('3.8')

        const submitBtn = page.locator('button').filter({ hasText: /generate|strategy/i }).first()
        await expect(submitBtn).toBeEnabled()
    })
})

test.describe('Major & Career Match Page', () => {
    test('form renders with all sections', async ({ page }) => {
        await page.goto('/major-match')
        await page.waitForLoadState('networkidle')

        const bodyText = await page.textContent('body')
        expect(bodyText?.toLowerCase()).toMatch(/interest|strength|value/)
    })

    test('value chips are clickable', async ({ page }) => {
        await page.goto('/major-match')
        await page.waitForLoadState('networkidle')

        // Find clickable chip/button elements
        const chips = page.locator('button').filter({ hasText: /income|innovation|creativity|stability/i })
        if (await chips.first().isVisible()) {
            await chips.first().click()
            // Should toggle styling (we verify it doesn't crash)
        }
    })
})

test.describe('Financial Aid Estimator Page', () => {
    test('form has income and household inputs', async ({ page }) => {
        await page.goto('/financial-aid')
        await page.waitForLoadState('networkidle')

        const bodyText = await page.textContent('body')
        expect(bodyText?.toLowerCase()).toMatch(/income|household|family/)
    })

    test('submit button exists', async ({ page }) => {
        await page.goto('/financial-aid')
        await page.waitForLoadState('networkidle')

        const submitBtn = page.locator('button').filter({ hasText: /estimate|calculate|aid/i }).first()
        await expect(submitBtn).toBeVisible()
    })
})

test.describe('Score Predictor Page', () => {
    test('page loads and shows heading', async ({ page }) => {
        await page.goto('/score-predictor')
        await page.waitForLoadState('networkidle')

        await expect(page.locator('h1').first()).toBeVisible()
    })
})
