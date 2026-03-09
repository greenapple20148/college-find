/**
 * Scholarship Ingestion Script
 *
 * Ingests scholarships from two sources:
 *   1. HTTP fetch: Select foundation & government pages with parseable static HTML
 *   2. Curated dataset: ~90 scholarships researched from public university and foundation pages
 *
 * Usage:
 *   npx tsx scripts/ingest-scholarships.ts [--dry-run] [--source curated|fetch|all]
 *
 * Requires .env.local to have SUPABASE keys configured.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ScholarshipRecord {
  name: string
  provider: string | null
  amount: number | null
  amount_type: 'fixed' | 'per_year' | 'full_tuition' | 'varies'
  gpa_min: number | null
  states: string[]
  majors: string[]
  deadline: string | null  // YYYY-MM-DD
  website: string | null
  description: string | null
  college_name?: string | null  // If set, will be resolved to college_id during ingestion
}

// ─── HTML Extraction Helpers ───────────────────────────────────────────────────

/** Extract the first JSON-LD block from an HTML string */
function extractJsonLd(html: string): Record<string, unknown> | null {
  const m = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
  if (!m) return null
  try { return JSON.parse(m[1].trim()) } catch { return null }
}

/** Extract the largest plausible dollar amount from HTML (between $500 and $200,000) */
function extractAmount(html: string): number | null {
  const matches = html.match(/\$(\d{1,3}(?:,\d{3})*)/g)
  if (!matches) return null
  const amounts = matches
    .map(s => parseInt(s.replace(/[$,]/g, ''), 10))
    .filter(n => n >= 500 && n <= 200000)
    .sort((a, b) => b - a)
  return amounts[0] ?? null
}

const MONTH_MAP: Record<string, string> = {
  january: '01', jan: '01', february: '02', feb: '02', march: '03', mar: '03',
  april: '04', apr: '04', may: '05', june: '06', jun: '06', july: '07', jul: '07',
  august: '08', aug: '08', september: '09', sep: '09', sept: '09',
  october: '10', oct: '10', november: '11', nov: '11', december: '12', dec: '12',
}

/** Extract a YYYY-MM-DD deadline from HTML near the word "deadline" */
function extractDeadline(html: string, fallback: string | null = null): string | null {
  const lower = html.toLowerCase()
  const idx = lower.indexOf('deadline')
  if (idx === -1) return fallback
  const window = html.slice(Math.max(0, idx - 50), idx + 200)
  const m = window.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})(?:,?\s*(\d{4}))?/i
  )
  if (!m) return fallback
  const mm = MONTH_MAP[m[1].toLowerCase()]
  const dd = m[2].padStart(2, '0')
  const yyyy = m[3] ?? '2026'
  return `${yyyy}-${mm}-${dd}`
}

// ─── HTTP Fetcher ──────────────────────────────────────────────────────────────

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; CollegeMatchBot/1.0; +https://collegematch.app)',
  Accept: 'text/html,application/xhtml+xml',
}

async function fetchHtml(url: string, timeoutMs = 10_000): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { headers: HEADERS, signal: controller.signal })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// ─── Fetch Sources ─────────────────────────────────────────────────────────────

interface FetchSource {
  url: string
  fallback: ScholarshipRecord
  parse?: (html: string, fallback: ScholarshipRecord) => ScholarshipRecord
}

const FETCH_SOURCES: FetchSource[] = [
  {
    url: 'https://goldwaterscholarship.org/goldwater-scholarship/',
    fallback: {
      name: 'Barry Goldwater Scholarship',
      provider: 'Barry Goldwater Scholarship and Excellence in Education Foundation',
      amount: 7500,
      amount_type: 'per_year',
      gpa_min: 3.6,
      states: [],
      majors: ['Science', 'Mathematics', 'Engineering', 'Computer Science & IT'],
      deadline: '2026-01-29',
      website: 'https://goldwaterscholarship.org',
      description:
        'Up to $7,500/year for college sophomores and juniors pursuing research careers in natural sciences, mathematics, or engineering. The most prestigious undergraduate STEM award in the U.S.',
    },
    parse: (html, fallback) => ({
      ...fallback,
      amount: extractAmount(html) ?? fallback.amount,
      deadline: extractDeadline(html, fallback.deadline),
    }),
  },
  {
    url: 'https://www.truman.gov/are-you-truman-candidate/eligibility-requirements/',
    fallback: {
      name: 'Harry S. Truman Scholarship',
      provider: 'Harry S. Truman Scholarship Foundation',
      amount: 30000,
      amount_type: 'fixed',
      gpa_min: 3.0,
      states: [],
      majors: ['History & Political Science', 'Social Work', 'Law'],
      deadline: '2026-02-03',
      website: 'https://www.truman.gov',
      description:
        '$30,000 award for college juniors committed to careers in government or public service. Includes mentoring, networking, and graduate school support for future public service leaders.',
    },
    parse: (html, fallback) => ({
      ...fallback,
      deadline: extractDeadline(html, fallback.deadline),
    }),
  },
  {
    url: 'https://www.smartscholarship.org/smart',
    fallback: {
      name: 'SMART Scholarship-for-Service Program',
      provider: 'U.S. Department of Defense',
      amount: null,
      amount_type: 'full_tuition',
      gpa_min: 3.0,
      states: [],
      majors: ['Science', 'Technology', 'Engineering', 'Mathematics', 'Computer Science & IT'],
      deadline: '2025-12-01',
      website: 'https://www.smartscholarship.org',
      description:
        'Full tuition + $25,000–$38,000 annual stipend for STEM students who commit to work for the Department of Defense after graduation. Covers undergraduate and graduate students.',
    },
    parse: (html, fallback) => ({
      ...fallback,
      amount: extractAmount(html) ?? fallback.amount,
      deadline: extractDeadline(html, fallback.deadline),
    }),
  },
  {
    url: 'https://davidsonfellows.org/scholarship/',
    fallback: {
      name: 'Davidson Fellows Scholarship',
      provider: 'Davidson Institute',
      amount: 50000,
      amount_type: 'fixed',
      gpa_min: null,
      states: [],
      majors: ['Science', 'Technology', 'Engineering', 'Mathematics', 'English & Literature', 'Arts & Design'],
      deadline: '2026-02-11',
      website: 'https://davidsonfellows.org',
      description:
        '$10,000, $25,000, or $50,000 for students 18 and under who complete a significant project in STEM, literature, music, or philosophy. No minimum GPA or test score required.',
    },
    parse: (html, fallback) => ({
      ...fallback,
      deadline: extractDeadline(html, fallback.deadline),
    }),
  },
  {
    url: 'https://www.swe.org/scholarships/',
    fallback: {
      name: 'Society of Women Engineers Scholarship',
      provider: 'Society of Women Engineers',
      amount: 15000,
      amount_type: 'varies',
      gpa_min: 3.0,
      states: [],
      majors: ['Engineering', 'Computer Science & IT', 'Technology'],
      deadline: '2026-02-15',
      website: 'https://www.swe.org/scholarships',
      description:
        'Multiple scholarships from $1,000–$15,000 for women pursuing undergraduate or graduate degrees in engineering, technology, and computer science. Over $1 million awarded annually.',
    },
    parse: (html, fallback) => ({
      ...fallback,
      deadline: extractDeadline(html, fallback.deadline),
    }),
  },
  {
    url: 'https://www.youngarts.org/apply',
    fallback: {
      name: 'YoungArts Foundation Award',
      provider: 'National YoungArts Foundation',
      amount: 10000,
      amount_type: 'fixed',
      gpa_min: null,
      states: [],
      majors: ['Arts & Design', 'English & Literature'],
      deadline: '2025-10-11',
      website: 'https://youngarts.org',
      description:
        'Up to $10,000 for talented artists ages 15–18 in dance, film, jazz, music, photography, theater, visual arts, voice, and writing. Winners are eligible for the U.S. Presidential Scholar in the Arts designation.',
    },
    parse: (html, fallback) => {
      // Try to extract JSON-LD for structured event/grant data
      const ld = extractJsonLd(html)
      const ldAmount = ld?.['maximumAttendeeCapacity'] // not usually relevant but worth trying
      void ldAmount
      return { ...fallback, deadline: extractDeadline(html, fallback.deadline) }
    },
  },
  {
    url: 'https://horatioalger.org/scholarships/about-our-scholarships/national-scholarships/',
    fallback: {
      name: 'Horatio Alger National Scholarship',
      provider: 'Horatio Alger Association',
      amount: 25000,
      amount_type: 'fixed',
      gpa_min: 2.0,
      states: [],
      majors: [],
      deadline: '2025-10-25',
      website: 'https://horatioalger.org/scholarships',
      description:
        '$25,000 for students who have faced and overcome great personal adversity. Emphasizes financial need, resilience, and commitment to higher education. Based on character, not just GPA.',
    },
    parse: (html, fallback) => ({
      ...fallback,
      amount: extractAmount(html) ?? fallback.amount,
      deadline: extractDeadline(html, fallback.deadline),
    }),
  },
  {
    url: 'https://pointfoundation.org/point-apply/point-scholarship/',
    fallback: {
      name: 'Point Foundation LGBTQ+ Scholarship',
      provider: 'Point Foundation',
      amount: 14000,
      amount_type: 'per_year',
      gpa_min: 3.0,
      states: [],
      majors: [],
      deadline: '2026-01-27',
      website: 'https://pointfoundation.org',
      description:
        'Comprehensive scholarship averaging $14,000/year for LGBTQ+ students demonstrating leadership and academic excellence. Includes mentoring, leadership training, and a lifelong alumni network.',
    },
    parse: (html, fallback) => ({
      ...fallback,
      deadline: extractDeadline(html, fallback.deadline),
    }),
  },
]

