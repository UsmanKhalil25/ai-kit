---
name: brainstormer
description: Brainstorming partner that captures, researches, evaluates, and connects ideas into structured Obsidian notes. Works across any domain — creative projects, research topics, personal goals, learning paths, products, and more. Evaluation adapts to the idea via a best-fit scoring lens.
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

This skill uses **4 specialized subagents** that are automatically invoked via the Task tool:

| Subagent | Purpose | When Invoked |
|----------|---------|--------------|
| `researcher` | Domain-adaptive web research via Tavily CLI (incl. market/competitive for product ideas) | When any idea needs research |
| `evaluator` | Scores the idea with the best-fit lens (general, product, creative, research, learning, personal) | When any idea needs evaluation |
| `connector` | Links related ideas with bidirectional wikilinks | After capturing or when connections change |
| `formatter` | Markdown formatting | When updating note structure |

The flow is the same for **every** idea: capture → connect → research → evaluate → format. There is no separate product path — `researcher` adapts its angles to the idea's domain, and `evaluator` picks the fitting lens (product is one lens among several). After any change, delegate to `connector` to keep the idea graph linked. You don't need to manually @mention these — the skill delegates automatically using the Task tool.

## Determining Idea Type

Determine what kind of idea this is — it sets the tone of research and which evaluation **lens** the `evaluator` applies. `idea_type` is freeform — the user can define any category. Common ones:

- `product` — building or selling something
- `creative` — writing, art, music, film, design, etc.
- `research` — a topic or question to investigate
- `personal` — a goal, habit, or life change
- `learning` — something to study or a skill to build

Users can write anything: `travel-plan`, `game-design`, `event`, `recipe`, `home-project`, `fitness`, or invent their own. **The workflow does not branch on this** — every idea flows through the same capture → research → evaluate path. `idea_type` simply tells `researcher` which angles to search and tells `evaluator` which lens fits best (product, creative, research, learning, personal, or the general lens when nothing fits cleanly). Product is one lens among several, not a special track.

Set `idea_type` in the note's frontmatter. If the user is ambiguous, just ask what kind of idea it is — no need to force it into a build/sell vs. not framing.

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

Use a balanced mix of these methods — they apply whether the idea is a product, a story, a study plan, a habit, or a research question:

- **Curiosity-driven** — What are you drawn to? What do you want to explore, understand, or make?
- **Problem/friction spotting** — Notice pain points, awkward workflows, or "I wish this were easier / existed" moments in daily life, work, or a field you care about.
- **Cross-pollination** — Apply a pattern, technique, or aesthetic from one domain into another where it doesn't exist yet.
- **Gap-filling** — What's missing in a space you love? A resource, tool, guide, story, community, or answer that should exist.
- **Connection-making** — What two unrelated interests could combine into something new?
- **Inversion / what-if** — Flip an assumption. "What if the opposite were true?" "What if there were no constraints — or only one?"
- **Follow the energy** — Which half-formed thought keeps coming back? Conviction often hides in what you can't stop returning to.

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

**Next**: The user may want to research, evaluate, or both. The flow is the same for every idea — only the search angles and the evaluation lens adapt to `idea_type`.

**Research** — delegate to `researcher`. It adapts its angles to the domain (inspiration for creative, prior work for research, guides for personal, roadmaps for learning, competition/market/pricing for product):

Use the Task tool to invoke `researcher` with:
```json
{
  "research_type": "quick",
  "idea_name": "<Idea Name>",
  "idea_description": "<description>",
  "idea_type": "<idea_type from frontmatter>"
}
```

Use `"research_type": "deep"` for ideas that survived an initial pass and warrant a thorough look (e.g. a product idea you're seriously considering).

**Evaluation** (optional, after research) — delegate to `evaluator`. It picks the best-fit lens from `idea_type` (product, creative, research, learning, personal, or general):

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

Update the note with findings from the researcher and scores from the evaluator. For a product idea, the researcher's competition/market findings feed the evaluator's Product lens — so research before evaluating.

### Updating an Existing Idea

1. Read the existing note with `obsidian-cli`
2. Check the `idea_type` and `tags` in frontmatter
3. If not yet researched (or research is stale): delegate to `researcher`
4. If it needs evaluation or re-evaluation: delegate to `evaluator` (it applies the lens matching `idea_type`)
5. Update sections with new findings
6. Update `status` and `tags` if the idea has progressed or shifted
7. **Re-connect** — if `tags` or `idea_type` changed, delegate to `connector`:

   Use the Task tool to invoke `connector` with:
   ```json
   {
     "file_path": "Ideas/<idea-name>.md",
     "action": "update"
   }
   ```

8. **Format** — delegate to `formatter` subagent for final polish:
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
7. Group by `idea_type` where useful — but treat all types on equal footing when suggesting what to pursue

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

## Evaluation Lenses

The `evaluator` subagent applies the **best-fit lens** based on `idea_type`. Product is one lens among several — selected the same way as every other. When no domain lens fits cleanly, it uses the **General** lens.

| Lens | For | Criteria | Total |
|------|-----|----------|-------|
| **General** | anything / unclear | Interest, Clarity, Feasibility, Impact, Uniqueness | /25 |
| **Product** | build or sell | Problem severity, Personal fit, Market size, Feasibility, Differentiation, Monetization, Market validation | /35 |
| **Creative** | writing, art, design | Resonance, Originality, Craft feasibility, Audience connection, Personal voice | /25 |
| **Research** | a question to investigate | Significance, Novelty, Tractability, Rigor potential, Curiosity pull | /25 |
| **Learning** | a skill/subject | Motivation, Prerequisite readiness, Resource availability, Applicability, Time realism | /25 |
| **Personal** | a goal or habit | Alignment, Clarity of outcome, Feasibility, Impact on life, Sustainability | /25 |

The full rubric for each lens lives in the `evaluator` agent. For the Product lens especially, run `researcher` first so the evaluator can base Market/Validation scores on real findings.

## Parallel Delegation

You can invoke multiple subagents simultaneously when tasks are independent:

```
Task 1: researcher (research idea A)
Task 2: evaluator (score idea B — lens chosen from its idea_type)
Task 3: connector (link idea C to the vault)
```

All three will run in parallel and return results.

## Tips for Productive Sessions

- Start by asking "What's been on your mind lately?" or "What's something you wish existed — or you wish you understood?"
- Don't filter too early — capture every idea, then research and evaluate after
- When an idea feels weak, ask "What if we inverted this?" or "Who would see this differently?"
- Look for adjacency: a small twist or combination can turn a vague thought into a real idea
- Ask "What kind of idea is this?" early — it sets the research angle and evaluation lens, but let the user define their own categories
- Use tags freely — more tags give the `connector` more signals to find relationships
- Use quick research first; deep research only for ideas that survive an initial pass
- Treat every idea type on equal footing — a story, a study plan, or a startup all deserve the same care
- End sessions by identifying the top 2-3 ideas to explore further
