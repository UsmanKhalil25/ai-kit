# Brainstormer + Obsidian Skills for OpenCode

A complete skill and agent pack for OpenCode that enables AI-powered idea brainstorming, research, and Obsidian vault management. Works across any domain — creative projects, research topics, personal goals, learning paths, and product ideas.

## What's Included

### Skills

| Skill | Purpose |
|-------|---------|
| `brainstormer` | Orchestrates idea capture, research, evaluation, and pipeline management across any domain |
| `obsidian-cli` | CLI commands for reading, creating, searching, and managing Obsidian notes |
| `obsidian-markdown` | Obsidian Flavored Markdown syntax (wikilinks, embeds, callouts, frontmatter) |
| `obsidian-bases` | Obsidian Bases (.base files) — views, filters, formulas, dashboards |
| `tavily-search` | Web search via Tavily CLI for quick lookups |
| `tavily-research` | Deep AI-powered research with citations via Tavily CLI |

### Agents

| Agent | Purpose |
|-------|---------|
| `researcher` | Runs web research for any idea domain and synthesizes findings |
| `evaluator` | Scores non-product ideas with a lightweight framework (interest, clarity, etc.) |
| `product-strategist` | Validates product/SaaS ideas — competitive analysis, market research, monetization, and product scoring |
| `connector` | Creates bidirectional wikilinks between related ideas, grouped by idea_type |
| `formatter` | Formats Obsidian markdown notes with proper structure and frontmatter |

## Setup

### 1. Install Tavily CLI

```bash
curl -fsSL https://cli.tavily.com/install.sh | bash
```

### 2. Export Tavily API Key

Get your API key from https://tavily.com, then export it in your shell:

```bash
export TAVILY_API_KEY=tvly-your-api-key-here
```

This must be done **before** starting OpenCode. The key is not stored in `.env` files.

### 3. Install Obsidian CLI

```bash
npm install -g obsidian-cli
```

Obsidian desktop app must be running for CLI commands to work.

### 4. Copy Skills and Agents into Your Project

Copy the `skills/` and `agents/` directories into your project's `.opencode/` folder:

```bash
cp -r skills/ /path/to/your-project/.opencode/skills/
cp -r agents/ /path/to/your-project/.opencode/agents/
```

Or symlink them:

```bash
ln -s /path/to/brainstormer-obsidian/skills /path/to/your-project/.opencode/skills
ln -s /path/to/brainstormer-obsidian/agents /path/to/your-project/.opencode/agents
```

### 5. Configure Agents (optional)

If your project doesn't already have an `opencode.json` with agent definitions, merge the agent configurations from `opencode.example.json` into your project's `opencode.json`. This registers the subagents with OpenCode so the brainstormer can delegate to them.

### 6. Start OpenCode

```bash
cd /path/to/your-project
opencode
```

## Usage

### Capturing a New Idea

1. Start a conversation with the brainstormer skill loaded
2. Describe any idea — a problem, a curiosity, a "what if" thought, a goal
3. The brainstormer will:
   - Determine the idea type and tags (freeform — any category works; suggest product, creative, research, personal, learning)
   - Create an idea note in your `Ideas/` folder
   - Add it to the Idea Pipeline dashboard

### Researching an Idea

For any idea, the brainstormer can delegate research to the `researcher` agent:

```json
{
  "research_type": "quick",
  "idea_name": "My Idea",
  "idea_description": "Brief description",
  "idea_type": "creative"
}
```

### Evaluating an Idea

**Non-product ideas** (creative, research, personal, learning, other) are scored by the `evaluator` agent against 5 criteria: Interest, Clarity, Feasibility, Impact, Uniqueness.

**Product/SaaS ideas** are validated by the `product-strategist` agent — it handles competitive analysis, market research, monetization assessment, and scores against 7 business-oriented criteria. This only happens when `idea_type: product` or the user explicitly wants to build/sell something.

### Product Validation (opt-in)

```json
{
  "idea_name": "My App Idea",
  "idea_description": "Brief description",
  "depth": "quick"
}
```

## Idea Note Structure

All idea notes follow this template:

```markdown
---
title: "Idea Name"
date: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - idea
  - [domain]
status: [seed/exploring/developing/completed/paused]
idea_type: <your category>
aliases:
  - [Alternative Name]
---

## Summary
## Context
## Details
## Research
## Evaluation
## References
## Next Steps
```

## Status Progression

| Status | Meaning |
|--------|---------|
| `seed` | Raw idea captured |
| `exploring` | Actively researching or thinking about it |
| `developing` | Working on it |
| `completed` | Done |
| `paused` | On hold |

## Evaluation Frameworks

### Generic (non-product ideas)

| Criterion | Description |
|-----------|-------------|
| Interest | How excited are you? (1-5) |
| Clarity | How well-defined? (1-5) |
| Feasibility | Can you pursue this? (1-5) |
| Impact | How meaningful? (1-5) |
| Uniqueness | Fresh angle? (1-5) |
| **Total** | **/25** |

### Product/SaaS (opt-in, via product-strategist)

| Criterion | Description |
|-----------|-------------|
| Problem severity | Painkiller or vitamin? (1-5) |
| Personal fit | Skills, interest, network? (1-5) |
| Market size | How many people? Growing? (1-5) |
| Feasibility | Can you build an MVP? (1-5) |
| Differentiation | 10x better or meaningfully different? (1-5) |
| Monetization | Clear path to revenue? (1-5) |
| Market validation | Research confirms demand? (1-5) |
| **Total** | **/35** |
