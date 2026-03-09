/**
 * College Deadline Scraper/Parser Design
 *
 * This script collects application deadlines from two sources:
 *   1. Official college admissions pages (primary)
 *   2. Common App Explore pages (fallback)
 *
 * Usage:
 *   npx tsx scripts/scrape-deadlines.ts [--college <unit_id>] [--cycle 2026] [--dry-run]
 *
 * Requires .env.local to have SUPABASE keys configured.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

// ─── Types ──────────────────────────────────────────────────────────

interface ScrapedDeadline {
    early_action_deadline: string | null
    early_decision_1_deadline: string | null
    early_decision_2_deadline: string | null
    regular_decision_deadline: string | null
    rolling_admission: boolean
    transfer_fall_deadline: string | null
    transfer_spring_deadline: string | null
    scholarship_priority_deadline: string | null
    fafsa_priority_deadline: string | null
    source_url: string
    source_type: 'official' | 'commonapp'
}

interface CollegeRecord {
    id: string
    unit_id: string
    name: string
    website: string | null
}

// ─── Validation Rules ───────────────────────────────────────────────

const VALIDATION_RULES = {
    /** Date must be in YYYY-MM-DD format */
    isValidDate(d: string | null): boolean {
        if (!d) return true // null is valid (means not set)
        return /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(new Date(d).getTime())
    },

    /** EA/ED1 should be Oct 15 – Nov 15 for most schools */
    isReasonableEarlyDeadline(d: string | null): boolean {
        if (!d) return true
        const month = new Date(d).getMonth() + 1
        return month >= 10 && month <= 12
    },

    /** ED2 should be Dec 15 – Jan 15 for most schools */
    isReasonableED2Deadline(d: string | null): boolean {
        if (!d) return true
        const month = new Date(d).getMonth() + 1
        return month === 12 || month === 1 || month === 2
    },

    /** RD should be Jan 1 – Feb 15 for most schools */
    isReasonableRDDeadline(d: string | null): boolean {
        if (!d) return true
        const month = new Date(d).getMonth() + 1
        return month >= 1 && month <= 3
    },

    /** Deadline should be in the current or next calendar year */
    isCurrentCycle(d: string | null, cycleYear: number): boolean {
        if (!d) return true
        const year = new Date(d).getFullYear()
        return year === cycleYear - 1 || year === cycleYear
    },

    /** Transfer deadlines are typically Feb – June */
    isReasonableTransferDeadline(d: string | null): boolean {
        if (!d) return true
        const month = new Date(d).getMonth() + 1
        return month >= 1 && month <= 8
    },

    /** Run all validations on a scraped deadline */
    validate(dl: ScrapedDeadline, cycleYear: number): string[] {
        const errors: string[] = []
        const dateFields = [
            'early_action_deadline', 'early_decision_1_deadline', 'early_decision_2_deadline',
            'regular_decision_deadline', 'transfer_fall_deadline', 'transfer_spring_deadline',
            'scholarship_priority_deadline', 'fafsa_priority_deadline',
        ] as const

        // All dates must be valid format
        for (const field of dateFields) {
            if (!this.isValidDate(dl[field])) {
                errors.push(`Invalid date format for ${field}: ${dl[field]}`)
            }
            if (!this.isCurrentCycle(dl[field], cycleYear)) {
                errors.push(`${field} (${dl[field]}) appears outside cycle ${cycleYear}`)
            }
        }

        // Reasonableness checks (warnings, not errors)
        if (!this.isReasonableEarlyDeadline(dl.early_action_deadline))
            errors.push(`EA deadline (${dl.early_action_deadline}) is outside typical Oct–Dec range`)
        if (!this.isReasonableEarlyDeadline(dl.early_decision_1_deadline))
            errors.push(`ED1 deadline (${dl.early_decision_1_deadline}) is outside typical Oct–Dec range`)
        if (!this.isReasonableED2Deadline(dl.early_decision_2_deadline))
            errors.push(`ED2 deadline (${dl.early_decision_2_deadline}) is outside typical Dec–Feb range`)
        if (!this.isReasonableRDDeadline(dl.regular_decision_deadline))
            errors.push(`RD deadline (${dl.regular_decision_deadline}) is outside typical Jan–Mar range`)

        // At least one deadline or rolling must be set
        const hasAny = dateFields.some(f => dl[f] !== null) || dl.rolling_admission
        if (!hasAny) {
            errors.push('No deadlines or rolling admission flag set')
        }

        // Source URL must be provided
        if (!dl.source_url || !dl.source_url.startsWith('http')) {
            errors.push('Missing or invalid source_url')
        }

        return errors
    },
}

// ─── Scraper: Official Page ─────────────────────────────────────────

async function scrapeOfficialPage(_college: CollegeRecord): Promise<ScrapedDeadline | null> {
    /**
     * DESIGN NOTE: In production, this would use Puppeteer/Playwright to:
     *
     * 1. Navigate to {college.website}/admissions or /apply
     * 2. Look for keywords: "early action", "early decision", "regular decision",
     *    "deadline", "rolling", "transfer"
     * 3. Extract dates from surrounding text using regex patterns:
     *    - "November 1" / "Nov 1" / "11/01" / "2025-11-01"
     * 4. Map extracted dates to the correct deadline type
     * 5. Return structured ScrapedDeadline
     *
     * Common page patterns:
     *   - Admissions table/list with deadlines
     *   - FAQ section with deadline info
     *   - Apply page with key dates sidebar
     *
     * Rate limiting: 2-second delay between requests
     * Retry: 3 attempts with exponential backoff
     */

    console.log(`  [official] Would scrape: ${_college.website ?? 'no website'}`)
    return null // Placeholder — implement with Puppeteer
}

// ─── Scraper: Common App ────────────────────────────────────────────

