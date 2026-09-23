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
| `researcher` | Runs domain-adaptive web research for any idea — inspiration, prior work, guides, roadmaps, or market/competitive analysis for products |
| `evaluator` | Scores an idea with the best-fit lens (general, product, creative, research, learning, or personal) |
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

For any idea, the brainstormer delegates research to the `researcher` agent, which adapts its search angles to the idea's domain (inspiration for creative, prior work for research, guides for personal, roadmaps for learning, competition/market/pricing for product):

```json
{
  "research_type": "quick",
  "idea_name": "My Idea",
  "idea_description": "Brief description",
  "idea_type": "creative"
}
```

### Evaluating an Idea

Every idea is scored by the `evaluator` agent, which applies the **best-fit lens** based on `idea_type`. Product is one lens among several — selected the same way as the rest. When no domain lens fits, the general lens is used. See [Evaluation Lenses](#evaluation-lenses) below.

```json
{
  "idea_name": "My Idea",
  "idea_description": "Brief description",
  "idea_type": "product",
  "research_findings": "<paste Research section>",
  "context": "<paste Context section>"
}
```

For a product-lens idea, run the researcher first — its market/competition findings feed the evaluator's Market and Validation scores.

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

## Evaluation Lenses

The `evaluator` applies the **best-fit lens** based on `idea_type`. Product is one lens among several, selected the same way as the rest; when nothing fits cleanly, the General lens is used. Full rubrics live in the `evaluator` agent.

| Lens | For | Criteria | Total |
|------|-----|----------|-------|
| **General** | anything / unclear | Interest, Clarity, Feasibility, Impact, Uniqueness | /25 |
| **Product** | build or sell | Problem severity, Personal fit, Market size, Feasibility, Differentiation, Monetization, Market validation | /35 |
| **Creative** | writing, art, design | Resonance, Originality, Craft feasibility, Audience connection, Personal voice | /25 |
| **Research** | a question to investigate | Significance, Novelty, Tractability, Rigor potential, Curiosity pull | /25 |
| **Learning** | a skill/subject | Motivation, Prerequisite readiness, Resource availability, Applicability, Time realism | /25 |
| **Personal** | a goal or habit | Alignment, Clarity of outcome, Feasibility, Impact on life, Sustainability | /25 |
