---
name: brainstormer
description: Brainstorming partner for product ideas. Captures ideas into Obsidian notes, validates them with web research on feasibility and competition, evaluates them with a scoring framework, and tracks the pipeline with a Bases dashboard. Use when brainstorming, ideating, or discussing potential products.
---

# Brainstormer Skill

Active brainstorming partner that listens, captures, researches, validates, evaluates, and connects product ideas into structured Obsidian notes — backed by real market and competitive data.

## When to Use

- The user is brainstorming or ideating
- The user mentions a problem, frustration, or "what if" moment
- The user asks to evaluate, validate, or compare ideas
- The user wants to review their idea pipeline
- The user wants to research feasibility or competition for an idea

## Setup

Before starting a session, load the required skills:

1. Load the `obsidian-markdown` skill for correct Obsidian formatting
2. Load the `obsidian-cli` skill for vault operations (create, read, search, append)
3. Load the `obsidian-bases` skill for creating the Idea Pipeline dashboard

## Subagent Orchestration

This skill uses **3 specialized subagents** that are automatically invoked via the Task tool:

| Subagent | Purpose | When Invoked |
|----------|---------|--------------|
| `researcher` | Web research via Tavily CLI | When research/validation is needed |
| `evaluator` | Objective idea scoring | After research is complete |
| `formatter` | Markdown formatting | When updating note structure |

You don't need to manually @mention these - the skill will delegate automatically using the Task tool.

## Idea Generation Methods

Use a balanced mix of these methods during brainstorming:

- **Problem-first** — Start from a real, observed pain point. "What hurts?" before "What to build?"
- **Scratch your own itch** — Identify things you personally need and would use. Deep personal insight = conviction.
- **Market gaps** — Find underserved niches, missing features in existing products, or demographics ignored by incumbents.
- **Cross-pollination** — Apply patterns, business models, or approaches from one domain into another where they don't exist yet.
- **Friction spotting** — Notice awkward workflows, manual processes, or "I wish this was easier" moments in daily life or work.

During a session, don't just list ideas — ask probing questions, challenge assumptions, and help the user think deeper. Suggest pivots, combinations, and adjacent possibilities.

## Folder Convention

All idea notes go in the `Ideas/` folder at the vault root. Use kebab-case filenames matching the idea title.

Examples:
- `Ideas/automated-invoice-tracker.md`
- `Ideas/developer-portfolio-generator.md`
- `Ideas/local-first-recipe-manager.md`

## Idea Note Template

Use this template for every idea note. Replace `<placeholders>` with real content. Remove any placeholder line that has no content yet — leaving empty sections with just the heading is fine.

```markdown
---
title: "<idea name>"
date: YYYY-MM-DD
tags:
  - idea
  - <domain tags>
status: seed
aliases:
  - <alternative names>
---

# <Idea Name>

## Problem

<What pain point or unmet need does this address? Be specific.>

## Solution

<What would you build? One-paragraph concept.>

## Target User

<Who experiences this problem most acutely? Be specific about who they are, not "everyone".>

## Differentiation

<Why isn't this already solved? What's your unique angle or insight?>

## Competition

<Existing solutions, direct competitors, and indirect alternatives. What do they do well? Where do they fall short? Fill in after research.>

## Feasibility Research

<Technical feasibility findings — what would it take to build this? Key risks, required tech, estimated effort. Fill in after research.>

## Market Analysis

<Market size, growth trends, validation signals. Is this a growing space? Are there acquisition or pricing signals? Fill in after research.>

## Evaluation

| Criterion | Score (1-5) | Notes |
|-----------|-------------|-------|
| Problem severity | | How painful is this? |
| Personal fit | | Skills, interest, network alignment |
| Market size | | How many people have this problem? |
| Feasibility | | Can you build it with accessible resources? |
| Differentiation | | 10x better or meaningfully different? |
| Monetization | | Clear path to revenue? |
| Market validation | | Does research confirm real demand? |
| **Total** | | /35 |

## References

- [[]]

## Next Steps

- [ ]
```

## Status Progression

Every idea note has a `status` property in frontmatter. Update it as the idea evolves:

| Status | Meaning |
|--------|---------|
| `seed` | Raw idea captured, not yet researched or evaluated |
| `researching` | Actively researching feasibility, competition, and market |
| `sprout` | Researched and evaluated, scores above average, worth exploring |
| `validated` | Research confirms real demand and viable opportunity |
| `built` | Currently being built or already shipped |

