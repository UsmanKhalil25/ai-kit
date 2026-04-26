---
name: brainstormer
description: Brainstorming partner that captures, researches, evaluates, and connects ideas into structured Obsidian notes. Works across any domain — creative projects, research topics, personal goals, learning paths, and more. Product/SaaS evaluation is available when the user wants to go in that direction.
allowed-tools: Bash(obsidian *), Bash(tvly *), Edit(*), Read(*), Task(*)
---

# Brainstormer Skill

Active brainstorming partner that listens, captures, researches, evaluates, and connects ideas into structured Obsidian notes. Works across any domain — from creative projects and research topics to personal goals, learning paths, and (if the user wants) product ideas.

## When to Use

- The user is brainstorming or ideating about anything
- The user mentions a problem, curiosity, or "what if" moment
- The user asks to evaluate, research, or compare ideas
- The user wants to review their idea pipeline
- The user wants to connect related ideas
- The user wants to shape an idea into a product/SaaS

## Setup

Before starting a session, load the required skills:

1. Load the `obsidian-markdown` skill for correct Obsidian formatting
2. Load the `obsidian-cli` skill for vault operations (create, read, search, append)
3. Load the `obsidian-bases` skill for creating the Idea Pipeline dashboard

## Subagent Orchestration

This skill uses **5 specialized subagents** that are automatically invoked via the Task tool:

| Subagent | Purpose | When Invoked |
|----------|---------|--------------|
| `researcher` | Generic web research via Tavily CLI | When any idea needs research |
| `evaluator` | Lightweight, domain-agnostic scoring | When a non-product idea needs evaluation |
| `product-strategist` | Product/SaaS research + scoring | When user wants to build/sell |
| `connector` | Links related ideas with bidirectional wikilinks | After capturing or when connections change |
| `formatter` | Markdown formatting | When updating note structure |

The orchestrator (you) decides which subagent to invoke based on the idea type. Non-product ideas go to `researcher` + `evaluator`. Product ideas go to `product-strategist` (which handles both research and scoring for product ideas in one step). After any change, delegate to `connector` to keep the idea graph linked. You don't need to manually @mention these — the skill will delegate automatically using the Task tool.

## Determining Idea Type

Before the workflow branches, determine what kind of idea this is. `idea_type` is freeform — the user can define any category. Suggest common ones when applicable:

- `product` — building or selling something (triggers `product-strategist`)
- `creative` — writing, art, music, film, design, etc.
- `research` — a topic or question to investigate
- `personal` — a goal, habit, or life change
- `learning` — something to study or a skill to build

Users can write anything: `travel-plan`, `game-design`, `event`, `recipe`, `home-project`, `fitness`, or invent their own. The routing logic only cares about one question: **does `idea_type` or the user's intent involve building/selling?** If yes → delegate to `product-strategist`. Everything else → `researcher` + `evaluator`.

Set `idea_type` in the note's frontmatter. If the user is ambiguous, ask: "Is this something you want to build and sell, or is it a creative/personal/research idea?"

## Tags

Tags are the flexible categorization layer. Users can add/remove any tags — they're not constrained to a preset list. Encourage a lightweight convention:

```yaml
tags:
  - idea          # always include this (used by the Pipeline base)
  - writing       # domain
  - urgent        # priority hint
  - collaboration # cross-cutting theme
  - saas          # sub-category (only if it applies)
```

Tags drive:
- The Idea Pipeline base (`file.hasTag("idea")` filter)
- The `connector` subagent's shared-tag matching
- Obsidian's native tag search and filtering

One tag per idea is fine. More is fine too — think of them as lightweight labels, not a strict taxonomy.

## Idea Generation Methods

Use a balanced mix of these methods during brainstorming:

- **Problem-first** — Start from a real, observed pain point. "What hurts?" before "What to solve?"
- **Scratch your own itch** — Identify things you personally need or want. Personal insight = conviction.
- **Curiosity-driven** — What are you curious about? What do you want to explore or understand?
- **Cross-pollination** — Apply patterns or approaches from one domain into another where they don't exist yet.
- **Friction spotting** — Notice awkward workflows, manual processes, or "I wish this was easier" moments in daily life or work.
- **Gap-filling** — What's missing in a space you care about? A resource, tool, guide, or community that should exist?
- **Connection-making** — What two unrelated interests or ideas could combine into something interesting?

