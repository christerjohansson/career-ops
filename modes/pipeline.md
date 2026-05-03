# Mode: pipeline — URL Inbox (Second Brain)

Process job offer URLs accumulated in `data/pipeline.md`. The user adds URLs whenever they want, then runs `/career pipeline` to process them all.

## Workflow

1. **Read** `data/pipeline.md` → look for `- [ ]` items in the "Pending" section
2. **For each pending URL**:
   a. **Extract JD** using Playwright (browser_navigate + browser_snapshot) → WebFetch → WebSearch
   b. If URL is not accessible → mark as `- [!]` with note and continue
   c. **Save/Normalize JD**: Save extracted content to `jds/` folder with descriptive name (e.g., `jds/company-role.md`). If already a `local:` prefix, verify file exists and its format.
   d. **Move from "Pending" to "Processed"**: `- [x] local:jds/file.md | Company | Role`
3. **If multiple pending URLs**, launch agents in parallel (Agent tool with `run_in_background`) to maximize speed
4. **At end**, show summary table:

```
| Company | Role | Local File | Status |
```

## pipeline.md format

```markdown
## Pending
- [ ] https://jobs.example.com/posting/123
- [ ] https://boards.greenhouse.io/company/jobs/456 | Company Inc | Senior PM
- [!] https://private.url/job — Error: login required

## Processed
- [x] local:jds/acme-corp-ai-pm.md | Acme Corp | AI PM
- [x] local:jds/bigco-sa.md | BigCo | SA
```

## Intelligent JD Detection from URL

1. **Playwright (preferred):** `browser_navigate` + `browser_snapshot`. Works with all SPAs.
2. **WebFetch (fallback):** For static pages or when Playwright is unavailable.
3. **WebSearch (last resort):** Search secondary portals that index the JD.

**Special cases:**
- **LinkedIn:** May require login → mark `[!]` and ask user to paste text
- **PDF:** If URL points to a PDF, read it directly with Read tool
- **`local:` prefix:** Read the local file. Example: `local:jds/linkedin-pm-ai.md` → read `jds/linkedin-pm-ai.md`

## Processing Strategy

### For 1-2 URLs:
- Process sequentially in the main agent
- Full A-G evaluation for each

### For 3+ URLs:
- Launch sub-agents in parallel (Agent tool with `run_in_background`)
- Each sub-agent processes a batch of URLs
- Main agent aggregates results

### Focus on quality over quantity:
- Don't process all 100+ pending URLs at once
- Pick the 5-10 most relevant based on:
  - Role matches target archetypes from `_profile.md`
  - Company aligns with compensation and location preferences
  - Seniority matches candidate level

## Post-processing

After each JD is processed:
1. Save evaluation report to `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`
2. Update `data/pipeline.md` status: `- [ ]` → `- [x]` or `- [!]`
3. If score >= 4.0, also register in `data/applications.md`

## Batch Summary Output

After processing completes, show:

```
Pipeline Processing — {YYYY-MM-DD}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URLs processed: {N}
Evaluations: {N} reports generated
High priority (score 4+): {N}
Recommended: {list of top 3-5 with scores}
Skipped: {N} (expired/private/irrelevant)

→ Run /career apply for highest-scoring offers
→ Review reports in reports/ folder
```