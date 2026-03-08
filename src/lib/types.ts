// CollegeFind — TypeScript Interfaces

export interface College {
  id: string
  unit_id: string
  name: string
  city: string | null
  state: string | null
  zip: string | null
  website: string | null
  control: 'public' | 'private_nonprofit' | 'private_forprofit' | null
  level: 'four_year' | 'two_year' | 'less_than_two_year' | null
  enrollment: number | null
  size_category: 'small' | 'medium' | 'large' | null
  tuition_in_state: number | null
  tuition_out_state: number | null
  net_price: number | null
  acceptance_rate: number | null   // 0.0–1.0
  sat_math_25: number | null
  sat_math_50: number | null
  sat_math_75: number | null
  sat_read_25: number | null
  sat_read_50: number | null
  sat_read_75: number | null
  act_25: number | null
  act_50: number | null
  act_75: number | null
  graduation_rate: number | null   // 0.0–1.0
  median_earnings: number | null
  programs: string[]
  slug?: string | null
  created_at?: string
  updated_at?: string
}

export interface StudentProfile {
  gpa: number
  sat_total: number | null    // Combined SAT score (Math + Reading), 400–1600
  act: number | null          // ACT Composite, 1–36
  intended_major: string | null
  preferred_states: string[]  // 2-letter state codes
  budget_max: number | null   // Max net price per year
  campus_size: 'small' | 'medium' | 'large' | 'any'
}

export type MatchCategory = 'safety' | 'match' | 'reach'

export interface ScoreBreakdown {
  base: number          // school acceptance rate (starting point)
  gpa_adj: number       // GPA adjustment (-0.30 to +0.20)
  test_adj: number      // test score adjustment (-0.10 to +0.15)
  fit_adj: number       // fit bonuses (in-state, major match)
  rule_cap: number | null  // probability cap applied by rule layer (null = none applied)
}

export interface MatchResult {
  college: College
  probability: number         // 0.0–1.0
  category: MatchCategory
  probability_label: string   // e.g. "82% estimated chance"
  budget_fit: boolean
  budget_note: string | null
  size_note: string | null
  score_breakdown: ScoreBreakdown
  explanation: string[]       // human-readable reasons for this score
}

export interface MatchResponse {
  disclaimer: string
  profile: StudentProfile
  results: {
    safety: MatchResult[]
    match: MatchResult[]
    reach: MatchResult[]
  }
  counts: {
    safety: number
    match: number
    reach: number
    total: number
  }
  filters_applied: {
    preferred_states: string[]
    budget_max: number | null
    campus_size: string
    states_relaxed: boolean
    budget_relaxed: boolean
  }
  generated_at: string
}

export type ApplicationStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'waitlisted'

export interface SavedCollege {
  id: string
  session_id: string
  college_id: string
  deadline: string | null     // ISO date string
  status: ApplicationStatus
  notes: string
  created_at: string
  updated_at: string
  college?: College           // Joined data
}

export interface Scholarship {
  id: string
  name: string
  provider: string | null
  amount: number | null
  amount_type: 'fixed' | 'per_year' | 'full_tuition' | 'varies'
  gpa_min: number | null
  states: string[]            // Empty = all states
  majors: string[]            // Empty = all majors
  deadline: string | null     // ISO date string
  website: string | null
  description: string | null
  created_at?: string
}

// ─── College Deadlines ────────────────────────────────────────────────────────

export type DeadlineSourceType = 'official' | 'commonapp' | 'manual'

export type DeadlineVerificationStatus =
  | 'official_verified'
  | 'commonapp_verified'
  | 'needs_review'

export interface CollegeDeadline {
  id: string
  college_id: string

  // Application deadlines
  early_action_deadline: string | null
  early_decision_1_deadline: string | null
  early_decision_2_deadline: string | null
  regular_decision_deadline: string | null

  // Rolling & transfer
  rolling_admission: boolean
  transfer_fall_deadline: string | null
  transfer_spring_deadline: string | null

  // Financial aid
  scholarship_priority_deadline: string | null
  fafsa_priority_deadline: string | null

  // Source tracking
  source_url: string
  source_type: DeadlineSourceType

  // Verification
  verification_status: DeadlineVerificationStatus
  last_verified_at: string | null
  verified_by: string | null

  // Cycle
  cycle_year: number

  // Admin
  admin_notes: string

  created_at?: string
  updated_at?: string

  // Joined data
  college?: College
}

export interface CollegeDeadlineApiResponse {
  data: CollegeDeadline | null
}

export interface CollegeDeadlinesListResponse {
  data: CollegeDeadline[]
  total: number
}

// Search/filter params
export interface CollegeFilters {
  q?: string
  state?: string              // Comma-separated, e.g. "CA,NY"
  control?: string
  size?: string
  tuition_max?: number
  acceptance_min?: number     // 0–100
  acceptance_max?: number     // 0–100
  major?: string
  limit?: number
  offset?: number
}

export interface CollegesApiResponse {
  data: College[]
  total: number
  limit: number
  offset: number
}

export interface ScholarshipsApiResponse {
  data: Scholarship[]
  total: number
}

export interface SavedCollegesApiResponse {
  data: SavedCollege[]
}

// US States list for the profile form
export const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
]

// ─── Cost Calculator ──────────────────────────────────────────────────────────

export interface FinancialProfile {
  annual_income: number          // Parent/household gross income
  family_size: number            // Total household size
  num_in_college: number         // Number of family members in college simultaneously
  home_state: string             // 2-letter state code (for in-state tuition check)
  dependency_status: 'dependent' | 'independent'
  // Independent student income (only used when dependency_status = 'independent')
  student_income?: number
}

export interface CostLineItem {
  label: string
  amount: number
  note?: string
}

