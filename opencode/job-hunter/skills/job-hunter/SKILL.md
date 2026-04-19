---
name: job-hunter
description: |
  Automated job search agent. Searches for jobs at target companies using Tavily, extracts posting details, scores them against your resume, reflects on matches, and sends Discord alerts for confirmed hits. Use when running a job search, checking for new job postings, or managing your job hunter pipeline.
allowed-tools: Bash(tvly *), Bash(cat *), Bash(ls *), Bash(jq *), Bash(curl *), Bash(which *), Edit(*), Read(*), Task(*)
---

# Job Hunter

Automated job search agent that finds, scores, and alerts you about relevant job openings at your target companies.

## When to Use

- Running a scheduled job search across target companies
- Checking for new job postings
- User says "run job hunter", "search for jobs", "check job postings"
- Reviewing previously found jobs or the job pipeline

## Prerequisites

1. `TAVILY_API_KEY` environment variable must be exported — start OpenCode with `export TAVILY_API_KEY=tvly-... && opencode`
2. `tvly` CLI must be installed — run `curl -fsSL https://cli.tavily.com/install.sh | bash` if not found
3. `DISCORD_WEBHOOK_URL` must be set for Discord notifications
4. `config.yaml` must exist in the project root with search and notification settings
5. `companies.yaml` must exist in the project root with your target companies
6. `resume.md` must exist in the project root with your skills and experience

## Setup

Before the first run, load these skills:

1. `tavily-search` — web search for finding job listings
2. `tavily-research` — deep research on companies and markets
3. `tavily-extract` — extract full content from job posting URLs
4. `resume-parser` — parse resume.md into a structured profile

## Folder Convention

```
project-root/
├── AGENTS.md              ← Agent brain (workflow instructions)
├── config.yaml            ← Search settings, notification, dedup config
├── companies.yaml           ← Target companies list
├── resume.md               ← Your Markdown resume
├── seen_jobs.json          ← Dedup store (auto-managed)
├── progress.md             ← Current session log (ephemeral, gitignored)
├── logs/                   ← Archived session logs
│   └── 2026-04-19_0800.md
└── .opencode/
    ├── skills/             ← Skills (symlinked or copied)
    ├── agents/             ← Agents (symlinked or copied)
    └── tools/              ← Custom TS tools
```

## Workflow

Every time the job hunter is invoked, follow this workflow exactly:

### Step 1 — Initialize Session

Create `progress.md` with a timestamped header:

```markdown
# Job Hunter — YYYY-MM-DD HH:MM

## Configuration
- Companies: X
- Min match score: Y
- Search depth: Z
```

Read `config.yaml` to get:
- `min_match_score` threshold
- Search settings (depth, max results, domains)
- Notification settings

Read `companies.yaml` to get:
- List of companies (name, keywords, seniority, location)

### Step 2 — Parse Resume

Call the `resume-parser` skill to read `resume.md` and extract a structured profile:

- Skills (languages, frameworks, tools)
- Seniority level
- Location preferences
- Role type preferences
- Companies to avoid

This profile is used for job matching in Step 5.

### Step 3 — Search for Jobs

For each company in `companies.yaml`:

1. Build search queries using company name + keywords
2. Use `tvly search` to find job listings:
   ```bash
   tvly search "Stripe backend engineer jobs" \
     --depth advanced \
     --max-results 10 \
     --include-domains linkedin.com,lever.co,greenhouse.io \
     --time-range week \
     --json
   ```
3. For each company, try multiple queries:
   - `"<Company> <keyword> jobs"` (one per keyword)
   - `"<Company> careers <seniority>"` for broader coverage
4. Log all raw results to `progress.md`

Delegate search to the `researcher` subagent for efficiency.

### Step 4 — Extract Job Details

For each promising search result URL:

1. Use `tvly extract` to get full job posting content:
   ```bash
   tvly extract <url> --json
   ```
2. Parse extracted content into structured format:
   - Job title
   - Company name
   - Location / remote status
   - Required skills
   - Seniority level
   - Job description summary
   - Application URL

Delegate extraction to the `scraper` subagent.

### Step 5 — Score Each Job

For each extracted job, score against the resume profile using the `matcher` subagent:

| Criterion | Points | What it measures |
|-----------|--------|-----------------|
| Skills match | 40 | Overlap between job requirements and your skills |
| Seniority fit | 30 | Alignment between job level and your target |
| Location/remote | 20 | Whether the location matches your preference |
| Title match | 10 | Whether the role title aligns with your targets |

**Minimum threshold**: Only jobs scoring >= `min_match_score` (from config) are considered potential matches.

For each job, log to `progress.md`:
```
### <Company> — <Title>
- Score: XX/100
- Skills (XX/40): Python✅ AWS✅ Docker✅
- Seniority (XX/30): senior✅ / mid❌ expected senior
- Location (XX/20): remote✅ / SF❌ wanted remote
- Title (XX/10): backend engineer✅
- Verdict: POTENTIAL / REJECTED
```

### Step 6 — Reflect and Filter

After scoring ALL jobs, review `progress.md` holistically:

1. **Filter false positives**: Jobs that scored high but aren't genuinely relevant
   - Seniority mismatches the resume clearly
   - Skills overlap is superficial (1-2 skills out of 10 required)
   - Title match is misleading (e.g., "engineer" in title but actually sales)
2. **Add commentary**: For each potential match, note what makes it a genuine fit
3. **Downgrade borderline matches**: If uncertain, err on the side of not alerting
4. **Final confirmed list**: Only jobs that pass reflection get notified

