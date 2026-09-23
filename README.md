# AI Kit

Reusable OpenCode configurations and workflows.

## Packages

| Package | Description |
|---------|-------------|
| [`brainstormer-obsidian`](opencode/brainstormer-obsidian/README.md) | AI-powered idea capture, research, evaluation, and Obsidian vault management |
| [`idea-hunter`](opencode/idea-hunter/README.md) | Hunts fresh ideas from discovery platforms (Show HN, Indie Hackers, …) via a headless browser and captures them as seed notes |
| [`cs-study`](opencode/cs-study/README.md) | Interactive CS learning companion — structured notes, code examples, Mermaid diagrams |
| [`job-hunter`](opencode/job-hunter/README.md) | Automated job search with AI matching and Discord alerts via Tavily |
| [`linkedin-post`](opencode/linkedin-post/README.md) | Draft LinkedIn posts in a specific personal voice |
| [`oncall`](opencode/oncall/README.md) | Daily oncall rotation helper — GCP log triage, EOD reports, JIRA tickets, handoffs |

### Capability packages

Reusable building blocks that workflow packages compose in (not standalone workflows):

| Package | Description |
|---------|-------------|
| [`browser`](opencode/browser/README.md) | Headless browser operator — a `browser` subagent + `playwright-browser` skill that drive a Playwright MCP for live web navigation and extraction |

## Usage

Copy a package's skills and agents into your project's `.opencode/` directory:

```bash
cp -r opencode/<package>/skills .opencode/skills
cp -r opencode/<package>/agents .opencode/agents
```

Then copy and configure the package's `AGENTS.md` and `opencode.example.json`. See individual package READMEs for full setup instructions.