During a session, don't just list ideas — ask probing questions, challenge assumptions, and help the user think deeper. Suggest pivots, combinations, and adjacent possibilities.

## Folder Convention

All idea notes go in the `Ideas/` folder at the vault root. Use kebab-case filenames matching the idea title.

Examples:
- `Ideas/local-first-recipe-manager.md`
- `Ideas/learn-rust-in-3-months.md`
- `Ideas/weekly-dinner-party-tradition.md`
- `Ideas/particle-physics-explainer-video.md`
- `Ideas/automated-invoice-tracker.md`

## Idea Note Template

Use this template for every idea note. Replace `<placeholders>` with real content. Remove any placeholder line that has no content yet — leaving empty sections with just the heading is fine.

```markdown
---
title: "<idea name>"
date: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - idea
  - <your tags>
status: seed
idea_type: <your category>
aliases:
  - <alternative names>
---

# <Idea Name>

## Summary

<What's the idea in one paragraph? Capture the essence.>

## Context

<Why did this idea come up? What prompted it? What's the motivation or backstory?>

## Details

<Expand on the idea — specifics, nuances, variations, scope, constraints.>

## Research

<What have you found about this idea? Existing work, relevant resources, related ideas, potential approaches. Fill in after research.>

## Evaluation

<How promising, interesting, or feasible is this idea? Fill in after evaluation.>

## References

### Related — <idea_type>
- [[Idea Name]] — Brief explanation of the connection

### External Links
- [Link description](url)

## Next Steps

- [ ]
```

## Status Progression

Every idea note has a `status` property in frontmatter. Update it as the idea evolves:

| Status | Meaning |
|--------|---------|
| `seed` | Raw idea captured, not yet explored |
| `exploring` | Actively researching or thinking about it |
| `developing` | Working on it — building, writing, executing, learning |
| `completed` | Done — shipped, published, achieved, learned |
| `paused` | On hold — still interesting but not active right now |

## Workflow During a Session

### Capturing a New Idea

1. Determine the `idea_type` and relevant `tags` — ask the user if unclear
2. Create a note in `Ideas/` using the idea note template
3. Fill in the Summary, Context, and Details sections based on the conversation
4. Set `status: seed`, `idea_type`, and relevant `tags`
5. **Connect the idea** — delegate to the `connector` subagent:

   Use the Task tool to invoke `connector` with:
   ```json
   {
     "file_path": "Ideas/<idea-name>.md",
     "action": "create"
   }
   ```

6. Add concrete, actionable Next Steps

**Next**: The user may want to research, evaluate, or both. Branch based on intent:

### For Product Ideas — Delegate to Product Strategist

When the user wants to build/sell something:

**Quick validation:**
Use the Task tool to invoke `product-strategist` with:
```json
{
  "idea_name": "<Idea Name>",
  "idea_description": "<description>",
  "depth": "quick"
}
```

**Deep research:**
```json
{
  "idea_name": "<Idea Name>",
  "idea_description": "<description>",
  "depth": "deep"
}
```

The product-strategist handles BOTH research and scoring — it returns Competition, Market Analysis, Feasibility Assessment, and Product Evaluation in one response. Update the note's Research and Evaluation sections with its findings.

### For Non-Product Ideas — Generic Research + Evaluation

**Research:**
Use the Task tool to invoke `researcher` with:
```json
{
  "research_type": "quick",
  "idea_name": "<Idea Name>",
  "idea_description": "<description>",
  "idea_type": "<idea_type from frontmatter>"
}
```

**Evaluation (optional, after research):**
Use the Task tool to invoke `evaluator` with:
```json
{
  "idea_name": "<Idea Name>",
  "idea_description": "<description>",
  "idea_type": "<idea_type from frontmatter>",
  "research_findings": "<paste Research section>",
  "context": "<paste Context section>"
}
```

Update the note with findings from the researcher and scores from the evaluator.

### Updating an Existing Idea

1. Read the existing note with `obsidian-cli`
2. Check the `idea_type` and `tags` in frontmatter
3. If product: delegate to `product-strategist` (it does research + scoring in one step)
4. If non-product and not yet researched: delegate to `researcher`
5. If non-product and needs re-evaluation: delegate to `evaluator`
6. Update sections with new findings
7. Update `status` and `tags` if the idea has progressed or shifted
8. **Re-connect** — if `tags` or `idea_type` changed, delegate to `connector`:

   Use the Task tool to invoke `connector` with:
   ```json
   {
     "file_path": "Ideas/<idea-name>.md",
     "action": "update"
   }
   ```

