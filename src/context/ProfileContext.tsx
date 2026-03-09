'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { StudentProfile } from '@/lib/types'

const STORAGE_KEY = 'collegefind_profile'

const defaultProfile: StudentProfile = {
  gpa: 3.0,
  sat_total: null,
  act: null,
  intended_major: null,
  preferred_states: [],
  budget_max: null,
  campus_size: 'any',
}

interface ProfileContextValue {
  profile: StudentProfile | null
  hasProfile: boolean
  setProfile: (profile: StudentProfile) => void
  clearProfile: () => void
  isLoaded: boolean
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<StudentProfile | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setProfileState(JSON.parse(stored))
      }
    } catch {
      // ignore parse errors
    }
    setIsLoaded(true)
  }, [])

  const setProfile = useCallback((newProfile: StudentProfile) => {
    setProfileState(newProfile)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile))
  }, [])

  const clearProfile = useCallback(() => {
    setProfileState(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <ProfileContext.Provider
      value={{
        profile,
        hasProfile: profile !== null,
        setProfile,
        clearProfile,
        isLoaded,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