// ─── Curated Dataset ───────────────────────────────────────────────────────────
// Researched from public university financial aid and foundation websites.

const CURATED_SCHOLARSHIPS: ScholarshipRecord[] = [
  // ── University Merit Awards ─────────────────────────────────────────────────
  {
    name: 'Morehead-Cain Scholarship',
    provider: 'Morehead-Cain Foundation / UNC Chapel Hill',
    college_name: 'University of North Carolina at Chapel Hill',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.7,
    states: [],
    majors: [],
    deadline: '2025-10-24',
    website: 'https://moreheadcain.org',
    description:
      'Full scholarship (tuition, room, board, and enrichment funding) at UNC Chapel Hill. Includes four summers of structured enrichment. Nominated through high school; one of the oldest and most prestigious merit awards.',
  },
  {
    name: 'Robertson Scholars Leadership Program',
    provider: 'Robertson Foundation / Duke & UNC Chapel Hill',
    college_name: 'Duke University',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.7,
    states: [],
    majors: [],
    deadline: '2025-11-01',
    website: 'https://robertsonscholars.org',
    description:
      'Full scholarship at either Duke or UNC Chapel Hill (and access to both). Covers tuition, room, board, and enrichment funding. Emphasizes collaborative leadership across two institutions.',
  },
  {
    name: 'Jefferson Scholars Foundation Scholarship',
    provider: 'Jefferson Scholars Foundation / University of Virginia',
    college_name: 'University of Virginia-Main Campus',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.7,
    states: [],
    majors: [],
    deadline: '2025-11-01',
    website: 'https://jeffersonscholars.org',
    description:
      'Full 4-year scholarship at UVA including tuition, room, board, and a $6,000 annual enrichment fund. Considered one of the most distinguished merit scholarships in the country.',
  },
  {
    name: 'Cornelius Vanderbilt Scholarship',
    provider: 'Vanderbilt University',
    college_name: 'Vanderbilt University',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.7,
    states: [],
    majors: [],
    deadline: '2025-12-01',
    website: 'https://vanderbilt.edu/scholarships/cornelius-vanderbilt',
    description:
      "Vanderbilt's most prestigious merit award covering full tuition (~$60,000/year). Awarded to top applicants across all fields of study. No separate application—automatically considered at admission.",
  },
  {
    name: 'Ingram Scholars Program',
    provider: 'E. Bronson Ingram Foundation / Vanderbilt University',
    college_name: 'Vanderbilt University',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.5,
    states: [],
    majors: [],
    deadline: '2025-12-01',
    website: 'https://ingramscholars.org',
    description:
      'Full scholarship + $3,000/year service grant at Vanderbilt. Focuses on community leadership and service. Includes mentoring, leadership seminars, and funded community service projects.',
  },
  {
    name: 'Emory Scholars Program',
    provider: 'Emory University',
    college_name: 'Emory University',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.7,
    states: [],
    majors: [],
    deadline: '2025-11-15',
    website: 'https://emory.edu/scholars',
    description:
      'Full scholarship at Emory University covering tuition and enrichment funding. Includes three program tracks: Liberal Arts, Science and Medicine, and Business. Competitive, invitation-based selection process.',
  },
  {
    name: 'Hesburgh-Yusko Scholars Program',
    provider: 'University of Notre Dame',
    college_name: 'University of Notre Dame',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.7,
    states: [],
    majors: [],
    deadline: '2025-11-01',
    website: 'https://scholarships.nd.edu/hesburgh-yusko',
    description:
      'Full scholarship at Notre Dame covering tuition, room, board, and books, plus a $9,000 enrichment fund. One of the top 20 merit scholarships in the country.',
  },
  {
    name: 'Danforth Scholars Program',
    provider: 'Washington University in St. Louis',
    college_name: 'Washington University in St Louis',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.7,
    states: [],
    majors: [],
    deadline: '2025-12-01',
    website: 'https://danforthscholars.wustl.edu',
    description:
      'Full tuition + enrichment funding at WashU. Includes leadership development workshops and funded enrichment grants. Among the most prestigious merit programs at a top research university.',
  },
  {
    name: 'USC Trustee Scholarship',
    provider: 'University of Southern California',
    college_name: 'University of Southern California',
    amount: 23000,
    amount_type: 'per_year',
    gpa_min: 3.8,
    states: [],
    majors: [],
    deadline: '2025-12-01',
    website: 'https://admission.usc.edu/financial-aid/merit-scholarships/',
    description:
      "USC's highest merit scholarship at $23,000/year renewable for 4 years. Awarded automatically to top freshman applicants—no separate application required.",
  },
  {
    name: 'USC Presidential Scholarship',
    provider: 'University of Southern California',
    college_name: 'University of Southern California',
    amount: 18500,
    amount_type: 'per_year',
    gpa_min: 3.7,
    states: [],
    majors: [],
    deadline: '2025-12-01',
    website: 'https://admission.usc.edu/financial-aid/merit-scholarships/',
    description:
      '$18,500/year renewable merit scholarship at USC. Awarded automatically to high-achieving freshman applicants based on academic record. No separate application required.',
  },
  {
    name: 'BU Trustee Scholarship',
    provider: 'Boston University',
    college_name: 'Boston University',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.8,
    states: [],
    majors: [],
    deadline: '2025-11-01',
    website: 'https://bu.edu/admissions/tuition-aid/scholarships/',
    description:
      "Boston University's most prestigious merit award, covering full tuition for 4 years. Requires a separate scholarship application; finalists are invited to campus for an interview.",
  },
  {
    name: 'NYU Presidential Honors Scholarship',
    provider: 'New York University',
    college_name: 'New York University',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.8,
    states: [],
    majors: [],
    deadline: '2026-01-01',
    website: 'https://www.nyu.edu/admissions/undergraduate-admissions/scholarships.html',
    description:
      "NYU's highest merit scholarship covering full tuition and room and board. Extremely competitive; awarded to a handful of the strongest applicants per year.",
  },
  {
    name: 'Tulane Dean\'s Honor Scholarship',
    provider: 'Tulane University',
    college_name: 'Tulane University of Louisiana',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.7,
    states: [],
    majors: [],
    deadline: '2026-01-15',
    website: 'https://tulane.edu/admission/scholarships',
    description:
      "Tulane's most prestigious merit award covering full tuition (~$60,000/year). No separate application—awarded automatically to top applicants. Renewable for 4 years with satisfactory progress.",
  },
  {
    name: 'Tulane Academic Excellence Award',
    provider: 'Tulane University',
    college_name: 'Tulane University of Louisiana',
    amount: 28000,
    amount_type: 'per_year',
    gpa_min: 3.5,
    states: [],
    majors: [],
    deadline: '2026-01-15',
    website: 'https://tulane.edu/admission/scholarships',
    description:
      '$28,000/year renewable merit scholarship at Tulane, automatically considered at admission. Among the most generous merit awards at a top-30 research university.',
  },
  {
    name: 'Rice University Trustee Distinguished Scholarship',
    provider: 'Rice University',
    college_name: 'Rice University',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.8,
    states: [],
    majors: [],
    deadline: '2025-11-01',
    website: 'https://financialaid.rice.edu/scholarships',
    description:
      "Rice University's highest merit scholarship covering full tuition. Extremely competitive; awarded through nomination and selection. Includes research opportunities and faculty mentorship.",
  },
  {
    name: '40 Acres Scholars Program',
    provider: 'University of Texas at Austin',
    college_name: 'The University of Texas at Austin',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.5,
    states: ['TX'],
    majors: [],
    deadline: '2025-12-01',
    website: 'https://40acres.org',
    description:
      'Full scholarship (tuition, fees, room, board, books, and enrichment) for exceptional Texas students at UT Austin. Includes leadership programming, mentoring, and summer funding for four years.',
  },
  {
    name: 'Case Western Reserve Merit Scholarship',
    provider: 'Case Western Reserve University',
    college_name: 'Case Western Reserve University',
    amount: 30000,
    amount_type: 'per_year',
    gpa_min: 3.7,
    states: [],
    majors: [],
    deadline: '2025-12-01',
    website: 'https://case.edu/undergraduate-admission/cost-and-aid/scholarships',
    description:
      'Merit scholarships up to $30,000/year at Case Western. Top applicants are automatically considered. CWRU offers some of the highest merit aid among research universities.',
  },
  {
    name: 'University of Rochester Scholarship',
    provider: 'University of Rochester',
    college_name: 'University of Rochester',
    amount: 25000,
    amount_type: 'per_year',
    gpa_min: 3.7,
    states: [],
    majors: [],
    deadline: '2026-01-05',
    website: 'https://enrollment.rochester.edu/aid/merit/',
    description:
      'Merit scholarships up to $25,000/year for exceptional admits to the University of Rochester. Top awards include the Frederick Douglass and Susan B. Anthony Scholarships, which cover full tuition.',
  },
  {
    name: 'Northeastern University Merit Scholarship',
    provider: 'Northeastern University',
    college_name: 'Northeastern University',
    amount: 23000,
    amount_type: 'per_year',
    gpa_min: 3.7,
    states: [],
    majors: [],
    deadline: '2026-01-01',
    website: 'https://www.northeastern.edu/admissions/costs-aid/undergraduate/',
    description:
      'Merit scholarships from $10,000–$23,000/year for high-achieving undergraduates. Automatically considered at admission. Northeastern\'s co-op program provides additional experiential learning funding.',
  },
  // ── National Foundations ────────────────────────────────────────────────────
  {
    name: 'Horatio Alger State Scholarship',
    provider: 'Horatio Alger Association',
    amount: 10000,
    amount_type: 'fixed',
    gpa_min: 2.0,
    states: [],
    majors: [],
    deadline: '2025-10-25',
    website: 'https://horatioalger.org/scholarships/about-our-scholarships/state-scholarships/',
    description:
      'State-specific $10,000 scholarships in 25+ states for students who have overcome significant hardship. Emphasizes resilience and determination over high GPA. Must demonstrate financial need.',
  },
  {
    name: 'AXA Achievement Scholarship',
    provider: 'AXA Foundation',
    amount: 10000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: [],
    deadline: '2025-12-15',
    website: 'https://axa-achievement.com',
    description:
      '$10,000 scholarship for students demonstrating outstanding achievement in school, community, or the workplace. Broad definition of achievement—no single special talent required.',
  },
  {
    name: 'Buick Achievers Scholarship',
    provider: 'General Motors Foundation',
    amount: 25000,
    amount_type: 'per_year',
    gpa_min: 3.0,
    states: [],
    majors: ['Engineering', 'Technology', 'Business & Management', 'Arts & Design'],
    deadline: '2026-02-01',
    website: 'https://buickachievers.com',
    description:
      'Up to $25,000/year for students pursuing engineering, technology, design, or business. Priority given to GM employee dependents and students from underrepresented groups. Renewable for 4 years.',
  },
  {
    name: 'Toyota Community Scholars',
    provider: 'Toyota Motor North America',
    amount: 20000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: [],
    deadline: '2026-02-01',
    website: 'https://www.toyota.com/usa/community/scholarships',
    description:
      '$20,000 total ($5,000/year × 4 years) for students demonstrating community leadership and civic engagement. Based on merit, service, and financial need.',
  },
  {
    name: 'Burger King Scholars Program',
    provider: 'Burger King McLamore Foundation',
    amount: 50000,
    amount_type: 'fixed',
    gpa_min: 2.5,
    states: [],
    majors: [],
    deadline: '2025-12-15',
    website: 'https://bkmclamorefoundation.org',
    description:
      'Scholarships from $1,000–$50,000 for Burger King employees, their children/spouses, and McLamore Award recipients. Based on academic performance, community involvement, and financial need.',
  },
  {
    name: 'Best Buy Foundation Scholarship',
    provider: 'Best Buy Foundation',
    amount: 3000,
    amount_type: 'fixed',
    gpa_min: 2.5,
    states: [],
    majors: ['Technology', 'Computer Science & IT', 'Engineering'],
    deadline: '2026-02-01',
    website: 'https://www.bestbuy.com/site/about/best-buy-foundation',
    description:
      "$3,000 scholarship for employees' children and youth served by Best Buy Teen Tech Centers. Focuses on access to technology education and career readiness for underrepresented students.",
  },
  {
    name: 'Walmart Community Scholarship',
    provider: 'Walmart Foundation',
    amount: 13000,
    amount_type: 'fixed',
    gpa_min: 2.5,
    states: [],
    majors: [],
    deadline: '2026-01-31',
    website: 'https://walmart.com/communitygiving',
    description:
      "Multiple scholarship programs for Walmart and Sam's Club associates and their dependents. Awards range from $2,000–$13,000. Apply through your local Walmart or Sam's Club.",
  },
  {
    name: 'Rotary Foundation District Scholarship',
    provider: 'Rotary International Foundation',
    amount: 5000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: [],
    deadline: null,
    website: 'https://www.rotary.org/en/our-programs/scholarships',
    description:
      'Local Rotary district scholarships from $1,000–$5,000+ for community-minded students. Apply through your local Rotary Club. Deadlines vary by district (typically December–February).',
  },
  {
    name: 'Foot Locker Scholar Athletes Scholarship',
    provider: 'Foot Locker Foundation',
    amount: 20000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: [],
    deadline: '2026-02-15',
    website: 'https://footlockerscholarathletes.com',
    description:
      '$5,000/year for 4 years ($20,000 total) for student athletes who excel academically, athletically, and in community service. 20 awards given annually based on leadership and dedication.',
  },
  // ── STEM / Tech ─────────────────────────────────────────────────────────────
  {
    name: 'Google Generation Google Scholarship',
    provider: 'Google',
    amount: 10000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: ['Computer Science & IT', 'Technology', 'Engineering'],
    deadline: '2026-04-01',
    website: 'https://buildyourfuture.withgoogle.com/scholarships',
    description:
      '$10,000 for CS, CE, or related technical major undergraduates. Separate programs for women, Black and Latino students, and students with disabilities. Includes mentorship and Google internship opportunities.',
  },
  {
    name: 'Microsoft Scholarship Program',
    provider: 'Microsoft',
    amount: 15000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: ['Computer Science & IT', 'Engineering', 'Technology', 'Mathematics'],
    deadline: '2026-02-01',
    website: 'https://careers.microsoft.com/v2/global/en/students.html',
    description:
      '$5,000–$15,000 for students pursuing degrees in computer science and related fields. Separate scholarships for women, underrepresented minorities, and students with disabilities. Includes 1:1 mentorship.',
  },
  {
    name: 'Palantir Global Impact Scholarship',
    provider: 'Palantir Technologies',
    amount: 7500,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: ['Computer Science & IT', 'Engineering', 'Mathematics', 'Technology'],
    deadline: '2026-04-30',
    website: 'https://www.palantir.com/students/scholarship/',
    description:
      '$7,500 for students committed to solving problems that matter. Multiple tracks: Women in Tech, FWD (minorities), Courage to be Different (adversity). Includes engagement with Palantir engineers.',
  },
  {
    name: 'Adobe Research Women-in-Technology Scholarship',
    provider: 'Adobe',
    amount: 10000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: ['Computer Science & IT', 'Engineering', 'Technology'],
    deadline: '2026-02-01',
    website: 'https://research.adobe.com/scholarship/',
    description:
      '$10,000 for female-identifying undergraduates in computer science, electrical engineering, or related technical fields. Also includes mentorship from Adobe Research scientists.',
  },
  {
    name: 'Amazon Future Engineer Scholarship',
    provider: 'Amazon',
    amount: 10000,
    amount_type: 'fixed',
    gpa_min: 2.5,
    states: [],
    majors: ['Computer Science & IT', 'Engineering'],
    deadline: '2026-01-25',
    website: 'https://www.amazonfutureengineer.com/scholarships',
    description:
      '$10,000 + guaranteed SWE internship at Amazon for low-income students pursuing computer science degrees. Recipients are automatically considered for Amazon internships after completing freshman year.',
  },
  {
    name: 'AISES Sequoyah Fellowship',
    provider: 'American Indian Science and Engineering Society',
    amount: 5000,
    amount_type: 'per_year',
    gpa_min: 3.0,
    states: [],
    majors: ['Science', 'Technology', 'Engineering', 'Mathematics', 'Computer Science & IT', 'Environmental Science'],
    deadline: '2026-04-01',
    website: 'https://www.aises.org/scholarships',
    description:
      '$1,000–$5,000/year for American Indian, Alaska Native, Native Hawaiian, Pacific Islander, or First Nations students in STEM or STEM-related business. AISES membership required.',
  },
  {
    name: 'SHPE Foundation Scholarship',
    provider: 'Society of Hispanic Professional Engineers',
    amount: 5000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: ['Engineering', 'Science', 'Technology', 'Mathematics'],
    deadline: '2026-04-01',
    website: 'https://www.shpe.org/scholarships',
    description:
      '$1,000–$5,000 for Hispanic undergraduates and graduates pursuing STEM degrees. Multiple programs including the SHPE Foundation General Scholarship and industry-sponsored awards.',
  },
  {
    name: 'National GEM Consortium Fellowship',
    provider: 'National GEM Consortium',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.0,
    states: [],
    majors: ['Engineering', 'Science', 'Computer Science & IT', 'Technology'],
    deadline: '2025-11-01',
    website: 'https://www.gemfellowship.org',
    description:
      'Full MS or PhD tuition + $16,000–$32,000/year stipend for underrepresented minority students in STEM. Includes paid internships at GEM employer member companies.',
  },
  {
    name: 'American Chemical Society Scholars Program',
    provider: 'American Chemical Society',
    amount: 5000,
    amount_type: 'per_year',
    gpa_min: 3.0,
    states: [],
    majors: ['Science', 'Biology & Life Sciences', 'Engineering', 'Health Sciences'],
    deadline: '2026-03-01',
    website: 'https://www.acs.org/scholars',
    description:
      'Up to $5,000/year for underrepresented minority students in chemistry, biochemistry, chemical engineering, or related disciplines. Renewable for up to 4 years.',
  },
  {
    name: 'NSF Graduate Research Fellowship',
    provider: 'National Science Foundation',
    amount: 37000,
    amount_type: 'per_year',
    gpa_min: 3.5,
    states: [],
    majors: ['Science', 'Technology', 'Engineering', 'Mathematics', 'Computer Science & IT', 'Psychology', 'Social Work'],
    deadline: '2025-10-17',
    website: 'https://www.nsfgrfp.org',
    description:
      '$37,000/year stipend + full tuition for 3 years of graduate STEM study. Apply in senior year of undergrad or the first two years of grad school. One of the most prestigious graduate fellowships in the U.S.',
  },
  {
    name: 'IEEE Foundation Scholarship',
    provider: 'Institute of Electrical and Electronics Engineers Foundation',
    amount: 5000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: ['Engineering', 'Computer Science & IT', 'Technology'],
    deadline: '2026-01-31',
    website: 'https://foundation.ieee.org/scholarships',
    description:
      "Multiple scholarships of $1,000–$5,000 for electrical engineering, computer engineering, and technology students. Includes the IEEE Presidents' Scholarship and the Charles Le Geyt Fortescue Scholarship.",
  },
  // ── Identity / Minority-Focused ─────────────────────────────────────────────
  {
    name: 'National Black MBA Association Scholarship',
    provider: 'National Black MBA Association',
    amount: 10000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: ['Business & Management', 'Economics', 'Mathematics'],
    deadline: '2026-04-30',
    website: 'https://nbmbaa.org/scholarships/',
    description:
      '$2,000–$10,000 for Black undergraduates and MBAs pursuing business degrees. Includes networking opportunities and conference attendance at the annual NBMBAA Conference.',
  },
  {
    name: 'Asian & Pacific Islander American Scholarship',
    provider: 'Asian & Pacific Islander American Scholarship Fund',
    amount: 20000,
    amount_type: 'fixed',
    gpa_min: 2.7,
    states: [],
    majors: [],
    deadline: '2026-01-18',
    website: 'https://apiasf.org',
    description:
      '$2,500–$20,000 for Asian Pacific Islander students with financial need. APIASF also administers the Gates Scholarship and other foundation programs for API students. Over $60 million awarded since 2003.',
  },
  {
    name: 'Pride Foundation Scholarship',
    provider: 'Pride Foundation',
    amount: 10000,
    amount_type: 'fixed',
    gpa_min: null,
    states: ['AK', 'ID', 'MT', 'OR', 'WA'],
    majors: [],
    deadline: '2026-01-15',
    website: 'https://pridefoundation.org/scholarships',
    description:
      'Multiple awards averaging $5,000–$10,000 for LGBTQ+ students and allies in the Pacific Northwest (AK, ID, MT, OR, WA). No minimum GPA. Based on community involvement and leadership.',
  },
  {
    name: 'NABA National Scholarship',
    provider: 'National Association of Black Accountants',
    amount: 10000,
    amount_type: 'fixed',
    gpa_min: 2.5,
    states: [],
    majors: ['Business & Management', 'Mathematics'],
    deadline: '2026-01-31',
    website: 'https://www.nabainc.org/page/Scholarships',
    description:
      'Multiple scholarships up to $10,000 for Black students pursuing accounting, finance, and business degrees. Regional chapters also offer additional scholarships.',
  },
  {
    name: 'Thurgood Marshall College Fund Scholarship',
    provider: 'Thurgood Marshall College Fund',
    amount: 6000,
    amount_type: 'per_year',
    gpa_min: 3.0,
    states: [],
    majors: [],
    deadline: '2026-05-31',
    website: 'https://www.tmcf.org/students/scholarship',
    description:
      "Merit-based scholarships for students at TMCF's 47 member HBCUs and Predominantly Black Institutions. Awards typically $3,000–$6,000/year. Sponsored by Walmart, Google, Verizon, and other corporate partners.",
  },
  {
    name: 'Comcast Leaders and Achievers Scholarship',
    provider: 'Comcast NBCUniversal Foundation',
    amount: 2500,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: [],
    deadline: '2025-11-05',
    website: 'https://leadershipinstitute.comcast.com/scholarships',
    description:
      '$2,500 one-time award for high school seniors demonstrating leadership, community service, and academic achievement. Intended for students from communities served by Comcast.',
  },
  // ── State Programs ──────────────────────────────────────────────────────────
  {
    name: 'Georgia HOPE Scholarship',
    provider: 'Georgia Student Finance Commission',
    amount: 10000,
    amount_type: 'per_year',
    gpa_min: 3.0,
    states: ['GA'],
    majors: [],
    deadline: null,
    website: 'https://www.gsfc.georgia.gov/hope-scholarship-program',
    description:
      'Merit scholarship for Georgia residents attending eligible Georgia colleges. Full tuition at public institutions; $4,000–$10,000 at private GA colleges. GPA must be maintained at 3.0 to renew.',
  },
  {
    name: 'Louisiana TOPS Award',
    provider: 'Louisiana Office of Student Financial Assistance',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 2.5,
    states: ['LA'],
    majors: [],
    deadline: null,
    website: 'https://www.osfa.la.gov/tops.htm',
    description:
      'Tuition scholarship for Louisiana residents at public LA universities. Four award levels (Opportunity, Performance, Honors, Tech) based on GPA and ACT score. Must file FAFSA.',
  },
  {
    name: 'Tennessee HOPE Scholarship',
    provider: 'Tennessee Student Assistance Corporation',
    amount: 6000,
    amount_type: 'per_year',
    gpa_min: 3.0,
    states: ['TN'],
    majors: [],
    deadline: null,
    website: 'https://www.tn.gov/collegepays/money-for-college/tn-education-lottery-scholarship-program/tennessee-hope-scholarship.html',
    description:
      '$4,000–$6,000/year for Tennessee residents at eligible Tennessee colleges. Based on high school GPA (3.0+) or ACT (21+). Maintain 2.75 GPA in college to renew.',
  },
  {
    name: 'South Carolina Palmetto Fellows Scholarship',
    provider: 'South Carolina Commission on Higher Education',
    amount: 7500,
    amount_type: 'per_year',
    gpa_min: 3.5,
    states: ['SC'],
    majors: [],
    deadline: '2026-06-30',
    website: 'https://www.che.sc.gov/Students,Families,Communities/Paying_for_College/Scholarship_and_Grant_Programs/Palmetto_Fellows.aspx',
    description:
      '$6,700–$7,500/year for top South Carolina high school graduates attending eligible SC colleges. Requires 3.5 GPA and 1200 SAT or 27 ACT. Renewable with 3.0 college GPA.',
  },
  {
    name: "Arkansas Governor's Distinguished Scholarship",
    provider: 'Arkansas Department of Higher Education',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.5,
    states: ['AR'],
    majors: [],
    deadline: '2026-02-01',
    website: 'https://scholarships.adhe.edu/scholarships/state-scholarships/governors-distinguished-scholarship/',
    description:
      'Full tuition at any Arkansas public college for top AR high school graduates. Requires 3.5 GPA and 32 ACT / 1410 SAT, National Merit Finalist status, or valedictorian/salutatorian standing.',
  },
  {
    name: 'Washington State Opportunity Scholarship',
    provider: 'Washington State Opportunity Scholarship',
    amount: 10000,
    amount_type: 'per_year',
    gpa_min: 2.75,
    states: ['WA'],
    majors: ['Engineering', 'Computer Science & IT', 'Science', 'Health Sciences', 'Mathematics'],
    deadline: '2026-03-01',
    website: 'https://www.waopportunityscholarship.org',
    description:
      'Up to $10,000/year for low- to middle-income Washington State residents pursuing STEM or health care degrees at WA institutions. Includes professional development opportunities.',
  },
  {
    name: 'Oregon Opportunity Grant',
    provider: 'Oregon Student Aid Commission',
    amount: 3360,
    amount_type: 'per_year',
    gpa_min: null,
    states: ['OR'],
    majors: [],
    deadline: null,
    website: 'https://www.oregonstudentaid.gov/oregon-opportunity-grant.aspx',
    description:
      'Need-based grant up to $3,360/year for Oregon residents at eligible Oregon colleges. Based on financial need; file FAFSA by the March 1 priority deadline.',
  },
  {
    name: 'Kentucky Educational Excellence Scholarship (KEES)',
    provider: 'Kentucky Higher Education Assistance Authority',
    amount: 2500,
    amount_type: 'per_year',
    gpa_min: 2.5,
    states: ['KY'],
    majors: [],
    deadline: null,
    website: 'https://www.kheaa.com/website/kheaa/program?main=1&Type=kees',
    description:
      'Merit scholarship for KY high school graduates based on annual GPA. Students earn $125–$500 per high school year for each year of 2.5–4.0 GPA. Bonus awards for high ACT/SAT scores.',
  },
  {
    name: 'Michigan Tuition Incentive Program (TIP)',
    provider: 'Michigan Student Financial Aid Association',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: null,
    states: ['MI'],
    majors: [],
    deadline: null,
    website: 'https://www.michigan.gov/mistudentaid/programs/tip',
    description:
      'Free community college tuition (Phase I) + up to $2,000/year for 4-year college (Phase II) for Michigan Medicaid-eligible students who graduated high school before age 20.',
  },
  {
    name: 'Massachusetts Gilbert Grant',
    provider: 'Massachusetts Department of Higher Education',
    amount: 2500,
    amount_type: 'per_year',
    gpa_min: null,
    states: ['MA'],
    majors: [],
    deadline: null,
    website: 'https://www.mass.edu/osfa/programs/gilbert.asp',
    description:
      'Need-based grant for Massachusetts residents at eligible MA private colleges. Award typically $200–$2,500/year. Must file FAFSA by the May 1 priority deadline.',
  },
  // ── Professional Associations ───────────────────────────────────────────────
  {
    name: 'AICPA Foundation Scholarship',
    provider: 'American Institute of Certified Public Accountants',
    amount: 10000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: ['Business & Management', 'Mathematics'],
    deadline: '2026-03-01',
    website: 'https://www.aicpa.org/career/scholarships',
    description:
      'Scholarships from $5,000–$10,000 for accounting students at the undergraduate or graduate level. Includes the AICPA Foundation Scholarship, John L. Carey Scholarship, and minority-focused awards.',
  },
  {
    name: 'AMA Foundation Medical Scholarship',
    provider: 'American Medical Association Foundation',
    amount: 10000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: ['Medicine & Pre-Med', 'Health Sciences', 'Biology & Life Sciences'],
    deadline: '2026-03-31',
    website: 'https://www.amafoundation.org/programs/scholarships',
    description:
      'Multiple scholarships of $5,000–$10,000 for premed and medical students. Includes Excellence in Medicine awards and scholarships for underrepresented minorities in medicine.',
  },
  {
    name: 'ADA Foundation Dental Student Scholarship',
    provider: 'American Dental Association Foundation',
    amount: 5000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: ['Medicine & Pre-Med', 'Health Sciences'],
    deadline: '2026-08-01',
    website: 'https://www.adafoundation.org/en/how-we-help/educational-scholarships',
    description:
      '$5,000–$10,000 for dental students demonstrating financial need and academic achievement. Separate scholarships for underrepresented minorities and students committed to underserved communities.',
  },
  {
    name: 'American Meteorological Society Scholarship',
    provider: 'American Meteorological Society',
    amount: 5000,
    amount_type: 'fixed',
    gpa_min: 3.25,
    states: [],
    majors: ['Science', 'Environmental Science'],
    deadline: '2026-02-01',
    website: 'https://www.ametsoc.org/index.cfm/ams/education-careers/undergraduate-students/ams-scholarships/',
    description:
      '$2,500–$5,000 for students pursuing degrees in atmospheric and related oceanic and hydrologic sciences. Includes freshman awards for those entering the field and upper-division awards.',
  },
  {
    name: 'American Nuclear Society Scholarship',
    provider: 'American Nuclear Society',
    amount: 3500,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: ['Science', 'Engineering', 'Technology'],
    deadline: '2026-02-01',
    website: 'https://www.ans.org/honors/scholarships/',
    description:
      'Multiple scholarships from $1,000–$3,500 for students in nuclear science, nuclear engineering, and related disciplines. Includes the Incoming Freshman Award, Graduate Fellowships, and industry-sponsored awards.',
  },
  // ── Military / Service ──────────────────────────────────────────────────────
  {
    name: 'Army ROTC Scholarship',
    provider: 'U.S. Army',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 2.5,
    states: [],
    majors: [],
    deadline: '2026-01-10',
    website: 'https://www.goarmy.com/rotc/scholarships.html',
    description:
      'Full or partial tuition + room and board + textbooks + monthly stipend for 4 years in exchange for Army service after graduation. 4-year, 3-year, and 2-year scholarship options available.',
  },
  {
    name: 'Navy ROTC Scholarship',
    provider: 'U.S. Navy',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.0,
    states: [],
    majors: [],
    deadline: '2026-01-31',
    website: 'https://www.nrotc.navy.mil',
    description:
      'Full tuition + fees + books + $250–$400/month stipend at 160+ host colleges. Commit to 4–8 years of active duty Navy or Marine Corps service after graduation.',
  },
  {
    name: 'Air Force ROTC Scholarship',
    provider: 'U.S. Air Force',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 3.0,
    states: [],
    majors: [],
    deadline: '2025-12-01',
    website: 'https://www.afrotc.com/scholarships/',
    description:
      'Full tuition + textbooks + $300–$500/month living stipend at 1,100+ colleges. Commit to 4 years of active duty in the Air Force or Space Force after graduation.',
  },
  {
    name: 'AmeriCorps Segal Education Award',
    provider: 'AmeriCorps / Corporation for National and Community Service',
    amount: 7395,
    amount_type: 'fixed',
    gpa_min: null,
    states: [],
    majors: [],
    deadline: null,
    website: 'https://americorps.gov/members-volunteers/segal-americorps-education-award',
    description:
      'Up to $7,395 education award after completing a term of AmeriCorps service (VISTA, State & National, or NCCC). Use toward student loans or tuition. Apply for AmeriCorps service to earn this award.',
  },
  // ── Faith / Cultural ────────────────────────────────────────────────────────
  {
    name: 'Knights of Columbus Scholarship',
    provider: 'Knights of Columbus',
    amount: 2500,
    amount_type: 'per_year',
    gpa_min: null,
    states: [],
    majors: [],
    deadline: '2026-05-01',
    website: 'https://www.kofc.org/en/members/scholarships.html',
    description:
      'Multiple scholarships from $500–$2,500/year for children and grandchildren of Knights of Columbus members. Includes the Matthews/Swift Award, John W. McDevitt Scholarship, and Bishop Greco Fellowship.',
  },
  {
    name: 'Presbyterian Church (USA) Financial Aid',
    provider: 'Presbyterian Church USA',
    amount: 2000,
    amount_type: 'per_year',
    gpa_min: 2.5,
    states: [],
    majors: [],
    deadline: '2026-06-01',
    website: 'https://www.presbyterianmission.org/ministries/higher-education/financial-aid/',
    description:
      'Need-based scholarships of $100–$2,000/year for active PC(USA) members attending accredited colleges. Several program tracks available, including the National Presbyterian College Scholarship.',
  },
  // ── Essay / Competition-Based ───────────────────────────────────────────────
  {
    name: 'Scholastic Art & Writing Awards',
    provider: 'Alliance for Young Artists & Writers',
    amount: 10000,
    amount_type: 'fixed',
    gpa_min: null,
    states: [],
    majors: ['Arts & Design', 'English & Literature'],
    deadline: '2025-12-31',
    website: 'https://www.artandwriting.org',
    description:
      'National recognition + scholarships up to $10,000 for student writers and visual artists in grades 7–12. American Visions and Voices Medals carry the highest distinction.',
  },
  // ── Health Sciences ─────────────────────────────────────────────────────────
  {
    name: 'Indian Health Service Scholarship',
    provider: 'Indian Health Service / U.S. Department of Health & Human Services',
    amount: null,
    amount_type: 'full_tuition',
    gpa_min: 2.0,
    states: [],
    majors: ['Health Sciences', 'Nursing', 'Medicine & Pre-Med', 'Science'],
    deadline: '2026-03-28',
    website: 'https://www.ihs.gov/scholarship/',
    description:
      'Full tuition + fees + living stipend for American Indian and Alaska Native students pursuing health professions degrees. Requires service commitment in an IHS or tribal health facility after graduation.',
  },
  {
    name: 'HRSA Faculty Loan Repayment Program',
    provider: 'Health Resources & Services Administration',
    amount: 40000,
    amount_type: 'fixed',
    gpa_min: null,
    states: [],
    majors: ['Health Sciences', 'Nursing', 'Medicine & Pre-Med'],
    deadline: null,
    website: 'https://bhw.hrsa.gov/loans-scholarships',
    description:
      'Up to $40,000 in student loan repayment for health professions faculty from disadvantaged backgrounds who commit to teaching at eligible health professions schools. Rolling deadlines.',
  },
  {
    name: 'American Association of Nurse Anesthetists Scholarship',
    provider: 'AANA Foundation',
    amount: 3000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: ['Nursing', 'Health Sciences'],
    deadline: '2026-04-15',
    website: 'https://www.aana.com/membership/become-a-crna/aana-foundation-scholarship-program',
    description:
      'Multiple scholarships from $1,000–$3,000 for nurse anesthesia students. Based on academic achievement, professional involvement, and financial need.',
  },
  // ── Education & Social Work ─────────────────────────────────────────────────
  {
    name: 'TEACH Grant',
    provider: 'U.S. Department of Education',
    amount: 4000,
    amount_type: 'per_year',
    gpa_min: 3.25,
    states: [],
    majors: ['Education'],
    deadline: null,
    website: 'https://studentaid.gov/understand-aid/types/grants/teach',
    description:
      'Up to $4,000/year for students planning to teach in high-need subjects at low-income schools. Converts to an unsubsidized loan if teaching commitment is not fulfilled after graduation.',
  },
  {
    name: 'Teach For America Stipend',
    provider: 'Teach For America',
    amount: 6000,
    amount_type: 'fixed',
    gpa_min: null,
    states: [],
    majors: ['Education', 'Social Work'],
    deadline: null,
    website: 'https://www.teachforamerica.org',
    description:
      "Up to $6,000 AmeriCorps education award + competitive entry-level salary for recent graduates who join TFA's 2-year teaching corps. Placed in low-income schools across the U.S.",
  },
  // ── Business / Law / Journalism ──────────────────────────────────────────────
  {
    name: 'LAGRANT Foundation Scholarship',
    provider: 'LAGRANT Foundation',
    amount: 5000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: ['Communications & Journalism', 'Business & Management', 'Arts & Design'],
    deadline: '2026-02-28',
    website: 'https://www.lagrantfoundation.org',
    description:
      '$2,500–$5,000 for underrepresented minorities (African American, Asian Pacific American, Hispanic/Latino, Native American) pursuing advertising, PR, or marketing degrees.',
  },
  {
    name: 'Society of Professional Journalists Scholarship',
    provider: 'Society of Professional Journalists Foundation',
    amount: 3000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: ['Communications & Journalism', 'English & Literature'],
    deadline: '2026-04-01',
    website: 'https://www.spj.org/scholarships.asp',
    description:
      'Multiple scholarships from $1,000–$3,000 for journalism students. Includes the Ken Hines Scholarship, Don Balmer Scholarship, and others. Apply through your SPJ regional chapter.',
  },
  {
    name: 'Law School Admission Council Diversity Matters Scholarship',
    provider: 'Law School Admission Council',
    amount: 10000,
    amount_type: 'fixed',
    gpa_min: 3.0,
    states: [],
    majors: ['Law', 'History & Political Science', 'Criminal Justice'],
    deadline: '2026-05-01',
    website: 'https://www.lsac.org/diversity-matters-scholarship',
    description:
      'Up to $10,000 for law students from underrepresented groups. Includes mentoring from legal professionals and support through the LSAC network.',
  },
]

