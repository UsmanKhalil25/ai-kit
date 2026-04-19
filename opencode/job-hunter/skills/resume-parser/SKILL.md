---
name: resume-parser
description: |
  Parses a Markdown resume file (resume.md) into a structured profile optimized for job matching. Extracts skills, seniority level, location preferences, role types, and companies to avoid. Use when the job-hunter skill needs a structured profile from the user's resume.
allowed-tools: Read(*)
---

# Resume Parser

Reads `resume.md` and extracts a structured profile the job matcher uses for scoring.

## When to Use

- At the start of a job hunter session, before any searching
- When the user updates their resume and wants to re-parse
- When the user says "parse my resume" or "update my profile"

## Workflow

### Step 1 — Read the Resume

Read `resume.md` from the project root. If it doesn't exist, tell the user to create one using the template:

```
Copy templates/resume.example.md to resume.md and fill in your details.
```

### Step 2 — Extract Structured Profile

Parse the resume into this exact structure:

```json
{
  "name": "Extracted from first heading",
  "contact": {
    "location": "City, State",
    "work_preference": "remote | hybrid | on-site",
    "relocate": true | false
  },
  "skills": {
    "languages": ["Python", "TypeScript", "Go"],
    "frameworks": ["FastAPI", "Next.js", "React"],
    "cloud": ["AWS", "Docker", "Kubernetes"],
    "databases": ["PostgreSQL", "Redis", "MongoDB"],
    "tools": ["Git", "CI/CD", "Terraform"],
    "all": ["flattened list of all skills"]
  },
  "experience": [
    {
      "title": "Senior Engineer",
      "company": "Company A",
      "period": "2022–Present",
      "highlights": ["Led API redesign", "Built developer tooling"],
      "seniority": "senior"
    }
  ],
  "seniority": {
    "current": "senior",
    "target": ["senior", "staff"],
    "years_total": 7
  },
  "preferences": {
    "role_types": ["Backend", "Platform", "Developer Experience"],
    "seniority": ["Senior", "Staff"],
    "location": "Remote preferred, hybrid in SF/NYC acceptable",
    "companies_avoid": [],
    "min_salary": "$150k",
    "industries": ["Fintech", "DevTools", "SaaS"]
  },
  "education": [
    {
      "degree": "B.S. Computer Science",
      "school": "University of X"
    }
  ]
}
```

### Step 3 — Seniority Detection

Infer seniority from experience entries:

| Indicator | Inferred Level |
|-----------|---------------|
| "Intern", "Junior", "Associate" | junior |
| "Mid-level", "Engineer" (standalone) | mid |
| "Senior", "Lead" | senior |
| "Staff", "Principal", "Distinguished" | staff |
| "VP", "Director", "Head of" | executive |

If the resume has a `Preferences` section with seniority listed, use that instead.

### Step 4 — Skill Normalization

Normalize skill names for matching:

| Variants | Normalized |
|----------|-----------|
| JS, JavaScript, ECMAScript | JavaScript |
| TS, TypeScript | TypeScript |
| Py, Python3 | Python |
| K8s, Kuberneets | Kubernetes |
| Postgres, PostgreSQL | PostgreSQL |
| AWS, Amazon Web Services | AWS |
| GCP, Google Cloud | GCP |
| Azure, Microsoft Azure | Azure |
| React.js, ReactJS | React |
| Node, Node.js, NodeJS | Node.js |
| CI/CD, CICD | CI/CD |
| TF, Terraform | Terraform |

### Step 5 — Output

Return the structured profile as JSON, then write a summary to `progress.md`:

```markdown
## Resume Profile
- **Name**: Usman
- **Seniority**: Senior (target: Senior, Staff)
- **Location preference**: Remote preferred
- **Top skills**: Python, TypeScript, AWS, Docker, PostgreSQL
- **Role types**: Backend, Platform, Developer Experience
- **Industries**: Fintech, DevTools, SaaS
```

## Rules

- If a section is missing from the resume, set it to `null` or `[]` — never guess
- Normalize all skill names using the table above
- Infer seniority from the most recent role title if not explicitly stated
- If `Preferences` section exists, always prefer explicit statements over inferred values
- Keep the original text for highlights — don't summarize further