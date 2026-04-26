
# Multi-Candidate Matching Refactoring Plan

## Context

**Problem:** The current career system is single-candidate by design -- one CV, one profile, one user. A consulting firm needs to match _multiple_ consultants against incoming client project requirements.

**Intended outcome:** A refactored system that can:

1. Store multiple consultant profiles (CVs, proof points, availability, billing rates)
2. Ingest client project requirements (structured job descriptions)
3. Rank consultants by fit score for each project
4. Handle reverse matching (which projects fit a given consultant)

---

## Assessment: Yes, It's Possible

The codebase is well-structured for this refactoring. The existing archetype framework, Block B CV-match logic, and markdown-based data model can be extended. Key strengths to leverage:

- **Archetype system** (6 types) provides a reusable fit classification framework
- **Block B evaluation** already maps JD requirements to CV lines -- can be parallelized across candidates
- **Markdown/YAML data model** scales naturally to multi-directory structures
- **Skill keyword extraction** (`analyze-patterns.mjs`) can drive multi-candidate matching

---

## Data Model Changes

### New Directory Structure

```
data/
├── candidates/                    # NEW: Multi-candidate storage
│   ├── {slug}/
│   │   ├── cv.md                 # Consultant CV
│   │   ├── profile.yml           # Targets, archetypes, narrative
│   │   ├── article-digest.md     # Proof points
│   │   ├── availability.yml      # NEW: availability status, notice period
│   │   └── consulting-data.yml   # NEW: bill rate, clearance, visa, domains
│   └── ...
├── jobs/                          # NEW: Structured job requirements
│   ├── {slug}.yml                # Client project requirements
│   └── ...
├── applications.md               # KEEP: existing single-user tracker
├── pipeline.md                   # KEEP: existing single-user inbox
└── ...
```

### Consulting-Specific Fields (New)

**`availability.yml`** per candidate:

- `status`: available / on-project / unavailable
- `notice_period`: "2 weeks" / "1 month", etc.
- `preferred_start`: YYYY-MM-DD
- `capacity_hours_per_week`: number

**`consulting-data.yml`** per candidate:

- `bill_rate_range`: "$150-200/hr"
- `currency`: "USD"
- `security_clearance`: ["secret", "top-secret"] or []
- `visa_status`: "US citizen", "green card", "H1B"
- `domains`: ["financial services", "healthcare", "AI/ML"]
- `certifications`: ["AWS Solutions Architect", ...]
- `industries_experience`: ["fintech", "edtech", ...]

**`jobs/{slug}.yml`** per project:

- `title`, `company`, `client_slug`
- `requirements`: list of must-have skills
- `nice_to_haves`: list of preferred skills
- `archetype`: inferred or specified (AI Platform, Agentic, etc.)
- `budget_range`: bill rate range client pays
- `clearance_required`: [] or ["secret"]
- `visa_required`: boolean
- `domain`: client domain
- `description_raw`: full JD text
- `status`: open / filled / cancelled

---

## Matching Algorithm

### Core Approach: Extend Block B

The existing Block B (CV Match) logic already does requirement-to-CV mapping. Reuse and parallelize:

1. **Structured matching** -- Extract skills/keywords from `jobs/{slug}.yml` requirements
2. **Per-candidate scoring** -- For each candidate, run Block B-style matching:
    - Skills match (keywords from JD vs candidate CV lines)
    - Archetype fit (candidate archetypes vs job archetype)
    - Proof points relevance (article-digest items vs JD domain)
    - Availability alignment (status + notice period)
    - Rate alignment (candidate rate vs client budget)
    - Clearance/visa match (hard filters)
3. **Aggregate score** -- Weighted average → 1-5 scale

### Weighting (Configurable)

Default weights in `config/profile.yml` (system-wide settings):

| Factor         | Weight | Notes                            |
| -------------- | ------ | -------------------------------- |
| Skills Match   | 40%    | Core competency alignment        |
| Archetype Fit  | 25%    | Role type alignment              |
| Proof Points   | 15%    | Relevant experience/achievements |
| Availability   | 10%    | Must be available                |
| Rate Alignment | 5%     | Budget fit                       |
| Clearance/Visa | 5%     | Hard filter                      |

### Reverse Matching

Also support: "Given this consultant, rank open projects by fit"

- Same algorithm, inverted: iterate jobs instead of candidates
- Useful for account managers pitching consultants to new projects

---

## New Modes

### `modes/match.md` (NEW)

Primary matching mode:

- Input: Job slug or candidate slug
- Output: Ranked match report with scores, gaps, recommendations
- Triggered by: `/career match {job-slug}` or `/career match --candidate {slug}`

### `modes/batch-match.md` (NEW)

Bulk matching for when new jobs arrive:

- Input: `data/jobs/` with new submissions
- Output: For each job, ranked candidate list
- Triggered by: `/career batch-match`

---

## New Scripts

### `scripts/match-candidates.mjs`

```javascript
// Pseudocode structure
const candidates = loadAllCandidates('data/candidates/')
const jobs = loadAllJobs('data/jobs/')

for (const job of jobs) {
  const scores = []
  for (const candidate of candidates) {
    const score = calculateFit(candidate, job)  // Reuses Block B logic
    scores.push({ candidate, score })
  }
  scores.sort((a, b) => b.score - a.score)
  generateMatchReport(job, scores)
}
```

### `scripts/cv-sync-check.mjs` (existing)

Already exists -- verifies candidate files are properly synced.

### `scripts/ingest-job.mjs` (NEW)

Ingests a raw JD (text/URL) and creates structured `jobs/{slug}.yml`:

- Uses LLM to extract structured requirements from free-form JD
- Saves as YAML for matching

---

## Implementation Steps

1. **Create directory structure** -- `data/candidates/`, `data/jobs/`
2. **Define YAML schemas** -- `consulting-data.yml`, `availability.yml`, `jobs/{slug}.yml`
3. **Create `scripts/ingest-job.mjs`** -- Two modes:
    - Structured: Direct YAML creation from form input
    - Free-form: LLM-assisted extraction from raw JD text
4. **Create `scripts/match-candidates.mjs`** -- Core matching engine with Block B-style parallel scoring
5. **Create `modes/match.md`** -- Interactive matching mode (`/career match`)
6. **Create `modes/batch-match.md`** -- Bulk matching mode (`/career batch-match`)
7. **Update `DATA_CONTRACT.md`** -- Document new directories
8. **Update `CLAUDE.md`** -- Document consulting mode commands
9. **Test** -- Run matching against 3-5 test candidates + jobs

---

## Critical Files to Modify

| File                           | Change                                             |
| ------------------------------ | -------------------------------------------------- |
| `DATA_CONTRACT.md`             | Add `data/candidates/`, `data/jobs/` to User Layer |
| `CLAUDE.md`                    | Document multi-candidate mode, new commands        |
| `config/profile.yml`           | Add matching weights, system defaults              |
| `modes/_shared.md`             | Extract reusable Block B functions                 |
| `modes/match.md`               | NEW -- matching mode                               |
| `modes/batch-match.md`         | NEW -- bulk matching mode                          |
| `scripts/match-candidates.mjs` | NEW -- matching engine                             |
| `scripts/ingest-job.mjs`       | NEW -- JD ingestion                                |

---

## Verification

1. **Unit test:** Run `scripts/match-candidates.mjs` with 3 test candidates + 2 test jobs -- verify ranked output
2. **Mode test:** `/career match {job-slug}` should return ranked candidate list with scores
3. **Reverse test:** `/career match --candidate {slug}` should return ranked job list
4. **Backward compat:** Existing single-user evaluation (`oferta`) still works unchanged