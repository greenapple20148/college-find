/**
 * University Scholarship Crawler
 *
 * Crawls public financial aid / scholarship pages from colleges in the DB
 * to discover and ingest institutional merit scholarships.
 *
 * For each college it tries common URL patterns, parses static HTML for
 * scholarship names, amounts, GPA requirements, and deadlines, then upserts
 * findings into the scholarships table.
 *
 * Usage:
 *   npx tsx scripts/crawl-university-scholarships.ts [options]
 *
 * Options:
 *   --dry-run              Print what would be inserted without touching DB
 *   --limit <n>            Max colleges to process (default: 100)
 *   --college <unit_id>    Process a single college by unit_id
 *   --min-enrollment <n>   Only crawl colleges with enrollment >= n (default: 2000)
 *
 * Requires .env.local to have SUPABASE keys configured.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CollegeRow {
  id: string
  unit_id: string
  name: string
  website: string | null
  state: string | null
}

interface ScholarshipRecord {
  name: string
  provider: string | null
  amount: number | null
  amount_type: 'fixed' | 'per_year' | 'full_tuition' | 'varies'
  gpa_min: number | null
  states: string[]
  majors: string[]
  deadline: string | null
  website: string | null
  description: string | null
}

// ─── URL patterns to try for each college ─────────────────────────────────────

const SCHOLARSHIP_PATH_PATTERNS = [
  '/scholarships',
  '/merit-scholarships',
  '/admissions/scholarships',
  '/admissions/merit-scholarships',
  '/admissions/cost-aid/scholarships',
  '/admissions/tuition-aid/scholarships',
  '/financial-aid/scholarships',
  '/financial-aid/merit-scholarships',
  '/financial-aid/grants-scholarships',
  '/financialaid/scholarships',
  '/undergraduate-admission/scholarships',
  '/undergraduate-admission/cost-and-aid/scholarships',
  '/undergraduate-admissions/scholarships',
  '/costs-aid/scholarships',
  '/tuition-aid/scholarships',
  '/aid/scholarships',
  '/academics/scholarships',
]

// ─── HTML Parsing Helpers ──────────────────────────────────────────────────────

/** Strip all HTML tags, decode common entities, collapse whitespace */
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** Extract headings that look like scholarship/award names */
function extractScholarshipHeadings(html: string): string[] {
  const headingRe = /<h[2-5][^>]*>([\s\S]*?)<\/h[2-5]>/gi
  const results: string[] = []
  let m: RegExpExecArray | null
  while ((m = headingRe.exec(html)) !== null) {
    const text = stripHtml(m[1]).trim()
    if (
      text.length > 5 && text.length < 120 &&
      /scholarship|award|fellowship|grant|merit|honor/i.test(text)
    ) {
      results.push(text)
    }
  }
  return [...new Set(results)]
}

const MONTH_MAP: Record<string, string> = {
  january: '01', jan: '01', february: '02', feb: '02', march: '03', mar: '03',
  april: '04', apr: '04', may: '05', june: '06', jun: '06',
  july: '07', jul: '07', august: '08', aug: '08',
  september: '09', sep: '09', sept: '09', october: '10', oct: '10',
  november: '11', nov: '11', december: '12', dec: '12',
}

/** Parse "November 1, 2026" / "Nov 1" patterns → YYYY-MM-DD */
function parseDate(text: string): string | null {
  const m = text.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})(?:,?\s*(\d{4}))?/i
  )
  if (!m) return null
  const mm = MONTH_MAP[m[1].toLowerCase()]
  const dd = m[2].padStart(2, '0')
  const monthNum = parseInt(mm, 10)
  const yyyy = m[3] ?? (monthNum >= 7 ? '2025' : '2026')
  return `${yyyy}-${mm}-${dd}`
}

/** Extract the largest plausible scholarship dollar amount from text */
function extractAmount(text: string): { amount: number; type: 'per_year' | 'fixed' | 'full_tuition' } | null {
  if (/full[\s-]tuition|full[\s-]ride|full[\s-]cost|full scholarship/i.test(text)) {
    return { amount: 0, type: 'full_tuition' }
  }
  const perYear = text.match(/\$(\d{1,3}(?:,\d{3})*)\s*(?:per year|\/year|a year|annually|each year)/i)
  if (perYear) {
    const n = parseInt(perYear[1].replace(/,/g, ''), 10)
    if (n >= 500 && n <= 100000) return { amount: n, type: 'per_year' }
  }
  const all = [...text.matchAll(/\$(\d{1,3}(?:,\d{3})*)/g)]
  const amounts = all
    .map(m => parseInt(m[1].replace(/,/g, ''), 10))
    .filter(n => n >= 500 && n <= 100000)
    .sort((a, b) => b - a)
  if (amounts.length) return { amount: amounts[0], type: 'fixed' }
  return null
}

