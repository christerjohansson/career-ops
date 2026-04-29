# Profile: Christer Johansson (Dual-Track Engineer + Instructor)

**Created:** 2026-04-27
**Profile Type:** Dual-track (Senior AI/Frontend Engineer + Technical Instructor)

## Overview

This profile demonstrates a dual-track career configuration for someone with:
- 20+ years of production engineering experience (React, TypeScript, AI tooling)
- 2+ years of university teaching experience (University of Borås, 2018-2020)
- Continuous mentorship and developer advocacy across multiple companies
- Measurable wins on both tracks

## Key Proof Points

### Engineering Track
- **BCG AI Engineering Advisor (2024-2025):**
  - 30% cycle time reduction
  - 20% defect rate reduction
  - 500K EUR pipeline from AI SDR (outperformed all human SDRs)
  - 100,000+ chats handled by SaaStr AI
  - 1,000+ speaker submissions reviewed autonomously
  - 3x content production increase

- **Volvo Certificate of Excellence 2024:**
  - Sr. Front End Developer certification
  - Validation: https://github.com/sigma-technology-ds/certifications

- **Multiple Senior Roles:**
  - Sigma Technology (2021-2024)
  - Västra Götalandsregionen (2023-2024)
  - Kinnarps (2022-2023)
  - Chalmers University (2022)
  - Volvo Group (2022)
  - Morgan Stanley (2020-2021)

### Teaching Track
- **University of Borås (2018-2020):**
  - University Lecturer and Developer
  - Curriculum development (frontend, AI, cloud services)
  - Student placement and mentorship

- **Publications (4 books/courses):**
  - "70 Intervjufrågor: Din nyckel till framgång i arbetsintervjun" (GitBook, 2024)
  - "Learn React Now" (GitBook, 2020)
  - "React Training Course" (University of Borås, 2020)
  - "The JavaScript Workshop" (Packt Publishing, 2019)

- **Advisory Boards:**
  - Sigma Technology: AI-driven development transformation
  - Kinnarps: Frontend playbook, DevOps practices
  - Waya Finance: IAM/KeyCloak implementation, team leadership

## Files in This Profile

| File | Location | Purpose |
|------|----------|---------|
| `cv.md` | `/cv.md` | Full CV with both engineering and teaching experience |
| `profile.yml` | `/config/profile.yml` | Dual-track configuration with two primary archetypes and split comp ranges |
| `_profile.md` | `/modes/_profile.md` | User-specific framing, proof points, negotiation scripts |
| `README.md` | `/profiles/christer-johansson/README.md` | This file |

## Compensation Structure (Dual-Track)

### Engineering Track
- **Target:** SEK 900K-1.2M/year (75K-100K SEK/month)
- **Minimum:** SEK 750K/year (62.5K SEK/month)
- **Use for:** Senior AI/Frontend Engineer, Staff Engineer, AI Advisor, Engineering Manager

### Teaching Track
- **Target:** SEK 650K-850K/year (54K-71K SEK/month)
- **Minimum:** SEK 550K/year (46K SEK/month)
- **Use for:** University Lecturer, Technical Instructor, Curriculum Developer

### Hybrid Track
- **Target:** SEK 800K-1.1M/year (67K-92K SEK/month)
- **Minimum:** SEK 700K/year (58K SEK/month)
- **Use for:** Developer Advocate, DevRel Engineer, Technical Evangelist

## Why Dual-Track?

Christer's profile meets all criteria for dual-track configuration (see `examples/dual-track-engineer-instructor/README.md`):

1. ✅ **Measurable wins on both sides:**
   - Engineering: 30% cycle time reduction, 20% defect rate reduction, Volvo Certificate of Excellence
   - Teaching: University lecturer 2+ years, 4 publications, multiple advisory boards

2. ✅ **Would accept offers from either side:**
   - Engineering roles at senior/staff level
   - Teaching roles at university/bootcamp level
   - Hybrid roles (DevRel, Developer Advocate)

