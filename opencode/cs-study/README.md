# CS Study Skills for OpenCode

A skill and agent pack that turns OpenCode into an interactive CS study partner. Researches topics via Tavily + Wikipedia, creates structured Obsidian notes with code snippets and Mermaid diagrams, and connects related concepts via wikilinks.

## What's Included

### Skills

| Skill | Purpose |
|-------|---------|
| `cs-study` | Orchestrates topic research, note creation, and knowledge graph linking across all CS domains |
| `obsidian-cli` | CLI commands for reading, creating, searching, and managing Obsidian notes |
| `obsidian-markdown` | Obsidian Flavored Markdown syntax (wikilinks, embeds, callouts, Mermaid) |
| `tavily-search` | Web search via Tavily CLI for quick lookups |
| `tavily-research` | Deep AI-powered research with citations via Tavily CLI |

### Agents

| Agent | Purpose |
|-------|---------|
| `topic-researcher` | Searches Tavily + Wikipedia + official docs for CS explanations, code examples, and sources |
| `topic-formatter` | Formats research into structured notes with code blocks, Mermaid diagrams, wikilinks, and callouts |

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
ln -s /path/to/cs-study/skills /path/to/your-project/.opencode/skills
ln -s /path/to/cs-study/agents /path/to/your-project/.opencode/agents
```

### 5. Configure Agents (optional)

If your project doesn't already have an `opencode.json` with agent definitions, merge the agent configurations from `opencode.example.json` into your project's `opencode.json`. This registers the subagents with OpenCode so the cs-study skill can delegate to them.

### 6. Start OpenCode

```bash
cd /path/to/your-project
opencode
```

## Usage

### Learning a New Topic

```
User: I want to learn about hash tables
```

The cs-study skill will:

1. Search your `CS/` vault folder for existing notes
2. Determine the topic category (`data-structures`), difficulty (`intermediate`), and tags
3. Research via Tavily + Wikipedia for explanations, code examples, and diagrams
4. Create a structured note at `CS/hash-tables.md` with:
   - Mermaid flowchart showing how hashing works
   - Runnable Python code with actual output
   - Warning callouts about load factor and collisions
   - Wikilinks to `[[Arrays]]`, `[[Big O Notation]]`, `[[Collision Resolution]]`
5. Update prerequisites with backlinks

### Reviewing an Existing Topic

```
User: Show me my notes on TCP
```

The skill reads the note, presents it, and offers to deepen, practice, or connect related topics.

### Exploring Prerequisites

```
User: I want to study graph traversal but what should I know first?
```

The skill reads `prerequisites` frontmatter, checks which exist in your vault, and suggests a learning order.

### Tracking Progress

```
User: What's my study progress?
```

The skill lists all CS notes grouped by status and topic type, highlighting gaps and suggesting next topics.

## CS Topic Taxonomy

| Category | Covers |
|----------|--------|
| `data-structures` | Arrays, linked lists, trees, graphs, hash tables, heaps, tries |
| `algorithms` | Sorting, searching, graph traversal, DP, greedy, backtracking |
| `systems` | OS concepts, memory management, file systems, processes, threads |
| `languages` | Language features, paradigms, type systems, compilation |
| `databases` | SQL, NoSQL, indexing, transactions, normalization, CAP |
| `networking` | TCP/IP, HTTP, DNS, load balancing, protocols |
| `ai-ml` | Neural networks, NLP, reinforcement learning, transformers |
| `security` | Cryptography, auth, OWASP, threat modeling |
| `theory` | Big O, computability, automata, complexity |
| `devops` | CI/CD, containers, orchestration, IaC, monitoring |
| `web` | REST, GraphQL, SSR, CSR, caching, CORS, WebSockets |
| `mobile` | App lifecycle, state management, push notifications |
| `design-patterns` | Creational, structural, behavioral, SOLID |
| `concurrency` | Threads, locks, channels, async/await, CSP |
| `compilers` | Lexing, parsing, IR, optimization, code gen |
| `graphics` | Rendering, shaders, pipelines, 2D/3D |

## Note Structure

Every CS note follows this template:

```markdown
---
topic_type: <category>
status: learning
difficulty: <level>
tags:
  - cs
  - <topic-specific>
prerequisites:
  - "[[Topic]]"
date: YYYY-MM-DD
updated: YYYY-MM-DD
---

## Overview
## How It Works
## Code
## Key Details
## When to Use
## Related Topics
## External Links
```

## Status Progression

| Status | Meaning |
|--------|---------|
| `new` | Identified, no note yet |
| `learning` | Actively studying |
| `practicing` | Writing code, solving problems |
| `familiar` | Comfortable, can use confidently |
| `proficient` | Can teach it, deep understanding |

## Difficulty Levels

| Level | Focus |
|-------|-------|
| `beginner` | Intuition, analogies, simple code |
| `intermediate` | Tradeoffs, implementation details |
| `advanced` | Edge cases, performance, internals |
| `expert` | Papers, novel approaches, benchmarks |

## Diagram Support (Mermaid)

Obsidian renders Mermaid diagrams natively. The skill uses:

- **Flowcharts** for algorithm steps and decision trees
- **Sequence diagrams** for protocol interactions
- **Class diagrams** for design patterns and OOP
- **State diagrams** for state machines and lifecycles
- **ER diagrams** for database schemas
- **Gantt charts** for process timelines

No extra tools needed — diagrams are plain text in the markdown note.