/** Extract a GPA minimum from text like "3.5 GPA" or "minimum GPA of 3.0" */
function extractGpa(text: string): number | null {
  const m = text.match(/(?:minimum\s+)?GPA\s+(?:of\s+)?(\d+\.\d+)|(\d+\.\d+)\s+(?:or\s+higher\s+)?GPA/i)
  if (!m) return null
  const val = parseFloat(m[1] ?? m[2])
  return val >= 2.0 && val <= 4.0 ? val : null
}

/** Extract a deadline date from text near the word "deadline" */
function extractDeadline(text: string): string | null {
  const idx = text.toLowerCase().indexOf('deadline')
  if (idx === -1) return null
  const window = text.slice(Math.max(0, idx - 30), idx + 150)
  return parseDate(window)
}

/**
 * From an HTML page, extract one ScholarshipRecord per discovered scholarship heading.
 * Falls back to one generic record for the page if no headings found.
 */
function parseScholarshipsFromPage(
  html: string,
  pageUrl: string,
  college: CollegeRow
): ScholarshipRecord[] {
  const plain = stripHtml(html)
  const headings = extractScholarshipHeadings(html)

  // Try to extract individual scholarship records from headings
  if (headings.length > 0) {
    const records: ScholarshipRecord[] = []

    for (const heading of headings.slice(0, 8)) { // cap at 8 per page
      // Find the heading in the plain text and grab the next 600 chars as context
      const hi = plain.indexOf(heading)
      const context = hi >= 0 ? plain.slice(hi, hi + 600) : plain.slice(0, 600)

      const amountData = extractAmount(context)
      const gpa = extractGpa(context)
      const deadline = extractDeadline(context)

      records.push({
        name: heading,
        provider: college.name,
        amount: amountData?.type === 'full_tuition' ? null : (amountData?.amount ?? null),
        amount_type: amountData?.type ?? 'varies',
        gpa_min: gpa,
        states: [],
        majors: [],
        deadline,
        website: pageUrl,
        description: `Institutional merit scholarship at ${college.name}. See ${pageUrl} for full eligibility details and application instructions.`,
      })
    }

    return records
  }

  // Fallback: one generic record pointing to the financial aid page
  const amountData = extractAmount(plain.slice(0, 3000))
  const gpa = extractGpa(plain.slice(0, 3000))
  const deadline = extractDeadline(plain.slice(0, 3000))

  return [{
    name: `${college.name} Merit Scholarship`,
    provider: college.name,
    amount: amountData?.type === 'full_tuition' ? null : (amountData?.amount ?? null),
    amount_type: amountData?.type ?? 'varies',
    gpa_min: gpa,
    states: [],
    majors: [],
    deadline,
    website: pageUrl,
    description: `Institutional merit scholarship at ${college.name}. Visit ${pageUrl} for eligibility requirements, amounts, and deadlines.`,
  }]
}

// ─── HTTP Helpers ──────────────────────────────────────────────────────────────

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; CollegeMatchBot/1.0; scholarship research)',
  Accept: 'text/html,application/xhtml+xml',
}

async function headOk(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 6000)
    const res = await fetch(url, { method: 'HEAD', headers: HEADERS, signal: ctrl.signal, redirect: 'follow' })
    clearTimeout(timer)
    return res.ok && (res.headers.get('content-type') ?? '').includes('text/html')
  } catch {
    return false
  }
}

async function getHtml(url: string): Promise<string | null> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 12000)
    const res = await fetch(url, { headers: HEADERS, signal: ctrl.signal, redirect: 'follow' })
    clearTimeout(timer)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

