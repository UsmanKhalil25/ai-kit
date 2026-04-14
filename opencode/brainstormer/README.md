# Brainstormer

AI-powered idea validation workflow for capturing, researching, and evaluating product ideas.

## Quick Start

1. Copy this package to your project:
   ```bash
   cp -r brainstormer/* /path/to/your/project/.opencode/
   ```

2. Merge the `opencode.json` with your project's configuration

3. Export your Tavily API key:
   ```bash
   export TAVILY_API_KEY=tvly-your-api-key-here
   ```

4. Start OpenCode and use the brainstormer skill

## What's Included

- **agents/**: 3 subagents for research, evaluation, and formatting
- **skills/**: Tavily integration and brainstormer workflow
- **opencode.json**: Agent definitions
- **AGENTS.md**: Detailed usage instructions

## Dependencies

- Tavily CLI: `curl -fsSL https://cli.tavily.com/install.sh | bash`
- (Optional) Obsidian for note editing
- (Optional) obsidian-cli for vault automation

## Usage

See `AGENTS.md` for detailed workflow documentation.