export interface CostEstimate {
  college: College

  // Cost of Attendance
  tuition: number                // in-state or out-of-state
  room_board_estimate: number    // estimated room + board
  books_fees_estimate: number    // standard estimate
  total_coa: number

  // Aid calculation
  sai: number                    // Student Aid Index
  pell_grant: number             // Federal Pell Grant estimate
  institutional_aid_estimate: number  // Estimated institutional/merit aid
  total_grants: number

  // Net cost
  estimated_net_price: number    // total_coa - total_grants
  comparison_net_price: number | null  // college.net_price from Scorecard (all students avg)

  // Metadata
  is_in_state: boolean
  aid_breakdown: CostLineItem[]
}

// ─── Auth / User Profile ──────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  user_id: string
  gpa: number | null
  sat_score: number | null
  act_score: number | null
  major: string | null
  preferred_states: string[]
  budget_max: number | null
  campus_size: 'small' | 'medium' | 'large' | 'any'
  plan?: string | null
  created_at: string
  updated_at: string
}

export const MAJOR_OPTIONS = [
  'Agriculture',
  'Architecture',
  'Arts & Design',
  'Biology & Life Sciences',
  'Business & Management',
  'Communications & Journalism',
  'Computer Science & IT',
  'Criminal Justice',
  'Education',
  'Engineering',
  'English & Literature',
  'Environmental Science',
  'Health Sciences',
  'History & Political Science',
  'Law',
  'Mathematics',
  'Medicine & Pre-Med',
  'Nursing',
  'Psychology',
  'Social Work',
  'Science',
  'Technology',
  'Undecided',
]

// ─── ROI Calculator ───────────────────────────────────────────────────────────

export interface MajorSalaryData {
  id: string
  major: string
  median_salary: number
  salary_growth_rate: number
  salary_10yr: number | null
  source: string
}

export type ROICategory = 'high' | 'medium' | 'low'

export interface ROIInputs {
  college_id: string
  major: string
  years_of_study: number
  tuition_per_year: number
  scholarship_amount: number
  living_cost_per_year: number
  loan_interest_rate: number
  is_in_state: boolean
}

export interface ROIResult {
  // Input echo
  inputs: ROIInputs
  college_name: string

  // Calculated outputs
  total_tuition: number
  total_cost: number
  net_cost: number
  loan_amount: number
  expected_salary: number
  monthly_payment: number
  repayment_years: number
  roi_score: number
  roi_category: ROICategory

  // Extra insight
  salary_10yr: number | null
  lifetime_earnings_premium: number   // vs. avg high school grad ($30k/yr baseline)

  // Enhanced model fields
  salary_growth_rate: number          // Annual salary growth rate
  salary_by_year: number[]            // Salary at year 0..10
  graduation_rate: number             // 0.0–1.0
  employment_rate: number             // 0.0–1.0 (major-specific)
  adjusted_salary: number             // salary × grad_rate × employment_rate
  net_earnings_10yr: number           // Cumulative earnings minus loan payments after 10 years
  projections: YearlyProjection[]     // Year-by-year breakdown
}

export interface YearlyProjection {
  year: number                        // 1–10
  salary: number                      // Salary in that year
  cumulative_earnings: number         // Total cumulative earnings
  loan_balance: number                // Remaining loan balance
  cumulative_loan_paid: number        // Total loan payments made
  net_earnings: number                // cumulative_earnings - cumulative_loan_paid
  hs_cumulative_earnings: number      // High school baseline cumulative
}

export interface SavedROICalculation {
  id: string
  user_id: string
  college_id: string
  major: string
  years_of_study: number
  tuition_per_year: number
  scholarship_amount: number
  living_cost_per_year: number
  loan_interest_rate: number
  is_in_state: boolean
  total_cost: number
  net_cost: number
  loan_amount: number
  expected_salary: number
  monthly_payment: number
  repayment_years: number
  roi_score: number
  roi_category: ROICategory
  created_at: string
  college?: College
}

// ─── Application Checklist ────────────────────────────────────────────────────

export type TaskStatus = 'pending' | 'completed'

export interface ChecklistTask {
  id: string
  user_id: string
  college_id: string
  task_name: string
  task_status: TaskStatus
  due_date: string | null
  is_custom: boolean
  sort_order: number
  created_at: string
}

export const DEFAULT_TASKS = [
  'Create Common App account',
  'Add college to Common App',
  'Write personal essay',
  'Write supplemental essays',
  'Request recommendation letters',
  'Send transcripts',
  'Submit SAT/ACT scores',
  'Complete FAFSA',
  'Pay application fee',
  'Submit application',
]

// ─── Essay Brainstorming ──────────────────────────────────────────────────────

export interface EssayIdea {
  title: string
  hook: string
  themes: string[]
  outline: string[]
  reflection: string
}

export interface EssaySession {
  id: string
  user_id: string
  major: string | null
  activities: string | null
  leadership: string | null
  challenges: string | null
  achievements: string | null
  goals: string | null
  values: string | null
  essay_prompt: string
  generated_output: { ideas: EssayIdea[] } | null
  created_at: string
}

export const COMMON_APP_PROMPTS = [
  { key: 'background', label: 'Background, identity, interest, or talent' },
  { key: 'challenge', label: 'Lessons from an obstacle, setback, or failure' },
  { key: 'belief', label: 'A time you questioned or challenged a belief or idea' },
  { key: 'gratitude', label: 'An act of kindness or problem you were inspired to solve' },
  { key: 'growth', label: 'Personal growth or a new understanding of yourself' },
  { key: 'passion', label: 'A topic, idea, or concept that captivates you' },
  { key: 'choice', label: 'Topic of your choice' },
]
