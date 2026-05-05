# Oncall — OpenCode Oncall Workflow Skill

An OpenCode skill and agent pack for running a daily oncall rotation against GCP-hosted services. Automates shift start, multi-project log triage, end-of-day reports, and end-of-rotation handoffs — with optional JIRA ticket creation via the Atlassian REST API.

## What's Included

### Skills

| Skill | Purpose |
|-------|---------|
| `oncall` | Orchestrates the full oncall workflow — `start`, `logs`, `eod`, `status`, `handoff` |

### Agents

| Agent | Purpose |
|-------|---------|
| `log-analyzer` | Fetches GCP logs for a given project + time window, classifies entries as actionable vs noise using the rubric, returns a compact markdown summary |

### Reference Files

| File | Purpose |
|------|---------|
| `reference/classification.md` | Rubric defining what is actionable, always-suppress noise, and "investigate" — edit to match your stack |
| `reference/log-queries.md` | Canned `gcloud logging read` filters for common patterns (errors, OOM, dead-letter, audit, scaling) |
| `reference/projects.md` | Table of GCP projects, Cloud Run services, and supporting infra per environment |

### Templates

| File | Purpose |
|------|---------|
| `templates/eod-report.md` | Daily report template with incidents table, carry-forward, and rubric updates sections |
| `templates/handoff-report.md` | End-of-rotation summary template covering all 7 days |

## Architecture

```
/oncall logs 2h
    │
    ├─ Task: log-analyzer (prod-us) ──┐
    ├─ Task: log-analyzer (prod-eu) ──┤─ concurrent
    │                                 │
    └─ Merge + render results ←───────┘
           │
           └─ Per actionable item:
                [t] Pre-stage JIRA stub → curl Atlassian REST API
                [i] Investigate → read related code
                [a] Acknowledge → record in session JSONL
                [n] Reclassify → stage for rubric update at EOD
                           │
/oncall eod                │
    │                      │
    ├─ Read session JSONL ←─┘
    ├─ Carry forward yesterday's open items
    ├─ Prompt: append reclassified noise to classification.md?
    └─ Write <REPORT_DIR>/<date>.md

/oncall handoff
    └─ Aggregate all 7 daily reports → write handoff-<end-date>.md
```

## Setup

### 1. Prerequisites

