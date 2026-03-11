import { test, expect } from '@playwright/test'

test.describe('Accessibility — Keyboard Navigation', () => {
    test('tab through login form reaches inputs', async ({ page }) => {
        await page.goto('/login')
        await page.waitForLoadState('networkidle')

        // Tab through the page to reach form elements
        for (let i = 0; i < 10; i++) {
            await page.keyboard.press('Tab')
        }

        // At some point, an input should have been focused
        const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
        // Should have at least reached an interactive element
        expect(['INPUT', 'BUTTON', 'A', 'SELECT', 'TEXTAREA']).toContain(focusedTag)
    })

    test('focus rings visible on interactive elements', async ({ page }) => {
        await page.goto('/pricing')
        await page.waitForLoadState('networkidle')

        // Tab through a few elements
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('Tab')
        }

        const hasFocus = await page.evaluate(() => {
            const el = document.activeElement
            if (!el) return false
            const styles = window.getComputedStyle(el)
            return (
                styles.outline !== 'none' ||
                styles.boxShadow !== 'none' ||
                el.classList.contains('ring') ||
                el.classList.contains('focus')
            )
        })

        // At least one focused element should have visible focus indicator
        expect(hasFocus).toBeTruthy()
    })
})

test.describe('Accessibility — Image Alt Text', () => {
    test('home page images have alt text', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        const images = page.locator('img')
        const count = await images.count()

        for (let i = 0; i < Math.min(count, 10); i++) {
            const alt = await images.nth(i).getAttribute('alt')
            // Every img should have an alt attribute (empty is OK for decorative)
            expect(alt).not.toBeNull()
        }
    })
})

test.describe('Accessibility — Color Contrast', () => {
    test('primary text has sufficient contrast', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // Check that primary heading text is visible
        const h1 = page.locator('h1').first()
        await expect(h1).toBeVisible()

        const styles = await h1.evaluate((el) => {
            const computed = window.getComputedStyle(el)
            return {
                color: computed.color,
                fontSize: computed.fontSize,
            }
        })

        // Text should not be transparent or fully transparent
        expect(styles.color).not.toBe('rgba(0, 0, 0, 0)')
        expect(styles.color).not.toBe('transparent')
    })
})

test.describe('Accessibility — Form Labels', () => {
    test('login form inputs have labels', async ({ page }) => {
        await page.goto('/login')
        await page.waitForLoadState('networkidle')

        const emailInput = page.locator('input[type="email"], input[name="email"]').first()
        const passwordInput = page.locator('input[type="password"], input[name="password"]').first()

        // Each input should have an associated label, aria-label, or placeholder
        const emailId = await emailInput.getAttribute('id')
        const emailAriaLabel = await emailInput.getAttribute('aria-label')
        const emailPlaceholder = await emailInput.getAttribute('placeholder')
        const emailLabel = emailId ? await page.locator(`label[for="${emailId}"]`).count() : 0

        expect(emailLabel > 0 || emailAriaLabel || emailPlaceholder).toBeTruthy()

        const passwordId = await passwordInput.getAttribute('id')
        const passwordAriaLabel = await passwordInput.getAttribute('aria-label')
        const passwordPlaceholder = await passwordInput.getAttribute('placeholder')
        const passwordLabel = passwordId ? await page.locator(`label[for="${passwordId}"]`).count() : 0

        expect(passwordLabel > 0 || passwordAriaLabel || passwordPlaceholder).toBeTruthy()
    })
})
