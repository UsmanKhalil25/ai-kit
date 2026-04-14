# AI Kit

A collection of OpenCode workflows, tools, and configurations for AI-powered development.

## Packages

### brainstormer/
AI-powered idea validation workflow for capturing, researching, and evaluating product ideas.

**Includes:**
- 3 specialized subagents (researcher, evaluator, formatter)
- Tavily search/research integration
- Obsidian note formatting
- Structured idea evaluation framework

### obsidian-tools/
Utilities for working with Obsidian vaults.

**Includes:**
- obsidian-cli skill for vault operations
- obsidian-markdown skill for formatting
- obsidian-bases skill for database views

### find-skills/
Tool for discovering and installing skills from the skills.sh ecosystem.

## Installation

Copy the desired package to your project's `.opencode/` directory:

```bash
# For brainstormer workflow
cp -r opencode/brainstormer/* /path/to/your/project/.opencode/

# For obsidian tools
cp -r opencode/obsidian-tools/* /path/to/your/project/.opencode/
```

## Prerequisites

- **Tavily API key** (for brainstormer): Get from https://tavily.com
- Export before starting OpenCode:
  ```bash
  export TAVILY_API_KEY=tvly-your-api-key-here
  ```

## Structure

```
ai-kit/
└── opencode/
    ├── brainstormer/        # Idea validation workflow
    ├── obsidian-tools/      # Obsidian integration
    └── find-skills/         # Skill discovery
```

## License

MIT