Add a Reflection section to `progress.md`:
```markdown
## Reflection

### Confirmed Matches
1. **Stripe — Senior Backend Engineer (85pts)**
   Python✅ AWS✅ Remote✅ Title✅ — Strong alignment with all criteria.

### Filtered Out
- **Stripe — Platform Engineer (72pts)**: Scored okay but closer to DevOps than backend development per resume preferences.
- **Vercel — Frontend Engineer (68pts)**: Below threshold and primarily React-focused vs. backend.
```

### Step 7 — Notify

For each confirmed match after reflection, send a Discord notification via the `notifier` subagent:

```
🆕 <Company> — <Title> (<Location>) | Match: XX%
Why: <skill>✅ <skill>✅ <location>✅
🔗 <job_url>
```

Use Discord webhook:
```bash
# The notify tool handles this — no manual curl needed
```

### Step 8 — Dedup

Update `seen_jobs.json` with all new jobs found in this session:

```json
{
  "jobs": {
    "stripe-senior-backend-engineer-12345": {
      "company": "Stripe",
      "title": "Senior Backend Engineer",
      "url": "https://...",
      "score": 85,
      "first_seen": "2026-04-19",
      "notified": true
    }
  }
}
```

Use the `manage-dedup` tool to check and update the dedup store.

### Step 9 — Archive

1. Archive `progress.md` → `logs/YYYY-MM-DD_HHMM.md`
2. Print a summary:
   ```
   Job Hunter Complete
   - Companies checked: X
   - Jobs found: Y
   - New jobs (not in seen_jobs): Z
   - Confirmed matches: W
   - Alerts sent: V
   ```

## Match Scoring Guidelines

### Skills Match (0–40 points)

- **35-40**: 80%+ of required skills match your resume
- **25-34**: 60-79% match — most key skills present
- **15-24**: 40-59% match — some overlap but significant gaps
- **5-14**: 20-39% match — few skills align
- **0-4**: <20% match — almost no overlap

### Seniority Fit (0–30 points)

- **25-30**: Exact level match (Senior role ↔ Senior candidate)
- **15-24**: Close but not exact (Staff role ↔ Senior candidate)
- **5-14**: Moderate gap (Junior role ↔ Senior candidate)
- **0-4**: Major mismatch (Intern role ↔ Senior candidate)

### Location/Remote (0–20 points)

- **18-20**: Perfect match (Remote role ↔ Remote preference)
- **10-17**: Acceptable (Hybrid in preferred city ↔ Remote preference)
- **5-9**: Compromise (On-site in non-preferred city)
- **0-4**: Non-starter (On-site across country from preferred location)

### Title Match (0–10 points)

- **9-10**: Exact title match
- **5-8**: Related title (Backend Engineer ↔ Platform Engineer)
- **2-4**: Loosely related
- **0-1**: Unrelated

## Search Query Patterns

| Goal | Query Template | Tavily Command |
|------|---------------|---------------|
| Direct listings | `<Company> <keyword> jobs` | `tvly search "Stripe backend engineer jobs" --include-domains linkedin.com --depth advanced --json` |
| Career pages | `<Company> careers <seniority>` | `tvly search "Stripe careers senior" --include-domains stripe.com,lever.co,greenhouse.io --json` |
| Remote focus | `<Company> <keyword> remote` | `tvly search "Stripe backend engineer remote" --depth advanced --json` |
| Recent posts | `<Company> <keyword> hiring` | `tvly search "Stripe backend engineer hiring" --time-range week --json` |
| Specific board | `site:linkedin.com <Company> <keyword>` | `tvly search "site:linkedin.com Stripe backend engineer" --include-domains linkedin.com --json` |

## Subagent Orchestration

### Researcher

For searching job listings and company data:

```json
{
  "task": "Search for <Company> <keyword> job listings",
  "queries": ["<Company> backend engineer jobs", "<Company> careers senior"],
  "depth": "advanced",
  "max_results": 10,
  "include_domains": ["linkedin.com", "lever.co", "greenhouse.io"],
  "time_range": "week"
}
```

### Scraper

For extracting job posting content from URLs:

```json
{
  "task": "Extract job posting details from these URLs",
  "urls": ["https://...", "https://..."],
  "fields_needed": ["title", "company", "location", "skills", "seniority", "description", "apply_url"]
}
```

### Matcher

For scoring jobs against the resume profile:

```json
{
  "task": "Score these jobs against the resume profile",
  "resume_profile": "<parsed from resume.md>",
  "config": "<from config.yaml (min_match_score, search settings)>",
  "company": "<from companies.yaml>",
  "jobs": [
    {
      "title": "Senior Backend Engineer",
      "company": "Stripe",
      "url": "https://...",
      "location": "Remote",
      "skills": ["Python", "AWS", "Docker", "PostgreSQL"],
      "seniority": "Senior",
      "description": "..."
    }
  ]
}
```

### Notifier

For sending Discord alerts:

```json
{
  "task": "Send Discord notifications for confirmed job matches",
  "matches": [
    {
      "company": "Stripe",
      "title": "Senior Backend Engineer",
      "location": "Remote",
      "score": 85,
      "why": "Python✅ AWS✅ Remote✅ Title✅",
      "url": "https://..."
    }
  ]
}
```

## Tips

- Run searches with `--time-range week` to focus on recent listings
- Use `--include-domains` to prioritize LinkedIn, Lever, Greenhouse (where most jobs are posted)
- Always check `seen_jobs.json` before scoring — skip jobs we've already seen
- Err on the side of fewer notifications — false positives annoy more than missing a marginal match
- If a company search returns no results, try broader queries or different keyword combinations
- Archive `progress.md` even if no matches were found — it's useful for tracking search patterns over time
- Use `--depth advanced` for initial searches; `--depth basic` for follow-up confirmation searches