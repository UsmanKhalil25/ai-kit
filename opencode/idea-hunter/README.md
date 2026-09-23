# Idea Hunter — Discover Ideas from the Wild

An OpenCode workflow that **hunts fresh ideas** from idea-discovery platforms (Show HN, Indie Hackers, "somebody make this" communities), curates the best, and captures them as **seed notes in your Obsidian vault** — ready for the [`brainstormer`](../brainstormer-obsidian/README.md) to research and evaluate.

Hunting is **browser-first**: an orchestrator delegates all web navigation to a headless `browser` subagent (from the [`browser`](../browser/README.md) capability package) that reads each platform and returns compact, structured idea candidates. No search-API key required.

## How it works

```
idea-hunter (orchestrator)
  ├─ for each platform ─▶ browser subagent ─▶ headless Chromium (Playwright MCP)
  │                          └─ returns capped JSON candidates
  ├─ curator subagent ─▶ dedupe vs vault + score for signal ─▶ keepers
  └─ writes keepers as `seed` notes into Ideas/ ─▶ hands off to the brainstormer
```

The `browser` subagent is a **context firewall**: the large page snapshots stay inside it, and only small structured candidates reach the orchestrator.

## What's Included

### Skills

| Skill | Purpose |
|-------|---------|
| `idea-hunter` | Orchestrates hunting, curation, and capture across platforms |
| `playwright-browser` | How to drive the Playwright MCP (from the `browser` package) |
| `obsidian-cli` | Read/write/search Obsidian notes |
| `obsidian-markdown` | Obsidian-flavored markdown for note formatting |

### Agents

| Agent | Purpose | Source |
|-------|---------|--------|
| `browser` | Headless browser operator — navigates a platform, returns capped candidates | `browser` package |
| `curator` | Dedupes candidates against the vault and scores them for signal | this package |

## Setup

This package **depends on the [`browser`](../browser/) capability package** — install it too.

### 1. Install Bun + Chromium

Requires Bun. Install the browser **through the MCP's own bundled Playwright** so the revision matches:

```bash
bunx @playwright/mcp@latest install-browser chrome-for-testing
```

> Do **not** use `bunx playwright install chromium` — a standalone install resolves a different Playwright version and the server will still report `browser_not_installed`. The config keeps `--browser=chromium`, which routes to this bundled Chrome-for-Testing build; without it the MCP looks for system Google Chrome (`/opt/google/chrome/chrome`), which most Linux boxes lack.

### 2. Install Obsidian CLI

```bash
npm install -g obsidian-cli
```

The Obsidian desktop app must be running for CLI commands to work.

### 3. Copy skills and agents into your project

From this package:

```bash
cp -r skills/ /path/to/your-project/.opencode/skills/
cp -r agents/ /path/to/your-project/.opencode/agents/
```

From the `browser` package (the shared browser operator + skill):

```bash
cp -r ../browser/skills/playwright-browser /path/to/your-project/.opencode/skills/
cp -r ../browser/agents/browser.md /path/to/your-project/.opencode/agents/
```

### 4. Merge the config

Merge this package's `opencode.example.json` into your project's `opencode.json`. It bundles everything: the `playwright` MCP server, the `browser` subagent, and the `curator` subagent — with `playwright*` **denied globally and allowed only for the `browser` subagent**, so the orchestrator must delegate.

### 5. Configure platforms

```bash
cp templates/platforms.example.yaml templates/platforms.yaml
```

Edit to enable/disable hunting grounds, set per-platform caps, and tune the signal threshold. See the file's comments for the schema.

### 6. Start OpenCode

```bash
cd /path/to/your-project
opencode
```

## Usage

Ask to hunt:

- "Hunt for new ideas" → runs all enabled platforms
- "See what's on Show HN and Indie Hackers this week"
- "Find product ideas people are asking for"

The hunter will browse each platform, curate the results, write the keepers as `seed` notes in `Ideas/`, and hand you the top few to run through the brainstormer.

## Platforms

Browser-first today. Notes on each:

| Platform | Status | Note |
|----------|--------|------|
| Show HN | ✅ enabled | Public, browser-friendly |
| Indie Hackers | ✅ enabled | No API — the browser earns its keep here |
| Reddit (r/SomebodyMakeThis, r/startups) | ⚠️ disabled | As of 2026 Reddit requires login; enable only with a logged-in session (`--storage-state`) — otherwise the browser returns `login_required` and the platform is skipped |

The config leaves room for API-based fetchers per platform later (`fetch: api`) if browser run-cost becomes a bottleneck — but everything is browser-first for now, by design.

## Relationship to the brainstormer

Idea-hunter **captures**; brainstormer **develops**. Hunted notes use the same `Ideas/` folder and frontmatter (`status: seed`, tagged `hunted`, with `source`/`source_url`), so they drop straight into the brainstormer's research → evaluate → connect pipeline.
