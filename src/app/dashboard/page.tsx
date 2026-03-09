import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { DashboardClient } from './DashboardClient'
import type { SavedCollege, UserProfile } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard')
  }

  const service = createServiceClient()

  const [savedResult, profileResult] = await Promise.all([
    service
      .from('saved_colleges')
      .select('*, college:colleges(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    service
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single(),
  ])

  const saved = (savedResult.data ?? []) as SavedCollege[]
  const profile = (profileResult.error?.code === 'PGRST116' ? null : profileResult.data) as UserProfile | null

  return <DashboardClient saved={saved} profile={profile} userEmail={user.email ?? ''} />
}
