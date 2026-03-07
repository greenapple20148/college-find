# API Routes Reference
## CollegeMatch — Next.js App Router API

Base URL: `https://yourdomain.com/api` (or `http://localhost:3000/api` locally)

All responses are JSON. Errors follow `{ error: string }` format.

---

## Colleges

### `GET /api/colleges`

Search and filter colleges. Returns paginated results.

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| q | string | Name search (partial match) |
| state | string | Comma-separated 2-letter state codes, e.g. `CA,NY,TX` |
| control | string | `public`, `private_nonprofit`, `private_forprofit` |
| size | string | `small`, `medium`, `large` |
| tuition_max | number | Max out-of-state tuition (dollars) |
| acceptance_min | number | Min acceptance rate (0–100) |
| acceptance_max | number | Max acceptance rate (0–100) |
| major | string | Program area keyword |
| limit | number | Results per page (default: 20, max: 100) |
| offset | number | Pagination offset (default: 0) |

**Response**

```json
{
  "data": [
    {
      "id": "uuid",
      "unit_id": "110662",
      "name": "University of California-Berkeley",
      "city": "Berkeley",
      "state": "CA",
      "control": "public",
      "size_category": "large",
      "enrollment": 31800,
      "tuition_in_state": 14312,
      "tuition_out_state": 44066,
      "net_price": 17000,
      "acceptance_rate": 0.14,
      "graduation_rate": 0.91,
      "median_earnings": 72000,
      "sat_math_50": 750,
      "sat_read_50": 720,
      "act_50": 33
    }
  ],
  "total": 842,
  "limit": 20,
  "offset": 0
}
```

---

### `GET /api/colleges/[id]`

Get full details for a single college.

**Path Parameters**: `id` — UUID from the colleges table

**Response**: Single college object with all fields including `programs[]`, `website`, all SAT/ACT percentile columns.

---

## Match

### `POST /api/match`

Run the admissions probability algorithm for a student profile.

**Request Body**

```json
{
  "gpa": 3.6,
  "sat_total": 1280,
  "act": null,
  "intended_major": "Nursing",
  "preferred_states": ["NY", "PA", "NJ"],
  "budget_max": 25000,
  "campus_size": "medium"
}
```

**All fields except `gpa` are optional.**

**Response**

```json
{
  "disclaimer": "These are statistical estimates based on publicly available data. They are not admission guarantees.",
  "profile": {
    "gpa": 3.6,
    "sat_total": 1280
  },
  "results": {
    "safety": [
      {
        "college": { "id": "...", "name": "Rutgers University", "state": "NJ", "..." : "..." },
        "probability": 0.82,
        "category": "safety",
        "probability_label": "82% estimated chance"
      }
    ],
    "match": [ "..." ],
    "reach": [ "..." ]
  },
  "counts": {
    "safety": 4,
    "match": 7,
    "reach": 11
  }
}
```

---

## Saved Colleges

### `GET /api/saved`

Get all saved colleges for a session.

**Query Parameters**: `session_id` (required) — UUID string

**Response**

```json
{
  "data": [
    {
      "id": "saved-uuid",
      "session_id": "session-uuid",
      "college_id": "college-uuid",
      "deadline": "2026-01-01",
      "status": "not_started",
      "notes": "My first choice!",
      "created_at": "2026-03-07T...",
      "college": { "name": "...", "state": "...", "..." : "..." }
    }
  ]
}
```

---

### `POST /api/saved`

Save a college to a session.

**Request Body**

```json
{
  "session_id": "uuid",
  "college_id": "uuid",
  "deadline": "2026-01-01",
  "status": "not_started",
  "notes": ""
}
```

**Response**: Created saved_college object. Returns 409 if already saved.

---

### `PATCH /api/saved/[id]`

Update deadline, status, or notes.

**Request Body** (all fields optional):

```json
{
  "deadline": "2026-11-15",
  "status": "submitted",
  "notes": "Submitted early decision"
}
```

**Response**: Updated saved_college object.

---

### `DELETE /api/saved/[id]`

Remove a saved college.

**Query Parameters**: `session_id` (for ownership verification)

**Response**: `{ "success": true }`

---

## Scholarships

### `GET /api/scholarships`

Get scholarships matching student criteria.

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| gpa | number | Student GPA (filters out scholarships with gpa_min > this value) |
| state | string | Student's state (returns scholarships available in this state or all states) |
| major | string | Student's major area (returns matching or all-major scholarships) |

**Response**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Gates Scholarship",
      "provider": "Gates Foundation",
      "amount": 0,
      "amount_type": "full_tuition",
      "gpa_min": 3.3,
      "states": [],
      "majors": [],
      "deadline": "2025-09-15",
      "website": "https://...",
      "description": "Full scholarship for high-achieving, minority students from low-income households."
    }
  ],
  "total": 12
}
```

---

## Error Responses

| Status | When |
|--------|------|
| 400 | Missing required fields, invalid parameter types |
| 404 | Resource not found |
| 409 | Duplicate (e.g. college already saved) |
| 500 | Internal server / Supabase error |

```json
{ "error": "session_id is required" }
```
