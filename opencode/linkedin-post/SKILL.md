---
name: linkedin-post
description: Draft a LinkedIn post in Usman's style. Asks a few questions first, then writes the post. Use when asked to write or draft a LinkedIn post.
compatibility: opencode
---

# LinkedIn Post Skill

Drafts LinkedIn posts in Usman's voice. Asks a few targeted questions first, then writes a post that fits his casual, punchy style — not the typical LinkedIn cringe.

## When to Use

- The user wants to write or draft a LinkedIn post
- The user has something to share — a build, an opinion, a thought, something they noticed
- The user asks to post about something on LinkedIn

## Workflow

### Step 1 — Ask Questions First

Before writing anything, ask:

1. **What is the post about?** (a build, a thought, an opinion, something he did or noticed)
2. **What's the angle?** (what makes this interesting — what's the contrast or the counter-take)
3. **Any reference to anchor it?** (a person, a trend, a tool, a moment his audience would recognise)
4. **Any honest caveat or personal detail?** (something real — these make the post human and likeable)
5. **Is there a link to share?** (repo, article, tool — goes in the comment, not the post)

Do not write anything until you have answers. If some answers are unclear, make reasonable assumptions and flag them.

### Step 2 — Write the Post

Use this loose structure — adapt it to whatever fits the topic:

```
[optional opener — self-aware, grounding, or sets the scene]

[hook — what's happening, what everyone else is doing, or what sparked this]

[the point — what he did, thinks, or noticed]
[honest caveat or personal detail if there is one]

[the substance — what it is or does, written as a sentence not a list]

link in the comments if you want to try it.
```

The last line is only needed if there's a link. If there's no link, end on whatever line lands best.

### Step 3 — Output

Always output two separate blocks when there's a link:

**Post:**
```
<the post>
```

**Comment (post this immediately after):**
```
repo → <url>
```

## Style Rules

- all lowercase except proper nouns (names, tools, companies, products)
- short lines — one idea per line, white space between paragraphs
- no bullet points — ever. write details as a natural flowing sentence
- no bold, no headers, no hashtags
- max one emoji and only if it fits naturally
- no motivational wrap-ups, no "the takeaway is", no "I'm excited to announce"
- doesn't over-explain — lets the reader connect the dots
- honest about tradeoffs and limitations — it makes the post more likeable
- casual and a little self-aware — he knows LinkedIn can be cringe, he posts anyway

## LinkedIn Rule

Never put external links in the post body — LinkedIn penalizes reach on posts with external links. Always end with "link in the comments if you want to try it." and output the link as a separate comment block.