// ─── Ingestion Logic ───────────────────────────────────────────────────────────

async function runFetchSources(
  dryRun: boolean,
  existing: Set<string>,
  supabase: ReturnType<typeof createClient>
): Promise<{ added: number; skipped: number; errors: number }> {
  let added = 0; let skipped = 0; let errors = 0

  for (const source of FETCH_SOURCES) {
    const record = source.fallback
    const key = (record.website ?? '').toLowerCase()

    if (existing.has(key)) {
      console.log(`  ⏭  Already exists: ${record.name}`)
      skipped++
      continue
    }

    process.stdout.write(`  Fetching ${source.url} … `)
    const html = await fetchHtml(source.url)

    const final: ScholarshipRecord = html && source.parse
      ? source.parse(html, record)
      : record

    if (html) {
      console.log('✓ fetched')
    } else {
      console.log('✗ failed (using fallback)')
    }

    if (dryRun) {
      console.log(`  [dry-run] Would insert: ${final.name} (${final.amount_type})`)
      added++
      continue
    }

    const { error } = await supabase.from('scholarships').insert(final)
    if (error) {
      console.log(`  ❌ DB error: ${error.message}`)
      errors++
    } else {
      console.log(`  ✅ Inserted: ${final.name}`)
      existing.add(key)
      added++
    }

    await new Promise(r => setTimeout(r, 1500))
  }

  return { added, skipped, errors }
}

