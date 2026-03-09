/**
 * Link existing scholarships to their corresponding colleges.
 * 
 * This script updates the college_id field on scholarships that were
 * ingested before the college_id column existed.
 *
 * Usage:
 *   npx tsx scripts/link-scholarships-to-colleges.ts [--dry-run]
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

// Map: scholarship name → college name (must match colleges.name in the DB)
const SCHOLARSHIP_TO_COLLEGE: Record<string, string> = {
    'Morehead-Cain Scholarship': 'University of North Carolina at Chapel Hill',
    'Robertson Scholars Leadership Program': 'Duke University',
    'Jefferson Scholars Foundation Scholarship': 'University of Virginia-Main Campus',
    'Cornelius Vanderbilt Scholarship': 'Vanderbilt University',
    'Ingram Scholars Program': 'Vanderbilt University',
    'Emory Scholars Program': 'Emory University',
    'Hesburgh-Yusko Scholars Program': 'University of Notre Dame',
    'Danforth Scholars Program': 'Washington University in St Louis',
    'USC Trustee Scholarship': 'University of Southern California',
    'USC Presidential Scholarship': 'University of Southern California',
    'BU Trustee Scholarship': 'Boston University',
    'NYU Presidential Honors Scholarship': 'New York University',
    "Tulane Dean's Honor Scholarship": 'Tulane University of Louisiana',
    'Tulane Academic Excellence Award': 'Tulane University of Louisiana',
    'Rice University Trustee Distinguished Scholarship': 'Rice University',
    '40 Acres Scholars Program': 'The University of Texas at Austin',
    'Case Western Reserve Merit Scholarship': 'Case Western Reserve University',
    'University of Rochester Scholarship': 'University of Rochester',
    'Northeastern University Merit Scholarship': 'Northeastern University',
}

async function main() {
    const dryRun = process.argv.includes('--dry-run')

    console.log('\n🔗 Link Scholarships to Colleges')
    console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}\n`)

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Load ALL colleges into a name → id map (paginate past Supabase 1000-row limit)
    console.log('Loading colleges…')
    const collegeMap = new Map<string, string>()
    let from = 0
    const PAGE = 1000
    while (true) {
        const { data: page, error: colErr } = await supabase
            .from('colleges')
            .select('id, name')
            .range(from, from + PAGE - 1)
        if (colErr) {
            console.error('Failed to load colleges:', colErr.message)
            process.exit(1)
        }
        for (const c of page ?? []) {
            collegeMap.set((c.name as string).toLowerCase(), c.id as string)
        }
        if (!page || page.length < PAGE) break
        from += PAGE
    }
    console.log(`  ${collegeMap.size} colleges loaded\n`)

    // 2. For each mapping, find the scholarship and update it
    let updated = 0
    let skipped = 0
    let errors = 0

    for (const [scholarshipName, collegeName] of Object.entries(SCHOLARSHIP_TO_COLLEGE)) {
        const collegeId = collegeMap.get(collegeName.toLowerCase())
        if (!collegeId) {
            console.log(`  ⚠  College not found: "${collegeName}" (for ${scholarshipName})`)
            errors++
            continue
        }

        // Find the scholarship by name
        const { data: scholarship, error: schErr } = await supabase
            .from('scholarships')
            .select('id, name, college_id')
            .eq('name', scholarshipName)
            .maybeSingle()

        if (schErr) {
            console.log(`  ❌ Error finding "${scholarshipName}": ${schErr.message}`)
            errors++
            continue
        }

        if (!scholarship) {
            console.log(`  ⚠  Scholarship not found: "${scholarshipName}"`)
            skipped++
            continue
        }

        if (scholarship.college_id === collegeId) {
            console.log(`  ⏭  Already linked: ${scholarshipName}`)
            skipped++
            continue
        }

        if (dryRun) {
            console.log(`  [dry-run] Would link: ${scholarshipName} → ${collegeName} (${collegeId})`)
            updated++
            continue
        }

        const { error: updateErr } = await supabase
            .from('scholarships')
            .update({ college_id: collegeId })
            .eq('id', scholarship.id)

        if (updateErr) {
            console.log(`  ❌ Failed to update "${scholarshipName}": ${updateErr.message}`)
            errors++
        } else {
            console.log(`  ✅ ${scholarshipName} → ${collegeName}`)
            updated++
        }
    }

    console.log('\n═══ Summary ═════════════════════════════════════════════')
    console.log(`  Updated: ${updated}`)
    console.log(`  Skipped: ${skipped}`)
    console.log(`  Errors:  ${errors}`)
    console.log()
}

main().catch(console.error)
