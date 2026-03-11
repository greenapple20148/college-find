import { test, expect } from '@playwright/test'

test.describe('Authentication - Login Page', () => {
    test('login page renders correctly', async ({ page }) => {
        await page.goto('/login')
        await page.waitForLoadState('networkidle')

        await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
        await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible()
        await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('shows error for invalid credentials', async ({ page }) => {
        await page.goto('/login')
        await page.waitForLoadState('networkidle')

        await page.fill('input[type="email"], input[name="email"]', 'wrong@example.com')
        await page.fill('input[type="password"], input[name="password"]', 'wrongpassword')
        await page.click('button[type="submit"]')

        await page.waitForTimeout(3000)
        const bodyText = await page.textContent('body')
        expect(bodyText?.toLowerCase()).toMatch(/invalid|error|incorrect|wrong/)
    })

    test('has link to signup page', async ({ page }) => {
        await page.goto('/login')
        await page.waitForLoadState('networkidle')

        const signupLink = page.locator('a[href*="signup"]').first()
        await expect(signupLink).toBeVisible()
    })

    test('has link to forgot password', async ({ page }) => {
        await page.goto('/login')
        await page.waitForLoadState('networkidle')

        const forgotLink = page.locator('a[href*="forgot"]').first()
        await expect(forgotLink).toBeVisible()
    })
})

test.describe('Authentication - Signup Page', () => {
    test('signup page renders correctly', async ({ page }) => {
        await page.goto('/signup')
        await page.waitForLoadState('networkidle')

        await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
        await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible()
        await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('has link to login page', async ({ page }) => {
        await page.goto('/signup')
        await page.waitForLoadState('networkidle')

        const loginLink = page.locator('a[href*="login"]').first()
        await expect(loginLink).toBeVisible()
    })
})

test.describe('Authentication - Protected Routes', () => {
    test('dashboard redirects to login when not authenticated', async ({ page }) => {
        await page.goto('/dashboard')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(3000)

        const url = page.url()
        // Should either redirect to login or show login prompt
        const isLoginPage = url.includes('/login')
        const hasLoginPrompt = await page.locator('input[type="email"], input[name="email"]').isVisible().catch(() => false)
        const bodyText = await page.textContent('body')
        const hasSignInText = bodyText?.toLowerCase().includes('sign in') || bodyText?.toLowerCase().includes('log in')

        expect(isLoginPage || hasLoginPrompt || hasSignInText).toBeTruthy()
    })

    test('public pages work without auth', async ({ page }) => {
        await page.goto('/search')
        await page.waitForLoadState('networkidle')
        expect(page.url()).toContain('/search')

        await page.goto('/pricing')
        await page.waitForLoadState('networkidle')
        expect(page.url()).toContain('/pricing')
    })
})

test.describe('Authentication - Password Reset', () => {
    test('forgot password page renders', async ({ page }) => {
        await page.goto('/forgot-password')
        await page.waitForLoadState('networkidle')

        await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
        await expect(page.locator('button[type="submit"]')).toBeVisible()
    })
})
