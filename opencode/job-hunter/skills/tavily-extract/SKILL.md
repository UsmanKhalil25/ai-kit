---
name: tavily-extract
description: |
  Extract full content from job posting URLs via the Tavily CLI. Use this skill when you have job listing URLs from search results and need the complete job description, requirements, and application details. Returns clean, structured content from any job board URL. Part of the workflow: search → extract → score → notify.
allowed-tools: Bash(tvly *)
---

# Tavily Extract

Extract clean, structured content from job posting URLs using the Tavily CLI. Turns job board pages into machine-readable content for scoring and matching.

## Prerequisites

- `TAVILY_API_KEY` environment variable must be exported before starting OpenCode
- `tvly` CLI must be installed — run `curl -fsSL https://cli.tavily.com/install.sh | bash` if not found

## When to Use

- You have job listing URLs from search results and need full posting details
- You need to extract job requirements, skills, and seniority level from a posting
- You're in the extract step of the job-hunter workflow: search → **extract** → score → notify
- You need the complete job description beyond what the search snippet provided

## Quick Start

```bash
# Extract a single job posting
tvly extract <url> --json

# Extract with specific fields
tvly extract <url> --json
```

## Job Posting Extraction Patterns

### LinkedIn Job Posting

```bash
tvly extract "https://www.linkedin.com/jobs/view/1234567890" --json
```

### Lever Job Board

```bash
tvly extract "https://jobs.lever.co/company/123-abc" --json
```

### Greenhouse Job Board

```bash
tvly extract "https://boards.greenhouse.io/company/jobs/12345" --json
```

### Indeed Listing

```bash
tvly extract "https://www.indeed.com/viewjob?jk=abc123" --json
```

## Extracting Multiple URLs

For a batch of URLs from search results, extract them sequentially:

```bash
# Extract each URL one at a time — no batch mode available
tvly extract "$URL_1" --json
tvly extract "$URL_2" --json
tvly extract "$URL_3" --json
```

## Parsing Extracted Content

After extraction, parse the content into structured job data:

1. **Job title**: Usually in the first `<h1>` or page title
2. **Company name**: Look for company branding elements
3. **Location / Remote**: Scan for location strings and "Remote", "Hybrid", "On-site"
4. **Required skills**: Look for skills sections, requirements lists
5. **Seniority**: Check for level indicators (Junior, Mid, Senior, Staff, Principal)
6. **Description**: The main body text about the role
7. **Apply URL**: The direct application link

## Handling Extraction Failures

- **Paywalled content**: Some LinkedIn postings may require login — fall back to search snippet
- **Removed listings**: Job may no longer exist — log and skip
- **Rate limiting**: Wait 1-2 seconds between extractions if receiving errors
- **Anti-bot pages**: Some boards block extraction — use search snippet data instead

## Tips

- Always use `--json` flag for structured, parseable output
- Extract the most promising URLs first (highest search relevance)
- If extraction fails, use whatever data was available in the search results as a fallback
- Don't extract more than 10-15 URLs per session to avoid rate limits
- Save extraction results to progress.md for the matcher agent to reference