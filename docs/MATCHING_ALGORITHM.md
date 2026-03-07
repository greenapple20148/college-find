# Admissions Probability Matching Algorithm
## CollegeMatch — Design & Pseudocode

---

## Overview

The matching algorithm produces a statistical estimate of a student's admission probability at each institution. It combines:

1. **School selectivity** — the acceptance rate acts as a baseline
2. **GPA fit** — compared against an estimated GPA profile derived from selectivity
3. **Test score fit** (optional) — compared against the school's SAT/ACT middle 50% range

The result is an adjusted probability score categorized as Safety, Match, or Reach.

**Important**: This is a first-pass heuristic, not a machine-learning model. It does not account for legacy status, geographic diversity, athletic recruitment, demonstrated interest, or essay quality. All outputs are clearly labeled as estimates.

---

## Inputs

```
Student:
  gpa           Float   — GPA on 4.0 scale (required)
  sat_total     Int?    — Combined SAT (Math + Reading, 400–1600)
  act           Int?    — ACT Composite (1–36)

College (from database):
  acceptance_rate  Float?  — Overall admission rate (0.0–1.0)
  sat_math_50      Int?    — SAT Math median
  sat_read_50      Int?    — SAT Reading & Writing median
  act_50           Int?    — ACT Composite median
```

---

## Algorithm

### Step 1: Handle missing acceptance rate

If `acceptance_rate` is null (open admission or not reported), assign:
- `probability = 0.85` (open-access assumption)
- `category = 'safety'`
- Skip remaining steps.

---

### Step 2: Estimate school's expected GPA profile

Map acceptance rate to an estimated median admitted student GPA:

```
function gpaFromAcceptanceRate(rate: Float) → Float:
  if rate < 0.10: return 3.90   // Highly selective (MIT, Stanford tier)
  if rate < 0.20: return 3.75   // Very selective (Boston U, Tulane tier)
  if rate < 0.35: return 3.50   // Selective (Penn State, UConn tier)
  if rate < 0.50: return 3.25   // Moderately selective
  if rate < 0.70: return 3.00   // Less selective
  return 2.70                   // Open/broad access
```

This approximation is derived from publicly reported admitted student GPA ranges and IPEDS data aggregates. It is deliberately conservative.

---

### Step 3: Compute GPA factor (sigmoid)

The sigmoid function maps GPA difference to a 0–1 probability-like score:

```
school_gpa = gpaFromAcceptanceRate(college.acceptance_rate)
gpa_delta  = student.gpa - school_gpa
gpa_z      = gpa_delta / 0.30          // 0.30 = one-sigma GPA spread
gpa_factor = sigmoid(gpa_z)
           = 1 / (1 + exp(-gpa_z))

// Examples:
//   student 3.7 at school expecting 3.5 → z=0.67 → factor≈0.66
//   student 3.5 at school expecting 3.5 → z=0.00 → factor=0.50
//   student 3.2 at school expecting 3.5 → z=-1.00 → factor≈0.27
```

---

### Step 4: Compute test score factor (sigmoid)

If the student has SAT/ACT scores AND the college has test data:

```
// SAT path:
if student.sat_total is not null AND college.sat_math_50 is not null AND college.sat_read_50 is not null:
  school_sat_mid = college.sat_math_50 + college.sat_read_50   // combined midpoint
  sat_delta      = student.sat_total - school_sat_mid
  sat_z          = sat_delta / 150                             // ~one-sigma spread
  test_factor    = sigmoid(sat_z)

// ACT path (if no SAT):
elif student.act is not null AND college.act_50 is not null:
  act_delta   = student.act - college.act_50
  act_z       = act_delta / 5                                  // ~one-sigma spread
  test_factor = sigmoid(act_z)

// No test scores or no school data:
else:
  test_factor = 0.50     // neutral — no bonus or penalty
```

---

### Step 5: Compute composite score

Weighted average: GPA matters more than test scores.

```
composite = (gpa_factor * 0.60) + (test_factor * 0.40)
```

---

### Step 6: Compute adjusted probability

Scale around the school's base acceptance rate:

```
delta       = (composite - 0.50) * college.acceptance_rate * 1.50
raw_prob    = college.acceptance_rate + delta
probability = clamp(raw_prob, 0.03, 0.97)

// clamp prevents impossible values (0% or 100%)
// max probability cap of 97% preserves uncertainty
```

**Why multiply by acceptance_rate?** A highly selective school (5% acceptance rate) should have a narrower probability spread than a 70% school. This scaling prevents artificially high probabilities at elite schools for above-average students.

---

### Step 7: Categorize

```
function categorize(probability: Float) → Category:
  if probability >= 0.75: return 'safety'
  if probability >= 0.40: return 'match'
  return 'reach'
```

| Category | Probability Range | Interpretation |
|----------|-----------------|----------------|
| Safety | ≥ 75% | Strong fit; very likely to be admitted |
| Match | 40–74% | Solid candidate; outcome uncertain |
| Reach | < 40% | Below typical admit profile; possible but unlikely |

---

## Budget & Preference Filter

After scoring, apply student preference filters:

```
function filterColleges(colleges, student):
  return colleges.filter(c =>
    (student.preferred_states.length === 0 OR c.state IN student.preferred_states) AND
    (student.budget_max is null OR c.net_price <= student.budget_max) AND
    (student.campus_size === 'any' OR c.size_category === student.campus_size)
  )
```

The filtering happens before match scoring to limit the search space. If fewer than 15 results remain after filtering, relax state filter first, then budget filter, with UI feedback.

---

## Full Pseudocode

```
function runMatch(student, colleges):
  results = []

  for each college in colleges:
    if college.acceptance_rate is null:
      prob = 0.85
    else:
      school_gpa  = gpaFromAcceptanceRate(college.acceptance_rate)
      gpa_z       = (student.gpa - school_gpa) / 0.30
      gpa_factor  = 1 / (1 + exp(-gpa_z))

      if student.sat_total AND college.sat_math_50 AND college.sat_read_50:
        school_mid  = college.sat_math_50 + college.sat_read_50
        sat_z       = (student.sat_total - school_mid) / 150
        test_factor = 1 / (1 + exp(-sat_z))
      elif student.act AND college.act_50:
        act_z       = (student.act - college.act_50) / 5
        test_factor = 1 / (1 + exp(-act_z))
      else:
        test_factor = 0.50

      composite = gpa_factor * 0.60 + test_factor * 0.40
      delta     = (composite - 0.50) * college.acceptance_rate * 1.50
      prob      = clamp(college.acceptance_rate + delta, 0.03, 0.97)

    category = categorize(prob)
    results.push({ college, probability: prob, category })

  return {
    safety: results.filter(r => r.category === 'safety').sortBy(prob DESC),
    match:  results.filter(r => r.category === 'match').sortBy(prob DESC),
    reach:  results.filter(r => r.category === 'reach').sortBy(prob DESC),
  }
```

---

## Limitations & Disclaimers

1. GPA mapping table is an approximation based on publicly available aggregate data, not regression-fitted to actual outcomes.
2. The algorithm does not account for: major selectivity differences within a school, campus visit/demonstrated interest, legacy, geographic bonus, athletic/artistic talent, or financial need.
3. Test-optional policies: if a student submits no scores, `test_factor = 0.5` which is neutral. Schools with test-optional policies may or may not weight scores the same way — this is not modeled.
4. For schools with null SAT/ACT data (many smaller or open-access schools), test score has zero impact.
5. Probabilities for highly selective schools (< 10% acceptance rate) are especially uncertain — small changes in GPA produce large relative swings.
