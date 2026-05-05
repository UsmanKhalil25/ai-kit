---
name: oncall
description: Oncall workflow helper for a 7-day GCP platform rotation. Subcommands - start | logs <duration> [service] [--project <id>] | eod [date] | status | handoff
allowed-tools: Bash(git *), Bash(gcloud *), Bash(date *), Bash(mkdir *), Bash(touch *), Bash(cat *), Bash(ls *), Bash(jq *), Bash(curl *), Read(*), Write(*), Edit(*), Task(*)
---

# /oncall

You are helping the user run their daily oncall workflow. The user invoked this skill with arguments: `$ARGUMENTS`

Parse `$0` (the first argument) to dispatch:

| `$0`      | Action                                                                          |
| :-------- | :------------------------------------------------------------------------------ |
| `start`   | Start-of-shift: sync both repos to `main`, verify gcloud auth.                 |
| `logs`    | Analyze GCP logs over `$1` window. Optionally filter by service or project.     |
| `eod`     | Write end-of-day report for `$1` date (default today).                          |
| `status`  | Print today's pulse: shift day, staged items, last log-check time.              |
| `handoff` | Produce end-of-rotation summary across all 7 days and offer Confluence publish. |
| _empty_   | Print usage and stop.                                                           |

If `$0` is anything else, print usage and stop. Usage:
```
/oncall start                                        # sync repos + check gcloud auth
/oncall logs <duration> [<service>] [--project <id>] # e.g. 30m, 2h, 1d (default 1h)
/oncall eod [YYYY-MM-DD]                             # write daily report (default today)
/oncall status                                       # quick daily pulse
/oncall handoff                                      # end-of-rotation summary
```

---

## Configuration

The skill reads from a config block at the top of `AGENTS.md` in your project. Customize for your setup:

| Variable | Default | Description |
| :------- | :------ | :---------- |
| `ROTATION_START` | Set in AGENTS.md | Date the current rotation began (YYYY-MM-DD) |
| `ONCALL_PROJECT_US` | Set in AGENTS.md | Primary GCP project (US prod) |
| `ONCALL_PROJECT_EU` | Set in AGENTS.md | Secondary GCP project (EU prod) |
| `PLATFORM_REPO` | `~/Code/platform` | Path to the platform repo |
| `INFRA_REPO` | `~/Code/infrastructure` | Path to the infrastructure repo |
| `REPORT_DIR` | `~/Code/platform/.oncall` | Where daily reports and session JSONLs are saved |
| `JIRA_PROJECT_KEY` | Set in AGENTS.md | JIRA project key for ticket creation (e.g. `PLTF`) |

Read these values from `AGENTS.md` at skill load time. Fall back to the defaults above if not set.

---

## Subcommand: `start`

Goal: leave the user on a clean `main` in both repos with gcloud authenticated.

1. **Sync platform repo:**
   - Run `git -C <PLATFORM_REPO> status --porcelain`. If output is non-empty:
     - Run `git -C <PLATFORM_REPO> stash push -u -m "oncall-auto-stash $(date +%F-%H%M%S)"`.
     - Tell the user the stash ref and how to restore: `git -C <PLATFORM_REPO> stash pop`.
   - Run `git -C <PLATFORM_REPO> checkout main && git -C <PLATFORM_REPO> pull --ff-only`.

2. **Sync infra repo:** same pattern with `<INFRA_REPO>`.

3. **Verify gcloud auth:**
   - Run `gcloud auth list --filter=status:ACTIVE --format='value(account)'`.
   - If output is empty, STOP and tell the user:
     > Not authenticated. Please run:
     > ```
     > gcloud auth login
     > gcloud auth application-default login
     > ```
     > Then re-run `/oncall start`.

4. **Set active project:**
   - Run `gcloud config get-value project 2>/dev/null`. If not already `<ONCALL_PROJECT_US>`, run `gcloud config set project <ONCALL_PROJECT_US>`. Tell the user what it was before.

5. **Day-1 check:** Compute shift day number from `ROTATION_START`. If today is day 1:
   - Glob `<REPORT_DIR>/handoff-*.md`. Take the most recent file.
   - If found, read it and extract the `## Open items at handoff` table. If any rows are present (not `_none_`), surface them before the ready summary.

6. **Print ready summary:** `✅ Ready. Repos on main. Authenticated as <account>. Active project: <ONCALL_PROJECT_US>.`

---

## Subcommand: `logs`

Goal: surface only actionable warnings/errors, suppressing known noise.

Usage: `/oncall logs <duration> [<service>] [--project <project-id>]`

