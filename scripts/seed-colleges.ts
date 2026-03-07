/**
 * College Scorecard API → Supabase Seeder
 *
 * Run: npx ts-node --esm scripts/seed-colleges.ts
 *
 * Required env vars (in .env.local or shell):
 *   SCORECARD_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SCORECARD_API_KEY = process.env.SCORECARD_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SCORECARD_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   SCORECARD_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log(SUPABASE_URL)
console.log(SUPABASE_SERVICE_KEY)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const SCORECARD_BASE = 'https://api.data.gov/ed/collegescorecard/v1/schools'
const PER_PAGE = 100

// Fields to request from the Scorecard API
const FIELDS = [
  'id',
  'school.name',
  'school.city',
  'school.state',
  'school.zip',
  'school.school_url',
  'school.ownership',
  'school.institutional_characteristics.level',
  'latest.student.size',
  'latest.cost.tuition.in_state',
  'latest.cost.tuition.out_of_state',
  'latest.cost.avg_net_price.overall',
  'latest.admissions.admission_rate.overall',
  'latest.admissions.sat_scores.25th_percentile.math',
  'latest.admissions.sat_scores.midpoint.math',
  'latest.admissions.sat_scores.75th_percentile.math',
  'latest.admissions.sat_scores.25th_percentile.read_write',
  'latest.admissions.sat_scores.midpoint.read_write',
  'latest.admissions.sat_scores.75th_percentile.read_write',
  'latest.admissions.act_scores.25th_percentile.cumulative',
  'latest.admissions.act_scores.midpoint.cumulative',
  'latest.admissions.act_scores.75th_percentile.cumulative',
  'latest.completion.rate_suppressed.overall',
  'latest.earnings.10_yrs_after_entry.median',
].join(',')

interface ScorecardResult {
  id: number
  'school.name': string
  'school.city': string
  'school.state': string
  'school.zip': string
  'school.school_url': string
  'school.ownership': number          // 1=public, 2=private_nonprofit, 3=private_forprofit
  'school.institutional_characteristics.level': number  // 1=four_year, 2=two_year, 3=<two_year
  'latest.student.size': number | null
  'latest.cost.tuition.in_state': number | null
  'latest.cost.tuition.out_of_state': number | null
  'latest.cost.avg_net_price.overall': number | null
  'latest.admissions.admission_rate.overall': number | null
  'latest.admissions.sat_scores.25th_percentile.math': number | null
  'latest.admissions.sat_scores.midpoint.math': number | null
  'latest.admissions.sat_scores.75th_percentile.math': number | null
  'latest.admissions.sat_scores.25th_percentile.read_write': number | null
  'latest.admissions.sat_scores.midpoint.read_write': number | null
  'latest.admissions.sat_scores.75th_percentile.read_write': number | null
  'latest.admissions.act_scores.25th_percentile.cumulative': number | null
  'latest.admissions.act_scores.midpoint.cumulative': number | null
  'latest.admissions.act_scores.75th_percentile.cumulative': number | null
  'latest.completion.rate_suppressed.overall': number | null
  'latest.earnings.10_yrs_after_entry.median': number | null
}

function mapControl(ownership: number): string {
  if (ownership === 1) return 'public'
  if (ownership === 2) return 'private_nonprofit'
  return 'private_forprofit'
}

function mapLevel(level: number): string {
  if (level === 1) return 'four_year'
  if (level === 2) return 'two_year'
  return 'less_than_two_year'
}

function mapSizeCategory(enrollment: number | null): string | null {
  if (enrollment === null) return null
  if (enrollment < 2000) return 'small'
  if (enrollment < 15000) return 'medium'
  return 'large'
}

function mapSchool(r: ScorecardResult) {
  const enrollment = r['latest.student.size'] ?? null
  return {
    unit_id: String(r.id),
    name: r['school.name'],
    city: r['school.city'] ?? null,
    state: r['school.state'] ?? null,
    zip: r['school.zip'] ?? null,
    website: r['school.school_url'] ?? null,
    control: mapControl(r['school.ownership']),
    level: mapLevel(r['school.institutional_characteristics.level']),
    enrollment,
    size_category: mapSizeCategory(enrollment),
    tuition_in_state: r['latest.cost.tuition.in_state'] ?? null,
    tuition_out_state: r['latest.cost.tuition.out_of_state'] ?? null,
    net_price: r['latest.cost.avg_net_price.overall'] ?? null,
    acceptance_rate: r['latest.admissions.admission_rate.overall'] ?? null,
    sat_math_25: r['latest.admissions.sat_scores.25th_percentile.math'] ?? null,
    sat_math_50: r['latest.admissions.sat_scores.midpoint.math'] ?? null,
    sat_math_75: r['latest.admissions.sat_scores.75th_percentile.math'] ?? null,
    sat_read_25: r['latest.admissions.sat_scores.25th_percentile.read_write'] ?? null,
    sat_read_50: r['latest.admissions.sat_scores.midpoint.read_write'] ?? null,
    sat_read_75: r['latest.admissions.sat_scores.75th_percentile.read_write'] ?? null,
    act_25: r['latest.admissions.act_scores.25th_percentile.cumulative'] ?? null,
    act_50: r['latest.admissions.act_scores.midpoint.cumulative'] ?? null,
    act_75: r['latest.admissions.act_scores.75th_percentile.cumulative'] ?? null,
    graduation_rate: r['latest.completion.rate_suppressed.overall'] ?? null,
    median_earnings: r['latest.earnings.10_yrs_after_entry.median'] ?? null,
    programs: [],
    updated_at: new Date().toISOString(),
  }
}

async function fetchPage(page: number): Promise<{ results: ScorecardResult[]; total: number }> {
  const url = new URL(SCORECARD_BASE)
  url.searchParams.set('api_key', SCORECARD_API_KEY!)
  url.searchParams.set('fields', FIELDS)
  url.searchParams.set('per_page', String(PER_PAGE))
  url.searchParams.set('page', String(page))
  // Filter: degree-granting (Carnegie level 1 or 2 = four-year/two-year), not null school name
  url.searchParams.set('school.degrees_awarded.predominant__range', '1..4')
  url.searchParams.set('school.operating', '1')  // operating institutions only

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

async function upsertBatch(rows: ReturnType<typeof mapSchool>[]) {
  const { error } = await supabase
    .from('colleges')
    .upsert(rows, { onConflict: 'unit_id' })

  if (error) {
    throw new Error(`Supabase upsert error: ${error.message}`)
  }
}

async function main() {
  console.log('🎓 CollegeMatch Seed Script — College Scorecard API')
  console.log('======================================================')
  console.log(`Target: ${SUPABASE_URL}`)
  console.log('')

  // Fetch first page to get total count
  console.log('Fetching page 1 to determine total count...')
  const firstPage = await fetchPage(0)
  const total = firstPage.total
  const totalPages = Math.ceil(total / PER_PAGE)

  console.log(`📊 Total institutions from API: ${total}`)
  console.log(`📄 Pages to fetch: ${totalPages}`)
  console.log('')

  let inserted = 0
  let errors = 0

  // Process first page
  const firstBatch = firstPage.results.map(mapSchool)
  try {
    await upsertBatch(firstBatch)
    inserted += firstBatch.length
    console.log(`✅ Page 1/${totalPages} — ${firstBatch.length} records upserted (total: ${inserted})`)
  } catch (e) {
    errors++
    console.error(`❌ Page 1 failed:`, e)
  }

  // Process remaining pages
  for (let page = 1; page < totalPages; page++) {
    // Rate limit: 1 req/second to stay within api.data.gov limits
    await new Promise(resolve => setTimeout(resolve, 1100))

    try {
      const { results } = await fetchPage(page)
      if (results.length === 0) break

      const batch = results.map(mapSchool)
      await upsertBatch(batch)
      inserted += batch.length
      console.log(`✅ Page ${page + 1}/${totalPages} — ${batch.length} records upserted (total: ${inserted})`)
    } catch (e) {
      errors++
      console.error(`❌ Page ${page + 1} failed:`, e)
      // Continue on errors — don't abort entire seed
    }
  }

  console.log('')
  console.log('======================================================')
  console.log(`🏁 Seed complete!`)
  console.log(`   Records upserted: ${inserted}`)
  console.log(`   Pages with errors: ${errors}`)
  console.log('')

  if (errors > 0) {
    console.log(`⚠️  ${errors} page(s) had errors. Re-run the script to retry (upserts are idempotent).`)
  } else {
    console.log('✨ All pages seeded successfully. Check Supabase dashboard to verify.')
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
