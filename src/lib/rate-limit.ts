/**
 * In-memory sliding-window rate limiter for AI routes.
 *
 * Tracks request timestamps per user (or IP for anonymous).
 * Each route can configure its own `maxRequests` and `windowMs`.
 *
 * NOTE: This is per-process. Works great for single-instance
 * deployments and Vercel serverless (short-lived, so the map
 * resets on cold starts — effectively a soft limit). For strict
 * cross-instance limiting, swap for Redis or Upstash.
 */

interface RateLimitEntry {
    timestamps: number[]
}

const buckets = new Map<string, RateLimitEntry>()

// Garbage-collect stale entries every 5 minutes
const GC_INTERVAL = 5 * 60 * 1000
let lastGc = Date.now()

function gc(windowMs: number) {
    if (Date.now() - lastGc < GC_INTERVAL) return
    lastGc = Date.now()
    const now = Date.now()
    for (const [key, entry] of buckets) {
        entry.timestamps = entry.timestamps.filter(t => now - t < windowMs)
        if (entry.timestamps.length === 0) buckets.delete(key)
    }
}

export interface RateLimitConfig {
    /** Maximum requests allowed within the window */
    maxRequests: number
    /** Window size in milliseconds */
    windowMs: number
}

export interface RateLimitResult {
    allowed: boolean
    remaining: number
    retryAfterMs: number | null
}

/**
 * Check and consume a rate-limit token for the given key.
 *
 * @param key   Unique identifier — typically `routeName:userId` or `routeName:ip`
 * @param config  Rate limit configuration
 * @returns  Whether the request is allowed, remaining count, and retry-after hint
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
    gc(config.windowMs)

    const now = Date.now()
    const entry = buckets.get(key) || { timestamps: [] }

    // Prune timestamps outside the window
    entry.timestamps = entry.timestamps.filter(t => now - t < config.windowMs)

    if (entry.timestamps.length >= config.maxRequests) {
        // Oldest in-window timestamp determines when to retry
        const oldestInWindow = entry.timestamps[0]
        const retryAfterMs = config.windowMs - (now - oldestInWindow)
        buckets.set(key, entry)
        return {
            allowed: false,
            remaining: 0,
            retryAfterMs,
        }
    }

    entry.timestamps.push(now)
    buckets.set(key, entry)

    return {
        allowed: true,
        remaining: config.maxRequests - entry.timestamps.length,
        retryAfterMs: null,
    }
}

/* ═══════════════════════════════════════════════════════════════
   Predefined limits for AI routes
   ═══════════════════════════════════════════════════════════════ */

/** AI Chat advisor — 20 messages per 10 minutes */
export const AI_CHAT_LIMIT: RateLimitConfig = {
    maxRequests: 20,
    windowMs: 10 * 60 * 1000,
}

/** Essay Toolkit — 10 generations per 10 minutes */
export const AI_ESSAY_TOOLKIT_LIMIT: RateLimitConfig = {
    maxRequests: 10,
    windowMs: 10 * 60 * 1000,
}

/** Essay Brainstorm — 10 generations per 10 minutes */
export const AI_ESSAY_BRAINSTORM_LIMIT: RateLimitConfig = {
    maxRequests: 10,
    windowMs: 10 * 60 * 1000,
}