- [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed and on `PATH`
- Access to the GCP projects you want to monitor
- Git repos to sync at shift start

### 2. Copy Skills and Agents

```bash
cp -r /path/to/ai-kit/opencode/oncall/skills .opencode/skills
cp -r /path/to/ai-kit/opencode/oncall/agents .opencode/agents
```

Or symlink:

```bash
ln -s /path/to/ai-kit/opencode/oncall/skills .opencode/skills
ln -s /path/to/ai-kit/opencode/oncall/agents .opencode/agents
```

### 3. Copy Reference and Templates

```bash
cp -r /path/to/ai-kit/opencode/oncall/reference .opencode/reference
cp -r /path/to/ai-kit/opencode/oncall/templates .opencode/templates
```

### 4. Set Up `opencode.json`

Copy and merge the agent definitions into your project's `opencode.json`:

```bash
cp /path/to/ai-kit/opencode/oncall/opencode.example.json opencode.json
```

### 5. Copy and Configure `AGENTS.md`

```bash
cp /path/to/ai-kit/opencode/oncall/AGENTS.md AGENTS.md
```

Edit `AGENTS.md` to set your rotation config at the top:

```markdown
## Oncall Config

- **ROTATION_START:** 2026-04-15
- **ONCALL_PROJECT_US:** fh-platform-production-us
- **ONCALL_PROJECT_EU:** fh-platform-production-6197
- **PLATFORM_REPO:** ~/Code/platform
- **INFRA_REPO:** ~/Code/infrastructure
- **REPORT_DIR:** ~/Code/platform/.oncall
- **JIRA_PROJECT_KEY:** PLTF
```

### 6. (Optional) Set Up JIRA Integration

To enable ticket creation from actionable log items, export these before starting OpenCode:

```bash
export JIRA_DOMAIN=yourco.atlassian.net
export JIRA_EMAIL=you@yourco.com
export JIRA_API_TOKEN=your-token-here   # https://id.atlassian.com/manage-profile/security/api-tokens
```

JIRA integration is fully optional — if the env vars are absent, ticket stubs are saved to the session JSONL and you can file them later.

### 7. Gitignore the Report Directory

Add `.oncall/` to your project's `.gitignore`:

```bash
echo ".oncall/" >> .gitignore
```

### 8. Start OpenCode

```bash
opencode
```

## Usage

### Start of shift

```
/oncall start
```

Syncs both repos to `main`, verifies gcloud auth, sets the active GCP project. On day 1, surfaces any open items from the previous rotation's handoff doc.

### Log triage

```
/oncall logs 2h                              # last 2 hours, both prod projects
/oncall logs 30m app                         # last 30 min, scoped to the 'app' service
/oncall logs 1h --project fh-platform-production-us   # single project
```

Runs `log-analyzer` concurrently against both prod projects (US + EU) by default, classifies entries using your rubric, and prompts you for a decision on each actionable item:

| Option | Action |
|--------|--------|
| `[t]` | Pre-stage a JIRA ticket and optionally create it via API |
| `[p]` | Page someone / escalate |
| `[i]` | Investigate now |
| `[a]` | Acknowledge — known issue |
| `[n]` | Reclassify as noise — prompted for reason, flagged for rubric update at EOD |

### Quick status

```
/oncall status
```

Reads today's session JSONL and prints a compact pulse: shift day N/7, last log check time and window, actionable item breakdown with JIRA keys.

### End of day

```
/oncall eod
/oncall eod 2026-04-17    # for a specific date
```

Generates `<REPORT_DIR>/<date>.md` from the session JSONL. Automatically carries forward unchecked items from yesterday's "Follow-ups for tomorrow". If any items were reclassified as noise today, prompts to append them to `classification.md`.

On subsequent runs the same day, appends an `## Update — <HH:MM:SS>` section rather than overwriting.

### End of rotation

```
/oncall handoff
```

Aggregates all 7 daily reports and session JSONLs into `<REPORT_DIR>/handoff-<end-date>.md`. Lists open items, JIRA tickets filed, recurring patterns, and rubric updates made during the rotation.

## Customizing the Rubric

`reference/classification.md` controls what the `log-analyzer` flags or suppresses. Edit it freely:

- Add patterns to `## 🔇 Always suppress` for noise you've confirmed is safe to ignore.
- Add patterns to `## ✅ Always actionable` for signals that always need eyes.
- Add patterns to `## 🤔 Investigate` for ambiguous signals.

The `/oncall eod` command will prompt you to append any in-session reclassifications automatically.

## Adapting to Your Stack

The reference files assume the Foundation Health GCP setup by default. To adapt:

1. **`reference/projects.md`** — replace with your GCP projects, Cloud Run services, and alerting config.
2. **`reference/log-queries.md`** — update resource types if you use non-Cloud-Run services.
3. **`AGENTS.md` config block** — set `ROTATION_START`, project IDs, repo paths, and JIRA key.
4. **`reference/classification.md`** — replace the always-suppress and always-actionable lists with your own known patterns.

## Report Directory Layout

```
<REPORT_DIR>/
├── 2026-04-15.md          # daily report, day 1
├── 2026-04-16.md          # daily report, day 2
│   ...
├── 2026-04-21.md          # daily report, day 7
├── handoff-2026-04-21.md  # end-of-rotation handoff
├── session-2026-04-15.jsonl   # structured event log for day 1
│   ...
└── session-2026-04-21.jsonl
```

The directory is gitignored in your project — reports stay local.
