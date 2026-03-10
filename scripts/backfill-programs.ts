/**
 * Backfill programs/majors for colleges from the College Scorecard API.
 *
 * Maps CIP (Classification of Instructional Programs) percentage fields
 * to human-readable MAJOR_OPTIONS categories. A college gets a major tag
 * if ≥ 2% of its degrees are in that CIP family.
 *
 * Run: npx tsx scripts/backfill-programs.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SCORECARD_API_KEY = process.env.SCORECARD_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SCORECARD_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing env vars: SCORECARD_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const SCORECARD_BASE = 'https://api.data.gov/ed/collegescorecard/v1/schools'
const PER_PAGE = 100
const THRESHOLD = 0.02 // 2% of degrees → include that major

/**
 * CIP code 2-digit families mapped to our MAJOR_OPTIONS labels.
 * College Scorecard uses fields like:
 *   latest.academics.program_percentage.agriculture
 *   latest.academics.program_percentage.business_marketing
 *   etc.
 */
const CIP_TO_MAJOR: Record<string, string[]> = {
    agriculture: ['Agriculture'],
    architecture: ['Architecture'],
    visual_performing: ['Arts & Design'],
    biological: ['Biology & Life Sciences'],
    business_marketing: ['Business & Management'],
    communication: ['Communications & Journalism'],
    computer: ['Computer Science & IT', 'Technology'],
    education: ['Education'],
    engineering: ['Engineering'],
    english: ['English & Literature'],
    resources: ['Environmental Science'],
    health: ['Health Sciences', 'Nursing'],
    history: ['History & Political Science'],
    legal: ['Law'],
    mathematics: ['Mathematics', 'Science'],
    physical_science: ['Science'],
    psychology: ['Psychology'],
    social_science: ['History & Political Science'],
    public_administration_social_service: ['Social Work'],
    security_law_enforcement: ['Criminal Justice'],
    // Less common mappings
    mechanic_repair_technology: ['Technology'],
    precision_production: ['Technology'],
    science_technology: ['Science', 'Technology'],
    construction: ['Architecture'],
    theology_religious_vocation: [],
    military: [],
    library: [],
    philosophy_religious: [],
    ethnic_cultural_gender: [],
    family_consumer_science: [],
    parks_recreation_fitness: [],
    transportation: [],
    multi_interdisciplinary: [],
    humanities: ['English & Literature'],
    personal_culinary: [],
}

// Build the Scorecard fields string
const PROGRAM_FIELDS = Object.keys(CIP_TO_MAJOR)
    .map(k => `latest.academics.program_percentage.${k}`)
    .join(',')

const FIELDS = `id,${PROGRAM_FIELDS}`

interface ScorecardResult {
    id: number
    [key: string]: number | null | string | undefined
}

function extractMajors(result: ScorecardResult): string[] {
    const majors = new Set<string>()

    for (const [cipKey, majorNames] of Object.entries(CIP_TO_MAJOR)) {
        const field = `latest.academics.program_percentage.${cipKey}`
        const pct = result[field]
        if (typeof pct === 'number' && pct >= THRESHOLD) {
            for (const m of majorNames) {
                majors.add(m)
            }
        }
    }

    return Array.from(majors).sort()
}

async function fetchPage(page: number): Promise<{ results: ScorecardResult[]; total: number }> {
    const url = new URL(SCORECARD_BASE)
    url.searchParams.set('api_key', SCORECARD_API_KEY!)
    url.searchParams.set('fields', FIELDS)
    url.searchParams.set('per_page', String(PER_PAGE))
    url.searchParams.set('page', String(page))
    url.searchParams.set('school.degrees_awarded.predominant__range', '1..4')
    url.searchParams.set('school.operating', '1')

    const response = await fetch(url.toString())
    if (!response.ok) {
        const text = await response.text()
        throw new Error(`Scorecard API error ${response.status}: ${text}`)
    }
    const json = await response.json()
    return {
        results: json.results ?? [],
        total: json.metadata?.total ?? 0,
    }
}

async function main() {
    console.log('📚 Backfilling programs/majors from College Scorecard')
    console.log('=====================================================')

    const firstPage = await fetchPage(0)
    const total = firstPage.total
    const totalPages = Math.ceil(total / PER_PAGE)
    console.log(`Total institutions: ${total}, Pages: ${totalPages}`)

    let updated = 0
    let errors = 0

    async function processPage(results: ScorecardResult[], pageNum: number) {
        const updates: { unit_id: string; programs: string[] }[] = []

        for (const r of results) {
            const majors = extractMajors(r)
            if (majors.length > 0) {
                updates.push({ unit_id: String(r.id), programs: majors })
            }
        }

        // Batch update via individual upserts (Supabase doesn't support batch partial updates well)
        for (const u of updates) {
            const { error } = await supabase
                .from('colleges')
                .update({ programs: u.programs })
                .eq('unit_id', u.unit_id)

            if (error) {
                console.error(`  ⚠ Error updating ${u.unit_id}: ${error.message}`)
                errors++
            } else {
                updated++
            }
        }

        console.log(`✅ Page ${pageNum + 1}/${totalPages} — ${updates.length} colleges updated (total: ${updated})`)
    }

    // Process first page
    await processPage(firstPage.results, 0)

    // Process remaining pages
    for (let page = 1; page < totalPages; page++) {
        await new Promise(resolve => setTimeout(resolve, 1100)) // Rate limit

        try {
            const { results } = await fetchPage(page)
            if (results.length === 0) break
            await processPage(results, page)
        } catch (e) {
            errors++
            console.error(`❌ Page ${page + 1} failed:`, e)
        }
    }

    console.log('')
    console.log('=====================================================')
    console.log(`🏁 Backfill complete! ${updated} colleges updated, ${errors} errors`)
}

main().catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
})