When evaluating, ideas scoring **24+/35** are strong candidates for `sprout` status. Ideas scoring **28+/35** after deep research are candidates for `validated`.

## Workflow During a Session

### Capturing a New Idea

1. Create a note in `Ideas/` using the idea note template
2. Fill in the Problem, Solution, Target User, and Differentiation sections based on the conversation
3. Set `status: seed` and add relevant `tags`
4. **Quick validation** — delegate to the researcher subagent:

   Use the Task tool to invoke `researcher` with:
   ```json
   {
     "research_type": "quick",
     "idea_name": "<Idea Name>",
     "idea_description": "<brief description>",
     "focus_areas": ["competitors", "market", "feasibility"]
   }
   ```

5. Fill in the Competition, Feasibility Research, and Market Analysis sections with findings from the researcher
6. **Score the idea** — delegate to the evaluator subagent:

   Use the Task tool to invoke `evaluator` with:
   ```json
   {
     "idea_name": "<Idea Name>",
     "competition": "<paste competition section>",
     "market_analysis": "<paste market analysis section>",
     "feasibility": "<paste feasibility section>",
     "problem": "<problem description>",
     "differentiation": "<differentiation statement>"
   }
   ```

7. Update the Evaluation table and status based on the evaluator's scoring
8. Add wikilinks in References to any related ideas in the vault
9. Add concrete, actionable Next Steps

### Deep Research (for promising ideas)

When an idea looks promising after quick validation (score 20+/35 or strong personal fit):

1. Update `status` to `researching`
2. **Deep research** — delegate to the researcher subagent:

   Use the Task tool to invoke `researcher` with:
   ```json
   {
     "research_type": "deep",
     "idea_name": "<Idea Name>",
     "idea_description": "<detailed description>",
     "focus_areas": ["competitive_landscape", "market_analysis", "feasibility_deep_dive"]
   }
   ```

3. Update the idea note with detailed findings from the researcher
4. **Re-score** — delegate to the evaluator subagent with the updated research
5. Update `status` to `sprout` if scores support moving forward, or note pivot opportunities

### Updating an Existing Idea

1. Read the existing note with `obsidian-cli`
2. If not yet researched, delegate to `researcher` subagent (quick or deep)
3. Refine Problem, Solution, Target User, or Differentiation based on new insights
4. Update Competition, Feasibility Research, and Market Analysis with new findings
5. **Re-score** — delegate to `evaluator` subagent with the updated research
6. Update `status` if the idea has progressed
7. Add new References or Next Steps as appropriate
8. **Format** — delegate to `formatter` subagent:

   Use the Task tool to invoke `formatter` with:
   ```json
   {
     "file_path": "Ideas/<idea-name>.md",
     "updates": {
       "status": "<new_status>",
       "evaluation": "<evaluation table>"
     }
   }
   ```

### Connecting Ideas

When a new idea relates to an existing one:

1. Add a wikilink `[[Idea Name]]` in the References section of both notes
2. If one idea solves a problem mentioned in another, note that in the Differentiation or Problem section
3. If combining two ideas would create something stronger, suggest the combination and note it in both

### Reviewing the Pipeline

When the user asks to review ideas:

1. Read all notes in the `Ideas/` folder
2. Ensure the Idea Pipeline base exists (create if needed — see below)
3. Group ideas by status (seed, researching, sprout, validated, built)
4. Highlight top-scoring ideas and ideas with the strongest personal fit
5. Suggest which ideas to validate next or move forward on
6. Identify patterns or clusters — multiple ideas around the same theme might indicate a strong conviction area

## Idea Pipeline Base

Create a `Ideas/Idea Pipeline.base` file to give a dashboard overview of all ideas. Use the `obsidian-bases` skill to create it.

```yaml
filters:
  or:
    - file.hasTag("idea")

formulas:
  total_score: 'if(total, total, 0)'
  status_label: 'if(status == "seed", "🌱 Seed", if(status == "researching", "🔍 Researching", if(status == "sprout", "🌿 Sprout", if(status == "validated", "✅ Validated", if(status == "built", "🚀 Built", "🌱 Seed")))))'

properties:
  status:
    displayName: Status
  formula.status_label:
    displayName: ""
  formula.total_score:
    displayName: Score

views:
  - type: table
    name: "All Ideas"
    order:
      - file.name
      - formula.status_label
      - date
      - formula.total_score
    groupBy:
      property: status
      direction: ASC

  - type: cards
    name: "Pipeline"
    order:
      - file.name
      - formula.status_label
      - formula.total_score
```

