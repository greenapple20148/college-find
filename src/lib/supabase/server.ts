import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component — can't set cookies, ignore
          }
        },
      },
    }
  )
}

/**
 * Service role client for admin operations (used in API routes).
 * Bypasses RLS — only use server-side.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      `Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL=${url ? 'set' : 'MISSING'}, SUPABASE_SERVICE_ROLE_KEY=${key ? 'set' : 'MISSING'}). Add them in Vercel → Settings → Environment Variables.`
    )
  }
  return createSupabaseClient(url, key)
}
