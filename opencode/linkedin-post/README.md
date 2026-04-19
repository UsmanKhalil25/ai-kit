# LinkedIn Post Skill for OpenCode

A skill for OpenCode that drafts LinkedIn posts in Usman's voice — casual, punchy, and self-aware. Asks a few targeted questions first, then writes a post that avoids the typical LinkedIn cringe.

## What's Included

| File | Purpose |
|------|---------|
| `SKILL.md` | Skill definition with workflow, style rules, and output format |

## Setup

### 1. Copy the Skill into Your Project

Copy the skill into your project's `.opencode/skills/` folder:

```bash
cp SKILL.md /path/to/your-project/.opencode/skills/linkedin-post/SKILL.md
```

Or symlink it:

```bash
ln -s /path/to/linkedin-post/SKILL.md /path/to/your-project/.opencode/skills/linkedin-post/SKILL.md
```

### 2. Start OpenCode

```bash
cd /path/to/your-project
opencode
```

## Usage

Ask the AI to write a LinkedIn post about anything — a build, an opinion, something you noticed. The skill will:

1. Ask 5 targeted questions (topic, angle, reference, caveat, link)
2. Write the post in Usman's style
3. Output the post body and a separate comment block (for links)

## Style

- all lowercase except proper nouns
- short lines, one idea per line, whitespace between paragraphs
- no bullet points, no bold, no headers, no hashtags
- honest about tradeoffs, casual and self-aware
- external links go in the comment, never in the post body
