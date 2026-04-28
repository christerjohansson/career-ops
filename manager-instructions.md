# Agency Manager Workflow Guide

How to use the career evaluation system to manage multiple candidates and job postings.

## Agency Manager Workflow Overview

The system is designed for **portfolio-level management** where one manager can handle multiple candidates. Here's the architecture:

```
karriärverket/
├── profiles/
│   ├── candidate-1-name/        # Candidate folder
│   │   ├── cv.md
│   │   ├── config/profile.yml
│   │   └── modes/_profile.md
│   ├── candidate-2-name/        # Another candidate
│   ├── candidate-3-name/
│   └── ... (up to 10+)
├── jds/                         # Job postings (shared)
│   ├── job-1.md
│   ├── job-2.md
│   └── ... (all candidates match against these)
├── data/
│   └── applications.md          # Master tracker (all candidates + all jobs)
└── reports/
    ├── 001-company-date.md      # Evaluation for candidate 1
    ├── 002-company-date.md      # Evaluation for candidate 2
    └── ... (numbered sequentially)
```

---

## Step-by-Step: Adding 10 Candidates

### Phase 1: Initial Setup (One-time)

1. **Create candidate directories:**
```bash
mkdir -p profiles/candidate-1/config profiles/candidate-1/modes
mkdir -p profiles/candidate-2/config profiles/candidate-2/modes
# ... repeat for all 10 candidates
```

2. **For each candidate, create 3 files:**

   **A) `profiles/[candidate-name]/cv.md`**
   - Copy candidate's resume/LinkedIn
   - Convert to markdown (you did this with Christer)
   - Standardize format: Summary → Experience → Skills → Education → Projects

   **B) `profiles/[candidate-name]/config/profile.yml`**
   ```yaml
   candidate:
     full_name: "Jane Developer"
     email: "jane@example.com"
     phone: "+46 123 456 789"
     location: "Stockholm"
     timezone: "CET/CEST"
     visa_status: "Swedish citizen"

   archetypes:
     - name: "Senior Backend Engineer"
       fit: "primary"
       track: "engineering"
     - name: "Staff Engineer"
       fit: "secondary"
       track: "engineering"

   compensation:
     target_range: "SEK 1.0M-1.4M"
     minimum: "SEK 850K"
   ```

   **C) `profiles/[candidate-name]/modes/_profile.md`**
   - Copy the template from `modes/_profile.template.md`
   - Customize with candidate's unique proof points, negotiation scripts, objection handling

3. **Verify setup:**
   ```bash
   # Check all 10 candidates are ready
   ls -la profiles/*/config/profile.yml
   ls -la profiles/*/cv.md
   ```

---

## Phase 2: Run Evaluations (Repeatable)

### Scenario 1: Single candidate + single job

```bash
# 1. Evaluate one job against one candidate
claude -p /career oferta profiles/candidate-1 jds/job-posting-1.md

# 2. System outputs:
#    - Score (e.g., 4.7/5)
#    - Report file: reports/001-company-name-2026-04-27.md
#    - Adds to applications.md

# 3. Generate PDF (optional)
claude -p /career pdf reports/001-company-name-2026-04-27.md
```

### Scenario 2: Batch processing (all 10 candidates against 1 job)

You'd want to script this. Example pseudo-workflow:

```bash
# Loop through all candidates
for candidate in profiles/*/; do
  candidate_name=$(basename $candidate)

  # Evaluate candidate against the job
  claude -p /career oferta "$candidate" "jds/target-job.md"

  # Generate PDF
  # claude -p /career pdf "reports/[latest-report].md"
done

# Merge all results into applications.md
node merge-tracker.mjs
```

**Better approach: Create a batch manifest file** (`batch/evaluate-candidates.yml`):

```yaml
batch:
  name: "Batch 1: Senior Backend - 10 candidates"
  job_posting: "jds/senior-backend-stockholm-2026.md"
  candidates:
    - profiles/candidate-1
    - profiles/candidate-2
    - profiles/candidate-3
    # ... all 10

run_in_parallel: true
generate_pdfs: true
track_results: true
```