**Parse arguments from `$ARGUMENTS` (everything after `logs`):**
- `$1` = duration (e.g. `30m`, `2h`, `1d`). Default `1h` if empty. Matches `^\d+[mhd]$`.
- Scan for `--project <id>`. If present, target only that project.
- Any remaining non-flag token is the optional service name (e.g. `app`, `partner-integrations`).

1. **Compute timestamps (macOS):**
   - Parse unit: `m` → minutes, `h` → hours, `d` → days.
   - `date -u -v-<N><M|H|d> +%Y-%m-%dT%H:%M:%SZ` (e.g. `date -u -v-2H +%Y-%m-%dT%H:%M:%SZ`).
   - End: `date -u +%Y-%m-%dT%H:%M:%SZ`.

2. **Verify gcloud auth:** same as `start` step 3. If empty, stop.

3. **Determine target projects:**
   - If `--project` given: use that single project.
   - Otherwise: both `<ONCALL_PROJECT_US>` and `<ONCALL_PROJECT_EU>`.

4. **Delegate to `log-analyzer`** via the Task tool — one invocation per project. Pass:
   ```json
   {
     "project": "<project-id>",
     "start": "<START_RFC3339>",
     "end": "<END_RFC3339>",
     "service": "<service or null>",
     "classification_md": "<SKILL_DIR>/reference/classification.md",
     "log_queries_md": "<SKILL_DIR>/reference/log-queries.md"
   }
   ```
   Launch both concurrently when targeting two projects. Wait for both results.

   > **Note on `<SKILL_DIR>`:** This is the directory containing this `SKILL.md` file. Resolve it as the path where the skill was loaded from (e.g. `.opencode/skills/oncall/`). Reference files live at `<SKILL_DIR>/reference/`.

5. **Render combined output**, grouped by project:
   - `### 🌎 <ONCALL_PROJECT_US> (US)` / `### 🌍 <ONCALL_PROJECT_EU> (EU)`
   - Then the actionable, investigate, and suppressed tables from the subagent.

6. **For each actionable/investigate row**, ask the user what to do:
   ```
   [t] File a JIRA ticket
   [p] Page someone / escalate
   [i] Investigate now
   [a] Acknowledge — known issue, will revisit
   [n] Reclassify as noise (ask for reason)
   ```

7. **JIRA pre-staging (when user picks `[t]`):**
   Synthesize a ticket stub and print it:
   ```
   Project:     <JIRA_PROJECT_KEY>
   Type:        Bug
   Summary:     [<service>] <one-line description from the sample>
   Priority:    High (5xx / OOM / panic) | Medium (integration errors) | Low (capacity signals)
   Labels:      oncall, <service>, <prod-us or prod-eu>
   Description:
     **Observed:** <sample log line — truncated to 200 chars>
     **First seen (UTC):** <first_seen>
     **Count in window:** <count>
     **GCP project:** <project>
     **Investigate:**
     `gcloud logging read '<minimal filter>' --project=<project> --format=json --limit=50`
   ```
   Ask: "Create this JIRA ticket now? [y/n]"

   If yes, create via REST API (requires `JIRA_DOMAIN`, `JIRA_EMAIL`, `JIRA_API_TOKEN` in env):
   ```bash
   curl -s -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
     -X POST \
     -H "Content-Type: application/json" \
     --data '{"fields":{"project":{"key":"<KEY>"},"summary":"<SUMMARY>","description":{"type":"doc","version":1,"content":[{"type":"paragraph","content":[{"type":"text","text":"<DESCRIPTION>"}]}]},"issuetype":{"name":"Bug"},"priority":{"name":"<PRIORITY>"},"labels":["oncall","<service>"]}}' \
     "https://${JIRA_DOMAIN}/rest/api/3/issue"
   ```
   Extract the returned `key` from the JSON response. If env vars are missing, tell the user and record the stub only.

8. **If user picks `[n]`:** ask for the reason. Store pattern + reason in the session JSONL with `decision: "reclassify_noise"`.

9. **Stage results:** append one JSON line per actionable item to `<REPORT_DIR>/session-<YYYY-MM-DD>.jsonl`:
   ```json
   {"type":"alert","timestamp":"<utc>","project":"<project>","service":"<svc>","severity":"<sev>","sample":"<sample>","decision":"<t|p|i|a|n>","jira_key":"<key or null>","jira_stub":{...or null},"noise_reason":"<reason or null>"}
   ```
   Create `<REPORT_DIR>/` and the file if they don't exist.

10. **Record log-check timestamp:**
    ```json
    {"type":"log_check","timestamp":"<utc>","window":"<duration>","projects":["..."],"service":"<service or null>"}
    ```

