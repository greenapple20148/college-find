import { test, expect } from '@playwright/test'

test.describe('SEO & Meta Tags', () => {
    const pagesWithSEO = [
        { path: '/', title: /CollegeFind/i },
        { path: '/search', title: /search|college/i },
        { path: '/pricing', title: /pricing|plan/i },
        { path: '/sat-prep', title: /SAT|prep/i },
        { path: '/college-essays', title: /essay/i },
    ]

    for (const page_ of pagesWithSEO) {
        test(`${page_.path} has proper title`, async ({ page }) => {
            await page.goto(page_.path)
            const title = await page.title()
            expect(title).toMatch(page_.title)
        })
    }

    test('home page has meta description', async ({ page }) => {
        await page.goto('/')
        const content = await page.locator('meta[name="description"]').getAttribute('content')
        expect(content).toBeTruthy()
        expect(content!.length).toBeGreaterThan(20)
    })

    test('home page has viewport meta tag', async ({ page }) => {
        await page.goto('/')
        const viewport = page.locator('meta[name="viewport"]')
        await expect(viewport).toHaveAttribute('content', /width=device-width/)
    })
})

test.describe('Sitemap & Robots', () => {
    test('sitemap.xml is accessible', async ({ request }) => {
        const response = await request.get('/sitemap.xml')
        expect(response.status()).toBe(200)

        const text = await response.text()
        expect(text).toContain('<?xml')
        expect(text).toContain('<urlset')
    })

    test('robots.txt is accessible', async ({ request }) => {
        const response = await request.get('/robots.txt')
        expect(response.status()).toBe(200)

        const text = await response.text()
        expect(text.toLowerCase()).toContain('user-agent')
    })

    test('manifest.webmanifest is accessible', async ({ request }) => {
        const response = await request.get('/manifest.webmanifest')
        expect(response.status()).toBe(200)
    })
})

test.describe('Legal Pages', () => {
    const legalPages = [
        { path: '/terms', text: 'terms' },
        { path: '/privacy', text: 'privacy' },
        { path: '/cookies', text: 'cookie' },
        { path: '/disclaimer', text: 'disclaimer' },
    ]

    for (const legalPage of legalPages) {
        test(`${legalPage.path} loads and has content`, async ({ page }) => {
            const response = await page.goto(legalPage.path)
            expect(response?.status()).toBe(200)

            const bodyText = await page.textContent('body')
            expect(bodyText?.toLowerCase()).toContain(legalPage.text)
        })
    }
})