Then: `claude -p /career batch batch/evaluate-candidates.yml`

---

## Phase 3: Reporting & Tracking

### Master Tracker: `data/applications.md`

This is the **agency manager's dashboard**. After each evaluation, a row is auto-added:

```markdown
| # | Date | Company | Role | Candidate | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-----------|-------|--------|-----|--------|-------|
| 001 | 2026-04-27 | Nordic Tech | Sr Frontend | Christer J | 4.7/5 | Evaluated | ✅ | [001](reports/001-nordic-2026-04-27.md) | Perfect stack match |
| 002 | 2026-04-27 | Nordic Tech | Sr Frontend | Jane D | 4.2/5 | Evaluated | ✅ | [002](reports/002-nordic-2026-04-27.md) | Good fit, lacks accessibility exp |
| 003 | 2026-04-27 | Nordic Tech | Sr Frontend | John M | 3.1/5 | SKIP | ❌ | [003](reports/003-nordic-2026-04-27.md) | Wrong location, no startup exp |
```

**To view all candidates' status:**
```bash
cat data/applications.md | grep "Nordic Tech"  # See all candidates for one company
cat data/applications.md | grep "Christer"     # See all companies for one candidate
```

---

## Adding Job Postings Manually (The Agency Scenario)

This is where it gets practical for an agency manager who doesn't have automated portal access.

### Option 1: Copy-Paste from Email/PDF (Fastest)

1. **Create the job file:**
```bash
touch jds/company-name-role-location-date.md
```

2. **Paste the job description** in this format:

```markdown
# [Role] - [Company]

**Company:** [Company Name]
**Location:** [City, Country]
**Employment Type:** [Full-time/Contract/etc]
**Salary Range:** [If available, else "Not specified"]
**Posted:** [Month Year]

## About the Company

[2-3 sentences about company + sizing]

## The Role

[Core responsibilities - what will they actually do daily?]

## What You'll Do

- Bullet point 1
- Bullet point 2
- ...

## Requirements

**Must Have:**
- Requirement 1
- Requirement 2

**Nice to Have:**
- Bonus 1
- Bonus 2

## Our Stack

**Frontend:** [Tech stack]
**Backend:** [Tech stack]
**Infrastructure:** [Tech stack]

## What We Offer

- Compensation details
- Benefits
- Work style

## Interview Process

[If known]

## How to Apply

[URL or contact]

---

*Source: [Original URL or "Email from client"]*
*Extracted: [Date]*
```

3. **Reference it in your evaluations:**
```bash
claude -p /career oferta profiles/candidate-1 jds/company-name-role-date.md
```

### Option 2: Agency Client Intake Form (Best for Volume)

Create a simple intake template (`batch/job-intake-template.md`):

```markdown
# Job Posting Intake Form

**Date Received:** [YYYY-MM-DD]
**Client Company:** [Company Name]
**Recruiter Contact:** [Email]

## Job Details

**Title:**
**Location:**
**Seniority:** [Entry/Mid/Senior/Staff]
**Employment Type:**
**Salary Range:**

## Responsibilities (paste from JD)

[Raw text from job description]

## Requirements

[Raw requirements text]

## Tech Stack / Tools

[Tools mentioned in JD]

## Notes from Recruiter

[Any internal notes about urgency, fit, etc]
```

**Then convert to proper format** using a simple script or manual cleanup:

```bash
# Store all intake forms
touch batch/intakes/client-1-2026-04-27.md
touch batch/intakes/client-2-2026-04-27.md

# Batch convert and create jds/ files
# (This could be a simple Node script that parses intakes → creates jds/)
node batch/intake-to-jd.mjs
```

---

## Complete Example: Agency Manager Day-to-Day

### Morning: New job arrives via email

1. Create job posting:
```bash
cat > jds/spotify-backend-stockholm-2026-04-27.md << 'EOF'
# Senior Backend Engineer - Spotify

**Company:** Spotify
**Location:** Stockholm, Sweden
**Employment Type:** Full-time
**Salary Range:** "Competitive + equity"
**Posted:** April 2026

[... paste the actual job description ...]
EOF
```

