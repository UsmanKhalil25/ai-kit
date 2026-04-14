# Brainstormer Workflow

AI-powered idea validation workflow for capturing, researching, and evaluating product ideas.

## Project Structure

When using brainstormer in your project, copy these files to your `.opencode/` directory:

```
<your-project>/
├── Ideas/                  # Product idea notes (kebab-case filenames)
├── .opencode/
│   ├── agents/            # Subagent definitions
│   │   ├── researcher.md  # Web research specialist
│   │   ├── evaluator.md   # Idea scoring specialist
│   │   └── formatter.md   # Markdown formatting specialist
│   └── skills/            # Custom skills
│       ├── brainstormer/  # Idea validation workflow
│       ├── tavily-search/ # Web search skill
│       └── tavily-research/ # Deep research skill
└── opencode.json          # Your project configuration
```

## Required Environment Variables

This project requires a **Tavily API key** for web research. The key must be manually exported in your shell before starting OpenCode:

```bash
export TAVILY_API_KEY=tvly-your-api-key-here
```

**IMPORTANT**: The API key must be available in your shell environment for research commands to work. Get your API key from: https://tavily.com

**Note**: This project does not use `.env` files. API keys should never be committed to the repository.

## Skills & Subagents

### Brainstormer Skill

Located at: `.opencode/skills/brainstormer/SKILL.md`

This skill helps validate product ideas through:
- Competitive research (via `@researcher` subagent)
- Market analysis (via `@researcher` subagent)
- Objective scoring (via `@evaluator` subagent)
- Note formatting (via `@formatter` subagent)

The skill orchestrates these subagents automatically using the Task tool.

### Subagents

All subagents are defined in `.opencode/agents/` and are marked as `hidden: true`:

1. **researcher** - Runs Tavily searches, synthesizes findings
2. **evaluator** - Scores ideas against 7 criteria (1-5 scale)
3. **formatter** - Formats Obsidian markdown with proper structure

## Idea Note Format

All ideas follow this structure:

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
[What pain point does this address?]

## Solution
[What would you build?]

## Target User
[Who experiences this problem?]

## Differentiation
[Why isn't this already solved?]

## Competition
[Research findings from @researcher]

## Feasibility Research
[Technical assessment from @researcher]

## Market Analysis
[Market data from @researcher]

## Evaluation
[Scoring table from @evaluator]

## References
- [[Related Idea]]

## Next Steps
- [ ] [Actionable item]
```

## Workflow

### Validating a New Idea

1. Create note in `Ideas/` folder (kebab-case filename)
2. Fill Problem, Solution, Target User, Differentiation
3. Invoke `@researcher` via Task tool for research
4. Fill Competition, Market Analysis, Feasibility with findings
5. Invoke `@evaluator` via Task tool for scoring
6. Update Evaluation table and status
7. Add Next Steps

### Status Progression

- `seed` → Raw idea, not researched
- `researching` → Active research ongoing
- `sprout` → Researched, worth exploring (24-27/35)
- `validated` → Strong opportunity (28+/35)
- `built` → Currently building or shipped

## Commands

### Research Commands

Ensure `TAVILY_API_KEY` is exported in your shell, then run:

```bash
# Quick search
tvly search "query" --json

# Deep research
tvly research "topic" --model pro
```

### Obsidian Operations

Use the `obsidian-cli` skill for vault operations:
- Read notes
- Create notes
- Search vault
- Manage properties

## Best Practices

1. **Always export `TAVILY_API_KEY`** in your shell before running research commands
2. **Never commit API keys** to the repository
3. **Use kebab-case** for idea filenames (e.g., `ai-meal-planner.md`)
4. **Link related ideas** using wikilinks `[[Idea Name]]`
5. **Update `updated` date** when modifying notes
6. **Score honestly** - not every idea should be 5/5
7. **Delegate to subagents** via Task tool for specialized work

## External Dependencies

- **Tavily CLI** - For web research (`curl -fsSL https://cli.tavily.com/install.sh | bash`)
- **Obsidian** - For note editing (desktop app)
- **obsidian-cli** - For vault automation
