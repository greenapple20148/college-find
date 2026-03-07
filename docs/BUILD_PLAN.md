# MVP Build Plan
## CollegeMatch — Weekly Development Phases

---

## Prerequisites

Before starting development:
1. Create Supabase project at supabase.com (free tier)
2. Get College Scorecard API key at https://api.data.gov/signup
3. Create Vercel account at vercel.com
4. Install: Node.js 20+, npm

---

## Week 1 — Foundation & Data

**Goal**: Running Next.js app connected to Supabase with real college data.

### Tasks

- [ ] `npm install` — install all dependencies
- [ ] Configure environment variables (`.env.local` from `.env.local.example`)
- [ ] Run Supabase migration (`supabase/migrations/001_init.sql`) via Supabase dashboard SQL editor
- [ ] Run seed script: `npx ts-node --esm scripts/seed-colleges.ts`
  - Expected: ~6,000–8,000 colleges inserted (4-year degree-granting institutions)
  - Verify in Supabase dashboard: Table Editor → colleges
- [ ] Confirm Next.js dev server runs: `npm run dev`
- [ ] Test `GET /api/colleges` returns data in browser

**Deliverable**: Supabase `colleges` table populated, app boots locally.

---

## Week 2 — API Layer & Matching Engine

**Goal**: All API routes functional and tested.

### Tasks

- [ ] Verify `GET /api/colleges` with filter params (state, tuition_max, etc.)
- [ ] Verify `GET /api/colleges/[id]` returns full detail
- [ ] Test `POST /api/match` with sample profile JSON
- [ ] Test `GET/POST/PATCH/DELETE /api/saved` endpoints
- [ ] Test `GET /api/scholarships` with gpa/state/major params
- [ ] Manually verify matching algorithm categorizations against 5 known schools
- [ ] Seed scholarship data (add 20–30 scholarships via Supabase dashboard or seed SQL)

**Test using**: curl or Postman / Bruno

```bash
curl 'http://localhost:3000/api/colleges?state=CA&tuition_max=50000&limit=5'

curl -X POST http://localhost:3000/api/match \
  -H 'Content-Type: application/json' \
  -d '{"gpa":3.6,"sat_total":1280,"preferred_states":["NY","NJ"],"budget_max":30000}'
```

**Deliverable**: All 7 API routes return correct data.

---

## Week 3 — Core UI (Layout + Search + Profile)

**Goal**: Working search experience with live data.

### Tasks

- [ ] Landing page renders with proper hero and nav
- [ ] Header navigation works across all routes
- [ ] `/profile` form saves to localStorage correctly
- [ ] `/search` page loads colleges from API on mount
- [ ] Filters trigger new API calls with correct params
- [ ] CollegeCard "Save" button writes to API + updates UI
- [ ] CollegeCard "+ Compare" button adds to CompareContext (max 4)
- [ ] Compare badge in header updates count

**Manual QA checklist**:
- [ ] Search for "University" — see results
- [ ] Filter by state "CA" — see only California schools
- [ ] Filter by tuition max $30,000 — see affordable schools
- [ ] Click Save on a card — card shows saved state
- [ ] Add 4 colleges to compare — 5th button is disabled
- [ ] Profile form fills and saves — localStorage contains correct JSON

---

## Week 4 — Match + Compare + Dashboard

**Goal**: Core differentiated features all working.

### Tasks

- [ ] `/match` calls `POST /api/match` on load using localStorage profile
- [ ] Shows redirect prompt if no profile set
- [ ] Safety / Match / Reach sections render with correct colors
- [ ] Probability % displayed per card
- [ ] Disclaimer banner visible
- [ ] `/compare` pulls from CompareContext
- [ ] Table shows all 11 stat rows
- [ ] Best-value highlighting works correctly
- [ ] Remove column button updates context and re-renders
- [ ] `/dashboard` loads saved colleges via `GET /api/saved?session_id=...`
- [ ] Status dropdown updates via `PATCH /api/saved/[id]`
- [ ] Deadline field updates correctly
- [ ] Color-coded deadline indicators working
- [ ] Delete button removes college from list

**Manual QA checklist**:
- [ ] Profile set → /match shows colleges in 3 categories
- [ ] No profile → /match shows "Set up your profile" screen
- [ ] Compare 2 schools → correct table rows
- [ ] Change status in dashboard → persists on page reload
- [ ] Delete a saved college → removed from list

---

## Week 5 — Scholarships + Polish + Deploy

**Goal**: Full MVP live on Vercel.

### Tasks

- [ ] `/scholarships` page loads and filters correctly
- [ ] Profile GPA pre-populates scholarship filter
- [ ] Loading states on all data-fetching components (skeleton cards)
- [ ] Empty states on all list views ("No colleges match your filters")
- [ ] Error states for API failures ("Something went wrong. Try again.")
- [ ] Mobile responsive: test on 375px width (iPhone SE)
- [ ] Header hamburger menu works on mobile
- [ ] Compare table horizontal scrolls on mobile
- [ ] Vercel deployment:
  - [ ] Connect GitHub repo to Vercel
  - [ ] Set environment variables in Vercel dashboard
  - [ ] Deploy → verify production URL
  - [ ] Test all pages on production

**Performance**:
- [ ] Lighthouse performance score > 80
- [ ] Images use `next/image` (college logos if added)
- [ ] API routes use Supabase server client (no exposed keys)

---

## Ongoing / Post-MVP

| Feature | Priority | Effort |
|---------|----------|--------|
| User auth (Supabase Auth) | High | M |
| Persistent saves across devices | High | M |
| College detail page `/colleges/[id]` | High | S |
| Export to PDF | Medium | M |
| Test-optional filter | Medium | S |
| Net price calculator (FAFSA estimate) | High | L |
| Email deadline reminders | Medium | L |
| Counselor view (shareable link) | Low | L |
| More scholarships (500+) | Medium | M |
| Real-time College Scorecard sync | Low | L |

---

## Environment Variables Reference

```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Only for seed script / server routes
SCORECARD_API_KEY=your_api_data_gov_key  # Only for seed script
```

---

## Commands Reference

```bash
# Development
npm run dev

# Type check
npm run type-check

# Linting
npm run lint

# Run seed script
npx ts-node --esm scripts/seed-colleges.ts

# Build for production
npm run build

# Start production build locally
npm start
```