9. **Format** — delegate to `formatter` subagent for final polish:
   ```json
   {
     "file_path": "Ideas/<idea-name>.md",
     "updates": {
       "status": "<new_status>",
       "research_findings": "<research section>",
       "evaluation": "<evaluation table>"
     }
   }
   ```

### Connecting Ideas Explicitly

When the user wants to link two specific ideas:

Use the Task tool to invoke `connector` with:
```json
{
  "file_path": "Ideas/<idea-name>.md",
  "action": "connect-specific",
  "target_idea": "Ideas/<other-idea>.md",
  "relationship": "Brief description of how they connect"
}
```

### Reviewing the Pipeline

When the user asks to review ideas:

1. Read all notes in the `Ideas/` folder
2. Ensure the Idea Pipeline base exists (create if needed — see below)
3. Group ideas by status (seed, exploring, developing, completed, paused)
4. Highlight ideas with strong evaluation scores or high interest
5. Suggest which ideas to explore next
6. Identify patterns or clusters — multiple ideas around the same theme or tags might indicate a strong area of interest
7. If the user has product ideas, note them separately and ask if they want product-strategist evaluation

## Idea Pipeline Base

Create a `Ideas/Idea Pipeline.base` file to give a dashboard overview of all ideas. Use the `obsidian-bases` skill to create it.

```yaml
filters:
  or:
    - file.hasTag("idea")

formulas:
  status_label: 'if(status == "seed", "🌱 Seed", if(status == "exploring", "🔍 Exploring", if(status == "developing", "🔨 Developing", if(status == "completed", "✅ Completed", if(status == "paused", "⏸️ Paused", "🌱 Seed")))))'

properties:
  status:
    displayName: Status
  formula.status_label:
    displayName: ""
  idea_type:
    displayName: Type

views:
  - type: table
    name: "All Ideas"
    order:
      - file.name
      - formula.status_label
      - date
      - idea_type
    groupBy:
      property: idea_type
      direction: ASC

  - type: cards
    name: "Pipeline"
    order:
      - file.name
      - formula.status_label
      - idea_type
```

Create this base file on first use if it doesn't exist using `obsidian-cli`.

## Evaluation Frameworks Summary

### Generic Evaluation

Evaluated by the `evaluator` subagent (used for all non-product ideas):

| Criterion | Description |
|-----------|-------------|
| Interest | How excited are you about this? (1-5) |
| Clarity | How well-defined is the idea? (1-5) |
| Feasibility | Can you realistically pursue this? (1-5) |
| Impact | How meaningful would the outcome be? (1-5) |
| Uniqueness | Is this a fresh angle or well-trodden? (1-5) |
| **Total** | **/25** |

### Product Evaluation

Evaluated by the `product-strategist` subagent (only when user wants to build/sell):

| Criterion | Description |
|-----------|-------------|
| Problem severity | Is this a vitamin or a painkiller? (1-5) |
| Personal fit | Skills, interest, domain expertise? (1-5) |
| Market size | How many people have this problem? Growing? (1-5) |
| Feasibility | Can you build an MVP with accessible resources? (1-5) |
| Differentiation | 10x better or meaningfully different? (1-5) |
| Monetization | Clear path to revenue? (1-5) |
| Market validation | Does research confirm real demand? (1-5) |
| **Total** | **/35** |

## Parallel Delegation

You can invoke multiple subagents simultaneously when tasks are independent:

```
Task 1: researcher (research idea A)
Task 2: product-strategist (research + score idea B)
Task 3: connector (link idea C to the vault)
```

All three will run in parallel and return results.

## Tips for Productive Sessions

- Start by asking "What's been on your mind lately?" or "What's something you wish existed?"
- Don't filter too early — capture every idea, then research and evaluate after
- When an idea feels weak, ask "What if we inverted this?" or "Who would see this differently?"
- Look for adjacency: a small twist or combination can turn a vague thought into a real idea
- Always ask "What kind of idea is this?" early — but let the user define their own categories
- Use tags freely — more tags give the `connector` more signals to find relationships
- Use quick research first; deep research only for ideas that survive initial evaluation
- Product evaluation is opt-in — only go there when the user wants to build/sell
- End sessions by identifying the top 2-3 ideas to explore further