2. Quick match against your 10 candidates:
```bash
# Run against all candidates
for candidate in profiles/*/; do
  candidate_name=$(basename $candidate)
  echo "Evaluating $candidate_name..."
  claude -p /career oferta "$candidate" "jds/spotify-backend-stockholm-2026-04-27.md"
done
```

### Afternoon: Review results

```bash
# Check scores for this job
grep "spotify-backend" data/applications.md

# View top match
cat reports/001-spotify-backend-2026-04-27.md

# Generate PDF for top 3 candidates
for report in reports/00{1,2,3}-spotify-backend-*.md; do
  claude -p /career pdf "$report"
done
```

### Before you send to client:

1. **Review rankings:**
   - Who scored 4.5+? → "Strong fits"
   - Who scored 3.5-4.5? → "Good fits, worth interviewing"
   - Who scored <3.5? → Don't send

2. **Customize each candidate's application:**
   - Use the cover letter from the report
   - Adjust for any feedback from the candidate
   - Tailor resume (using the CV + personalization)

3. **Send to client:**
   ```
   Subject: Spotify Sr Backend - Top 3 Candidates

   Attached:
   - 001-candidate-1-spotify.pdf (4.8/5 - Perfect match)
   - 002-candidate-2-spotify.pdf (4.3/5 - Strong fundamentals)
   - 003-candidate-3-spotify.pdf (4.1/5 - Growth potential)

   Scores & reasoning in attached reports.
   ```

---

## Key Workflow Files for Agency Manager

| File | Purpose |
|------|---------|
| `profiles/[candidate]/cv.md` | Candidate's canonical work history |
| `profiles/[candidate]/config/profile.yml` | Candidate's salary ranges, archetypes, preferences |
| `jds/[company-role-date].md` | Job posting (manually created from email/PDF) |
| `data/applications.md` | Master tracker (all matches, all candidates, all scores) |
| `reports/[###]-[company]-[date].md` | Full evaluation (score, match analysis, cover letter) |
| `batch/candidates-manifest.yml` | Batch config (10 candidates × 5 jobs = 50 evaluations) |

---

## Scaling to 50+ Jobs (Agency at Scale)

Once you have the system working with 10 candidates:

**Week 1-2:** Set up 10 candidates (one-time effort)
**Week 3+:** Add 2-3 new jobs per week, run batch evaluations

**Estimated time per job:**
- Manual entry: 5 minutes (copy-paste from email)
- Batch evaluate (10 candidates): 2-3 minutes (parallel processing)
- Review & rank: 10 minutes
- **Total: ~20 minutes per job**

For an agency handling 50 candidates × 100 jobs/year = **~33 hours of work that would normally take 200+ hours manually.**

---

## Best Practices for Agency Managers

1. **Standardize candidate intake**
   - Same CV format for all
   - Same profile.yml structure
   - Same modes/_profile.md template

2. **Batch jobs by category**
   - One manifest for "Senior Backend - Stockholm"
   - Another for "Mid Frontend - Remote"
   - Prevents evaluating wrong candidates against wrong roles

3. **Track candidate feedback**
   - Update `modes/_profile.md` after each interview
   - Note what worked/didn't work
   - System learns what scoring adjustments are needed

4. **Maintain jds/ library**
   - Keep all job postings (even closed ones)
   - Reuse for future candidates
   - Build institutional knowledge about markets

5. **Use applications.md as CRM**
   - Filter by score to identify weak fits early
   - Track which candidates are hot with recruiters
   - See which companies keep asking

---

## Next Steps

To get started:

1. Create candidate folders for your first 2-3 candidates
2. Convert their resumes/LinkedIn to `cv.md` format
3. Fill out `config/profile.yml` for each
4. Create a sample job posting in `jds/`
5. Run your first batch evaluation
6. Review the reports and tracker output

For questions or customizations, refer to the main `CLAUDE.md` system documentation.
