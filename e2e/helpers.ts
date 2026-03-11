/**
 * E2E Test Helpers
 * Shared auth utilities and constants
 */
import { type Page } from '@playwright/test'

// Test user credentials — set these in your .env.local or CI environment
export const TEST_USER = {
    email: process.env.E2E_TEST_EMAIL || 'test@collegefind.com',
    password: process.env.E2E_TEST_PASSWORD || 'TestPassword123!',
}

/**
 * Login helper — navigates to login page and authenticates
 */
export async function login(page: Page, email?: string, password?: string) {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.fill('input[type="email"], input[name="email"]', email || TEST_USER.email)
    await page.fill('input[type="password"], input[name="password"]', password || TEST_USER.password)

    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => {
        // Some flows redirect elsewhere
    })
    // Wait for auth to settle
    await page.waitForTimeout(1000)
}

/**
 * Check if page has an element matching the selector
 */
export async function hasElement(page: Page, selector: string): Promise<boolean> {
    return (await page.locator(selector).count()) > 0
}

/**
 * Wait for API response with specific status
 */
export async function waitForApi(page: Page, urlPattern: string, status = 200) {
    return page.waitForResponse(
        (response) => response.url().includes(urlPattern) && response.status() === status,
        { timeout: 15000 }
    )
}
