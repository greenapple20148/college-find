import { test, expect } from '@playwright/test'

test.describe('API Health Checks', () => {
    test('GET /api/colleges returns data', async ({ request }) => {
        const response = await request.get('/api/colleges?limit=5')
        expect(response.status()).toBe(200)

        const data = await response.json()
        expect(data.colleges || data.data || data).toBeTruthy()
    })

    test('GET /api/colleges filters by state', async ({ request }) => {
        const response = await request.get('/api/colleges?limit=5&state=California')
        expect(response.status()).toBe(200)
    })

    test('POST /api/chat without auth returns error', async ({ request }) => {
        const response = await request.post('/api/chat', {
            data: { message: 'test' },
        })
        // Should not return 200 — either 401 or 400 depending on auth implementation
        expect(response.status()).toBeGreaterThanOrEqual(400)
    })

    test('POST /api/admission-strategy without auth returns 401', async ({ request }) => {
        const response = await request.post('/api/admission-strategy', {
            data: { gpa: '3.5' },
        })
        expect(response.status()).toBe(401)
    })

    test('POST /api/major-match without auth returns 401', async ({ request }) => {
        const response = await request.post('/api/major-match', {
            data: { interests: 'math' },
        })
        expect(response.status()).toBe(401)
    })

    test('POST /api/financial-aid without auth returns 401', async ({ request }) => {
        const response = await request.post('/api/financial-aid', {
            data: { income: 50000 },
        })
        expect(response.status()).toBe(401)
    })

    test('POST /api/essay-feedback without auth returns 401', async ({ request }) => {
        const response = await request.post('/api/essay-feedback', {
            data: { essayText: 'test' },
        })
        expect(response.status()).toBe(401)
    })

    test('GET /api/score-predictor without auth returns 401', async ({ request }) => {
        const response = await request.get('/api/score-predictor')
        expect(response.status()).toBe(401)
    })

    test('GET /api/saved without auth returns error', async ({ request }) => {
        const response = await request.get('/api/saved')
        expect(response.status()).toBeGreaterThanOrEqual(400)
    })

    test('GET /api/deadlines returns data', async ({ request }) => {
        const response = await request.get('/api/deadlines?cycle_year=2026&limit=5')
        expect(response.status()).toBe(200)
    })
})

test.describe('API Input Validation', () => {
    test('POST /api/recommendations with invalid GPA returns 400', async ({ request }) => {
        const response = await request.post('/api/recommendations', {
            data: { gpa: 5.0 },
        })
        expect(response.status()).toBe(400)
    })

    test('POST /api/recommendations with negative GPA returns 400', async ({ request }) => {
        const response = await request.post('/api/recommendations', {
            data: { gpa: -1 },
        })
        expect(response.status()).toBe(400)
    })

    test('POST /api/recommendations without GPA returns 400', async ({ request }) => {
        const response = await request.post('/api/recommendations', {
            data: {},
        })
        expect(response.status()).toBe(400)
    })
})
