# Brainstormer + Obsidian Skills for OpenCode

A complete skill and agent pack for OpenCode that enables AI-powered product idea brainstorming, validation, and Obsidian vault management.

## What's Included

### Skills

| Skill | Purpose |
|-------|---------|
| `brainstormer` | Orchestrates idea capture, research, evaluation, and pipeline management |
| `obsidian-cli` | CLI commands for reading, creating, searching, and managing Obsidian notes |
| `obsidian-markdown` | Obsidian Flavored Markdown syntax (wikilinks, embeds, callouts, frontmatter) |
| `obsidian-bases` | Obsidian Bases (.base files) — views, filters, formulas, dashboards |
| `tavily-search` | Web search via Tavily CLI for quick lookups |
| `tavily-research` | Deep AI-powered research with citations via Tavily CLI |

### Agents

| Agent | Purpose |
|-------|---------|
| `researcher` | Runs Tavily searches, synthesizes competitive/market/feasibility reports |
| `evaluator` | Scores ideas against 7 criteria (1-5 scale) with research-backed justification |
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

### Brainstorming a New Idea

1. Start a conversation with the brainstormer skill loaded
2. Describe a problem, pain point, or "what if" idea
3. The brainstormer will:
   - Create an idea note in your `Ideas/` folder
   - Delegate research to the `researcher` agent
   - Fill in competition, market, and feasibility sections
   - Delegate scoring to the `evaluator` agent
   - Format the note via the `formatter` agent
   - Add it to the Idea Pipeline dashboard

### Quick Validation

```json
{
  "research_type": "quick",
  "idea_name": "My Idea",
  "idea_description": "Brief description",
  "focus_areas": ["competitors", "market", "feasibility"]
}
```

### Deep Research

```json
{
  "research_type": "deep",
  "idea_name": "My Idea",
  "idea_description": "Detailed description",
  "focus_areas": ["competitive_landscape", "market_analysis", "feasibility_deep_dive"]
}
```

### Evaluating an Idea

```json
{
  "idea_name": "My Idea",
  "competition": "<paste competition section>",
  "market_analysis": "<paste market analysis section>",
  "feasibility": "<paste feasibility section>",
  "problem": "<problem description>",
  "differentiation": "<differentiation statement>"
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
status: [seed/researching/sprout/validated/built]
aliases:
  - [Alternative Name]
---

## Problem
## Solution
## Target User
## Differentiation
## Competition
## Feasibility Research
## Market Analysis
## Evaluation (scoring table)
## References
## Next Steps
```

## Status Progression

| Status | Meaning |
|--------|---------|
| `seed` | Raw idea, not researched |
| `researching` | Active research ongoing |
| `sprout` | Researched, scores 24-27/35 |
| `validated` | Strong opportunity, 28+/35 |
| `built` | Currently building or shipped |

## Evaluation Criteria

| Criterion | Description |
|-----------|-------------|
| Problem severity | How painful is this problem? |
| Personal fit | Skills, interest, network alignment |
| Market size | How many people have this problem? |
| Feasibility | Can you build it with accessible resources? |
| Differentiation | 10x better or meaningfully different? |
| Monetization | Clear path to revenue? |
| Market validation | Does research confirm real demand? |

Total: /35