3. ✅ **Both tracks at similar seniority:**
   - Senior/Staff Engineer level
   - Senior Lecturer / Lead Instructor level

## How This Profile Works

### In Evaluations
When career evaluates a job offer:
1. Detects primary archetype (engineering, teaching, or hybrid)
2. Picks matching salary range from `profile.yml alternate_ranges`
3. Emphasizes relevant proof points from CV
4. Generates appropriate STAR stories

### In Applications
- **Engineering roles:** Lead with BCG/Volvo wins, mention teaching as credibility signal
- **Teaching roles:** Lead with University of Borås + publications, mention engineering as credibility
- **Hybrid roles (DevRel):** Lead with the combination as the rare value

### In Interviews

#### Expected Objection 1: "Why engineering if you also teach?"
**Answer:**
> "Teaching is how I keep the engineering sharp. At University of Borås, I had to design curriculum that produced students who could ship production React apps, not just pass quizzes. That forced me to stay current. Teaching continues as a side activity, but engineering is where I want to focus my primary energy."

#### Expected Objection 2: "Are you overqualified for teaching?"
**Answer:**
> "The students I want to teach are going to ship production systems, not pass quizzes. My engineering background is exactly why I can get them there. At University of Borås, I taught React/frontend in the context of real deployments. The satisfaction comes from seeing alumni land jobs."

#### Expected Objection 3: "Why not just pick one?"
**Answer:**
> "Because the combination is the actual value. Engineers who can teach end up leading onboarding, writing docs people actually read, and running effective code reviews. At Sigma, I formed an advisory board to guide management through AI-driven development -- that required both engineering depth and communication skills."

## Location & Work Preferences

- **Location:** Stenungsund/Göteborg, Sweden
- **Timezone:** CET/CEST
- **Visa:** Swedish citizen
- **Remote:** Preferred (full remote)
- **On-site:** Flexible -- 1 week/month in Stockholm, Göteborg, or other Swedish cities

## Next Steps

### Before Your First Evaluation
1. ✅ CV created (`cv.md`)
2. ✅ Profile configured (`config/profile.yml`)
3. ✅ Personalization file created (`modes/_profile.md`)
4. ⏳ Consider creating `article-digest.md` with detailed proof points
5. ⏳ Test the system with a real job posting to verify track detection

### Optional Enhancements
- Create `article-digest.md` with detailed case studies (BCG AI transformation, Volvo frontend work)
- Add portfolio URL if/when you create one
- Consider adding demo/code samples to GitHub for interview prep
- Update compensation ranges based on market research (use WebSearch)

## Testing Track Detection

To verify the system picks the right track:

```bash
# Test with engineering JD (should pick engineering range)
claude -p /career eval <engineering-jd-url>

# Test with teaching JD (should pick teaching range)
claude -p /career eval <teaching-jd-url>

# Check the "Archetype:" line in report header
# If wrong track selected, the salary evaluation will be off
```

## Related Documentation

- [Dual-track pattern explanation](../../examples/dual-track-engineer-instructor/README.md)
- [Example dual-track CV](../../examples/dual-track-engineer-instructor/cv.md)
- [Example dual-track profile.yml](../../examples/dual-track-engineer-instructor/profile.yml)
- [Main CLAUDE.md](../../CLAUDE.md) -- system documentation
- [Data contract](../../DATA_CONTRACT.md) -- what's user data vs system data

## Maintenance

**Your files (never auto-updated):**
- `cv.md`
- `config/profile.yml`
- `modes/_profile.md`
- This README

**System files (may be updated):**
- `modes/_shared.md`
- `modes/eval.md`, `modes/evals.md`, etc.
- All `.mjs` scripts

If you customize archetypes, compensation, or narrative, ALWAYS edit `modes/_profile.md` or `config/profile.yml`, not `modes/_shared.md`.
