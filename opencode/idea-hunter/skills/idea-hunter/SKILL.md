---
name: idea-hunter
description: |
  Hunts fresh ideas from idea-discovery platforms (Show HN, Indie Hackers, Reddit, etc.) by driving a headless browser, then curates and captures the best ones as seed notes in an Obsidian vault. Use when the user wants to discover new ideas, scan what people are building or asking for, find problems worth solving, or "hunt for ideas", "see what's trending", "find product/problem ideas". Feeds the brainstormer pipeline. Browser-first — delegates all web navigation to the `browser` subagent.
allowed-tools: Bash(obsidian *), Edit(*), Read(*), Task(*)
---

# idea-hunter

Discovers ideas from the wild — Show HN, Indie Hackers, "somebody make this" communities — and turns the good ones into structured seed notes ready for the brainstormer to research and evaluate.

You are the **orchestrator**. You never touch a browser directly. You route each platform to the `browser` subagent, collect compact results, curate them, and write the keepers into the vault.

## Setup

Load these skills before starting:

1. `playwright-browser` — so you understand what the `browser` subagent can do and how to brief it (you delegate; you don't call `playwright_*` yourself).
2. `obsidian-cli` — to write idea notes into the vault.
3. `obsidian-markdown` — for correct note formatting.

Read the platform config (`templates/platforms.yaml`, or `platforms.example.yaml` if the user hasn't made one). It defines the hunting grounds, the extraction schema, caps, and output settings.

## Subagents

| Subagent | Role | When |
|----------|------|------|
| `browser` | Headless browser operator (from the `browser` package). Navigates a platform and returns capped, structured idea candidates. | Once per enabled platform |
| `curator` | Dedupes candidates against the existing vault and scores them for signal. Returns only the keepers. | After hunting, before writing |

The `browser` subagent is a context firewall — it absorbs the large page snapshots and returns only small JSON. Keep it that way: never ask it for raw page content.

## Workflow

### 1. Pick the hunting grounds

From the config, take the `enabled: true` platforms. If the user named specific ones ("hunt Show HN and Indie Hackers"), use those. Confirm the list if it's ambiguous.

### 2. Hunt — delegate each platform to `browser` (in parallel)

For each platform, invoke the `browser` subagent via the Task tool with an explicit goal, the extraction schema, and limits. These are independent — **run them in parallel**.

```json
{
  "goal": "<platform.goal from config — concrete URL + what to collect>",
  "url": "<platform.url>",
  "schema": {
    "items": [{
      "title": "", "url": "", "author": "", "posted_at": "",
      "score": null, "num_comments": null,
      "summary": "", "pain_point": "", "tags": []
    }]
  },
  "limits": { "max_items": 20, "max_chars_per_field": 300 },
  "notes": "<platform.notes — selectors / pagination hints>"
}
```

Handle structured errors gracefully:
- `login_required` (e.g. Reddit in 2026) → skip that platform, note it in the run summary, suggest the user provide a logged-in session (`--storage-state`) if they want it.
- `blocked` / `timeout` → skip and report; don't retry endlessly.

### 3. Curate — delegate to `curator`

Pass all collected candidates plus the vault folder to the `curator` subagent:

```json
{
  "candidates": [ ...all items from all platforms... ],
  "vault_folder": "Ideas",
  "min_signal_score": 3
}
```

The curator reads existing vault ideas, drops duplicates and low-signal noise, scores what's left, and returns the keepers with a short rationale each.

### 4. Capture — write seed notes

For each kept candidate, create a note in the `Ideas/` folder using `obsidian-cli`, following the seed template below. This is mechanical — you hold the curated list, so write the notes directly (don't burn a subagent on it).

- Skip anything the curator flagged as a duplicate of an existing note (optionally, append the new source link to the existing note instead).
- Set `status: seed`, add the `hunted` tag plus inferred topical tags, and record the source.

### 5. Report

Give the user a short run summary: platforms hunted, how many candidates, how many kept, and the top 3 by signal — with a nudge to run the brainstormer on the strongest ones.

## Seed note template

Hunted ideas use the same shape as brainstormer notes (so they interoperate in one vault), pre-filled as seeds:

```markdown
---
title: "<idea name>"
date: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - idea
  - hunted
  - <inferred topical tags>
status: seed
idea_type: <inferred — product / problem / research / etc.>
source: <platform name>
source_url: <canonical link>
aliases: []
---

# <Idea Name>

## Summary

<1-2 sentence neutral summary of the idea.>

## Context

Hunted from **<platform>** on <date>. <Who posted it / what prompted it, if known.>

The underlying pain point: <pain_point>.

## Details

<Anything more the candidate carried — discussion signal, score, notable comments.>

## Research

<Empty — for the brainstormer's researcher to fill.>

## Evaluation

<Empty — for the brainstormer's evaluator to fill.>

## References

### External Links
- [<source title>](<source_url>) — original post

## Next Steps

- [ ] Run the brainstormer to research and evaluate this seed
```

## Rules

- **Browser-first, but never drive the browser yourself** — always delegate navigation to the `browser` subagent with a concrete goal + schema + caps.
- **Keep candidates compact** — the browser returns capped JSON; don't request raw pages.
- **Respect login walls** — if a platform returns `login_required`, skip it; don't try to evade.
- **Dedupe against the vault** — the curator checks existing `Ideas/` notes so you don't create duplicates.
- **Capture as seeds** — hunted ideas are raw. Tag them `hunted`, set `status: seed`, record the `source`, and leave Research/Evaluation for the brainstormer.
- **Config-driven** — platforms, caps, and thresholds live in `platforms.yaml`, not in this skill.
- **Be honest in the summary** — say which platforms were skipped and why.

## Handoff to the brainstormer

The idea-hunter only *captures* seeds. Researching, scoring, and connecting them is the brainstormer's job — hunted notes drop straight into its pipeline (same `Ideas/` folder, same frontmatter). End a hunt by pointing the user at the strongest seeds to run through the brainstormer.