---

## Subcommand: `eod`

Goal: produce or update `<REPORT_DIR>/<date>.md`.

1. **Resolve date:** use `$1` if provided (validate `YYYY-MM-DD`), else `date +%F`.

2. **Compute shift day:** `day_n = (date - ROTATION_START) + 1`. Cap at 7.

3. **Carry forward from previous day:**
   - Compute previous calendar date. Look for `<REPORT_DIR>/<prev-date>.md`.
   - If found, extract unchecked `- [ ]` lines under `## Follow-ups for tomorrow`.
   - These populate `## Follow-ups carried from <prev-date>`. Leave as `_none_` if all checked or file missing.

4. **Gather context:**
   - `gcloud config get-value project` and `gcloud auth list --filter=status:ACTIVE --format='value(account)'`.
   - Parse `<REPORT_DIR>/session-<date>.jsonl` — all `type:alert` lines.
   - Note any `decision: "reclassify_noise"` entries.

5. **Read the template** at `<SKILL_DIR>/templates/eod-report.md`.

6. **Fill the template:** substitute all `{{placeholders}}`, populate the incidents table and actionable items list from the JSONL, inject carry-forward items, add reclassified noise to `## Rubric updates`.

7. **Rubric update prompt:** If any `reclassify_noise` items exist, ask: "Append these reclassified patterns to `classification.md`? [y/n]". If yes, append each under `## 🔇 Always suppress` in `<SKILL_DIR>/reference/classification.md`:
   ```
   - **`<service>`: `<pattern>`** — <user's reason>. Reclassified <date>.
   ```

8. **Write the report:**
   - **If file exists:** append `## Update — <HH:MM:SS>` with new content. Use Edit, not Write.
   - **If new:** Write the full filled template.

9. **Print 5-line digest:** path, day N of 7, # actionable, # suppressed, top headline.

10. **Optional follow-ons (do not auto-execute):**
    - "Want me to publish this to Confluence?"
    - "Want me to post the summary to Slack?"
    - "Want to create JIRA tickets for remaining open items?"

---

## Subcommand: `status`

Goal: quick pulse without fetching new logs.

1. **Compute shift day** from `ROTATION_START`. Print `Day <n> of 7`.
2. **Read `<REPORT_DIR>/session-<today>.jsonl`.** If missing: "No log checks run yet today."
3. **Summarize:**
   - Most recent `log_check` line → last check time, window, projects.
   - All `alert` lines → total + breakdown: `t` (Filed JIRA, list keys), `p` (Escalated), `i` (Investigating, list service+sample), `a` (Acknowledged), `n` (Reclassified), pending.
4. **Print compact block:**
   ```
   📅 Oncall — Day <n> of 7 (<date>)
   🔍 Last log check: <HH:MM> UTC (<window>, <projects>)
   🚨 Actionable today: <total>
      ✅ Filed JIRA:    <count> (<keys>)
      👁  Investigating: <count> — [<service>] <sample>
      💤 Acknowledged:  <count>
      ⏳ Pending:       <count>
   ```

---

## Subcommand: `handoff`

Goal: end-of-rotation summary across all 7 days.

1. **Identify rotation dates:** `ROTATION_START` + 6 days = end. Build array of 7 dates.

2. **Gather daily data:** for each date, read `<REPORT_DIR>/<date>.md` (if exists) and parse `<REPORT_DIR>/session-<date>.jsonl` (if exists).

3. **Aggregate:**
   - Total actionable per day.
   - All non-null `jira_key` values → JIRA tickets filed.
   - Items with decision `i` or pending → "Open items at handoff".
   - Items with decision `a` → recurring watch items.
   - `reclassify_noise` items → rubric updates made this rotation.

4. **Read the handoff template** at `<SKILL_DIR>/templates/handoff-report.md`.

5. **Fill and write** to `<REPORT_DIR>/handoff-<end-date>.md`. Write a 2–3 sentence TL;DR.

6. **Print summary:** rotation dates, total alerts, open items, JIRA tickets filed.

7. **Offer follow-ons (do not auto-execute):**
   - "Want me to publish this handoff to Confluence?"
   - "Want me to post the summary to Slack?"
   - "Want me to create JIRA tickets for the open items?"

---

## Notes

- Always shell out from absolute paths. Don't rely on cwd.
- When delegating to `log-analyzer`, give a concrete Task prompt — project, timestamps, service (if any), and explicit instruction to return only the classified summary table, no raw log lines.
- Never commit anything; `<REPORT_DIR>` should be gitignored in the user's project.