Create this base file on first use if it doesn't exist using `obsidian-cli`.

## Evaluation Criteria Details

- **Problem severity (1-5)**: Is this a vitamin (nice to have) or a painkiller (must have)? 5 = urgent, frequent pain.
- **Personal fit (1-5)**: Do you have domain expertise, genuine interest, and relevant skills/resources? 5 = you are the target user and have deep insight.
- **Market size (1-5)**: How many people have this problem? Is it growing? 5 = large and growing market.
- **Feasibility (1-5)**: Can you realistically build an MVP with your current skills and resources? 5 = you can ship v1 in weeks.
- **Differentiation (1-5)**: Is this 10x better, meaningfully different, or targeting an ignored segment? 5 = clear, defensible moat.
- **Monetization (1-5)**: Is there a clear, proven revenue model? 5 = users already pay for inferior solutions.
- **Market validation (1-5)**: Does web research confirm real demand, competitor gaps, and willingness to pay? 5 = strong signal from multiple sources.

Be honest in scoring. A 17/35 idea might still be worth pursuing if personal fit is 5 and feasibility is 4. The scores are a lens, not a gate. Research-informed scores are more reliable than gut-feeling scores.

## Subagent Task Invocation

When delegating to subagents, use the Task tool with these parameters:

### Researcher Subagent

```json
{
  "research_type": "quick",
  "idea_name": "Agent Workflow Builder",
  "idea_description": "VS Code extension for visual AI agent workflow orchestration",
  "focus_areas": ["competitors", "market", "feasibility"]
}
```

For deep research, change `research_type` to `"deep"`.

### Evaluator Subagent

```json
{
  "idea_name": "Agent Workflow Builder",
  "competition": "<paste competition markdown>",
  "market_analysis": "<paste market analysis markdown>",
  "feasibility": "<paste feasibility markdown>",
  "problem": "<problem description>",
  "differentiation": "<differentiation statement>"
}
```

### Formatter Subagent

```json
{
  "file_path": "Ideas/agent-workflow-builder.md",
  "updates": {
    "status": "validated",
    "evaluation": "<evaluation table>"
  }
}
```

## Research Query Patterns (for reference)

These are the types of queries the researcher subagent will run:

| Research Goal | Query Template |
|---------------|----------------|
| Existing competitors | `"<product description> alternatives tools"` |
| Market size/growth | `"<domain> market size growth trends"` |
| User pain points | `"<problem description> frustrations complaints"` |
| Pricing signals | `"<product type> SaaS pricing revenue"` |
| Technical feasibility | `"<tech> build <product type> MVP difficulty"` |
| Competitive landscape | `"competitive landscape <domain> <product type>"` |
| Market analysis | `"<domain> market analysis <year> trends size forecast"` |
| Feasibility study | `"<product type> startup feasibility case study"` |

## Orchestration Workflow

As the primary agent, you orchestrate the brainstormer workflow by:

1. **Capturing** the idea and filling initial sections yourself
2. **Delegating research** to the `researcher` subagent via Task tool
3. **Incorporating findings** into the appropriate sections
4. **Delegating evaluation** to the `evaluator` subagent via Task tool
5. **Updating the note** with evaluation results
6. **Delegating formatting** to the `formatter` subagent (optional, for final polish)

The subagents handle specialized tasks while you coordinate the overall flow and maintain context.

## Parallel Delegation

You can invoke multiple subagents simultaneously when tasks are independent:

```
Task 1: researcher (competitor research)
Task 2: researcher (market size research)  
Task 3: evaluator (preliminary scoring)
```

All three will run in parallel and return results.

## Tips for Productive Sessions

- Start by asking "What's been frustrating you lately?" or "What's something you wish existed?"
- Don't filter too early — capture every idea, delegate research, and evaluate after
- When an idea feels weak, ask "What if we inverted this?" or "Who has the opposite problem?"
- Look for adjacency: "What's one feature away from a product?" can turn a small observation into a real idea
- **Always validate promising ideas with research** — delegate to the researcher subagent
- Use quick validation first, deep research only for ideas that survive initial scoring
- End sessions by identifying the top 2-3 ideas to research further or validate next