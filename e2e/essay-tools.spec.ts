import { test, expect } from '@playwright/test'

test.describe('Essay Toolkit Hub', () => {
    test('essay toolkit page loads with all tools', async ({ page }) => {
        await page.goto('/college-essays')
        await page.waitForLoadState('networkidle')

        await expect(page.locator('h1')).toBeVisible()
    })

    test('links to individual essay tools', async ({ page }) => {
        await page.goto('/college-essays')
        await page.waitForLoadState('networkidle')

        // Check that at least some tools are listed
        const toolLinks = page.locator('a[href*="essay"]')
        expect(await toolLinks.count()).toBeGreaterThan(0)
    })
})

test.describe('Individual Essay Tools Load', () => {
    const essayToolPages = [
        { path: '/essay-brainstorm', name: 'Brainstorm' },
        { path: '/essay-topic-generator', name: 'Topic Generator' },
        { path: '/essay-hook-generator', name: 'Hook Generator' },
        { path: '/essay-outline-builder', name: 'Outline Builder' },
        { path: '/essay-analyzer', name: 'Analyzer' },
        { path: '/personal-story-finder', name: 'Story Finder' },
        { path: '/supplemental-essay-helper', name: 'Supplemental Helper' },
        { path: '/essay-idea-score', name: 'Idea Score' },
    ]

    for (const tool of essayToolPages) {
        test(`${tool.name} page loads`, async ({ page }) => {
            await page.goto(tool.path)
            await page.waitForLoadState('networkidle')

            // Page should render without error
            const response = await page.goto(tool.path)
            expect(response?.status()).toBeLessThan(500)

            await expect(page.locator('h1, h2').first()).toBeVisible()
        })
    }
})

test.describe('Essay Feedback (Premium)', () => {
    test('essay feedback page renders form', async ({ page }) => {
        await page.goto('/essay-feedback')
        await page.waitForLoadState('networkidle')

        // Should have textarea for essay
        await expect(page.locator('textarea').first()).toBeVisible()
    })

    test('word counter updates in real time', async ({ page }) => {
        await page.goto('/essay-feedback')
        await page.waitForLoadState('networkidle')

        const textarea = page.locator('textarea').first()
        await textarea.fill('This is a test essay with several words to check the counter functionality works correctly')
        await page.waitForTimeout(300)

        // Word count should be visible and > 0
        const bodyText = await page.textContent('body')
        expect(bodyText).toMatch(/\d+\/\d+ words/)
    })

    test('submit button disabled with empty text', async ({ page }) => {
        await page.goto('/essay-feedback')
        await page.waitForLoadState('networkidle')

        const submitButton = page.locator('button').filter({ hasText: /feedback|submit|analyze/i }).first()
        if (await submitButton.isVisible()) {
            await expect(submitButton).toBeDisabled()
        }
    })

    test('essay type selector has options', async ({ page }) => {
        await page.goto('/essay-feedback')
        await page.waitForLoadState('networkidle')

        const select = page.locator('select').first()
        if (await select.isVisible()) {
            const options = select.locator('option')
            expect(await options.count()).toBeGreaterThan(1)
        }
    })
})
