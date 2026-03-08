import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminDeadlinesPage from './AdminDeadlinesPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Deadline Admin — CollegeFind',
    description: 'Admin dashboard for reviewing and verifying college application deadlines.',
    robots: 'noindex, nofollow',
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)

export default async function Page() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
        redirect('/')
    }

    return <AdminDeadlinesPage />
}