async function scrapeCommonApp(_college: CollegeRecord): Promise<ScrapedDeadline | null> {
    /**
     * DESIGN NOTE: In production, this would:
     *
     * 1. Search Common App Explore: https://www.commonapp.org/explore/{name}
     * 2. Parse the college's profile page for deadline data
     * 3. Common App typically provides:
     *    - Application type (EA/ED/RD)
     *    - Deadline dates
     *    - Rolling admission indicator
     *
     * Alternative: Use Common App's data files or API if available
     *
     * Rate limiting: 3-second delay (Common App is more restrictive)
     */

    console.log(`  [commonapp] Would scrape Common App for: ${_college.name}`)
    return null // Placeholder — implement with Puppeteer
}

// ─── Date Parser ────────────────────────────────────────────────────

/**
 * Parse natural-language dates into YYYY-MM-DD format.
 * Handles: "November 1, 2025", "Nov 1", "11/01/2025", "11/1"
 */
export function parseDeadlineDate(text: string, cycleYear: number): string | null {
    const cleaned = text.trim()

    // ISO format: 2025-11-01
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned

    // US format: 11/01/2025 or 11/1/2025
    const usMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (usMatch) {
        const [, m, d, y] = usMatch
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }

    // US short: 11/01 or 11/1
    const usShortMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})$/)
    if (usShortMatch) {
        const [, m, d] = usShortMatch
        const month = parseInt(m, 10)
        // If month >= 8, it's likely fall of cycle year - 1
        const year = month >= 8 ? cycleYear - 1 : cycleYear
        return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }

    // Written: "November 1, 2025" or "Nov 1, 2025" or "November 1"
    const monthNames: Record<string, string> = {
        january: '01', jan: '01', february: '02', feb: '02',
        march: '03', mar: '03', april: '04', apr: '04',
        may: '05', june: '06', jun: '06', july: '07', jul: '07',
        august: '08', aug: '08', september: '09', sep: '09', sept: '09',
        october: '10', oct: '10', november: '11', nov: '11',
        december: '12', dec: '12',
    }

    const writtenMatch = cleaned.match(
        /^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})(?:,?\s*(\d{4}))?$/i
    )
    if (writtenMatch) {
        const [, monthStr, dayStr, yearStr] = writtenMatch
        const mm = monthNames[monthStr.toLowerCase()]
        const dd = dayStr.padStart(2, '0')
        const month = parseInt(mm, 10)
        const yyyy = yearStr ?? (month >= 8 ? String(cycleYear - 1) : String(cycleYear))
        return `${yyyy}-${mm}-${dd}`
    }

    return null
}

// ─── Main Orchestrator ──────────────────────────────────────────────

async function main() {
    const args = process.argv.slice(2)
    const dryRun = args.includes('--dry-run')
    const cycleYear = parseInt(
        args[args.indexOf('--cycle') + 1] || '2026',
        10
    )
    const unitIdFilter = args.includes('--college')
        ? args[args.indexOf('--college') + 1]
        : null

    console.log(`\n🎓 College Deadline Scraper`)
    console.log(`   Cycle: ${cycleYear - 1}–${cycleYear}`)
    console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
    console.log()

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch colleges to scrape
    let query = supabase.from('colleges').select('id, unit_id, name, website')
    if (unitIdFilter) {
        query = query.eq('unit_id', unitIdFilter)
    } else {
        query = query.eq('level', 'four_year').order('enrollment', { ascending: false }).limit(50)
    }

    const { data: colleges, error } = await query
    if (error) {
        console.error('Failed to fetch colleges:', error.message)
        process.exit(1)
    }

    console.log(`Found ${colleges?.length ?? 0} colleges to process\n`)

    let processed = 0
    let scraped = 0
    let errors = 0

    for (const college of (colleges ?? []) as CollegeRecord[]) {
        processed++
        console.log(`[${processed}/${colleges!.length}] ${college.name}`)

        // Try official page first
        let result = await scrapeOfficialPage(college)
        let sourceType: 'official' | 'commonapp' = 'official'

        // Fallback to Common App
        if (!result) {
            result = await scrapeCommonApp(college)
            sourceType = 'commonapp'
        }

        if (!result) {
            console.log('  ⚠️  No data found from either source\n')
            continue
        }

        // Validate
        const validationErrors = VALIDATION_RULES.validate(result, cycleYear)
        if (validationErrors.length > 0) {
            console.log('  ⚠️  Validation issues:')
            validationErrors.forEach(e => console.log(`      - ${e}`))
        }

        // Determine verification status
        const verificationStatus =
            validationErrors.length > 0
                ? 'needs_review'
                : sourceType === 'official'
                    ? 'official_verified'
                    : 'commonapp_verified'

        if (!dryRun) {
            const { error: upsertError } = await supabase
                .from('college_deadlines')
                .upsert(
                    {
                        college_id: college.id,
                        cycle_year: cycleYear,
                        ...result,
                        source_type: sourceType,
                        verification_status: verificationStatus,
                        last_verified_at: new Date().toISOString(),
                        verified_by: 'scraper',
                    },
                    { onConflict: 'college_id,cycle_year' }
                )

            if (upsertError) {
                console.log(`  ❌ DB error: ${upsertError.message}`)
                errors++
            } else {
                console.log(`  ✅ Saved (${verificationStatus})`)
                scraped++
            }
        } else {
            console.log(`  [dry-run] Would save with status: ${verificationStatus}`)
            scraped++
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 2000))
        console.log()
    }

    console.log(`\n═══ Summary ═══`)
    console.log(`  Processed: ${processed}`)
    console.log(`  Scraped:   ${scraped}`)
    console.log(`  Errors:    ${errors}`)
    console.log()
}

main().catch(console.error)
