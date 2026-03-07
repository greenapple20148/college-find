# UI Components Reference
## CollegeMatch — Next.js + Tailwind CSS

---

## Design System

**Colors**
- Primary: Indigo (`indigo-600` / `indigo-700`)
- Safety badge: Green (`green-100` / `green-700`)
- Match badge: Blue (`blue-100` / `blue-700`)
- Reach badge: Orange (`orange-100` / `orange-700`)
- Background: `gray-50`
- Card background: white
- Text: `gray-900` (primary), `gray-500` (secondary)

**Typography**
- Font: Inter (via next/font/google)
- Page headings: `text-2xl font-bold`
- Card titles: `text-lg font-semibold`
- Labels: `text-sm text-gray-500`

**Border radius**: `rounded-xl` for cards, `rounded-lg` for buttons/inputs

---

## Pages

### `/` — Landing Page

**Components**: Hero section, 6 feature cards, "Get Started" CTA

```
┌─────────────────────────────────────────┐
│  CollegeMatch                    [Nav]  │
│                                         │
│  Find your perfect college fit          │
│  Free tools for 12th graders            │
│                                         │
│  [ Create My Profile ]                  │
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │Search│ │Match │ │Compare│ │Track│  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
└─────────────────────────────────────────┘
```

---

### `/profile` — Student Profile Form

**Component**: `ProfileForm`

Fields:
- GPA: number input (0.0–4.0, step 0.1)
- SAT Total: number input (400–1600, optional)
- ACT Composite: number input (1–36, optional)
- Intended Major: `<Select>` (20 CIP-based options)
- Preferred States: multi-select checkboxes (all 50 states + DC, up to 10)
- Annual Budget (net price max): range slider ($5k–$80k, label "No limit" at max)
- Campus Size: radio buttons (Small / Medium / Large / No Preference)
- Submit: "Save Profile & Find Matches"

On submit: save to `localStorage['collegematch_profile']`, navigate to `/match`.

---

### `/search` — College Search

**Layout**: Sidebar filters (left 280px) + main grid (right, fluid)

**Components**:
- `CollegeFilters` — filter sidebar/panel with all filter controls
- `CollegeGrid` — responsive grid of `CollegeCard` components
- `CollegeCard` — individual college result card

```
┌─────────────────────────────────────────────────┐
│  [Search colleges...]              420 results  │
├──────────┬──────────────────────────────────────┤
│ Filters  │  ┌────┐ ┌────┐ ┌────┐              │
│          │  │Card│ │Card│ │Card│              │
│ State    │  └────┘ └────┘ └────┘              │
│ Control  │  ┌────┐ ┌────┐ ┌────┐              │
│ Size     │  │Card│ │Card│ │Card│              │
│ Tuition  │  └────┘ └────┘ └────┘              │
│ Accept % │                                     │
└──────────┴──────────────────────────────────────┘
```

**CollegeCard** shows:
- Institution name (link to future detail page)
- City, State + Control badge (`public`/`private`)
- Acceptance rate (or "Not reported")
- Out-of-state tuition (formatted as $X,XXX)
- Graduation rate
- [+ Compare] button (disabled when 4 already selected)
- [♡ Save] button (toggles saved state)

---

### `/match` — Safety / Match / Reach

**Requires**: Profile in localStorage. If missing, redirect to `/profile`.

**Components**: `MatchSection`, `MatchCard`

```
⚠️  These are estimates, not guarantees. Based on publicly available data.

Safety (4)    ━━━━━━━━━━━━━━━━
  ┌─────────────────────────────────────────┐
  │ Rutgers University           [82%] 🟢   │
  │ New Brunswick, NJ · Public · Large      │
  │ Tuition: $32,189 · Accept: 61%         │
  └─────────────────────────────────────────┘

Match (7)     ━━━━━━━━━━━━━━━━
  ...

Reach (11)    ━━━━━━━━━━━━━━━━
  ...
```

**MatchCard** shows:
- College name, location, control
- Probability % badge (colored by category)
- Key stats: tuition (net price if available), acceptance rate, graduation rate
- [Save] button
- [+ Compare] button

---

### `/compare` — Side-by-Side Comparison

**Requires**: ≥2 colleges in compare list.

**Component**: `CompareTable`

```
┌───────────┬────────────┬────────────┬────────────┐
│           │ UC Berkeley│ NYU        │ BU         │
├───────────┼────────────┼────────────┼────────────┤
│ Location  │ Berkeley CA│ New York NY│ Boston MA  │
│ Control   │ Public     │ Private    │ Private    │
│ Size      │ Large      │ Large      │ Large      │
│ In-State  │ $14,312 🟢 │ $58,168    │ $60,792    │
│ Out-State │ $44,066    │ $58,168    │ $60,792    │
│ Net Price │ $17,000 🟢 │ $32,000    │ $35,000    │
│ Accept %  │ 14%        │ 12%        │ 19%        │
│ Grad Rate │ 91% 🟢     │ 84%        │ 85%        │
│ Med Earn  │ $72,000 🟢 │ $67,000    │ $64,000    │
│ SAT Mid   │ 1470       │ 1440       │ 1390       │
│ ACT Mid   │ 33         │ 32         │ 32         │
└───────────┴────────────┴────────────┴────────────┘
```

- Best value per row highlighted in green
- "Remove" button per column header
- Up to 4 columns

---

### `/dashboard` — Saved Colleges

**Components**: `SavedCollegeRow`, `DeadlineTracker`

```
My College List (6)

┌──────────────────────────────────────────────────────┐
│ University of Michigan      [ Nov 1 🔴] [Submitted ▾]│
│ Ann Arbor, MI · Public                    [notes] [🗑] │
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│ Penn State                  [ Jan 1 🟡] [In Progress]│
│ University Park, PA · Public              [notes] [🗑] │
└──────────────────────────────────────────────────────┘
```

Deadline color coding:
- Red: < 7 days away
- Yellow: 7–30 days away
- Green: > 30 days away
- Gray: no deadline set

Status dropdown: Not Started / In Progress / Submitted / Accepted / Rejected / Waitlisted

---

### `/scholarships` — Scholarship Search

Auto-populated from student profile (if set), or filter manually.

```
┌──────────────────────────────────────────────────┐
│ Gates Scholarship                         [Full] │
│ Gates Foundation · Deadline: Sep 15, 2025        │
│ GPA ≥ 3.3 · All States · All Majors             │
│ Full scholarship for high-achieving minority...  │
│ [Apply →]                                        │
└──────────────────────────────────────────────────┘
```

---

## Shared Components

### `Button`
Props: `variant` (primary | secondary | ghost | danger), `size` (sm | md | lg), `disabled`, `onClick`, `children`

### `Card`
Props: `className?`, `children` — white rounded-xl shadow-sm wrapper

### `Badge`
Props: `variant` (safety | match | reach | public | private | info), `children`

### `Input`
Props: `label`, `type`, `value`, `onChange`, `min`, `max`, `step`, `placeholder`, `error?`

### `Select`
Props: `label`, `value`, `onChange`, `options: { value, label }[]`, `placeholder?`, `error?`

---

## Header Navigation

```
CollegeMatch    [Search]  [My Matches]  [Compare(2)]  [Dashboard]  [Scholarships]
```

- Compare link shows count badge when colleges are in compare list
- Profile icon → `/profile`
- Mobile: hamburger menu

---

## Responsive Breakpoints

- Mobile (< 640px): Stack filters above results, single-column card grid, horizontal scroll on compare table
- Tablet (640–1024px): 2-column card grid, collapsible filter panel
- Desktop (> 1024px): Sidebar + 3-column card grid, full compare table
