'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Merge anonymous session saves into newly authenticated account (once per session)
  async function mergeAnonymousSaves() {
    try {
      const sessionId = localStorage.getItem('collegefind_session_id')
      if (!sessionId) return
      // Prevent duplicate merge calls across re-renders
      const mergeKey = `collegefind_merged_${sessionId}`
      if (sessionStorage.getItem(mergeKey)) return
      sessionStorage.setItem(mergeKey, '1')
      await fetch('/api/saved/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })
    } catch {
      // Non-critical — ignore errors
    }
  }

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    // Clear sensitive local data
    try {
      localStorage.removeItem('collegefind_profile')
      localStorage.removeItem('collegefind_session_id')
      localStorage.removeItem('cm-profile')
    } catch { /* ignore */ }
    setUser(null)
    setSession(null)
    router.push('/login')
  }, [supabase, router])

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN') {
          await mergeAnonymousSaves()
          router.refresh()
        }
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
