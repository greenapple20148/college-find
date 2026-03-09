import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function check() {
    const { count } = await sb.from('colleges').select('*', { count: 'exact', head: true })
    console.log('Total colleges in DB:', count)

    const names = ['Harvard', 'Stanford', 'MIT', 'Michigan State', 'Duke', 'Princeton', 'Columbia', 'Cornell', 'Brown', 'Dartmouth', 'Penn', 'Rice', 'NYU', 'Boston']
    for (const n of names) {
        const { data } = await sb.from('colleges').select('id, name').ilike('name', '%' + n + '%').limit(5)
        console.log(`  "${n}":`, data?.map(d => d.name).join(' | ') || '❌ NOT FOUND')
    }
}
check()
