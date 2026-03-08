'use client'

import { useState, useEffect } from 'react'
import { HeartIcon } from '@/components/ui/Icon'
import { getOrCreateSessionId } from '@/lib/utils'

interface SaveButtonProps {
  collegeId: string
}

export function SaveButton({ collegeId }: SaveButtonProps) {
  const [saved, setSaved] = useState(false)
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Check initial saved state
  useEffect(() => {
    const sessionId = getOrCreateSessionId()
    if (!sessionId) return
    fetch(`/api/saved?session_id=${sessionId}`)
      .then(r => r.json())
      .then(data => {
        const match = (data.data ?? []).find((s: { college_id: string; id: string }) => s.college_id === collegeId)
        if (match) {
          setSaved(true)
          setSavedRecordId(match.id)
        }
      })
      .catch(() => {})
  }, [collegeId])

  async function handleToggle() {
    const sessionId = getOrCreateSessionId()
    if (!sessionId || loading) return
    setLoading(true)

    if (!saved) {
      try {
        const res = await fetch('/api/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, college_id: collegeId }),
        })
        const data = await res.json()
        if (res.ok) {
          setSaved(true)
          setSavedRecordId(data.data?.id ?? null)
        }
      } catch {
        // ignore
      }
    } else if (savedRecordId) {
      try {
        await fetch(`/api/saved/${savedRecordId}`, { method: 'DELETE' })
        setSaved(false)
        setSavedRecordId(null)
      } catch {
        // ignore
      }
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border disabled:opacity-50"
      style={{
        backgroundColor: saved ? 'rgba(201,146,60,0.12)' : 'transparent',
        color: saved ? 'var(--gold-primary)' : 'var(--text-muted)',
        borderColor: saved ? 'rgba(201,146,60,0.3)' : 'var(--border-subtle)',
      }}
    >
      <HeartIcon className="w-4 h-4" filled={saved} />
      {saved ? 'Saved' : 'Save College'}
    </button>
  )
}
