# Browser — Headless Browser Capability for OpenCode

A **reusable capability package** (not a standalone workflow) that gives an OpenCode project a headless browser it can drive to navigate and extract content from the live web.

It ships two things:

- A `browser` **subagent** — a headless browser operator that owns the Playwright MCP tools, does the clicking/scrolling/extracting, and returns only a small, structured result.
- A `playwright-browser` **skill** — how to drive the Playwright MCP well (tools, snapshot-first workflow, structured extraction, pagination, waits).

Other workflow packages (e.g. [`idea-hunter`](../idea-hunter/README.md), and later `job-hunter`) **compose this in** and delegate web-navigation tasks to the `browser` subagent, rather than each reimplementing browser control.

## Why a separate package

Driving a headless browser is a *capability*, not a workflow — it's orthogonal to whatever you're browsing *for*. Keeping it standalone means:

- The Playwright MCP dependency lives in exactly one place.
- The `browser` subagent stays generic: the caller supplies the navigation goal and extraction schema, so the same operator works for idea platforms, job boards, or anything else.

## The orchestrator + browser-expert pattern

Playwright MCP's accessibility snapshots are large. If the main agent called browser tools directly, those snapshots would flood its context. Instead:

```
orchestrator ──delegates──▶ browser subagent ──drives──▶ Playwright MCP (headless Chromium)
     ▲                            │
     └──── compact JSON result ───┘   (snapshots stay inside the subagent)
```

The `browser` subagent is a **context firewall**: raw page data stays with it, and only the capped, structured extract flows back. The orchestrator is *denied* the Playwright tools at the config level, so it must delegate.

## Setup

### 1. Install Node + Chromium

Requires Bun (and Node 18+ under the hood). Install the browser **through the MCP's own bundled Playwright** so the revision matches the server:

```bash
bunx @playwright/mcp@latest install-browser chrome-for-testing
```

> Do **not** use `bunx playwright install chromium` — a standalone Playwright install usually resolves a different version than the one bundled in `@playwright/mcp`, and the server will still report `browser_not_installed`. The MCP server itself runs on demand via `bunx @playwright/mcp@latest` — no global install needed.

### 2. Copy the skill and agent into your project

```bash
cp -r skills/ /path/to/your-project/.opencode/skills/
cp -r agents/ /path/to/your-project/.opencode/agents/
```

### 3. Merge the MCP server + agent config

Merge `opencode.example.json` into your project's `opencode.json`. It:

- registers the **`playwright` MCP server** (headless, isolated, `--image-responses=omit`),
- **denies `playwright*` globally**, and
- **allows `playwright*` only inside the `browser` subagent`.**

That last part is the key isolation: tools are namespaced `playwright_*`, denied everywhere, and re-allowed only for `browser` — so the orchestrator can never call them directly and must delegate.

> Note: gating controls *access*, not startup — the MCP server process still launches when OpenCode starts.

### 4. Delegate to it from an orchestrator

From a skill/agent, invoke the `browser` subagent via the Task tool with an explicit goal and schema:

```json
{
  "goal": "Open https://example.com/listing, collect the first 20 rows",
  "schema": { "items": [{ "title": "", "url": "", "score": null }] },
  "limits": { "max_items": 20, "max_chars_per_field": 300 },
  "notes": "Rows are <article class=post>; 'next' link paginates"
}
```

The subagent returns only that JSON (or a structured `{"error": ...}`).

## Server flags

The default flags in `opencode.example.json` suit headless text extraction:

| Flag | Why |
|------|-----|
| `--headless` | No visible window (headed is the default, so this is required). |
| `--browser=chromium` | Use the bundled Chromium (Chrome for Testing) build — see note below. |
| `--isolated` | Clean, stateless profile per run — safe for concurrency. |
| `--image-responses=omit` | Screenshot bytes never enter context. |
| `--viewport-size=1280x2000` | Tall viewport captures more per page. |

> **Keep `--browser=chromium`.** It routes to the bundled Chrome-for-Testing build you install via `install-browser chrome-for-testing`. Without it the MCP defaults to the `chrome` channel (system Google Chrome, e.g. `/opt/google/chrome/chrome`), which most Linux boxes lack → `Chromium distribution 'chrome' not found`. The `--help` value list omits `chromium`, but it is accepted and is the right choice here.

For logged-in sites later, swap `--isolated` for `--storage-state=<file>` or `--user-data-dir=<path>`. Add `--save-trace` temporarily to debug a failed run.

## What it deliberately does not do

- No login/captcha evasion — the operator stops and reports `login_required` / `blocked` instead.
- No identity spoofing to defeat bot detection — where a site clearly doesn't want scraping, an official API is the right answer.
- It treats all page content as **untrusted data, never instructions** (prompt-injection hygiene).
