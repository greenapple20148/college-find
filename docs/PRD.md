# Product Requirements Document
## CollegeMatch — U.S. College Admission Search Platform

**Version**: 1.0 MVP
**Date**: 2026-03-07
**Audience**: 12th-grade U.S. high school students

---

## 1. Problem Statement

High school seniors face a fragmented, opaque college search process. They must manually cross-reference dozens of spreadsheets, navigate confusing institutional websites, and rely on expensive counselors to estimate their admission chances. First-generation students and those without access to premium college prep services are disproportionately disadvantaged.

CollegeMatch centralizes discovery, fit estimation, comparison, and application tracking into a single free platform.

---

## 2. Goals

| Goal | Metric |
|------|--------|
| Help students find colleges that fit their academic and financial profile | Students complete ≥3 saves within a session |
| Provide transparent admission probability estimates | Match rate accuracy within ±15% of actual outcomes (tracked post-MVP) |
| Reduce time to build a balanced application list | Students reach a Safety/Match/Reach list in < 5 minutes |
| Surface financial aid opportunities | ≥1 scholarship match per student profile |

---

## 3. Non-Goals (MVP)

- Real-time admissions decisions or official estimates
- User authentication / persistent accounts (session-based only)
- Essays, recommendation tracking, or document management
- International universities
- Graduate school search

---

## 4. User Personas

**Primary**: Maya, 17, high school senior
- GPA: 3.6, SAT: 1280
- First-generation college student
- Interested in nursing, prefers East Coast
- Budget: $25k/year net price max
- Overwhelmed by options, unsure what she can get into

**Secondary**: Parents helping coordinate applications
**Tertiary**: School counselors reviewing options with students

---

## 5. Features

### 5.1 Student Profile Form (`/profile`)
- GPA input (0.0–4.0 scale, weighted GPA note)
- SAT total (400–1600) and/or ACT composite (1–36), both optional
- Intended major (dropdown: 20 major areas based on CIP categories)
- Preferred states (multi-select, up to 10)
- Annual budget (net price max, slider: $5k–$80k+)
- Campus size preference (small <2k, medium 2–15k, large >15k, no preference)
- Profile stored in localStorage, editable at any time

### 5.2 College Search (`/search`)
- Text search by institution name
- Filters: state, public/private, campus size, tuition max, acceptance rate range
- Results as card grid (20 per page, infinite scroll or pagination)
- Each card: name, city/state, control, size, tuition (out-of-state), acceptance rate, graduation rate
- Add to compare button (max 4), save button
- Link to full detail view

### 5.3 College Match Tool (`/match`)
- Requires profile to be set
- Runs POST /api/match with student profile
- Returns colleges sorted into Safety / Match / Reach sections
- Each card shows: admission probability %, category badge, key stats
- Disclaimer: "These are estimates based on statistical averages. They are not guarantees."
- Filter results by state, budget fit, major availability

### 5.4 College Comparison (`/compare`)
- Compare 2–4 schools side-by-side
- Rows: In-state tuition, Out-of-state tuition, Net price, Acceptance rate, Graduation rate, Median earnings (10yr), Enrollment, Location, Control, SAT mid, ACT mid
- Highlight best value in each row (green)
- Export as PDF (post-MVP)

### 5.5 Saved Colleges + Dashboard (`/dashboard`)
- List of saved colleges with deadline and status fields
- Status options: Not Started, In Progress, Submitted, Accepted, Rejected, Waitlisted
- Sort by deadline (nearest first)
- Color-coded deadlines (red < 7 days, yellow < 30 days)
- Notes field per college
- Session persisted in localStorage; optional Supabase sync via anonymous session ID

### 5.6 Scholarship Section (`/scholarships`)
- Filter by: minimum GPA, eligible states, major area
- Cards: name, provider, amount, deadline, eligibility summary, link
- Pre-seeded dataset of ~50 major national/state scholarships
- Disclaimer: "Always verify eligibility on the scholarship provider's official website."

---

## 6. Data Sources

| Source | URL | Use |
|--------|-----|-----|
| College Scorecard | https://collegescorecard.ed.gov/data/ | Primary college data (admissions, cost, outcomes) |
| IPEDS | https://nces.ed.gov/ipeds/ | Cross-reference for programs and institutional characteristics |
| College Scorecard API | https://api.data.gov/ed/collegescorecard/v1/schools | Live data pull via seed script |

All data is from U.S. Department of Education official sources. Data is fetched at import time and stored in Supabase; not proxied live to avoid rate limits.

---

## 7. Technical Architecture

```
Browser (Next.js App Router)
  └── Pages: /, /profile, /search, /match, /compare, /dashboard, /scholarships
  └── React Context: ProfileContext, CompareContext
  └── localStorage: profile JSON, saved colleges, session ID

Next.js API Routes
  ├── GET  /api/colleges          ← Supabase query
  ├── GET  /api/colleges/[id]     ← Supabase query
  ├── POST /api/match             ← matching.ts + Supabase
  ├── GET  /api/saved             ← Supabase
  ├── POST /api/saved             ← Supabase
  ├── PATCH/DELETE /api/saved/[id]← Supabase
  └── GET  /api/scholarships      ← Supabase

Supabase (PostgreSQL)
  ├── colleges (seeded from College Scorecard)
  ├── saved_colleges (session-scoped)
  └── scholarships (hand-curated seed)
```

---

## 8. Success Metrics (Post-Launch)

- Session length > 8 minutes (engaged usage)
- Profile completion rate > 60%
- ≥1 college saved per 70% of sessions
- Return visit rate > 30% (measured by session ID recurrence)

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| College Scorecard data has gaps (null acceptance rates) | Show "Data unavailable" gracefully; exclude from match scoring |
| Students misinterpret probabilities as guarantees | Bold disclaimer on match page; use language like "estimated chance" |
| localStorage loss if browser cleared | Prompt to note down session ID for potential recovery |
| College data goes stale | Re-run seed script quarterly; show "Data as of [date]" in UI |
