/**
 * Seed College Deadlines for 2025-2026 Application Cycle
 *
 * Run: npx tsx scripts/seed-deadlines.ts
 *
 * This script populates the college_deadlines table with common
 * application deadline data for popular U.S. universities.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const CYCLE_YEAR = 2026

// ═══════════════════════════════════════════════════════════════
// Well-known deadlines for popular U.S. colleges (2025-2026 cycle)
// Format: [college_name_pattern, deadlines]
// ═══════════════════════════════════════════════════════════════

interface DeadlineData {
    name_pattern: string
    early_action_deadline?: string
    early_decision_1_deadline?: string
    early_decision_2_deadline?: string
    regular_decision_deadline?: string
    rolling_admission?: boolean
    transfer_fall_deadline?: string
    scholarship_priority_deadline?: string
    fafsa_priority_deadline?: string
    source_url: string
}

const DEADLINES: DeadlineData[] = [
    // ── Ivy League ──────────────────────────────────────────────
    {
        name_pattern: 'Harvard',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-01',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-02-01',
        source_url: 'https://college.harvard.edu/admissions/apply',
    },
    {
        name_pattern: 'Yale',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-02',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-03-01',
        source_url: 'https://admissions.yale.edu/apply',
    },
    {
        name_pattern: 'Princeton',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-01',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-02-01',
        source_url: 'https://admission.princeton.edu/apply',
    },
    {
        name_pattern: 'Columbia University in the City of New York',
        early_decision_1_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-01',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://undergrad.admissions.columbia.edu/apply',
    },
    {
        name_pattern: 'University of Pennsylvania',
        early_decision_1_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-05',
        transfer_fall_deadline: '2026-03-15',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://admissions.upenn.edu/admissions-and-financial-aid/apply',
    },
    {
        name_pattern: 'Brown',
        early_decision_1_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-05',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-02-01',
        source_url: 'https://admission.brown.edu/apply',
    },
    {
        name_pattern: 'Dartmouth',
        early_decision_1_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-02',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-02-01',
        source_url: 'https://admissions.dartmouth.edu/apply',
    },
    {
        name_pattern: 'Cornell',
        early_decision_1_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-02',
        transfer_fall_deadline: '2026-03-15',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://admissions.cornell.edu/apply',
    },

    // ── Top Universities ────────────────────────────────────────
    {
        name_pattern: 'Stanford',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-05',
        transfer_fall_deadline: '2026-03-15',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://admission.stanford.edu/apply',
    },
    {
        name_pattern: 'Massachusetts Institute of Technology',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-05',
        transfer_fall_deadline: '2026-03-15',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://mitadmissions.org/apply',
    },
    {
        name_pattern: 'California Institute of Technology',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-03',
        fafsa_priority_deadline: '2026-03-02',
        source_url: 'https://www.admissions.caltech.edu/apply',
    },
    {
        name_pattern: 'Duke',
        early_decision_1_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-03',
        transfer_fall_deadline: '2026-03-15',
        fafsa_priority_deadline: '2026-03-01',
        source_url: 'https://admissions.duke.edu/apply',
    },
    {
        name_pattern: 'Northwestern',
        early_decision_1_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-03',
        transfer_fall_deadline: '2026-03-15',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://admissions.northwestern.edu/apply',
    },
    {
        name_pattern: 'Johns Hopkins',
        early_decision_1_deadline: '2025-11-01',
        early_decision_2_deadline: '2026-01-02',
        regular_decision_deadline: '2026-01-02',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://apply.jhu.edu',
    },
    {
        name_pattern: 'Rice',
        early_decision_1_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-04',
        transfer_fall_deadline: '2026-03-15',
        fafsa_priority_deadline: '2026-03-01',
        source_url: 'https://admission.rice.edu/apply',
    },
    {
        name_pattern: 'Vanderbilt',
        early_decision_1_deadline: '2025-11-01',
        early_decision_2_deadline: '2026-01-01',
        regular_decision_deadline: '2026-01-01',
        scholarship_priority_deadline: '2025-11-01',
        fafsa_priority_deadline: '2026-02-01',
        source_url: 'https://admissions.vanderbilt.edu/apply',
    },
    {
        name_pattern: 'Georgetown',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-10',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-02-01',
        source_url: 'https://admissions.georgetown.edu/apply',
    },
    {
        name_pattern: 'Emory',
        early_decision_1_deadline: '2025-11-01',
        early_decision_2_deadline: '2026-01-01',
        regular_decision_deadline: '2026-01-01',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://apply.emory.edu',
    },
    {
        name_pattern: 'University of Notre Dame',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-01',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://admissions.nd.edu/apply',
    },
    {
        name_pattern: 'Carnegie Mellon',
        early_decision_1_deadline: '2025-11-01',
        early_decision_2_deadline: '2026-01-03',
        regular_decision_deadline: '2026-01-03',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://admission.enrollment.cmu.edu/apply',
    },
    {
        name_pattern: 'University of Virginia',
        early_action_deadline: '2025-11-01',
        early_decision_1_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-05',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-03-01',
        source_url: 'https://admission.virginia.edu/apply',
    },
    {
        name_pattern: 'Wake Forest',
        early_decision_1_deadline: '2025-11-15',
        early_decision_2_deadline: '2026-01-01',
        regular_decision_deadline: '2026-01-01',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://admissions.wfu.edu/apply',
    },
    {
        name_pattern: 'Tufts',
        early_decision_1_deadline: '2025-11-01',
        early_decision_2_deadline: '2026-01-04',
        regular_decision_deadline: '2026-01-04',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://admissions.tufts.edu/apply',
    },
    {
        name_pattern: 'New York University',
        early_decision_1_deadline: '2025-11-01',
        early_decision_2_deadline: '2026-01-01',
        regular_decision_deadline: '2026-01-05',
        transfer_fall_deadline: '2026-04-01',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply.html',
    },
    {
        name_pattern: 'Boston College',
        early_decision_1_deadline: '2025-11-01',
        early_decision_2_deadline: '2026-01-02',
        regular_decision_deadline: '2026-01-02',
        fafsa_priority_deadline: '2026-02-01',
        source_url: 'https://www.bc.edu/bc-web/admission/apply.html',
    },
    {
        name_pattern: 'Boston University',
        early_decision_1_deadline: '2025-11-01',
        early_decision_2_deadline: '2026-01-04',
        regular_decision_deadline: '2026-01-04',
        transfer_fall_deadline: '2026-04-01',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://www.bu.edu/admissions/apply',
    },
    {
        name_pattern: 'University of Southern California',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-15',
        scholarship_priority_deadline: '2025-12-01',
        fafsa_priority_deadline: '2026-03-02',
        source_url: 'https://admission.usc.edu/apply',
    },

    // ── Large Public Universities ───────────────────────────────
    {
        name_pattern: 'University of Michigan-Ann Arbor',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-02-01',
        transfer_fall_deadline: '2026-02-01',
        scholarship_priority_deadline: '2025-11-01',
        fafsa_priority_deadline: '2026-04-30',
        source_url: 'https://admissions.umich.edu/apply',
    },
    {
        name_pattern: 'University of California-Berkeley',
        regular_decision_deadline: '2025-11-30',
        transfer_fall_deadline: '2025-11-30',
        fafsa_priority_deadline: '2026-03-02',
        source_url: 'https://admissions.berkeley.edu/apply',
    },
    {
        name_pattern: 'University of California-Los Angeles',
        regular_decision_deadline: '2025-11-30',
        transfer_fall_deadline: '2025-11-30',
        fafsa_priority_deadline: '2026-03-02',
        source_url: 'https://admission.ucla.edu/apply',
    },
    {
        name_pattern: 'University of California-San Diego',
        regular_decision_deadline: '2025-11-30',
        transfer_fall_deadline: '2025-11-30',
        fafsa_priority_deadline: '2026-03-02',
        source_url: 'https://admissions.ucsd.edu/apply',
    },
    {
        name_pattern: 'University of California-Davis',
        regular_decision_deadline: '2025-11-30',
        transfer_fall_deadline: '2025-11-30',
        fafsa_priority_deadline: '2026-03-02',
        source_url: 'https://admissions.ucdavis.edu/apply',
    },
    {
        name_pattern: 'University of California-Irvine',
        regular_decision_deadline: '2025-11-30',
        transfer_fall_deadline: '2025-11-30',
        fafsa_priority_deadline: '2026-03-02',
        source_url: 'https://admissions.uci.edu/apply',
    },
    {
        name_pattern: 'University of California-Santa Barbara',
        regular_decision_deadline: '2025-11-30',
        transfer_fall_deadline: '2025-11-30',
        fafsa_priority_deadline: '2026-03-02',
        source_url: 'https://admissions.sa.ucsb.edu/apply',
    },
    {
        name_pattern: 'University of California-Santa Cruz',
        regular_decision_deadline: '2025-11-30',
        transfer_fall_deadline: '2025-11-30',
        fafsa_priority_deadline: '2026-03-02',
        source_url: 'https://admissions.ucsc.edu/apply',
    },
    {
        name_pattern: 'University of California-Riverside',
        regular_decision_deadline: '2025-11-30',
        transfer_fall_deadline: '2025-11-30',
        fafsa_priority_deadline: '2026-03-02',
        source_url: 'https://admissions.ucr.edu/apply',
    },
    {
        name_pattern: 'University of Texas at Austin',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2025-12-01',
        transfer_fall_deadline: '2026-03-01',
        scholarship_priority_deadline: '2025-12-01',
        fafsa_priority_deadline: '2026-03-15',
        source_url: 'https://admissions.utexas.edu/apply',
    },
    {
        name_pattern: 'Georgia Institute of Technology',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-04',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://admission.gatech.edu/apply',
    },
    {
        name_pattern: 'University of Florida',
        regular_decision_deadline: '2025-11-01',
        transfer_fall_deadline: '2026-03-01',
        scholarship_priority_deadline: '2025-10-15',
        fafsa_priority_deadline: '2025-12-15',
        source_url: 'https://admissions.ufl.edu/apply',
    },
    {
        name_pattern: 'University of North Carolina at Chapel Hill',
        early_action_deadline: '2025-10-15',
        regular_decision_deadline: '2026-01-15',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-03-01',
        source_url: 'https://admissions.unc.edu/apply',
    },
    {
        name_pattern: 'University of Wisconsin-Madison',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-02-01',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-04-01',
        source_url: 'https://admissions.wisc.edu/apply',
    },
    {
        name_pattern: 'University of Illinois Urbana-Champaign',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-05',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-03-15',
        source_url: 'https://admissions.illinois.edu/apply',
    },
    {
        name_pattern: 'Ohio State University',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-02-01',
        rolling_admission: true,
        transfer_fall_deadline: '2026-05-01',
        fafsa_priority_deadline: '2026-02-01',
        source_url: 'https://admissions.osu.edu/apply',
    },
    {
        name_pattern: 'Pennsylvania State University',
        rolling_admission: true,
        regular_decision_deadline: '2025-11-30',
        scholarship_priority_deadline: '2025-11-30',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://admissions.psu.edu/apply',
    },
    {
        name_pattern: 'Purdue University',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-15',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-03-01',
        source_url: 'https://admissions.purdue.edu/apply',
    },
    {
        name_pattern: 'University of Washington-Seattle',
        regular_decision_deadline: '2025-11-15',
        transfer_fall_deadline: '2026-02-15',
        fafsa_priority_deadline: '2026-02-28',
        source_url: 'https://admit.washington.edu/apply',
    },
    {
        name_pattern: 'University of Maryland',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-20',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-02-15',
        source_url: 'https://admissions.umd.edu/apply',
    },
    {
        name_pattern: 'Virginia Tech',
        early_action_deadline: '2025-11-01',
        early_decision_1_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-15',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-03-01',
        source_url: 'https://admissions.vt.edu/apply',
    },
    {
        name_pattern: 'University of Minnesota-Twin Cities',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-01-01',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-03-01',
        source_url: 'https://admissions.tc.umn.edu/apply',
    },
    {
        name_pattern: 'Indiana University-Bloomington',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-02-01',
        rolling_admission: true,
        fafsa_priority_deadline: '2026-04-15',
        source_url: 'https://admissions.indiana.edu/apply',
    },
    {
        name_pattern: 'University of Pittsburgh',
        rolling_admission: true,
        scholarship_priority_deadline: '2025-12-01',
        fafsa_priority_deadline: '2026-03-01',
        source_url: 'https://admissions.pitt.edu/apply',
    },
    {
        name_pattern: 'Rutgers University-New Brunswick',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2025-12-01',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2025-12-01',
        source_url: 'https://admissions.rutgers.edu/apply',
    },
    {
        name_pattern: 'Florida State University',
        regular_decision_deadline: '2026-01-15',
        transfer_fall_deadline: '2026-05-01',
        scholarship_priority_deadline: '2025-10-15',
        fafsa_priority_deadline: '2025-12-01',
        source_url: 'https://admissions.fsu.edu/apply',
    },
    {
        name_pattern: 'University of Georgia',
        early_action_deadline: '2025-10-15',
        regular_decision_deadline: '2026-01-01',
        transfer_fall_deadline: '2026-03-01',
        fafsa_priority_deadline: '2026-03-01',
        source_url: 'https://admissions.uga.edu/apply',
    },
    {
        name_pattern: 'Texas A & M',
        regular_decision_deadline: '2025-12-01',
        transfer_fall_deadline: '2026-03-15',
        scholarship_priority_deadline: '2025-12-01',
        fafsa_priority_deadline: '2026-03-15',
        source_url: 'https://admissions.tamu.edu/apply',
    },
    {
        name_pattern: 'Arizona State University',
        rolling_admission: true,
        scholarship_priority_deadline: '2025-11-01',
        fafsa_priority_deadline: '2026-01-15',
        source_url: 'https://admission.asu.edu/apply',
    },
    {
        name_pattern: 'Michigan State University',
        early_action_deadline: '2025-11-01',
        regular_decision_deadline: '2026-02-01',
        rolling_admission: true,
        scholarship_priority_deadline: '2025-11-01',
        fafsa_priority_deadline: '2026-03-01',
        source_url: 'https://admissions.msu.edu/apply',
    },
]

// Exact name mappings — maps our pattern to the exact DB name
// This avoids false matches like "Brown" → "John Brown University"
const EXACT_NAMES: Record<string, string> = {
    'Harvard': 'Harvard University',
    'Yale': 'Yale University',
    'Princeton': 'Princeton University',
    'Columbia University in the City of New York': 'Columbia University in the City of New York',
    'University of Pennsylvania': 'University of Pennsylvania',
    'Brown': 'Brown University',
    'Dartmouth': 'Dartmouth College',
    'Cornell': 'Cornell University',
    'Stanford': 'Stanford University',
    'Massachusetts Institute of Technology': 'Massachusetts Institute of Technology',
    'California Institute of Technology': 'California Institute of Technology',
    'Duke': 'Duke University',
    'Northwestern': 'Northwestern University',
    'Johns Hopkins': 'Johns Hopkins University',
    'Rice': 'Rice University',
    'Vanderbilt': 'Vanderbilt University',
    'Georgetown': 'Georgetown University',
    'Emory': 'Emory University',
    'University of Notre Dame': 'University of Notre Dame',
    'Carnegie Mellon': 'Carnegie Mellon University',
    'University of Virginia': 'University of Virginia-Main Campus',
    'Wake Forest': 'Wake Forest University',
    'Tufts': 'Tufts University',
    'New York University': 'New York University',
    'Boston College': 'Boston College',
    'Boston University': 'Boston University',
    'University of Southern California': 'University of Southern California',
    'University of Michigan-Ann Arbor': 'University of Michigan-Ann Arbor',
    'University of California-Berkeley': 'University of California-Berkeley',
    'University of California-Los Angeles': 'University of California-Los Angeles',
    'University of California-San Diego': 'University of California-San Diego',
    'University of California-Davis': 'University of California-Davis',
    'University of California-Irvine': 'University of California-Irvine',
    'University of California-Santa Barbara': 'University of California-Santa Barbara',
    'University of California-Santa Cruz': 'University of California-Santa Cruz',
    'University of California-Riverside': 'University of California-Riverside',
    'University of Texas at Austin': 'The University of Texas at Austin',
    'Georgia Institute of Technology': 'Georgia Institute of Technology-Main Campus',
    'University of Florida': 'University of Florida',
    'University of North Carolina at Chapel Hill': 'University of North Carolina at Chapel Hill',
    'University of Wisconsin-Madison': 'University of Wisconsin-Madison',
    'University of Illinois Urbana-Champaign': 'University of Illinois Urbana-Champaign',
    'Ohio State University': 'Ohio State University-Main Campus',
    'Pennsylvania State University': 'Pennsylvania State University-Main Campus',
    'Purdue University': 'Purdue University-Main Campus',
    'University of Washington-Seattle': 'University of Washington-Seattle Campus',
    'University of Maryland': 'University of Maryland-College Park',
    'Virginia Tech': 'Virginia Polytechnic Institute and State University',
    'University of Minnesota-Twin Cities': 'University of Minnesota-Twin Cities',
    'Indiana University-Bloomington': 'Indiana University-Bloomington',
    'University of Pittsburgh': 'University of Pittsburgh-Pittsburgh Campus',
    'Rutgers University-New Brunswick': 'Rutgers University-New Brunswick',
    'Florida State University': 'Florida State University',
    'University of Georgia': 'University of Georgia',
    'Texas A & M': 'Texas A & M University-College Station',
    'Arizona State University': 'Arizona State University Campus Immersion',
    'Michigan State University': 'Michigan State University',
}

async function main() {
    console.log(`\n🎓 Seeding college deadlines for ${CYCLE_YEAR} cycle...\n`)

    // Fetch ALL colleges (paginated in batches of 1000)
    const allColleges: { id: string; name: string }[] = []
    let offset = 0
    const batchSize = 1000
    while (true) {
        const { data, error } = await supabase
            .from('colleges')
            .select('id, name')
            .range(offset, offset + batchSize - 1)
        if (error) {
            console.error('❌ Failed to fetch colleges:', error.message)
            process.exit(1)
        }
        if (!data || data.length === 0) break
        allColleges.push(...data)
        console.log(`  📦 Fetched batch ${Math.floor(offset / batchSize) + 1}: ${data.length} colleges`)
        if (data.length < batchSize) break
        offset += batchSize
    }

    console.log(`📚 Total colleges in DB: ${allColleges.length}`)

    // Build a lookup map: lowercase name → college
    const nameMap = new Map<string, { id: string; name: string }>()
    for (const c of allColleges) {
        nameMap.set(c.name.toLowerCase(), c)
    }

    let matched = 0
    let skipped = 0
    let errors = 0

    for (const deadline of DEADLINES) {
        // Look up the exact DB name for this pattern
        const exactName = EXACT_NAMES[deadline.name_pattern]
        const college = exactName
            ? nameMap.get(exactName.toLowerCase())
            : undefined

        if (!college) {
            console.log(`  ⚠️  No match for "${deadline.name_pattern}" — skipped`)
            skipped++
            continue
        }

        const record: Record<string, unknown> = {
            college_id: college.id,
            cycle_year: CYCLE_YEAR,
            source_url: deadline.source_url,
            source_type: 'manual',
            verification_status: 'needs_review',
            verified_by: 'seed-script',
            last_verified_at: new Date().toISOString(),
        }

        // Only set fields that are defined
        if (deadline.early_action_deadline) record.early_action_deadline = deadline.early_action_deadline
        if (deadline.early_decision_1_deadline) record.early_decision_1_deadline = deadline.early_decision_1_deadline
        if (deadline.early_decision_2_deadline) record.early_decision_2_deadline = deadline.early_decision_2_deadline
        if (deadline.regular_decision_deadline) record.regular_decision_deadline = deadline.regular_decision_deadline
        if (deadline.rolling_admission !== undefined) record.rolling_admission = deadline.rolling_admission
        if (deadline.transfer_fall_deadline) record.transfer_fall_deadline = deadline.transfer_fall_deadline
        if (deadline.scholarship_priority_deadline) record.scholarship_priority_deadline = deadline.scholarship_priority_deadline
        if (deadline.fafsa_priority_deadline) record.fafsa_priority_deadline = deadline.fafsa_priority_deadline

        const { error } = await supabase
            .from('college_deadlines')
            .upsert(record, { onConflict: 'college_id,cycle_year' })

        if (error) {
            console.log(`  ❌ Error for "${college.name}": ${error.message}`)
            errors++
        } else {
            console.log(`  ✅ ${college.name}`)
            matched++
        }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`✅ Inserted/updated: ${matched}`)
    console.log(`⚠️  Skipped (no match): ${skipped}`)
    console.log(`❌ Errors: ${errors}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
}

main().catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
})