async function runCurated(
  dryRun: boolean,
  existing: Set<string>,
  supabase: ReturnType<typeof createClient>,
  collegeIdMap: Map<string, string>
): Promise<{ added: number; skipped: number; errors: number }> {
  let added = 0; let skipped = 0; let errors = 0

  for (const record of CURATED_SCHOLARSHIPS) {
    const key = (record.website ?? '').toLowerCase()

    if (existing.has(key)) {
      console.log(`  ⏭  Already exists: ${record.name}`)
      skipped++
      continue
    }

    // Resolve college_id from college_name
    let college_id: string | null = null
    if (record.college_name) {
      college_id = collegeIdMap.get(record.college_name.toLowerCase()) ?? null
      if (!college_id) {
        console.log(`  ⚠  No college match for "${record.college_name}" (scholarship: ${record.name})`)
      }
    }

    if (dryRun) {
      console.log(`  [dry-run] Would insert: ${record.name} (${record.amount_type})${college_id ? ` → college_id: ${college_id}` : ''}`)
      added++
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { college_name: _cn, ...insertData } = record
    const { error } = await supabase.from('scholarships').insert({
      ...insertData,
      college_id,
    })
    if (error) {
      console.log(`  ❌ ${record.name}: ${error.message}`)
      errors++
    } else {
      console.log(`  ✅ ${record.name}${college_id ? ' (linked to college)' : ''}`)
      existing.add(key)
      added++
    }
  }

  return { added, skipped, errors }
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const sourceArg = args.includes('--source')
    ? args[args.indexOf('--source') + 1]
    : 'all'

  if (!['curated', 'fetch', 'all'].includes(sourceArg)) {
    console.error('--source must be one of: curated, fetch, all')
    process.exit(1)
  }

  console.log('\n🎓 Scholarship Ingestion')
  console.log(`   Mode:   ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log(`   Source: ${sourceArg}`)
  console.log()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Build dedup set from existing website URLs
  const { data: existing, error: fetchErr } = await supabase
    .from('scholarships')
    .select('website')
  if (fetchErr) {
    console.error('Failed to fetch existing scholarships:', fetchErr.message)
    process.exit(1)
  }

  const existingSet = new Set(
    (existing ?? [])
      .map((r: { website: string | null }) => (r.website ?? '').toLowerCase())
      .filter(Boolean)
  )
  console.log(`Existing scholarships in DB: ${existingSet.size}\n`)

  // Build college name → ID map for linking university scholarships
  console.log('Loading college lookup table…')
  const { data: colleges } = await supabase
    .from('colleges')
    .select('id, name')
  const collegeIdMap = new Map<string, string>()
  for (const c of colleges ?? []) {
    collegeIdMap.set((c.name as string).toLowerCase(), c.id as string)
  }
  console.log(`Loaded ${collegeIdMap.size} colleges for matching\n`)

  let totalAdded = 0
  let totalSkipped = 0
  let totalErrors = 0

  if (sourceArg === 'fetch' || sourceArg === 'all') {
    console.log('── HTTP Fetch Sources ──────────────────────────────────')
    const r = await runFetchSources(dryRun, existingSet, supabase)
    totalAdded += r.added; totalSkipped += r.skipped; totalErrors += r.errors
    console.log()
  }

  if (sourceArg === 'curated' || sourceArg === 'all') {
    console.log('── Curated Dataset ─────────────────────────────────────')
    const r = await runCurated(dryRun, existingSet, supabase, collegeIdMap)
    totalAdded += r.added; totalSkipped += r.skipped; totalErrors += r.errors
    console.log()
  }

  console.log('═══ Summary ═════════════════════════════════════════════')
  console.log(`  Added:   ${totalAdded}`)
  console.log(`  Skipped: ${totalSkipped} (already in DB)`)
  console.log(`  Errors:  ${totalErrors}`)
  console.log()
}

main().catch(console.error)

