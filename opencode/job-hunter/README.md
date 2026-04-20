# Job Hunter — OpenCode-Native Job Search Agent

An OpenCode skill and agent pack that automates job searching with AI-powered matching and Discord alerts. Uses Tavily for web search and extraction (no scraping, no ToS risk), OpenCode agents for intelligent scoring, and Discord webhooks for instant notifications.

## What's Included

### Skills

| Skill | Purpose |
|-------|---------|
| `job-hunter` | Orchestrates the full workflow — search jobs, extract details, score against resume, reflect, notify |
| `tavily-search` | Web search via Tavily CLI for quick job listing lookups |
| `tavily-research` | Deep AI-powered research with citations via Tavily CLI |
| `tavily-extract` | Extract full content from job posting URLs |
| `resume-parser` | Reads `resume.md` and extracts a structured skill/seniority/preferences profile |

### Agents

| Agent | Purpose |
|-------|---------|
| `researcher` | Runs Tavily searches to find job listings and company market data |
| `scraper` | Extracts and structures job posting content from URLs |
| `matcher` | Scores jobs against your resume profile with detailed rationale |
| `notifier` | Sends Discord alerts via webhook for confirmed matches |

### Custom TS Tools

| Tool | Purpose |
|------|---------|
| `search-jobs` | Search for job listings using Tavily CLI |
| `extract-job` | Extract full content from a job posting URL |
| `notify` | Send Discord notification via webhook |
| `manage-dedup` | Read/write `seen_jobs.json` for deduplication |

### Templates

| File | Purpose |
|------|---------|
| `config.example.yaml` | Search settings, notification config, dedup settings |
| `companies.example.yaml` | Target companies list |
| `resume.example.md` | Markdown resume template |
| `AGENTS.md` | Full agent brain — the workflow OpenCode follows |
| `.gitignore.example` | Standard gitignore for auth, seen_jobs, progress |
| `.github/workflows/job-hunter.yml` | GitHub Actions scheduled workflow |
| `docs/scoring-rubric.md` | Detailed job matching scoring criteria |

## Architecture

```
[Tavily Search] → Find job listings across LinkedIn, Indeed, company pages
       ↓
[Tavily Extract] → Pull full job posting content from URLs
       ↓
[Agent Matcher] → Score each job against resume (skills 40, seniority 30, location 20, title 10)
       ↓
[Reflect] → Filter false positives, add commentary, confirm genuine matches
       ↓
[Discord Notify] → Alert for confirmed matches only
       ↓
[Archive] → Save progress.md to logs/, update seen_jobs.json
```

## Setup

### 1. Install Tavily CLI

```bash
curl -fsSL https://cli.tavily.com/install.sh | bash
tvly login
```

### 2. Set Environment Variables

```bash
export TAVILY_API_KEY=tvly-your-api-key-here
export DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-id/your-webhook-token
```

These must be exported **before** starting OpenCode.

### 3. Create Your Project

```bash
mkdir my-job-search && cd my-job-search
git init
```

### 4. Copy Templates

```bash
# Copy and customize config (search settings, notification, dedup)
cp /path/to/ai-kit/opencode/job-hunter/templates/config.example.yaml config.yaml

# Copy and customize companies (your target companies)
cp /path/to/ai-kit/opencode/job-hunter/templates/companies.example.yaml companies.yaml

# Copy and fill in your resume
cp /path/to/ai-kit/opencode/job-hunter/templates/resume.example.md resume.md

# Copy gitignore
cp /path/to/ai-kit/opencode/job-hunter/templates/.gitignore.example .gitignore

# Copy agent instructions (this is the workflow OpenCode follows)
cp /path/to/ai-kit/opencode/job-hunter/AGENTS.md AGENTS.md

# Copy and customize opencode.json
cp /path/to/ai-kit/opencode/job-hunter/opencode.example.json opencode.json

# Copy GitHub Actions workflow
mkdir -p .github/workflows
cp /path/to/ai-kit/opencode/job-hunter/templates/.github/workflows/job-hunter.yml .github/workflows/
```

### 5. Link Skills and Agents

```bash
# Link skills
ln -s /path/to/ai-kit/opencode/job-hunter/skills .opencode/skills

# Link agents
ln -s /path/to/ai-kit/opencode/job-hunter/agents .opencode/agents

# Link tools
ln -s /path/to/ai-kit/opencode/job-hunter/tools .opencode/tools
```

Or copy them if you prefer:

```bash
cp -r /path/to/ai-kit/opencode/job-hunter/skills .opencode/skills
cp -r /path/to/ai-kit/opencode/job-hunter/agents .opencode/agents
cp -r /path/to/ai-kit/opencode/job-hunter/tools .opencode/tools
```

### 6. Create Required Directories

```bash
mkdir -p logs auth seen
touch seen_jobs.json
echo '{}' > seen_jobs.json
```

### 7. Start OpenCode

```bash
opencode
```

Then trigger the agent:

```
Run the job hunter agent per AGENTS.md
```

## Usage

### Manual Run

Start OpenCode and invoke the job-hunter skill:

```
Run the job hunter agent per AGENTS.md
```

The agent will:
1. Read your `config.yaml` and `resume.md`
2. Search for jobs at each target company
3. Extract and score each job against your profile
4. Reflect on matches, filter false positives
5. Send Discord alerts for confirmed matches
6. Archive the session log to `logs/`

### Scheduled Runs (GitHub Actions)

Push your project to GitHub and the workflow runs every 4 hours. You need to set these repository secrets:

- `TAVILY_API_KEY`
- `DISCORD_WEBHOOK_URL`
- `OPENCODE_API_KEY`

### Adding Companies

Edit `companies.yaml` to add or remove target companies:

```yaml
- name: Stripe
  keywords:
    - backend engineer
    - platform engineer
  seniority: senior
  location: remote
```

### Updating Your Resume

Edit `resume.md` — the `resume-parser` skill reads this file each run to build your matching profile.

## How Job Matching Works

Each job is scored on 4 criteria:

| Criterion | Points | What it measures |
|-----------|--------|-----------------|
| Skills match | 40 | Overlap between job requirements and your skills |
| Seniority fit | 30 | Alignment between job level and your target seniority |
| Location/remote | 20 | Whether the job's location matches your preference |
| Title match | 10 | Whether the job title aligns with your target roles |

See `templates/docs/scoring-rubric.md` for the full scoring breakdown.

## Status Progression for Jobs

| Status | Meaning |
|--------|---------|
| `new` | Just found, not yet scored |
| `potential` | Scored above min threshold, pending reflection |
| `confirmed` | Passed reflection, notification sent |
| `false_positive` | Scored high but filtered out during reflection |
| `rejected` | Below minimum score threshold |
| `expired` | Job listing no longer available |

## Notification Format

Discord alerts look like:

```
🆕 **Stripe — Senior Backend Engineer** (Remote) | Match: 87%
Why: Python✅ AWS✅ Remote✅ Title✅
🔗 https://linkedin.com/jobs/view/...
```

## Differences from v1 Idea Doc

| Aspect | Idea Doc | This Implementation |
|--------|----------|---------------------|
| Job search | Playwright + LinkedIn scraping | Tavily search + extract (no ToS risk) |
| Architecture | Python-first + TS wrappers | Skills/agents + TS tools |
| Data sources | LinkedIn only | LinkedIn, Indeed, Greenhouse, Lever, company pages |
| Session management | Playwright storage state | Not needed (Tavily is API-based) |

## Credits

Uses [Tavily](https://tavily.com) for web search and extraction, [Discord](https://discord.com) for notifications via webhooks, and [OpenCode](https://opencode.ai) for agent orchestration.