/** Try URL patterns until one returns HTML, return {url, html} or null */
async function findScholarshipPage(
  baseUrl: string
): Promise<{ url: string; html: string } | null> {
  // Normalize base URL (remove trailing slash)
  const base = baseUrl.replace(/\/$/, '').replace(/^http:/, 'https:')

  for (const path of SCHOLARSHIP_PATH_PATTERNS) {
    const url = `${base}${path}`
    if (await headOk(url)) {
      const html = await getHtml(url)
      if (html && html.length > 2000) {
        // Sanity check: page should mention "scholarship" somewhere
        if (/scholarship|merit|award|fellowship/i.test(html)) {
          return { url, html }
        }
      }
    }
    await sleep(300) // brief pause between HEAD requests
  }
  return null
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const limitIdx = args.indexOf('--limit')
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 100
  const collegeFilter = args.includes('--college') ? args[args.indexOf('--college') + 1] : null
  const minEnrollIdx = args.indexOf('--min-enrollment')
  const minEnrollment = minEnrollIdx >= 0 ? parseInt(args[minEnrollIdx + 1], 10) : 2000

  console.log('\n🏫 University Scholarship Crawler')
  console.log(`   Mode:           ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log(`   Limit:          ${collegeFilter ? '1 (single college)' : limit}`)
  console.log(`   Min enrollment: ${minEnrollment}`)
  console.log()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ── 1. Load colleges ──────────────────────────────────────────────────────

  let collegeQuery = supabase
    .from('colleges')
    .select('id, unit_id, name, website, state')
    .eq('level', 'four_year')
    .not('website', 'is', null)
    .gte('enrollment', minEnrollment)
    .order('enrollment', { ascending: false })

  if (collegeFilter) {
    collegeQuery = collegeQuery.eq('unit_id', collegeFilter)
  } else {
    collegeQuery = collegeQuery.limit(limit)
  }

  const { data: colleges, error: collegeErr } = await collegeQuery
  if (collegeErr) { console.error('DB error:', collegeErr.message); process.exit(1) }
  if (!colleges?.length) { console.log('No colleges found.'); return }

  console.log(`Colleges to crawl: ${colleges.length}\n`)

  // ── 2. Load existing scholarship websites for dedup ───────────────────────

  const { data: existingRows } = await supabase.from('scholarships').select('website')
  const existingUrls = new Set(
    (existingRows ?? []).map((r: { website: string | null }) => (r.website ?? '').toLowerCase())
  )

  // Also track which college domains we've already crawled
  const crawledDomains = new Set(
    [...existingUrls].map(u => {
      try { return new URL(u).hostname.replace(/^www\./, '') } catch { return '' }
    }).filter(Boolean)
  )

  // ── 3. Crawl each college ─────────────────────────────────────────────────

  let processed = 0; let found = 0; let inserted = 0; let errors = 0

  for (const college of colleges as CollegeRow[]) {
    processed++
    const website = college.website!
    const domain = website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]

    process.stdout.write(`[${processed}/${colleges.length}] ${college.name} — `)

    if (crawledDomains.has(domain)) {
      console.log('already crawled, skipping')
      continue
    }

    // Find a working scholarship page
    const page = await findScholarshipPage(website)

    if (!page) {
      console.log('no scholarship page found')
      await sleep(1000)
      continue
    }

    console.log(`found: ${page.url}`)
    found++

    // Parse scholarships from the page
    const scholarships = parseScholarshipsFromPage(page.html, page.url, college)
    console.log(`  → ${scholarships.length} scholarship(s) extracted`)

    for (const s of scholarships) {
      const key = (s.website ?? '').toLowerCase()
      if (existingUrls.has(key)) {
        console.log(`    ⏭  Already in DB: ${s.name}`)
        continue
      }

      if (dryRun) {
        console.log(`    [dry-run] Would insert: "${s.name}" — ${s.amount_type}${s.amount ? ` $${s.amount}` : ''}${s.gpa_min ? ` GPA ${s.gpa_min}` : ''}`)
        inserted++
        continue
      }

      const { error } = await supabase.from('scholarships').insert(s)
      if (error) {
        console.log(`    ❌ ${s.name}: ${error.message}`)
        errors++
      } else {
        console.log(`    ✅ ${s.name}`)
        existingUrls.add(key)
        inserted++
      }
    }

    crawledDomains.add(domain)
    await sleep(2000) // be respectful — 2s between colleges
    console.log()
  }

  // ── 4. Summary ────────────────────────────────────────────────────────────

  console.log('═══ Summary ══════════════════════════════════════════════')
  console.log(`  Colleges processed: ${processed}`)
  console.log(`  Pages found:        ${found}`)
  console.log(`  Scholarships added: ${inserted}`)
  console.log(`  Errors:             ${errors}`)
  console.log()
}

main().catch(console.error)
