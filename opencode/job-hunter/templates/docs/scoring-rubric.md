# Job Matching Scoring Rubric

Detailed scoring criteria for the job-hunter matching system. Each job is scored on 4 criteria, totaling 100 points. Only jobs scoring at or above the `min_match_score` threshold (default: 70) are considered for notification.

## Overview

| Criterion | Points | Weight |
|-----------|--------|--------|
| Skills match | 40 | 40% |
| Seniority fit | 30 | 30% |
| Location/remote | 20 | 20% |
| Title match | 10 | 10% |
| **Total** | **100** | **100%** |

## Skills Match (0–40 points)

Measures the overlap between the job's required skills and your resume profile.

### Scoring

| Overlap | Points | Description |
|---------|--------|-------------|
| 80%+ | 35-40 | Nearly all required skills match your profile |
| 60-79% | 25-34 | Most key skills present, minor gaps |
| 40-59% | 15-24 | Some overlap but significant gaps |
| 20-39% | 5-14 | Few skills align |
| <20% | 0-4 | Almost no overlap |

### Methodology

1. Extract all required/preferred skills from the job posting
2. Normalize skill names (JS → JavaScript, K8s → Kubernetes, etc.)
3. Separate required vs. preferred skills
4. Required skills are weighted 2x vs. preferred skills
5. Match against the full skill list from resume profile

### Example Scoring

Job requires: Python (required), AWS (required), Docker (required), Kubernetes (preferred), Go (preferred)

Resume has: Python, AWS, Docker, PostgreSQL, Redis, TypeScript

- Required match: Python✅ AWS✅ Docker✅ = 3/3
- Preferred match: Kubernetes❌ Go❌ = 0/2
- Weighted: (3/3 × 25) + (0/2 × 15) = 25 + 0 = 25 → **Points: 30**

### Callout Format

```
Skills (30/40): Python✅ AWS✅ Docker✅ Kubernetes❌ Go❌
```

## Seniority Fit (0–30 points)

Measures alignment between the job's seniority level and your target level.

### Scoring

| Match | Points | Description |
|-------|--------|-------------|
| Exact match | 25-30 | Job level matches your target exactly |
| Close match | 15-24 | One level off (Senior ↔ Staff, Mid ↔ Senior) |
| Moderate gap | 5-14 | Two levels off (Junior ↔ Senior) |
| Major mismatch | 0-4 | Significant level gap |

### Level Definitions

| Level | Typical Titles | Years |
|-------|---------------|-------|
| Junior | Junior, Associate, Engineer I | 0-2 |
| Mid | Engineer II, Mid-level | 3-5 |
| Senior | Senior, Lead, Engineer III | 5-8 |
| Staff | Staff, Principal | 8-12 |
| Executive | Director, VP, Head of | 10+ |

### Bonus/Penalty

- **+5 bonus**: Job is at your exact target level with growth potential
- **-5 penalty**: Job is clearly below your level (overqualified)
- **-10 penalty**: Job is significantly above your level (underqualified)

### Example Scoring

Target: Senior
Job level: Senior

Exact match → **Points: 28** (30 base - 2 for no explicit growth path mentioned)

### Callout Format

```
Seniority (28/30): senior✅ — exact match with target
```

## Location/Remote Fit (0–20 points)

Measures whether the job's location and work arrangement matches your preferences.

### Scoring

| Match | Points | Description |
|-------|--------|-------------|
| Perfect | 18-20 | Exact match (Remote job ↔ Remote preference) |
| Acceptable | 10-17 | Workable (Hybrid in preferred city) |
| Compromise | 5-9 | Suboptimal but possible (On-site in preferred city) |
| Non-starter | 0-4 | Unacceptable (On-site far from preference) |

### Scoring Matrix

| Job Location \ Preference | Remote | Hybrid in preferred city | On-site in preferred city | Other |
|--------------------------|--------|------------------------|--------------------------|-------|
| Remote | 20 | 18 | 16 | 14 |
| Hybrid in preferred city | 14 | 18 | 16 | 8 |
| Hybrid in other city | 8 | 10 | 8 | 5 |
| On-site in preferred city | 10 | 14 | 18 | 8 |
| On-site in other city | 2 | 4 | 6 | 2 |

### Adjustments

- **+2 bonus**: Job is in your preferred industry hub city
- **-3 penalty**: Job requires relocation without support
- **-5 penalty**: Job has frequent travel requirements you don't want

### Example Scoring

Preference: Remote
Job location: Remote (US)

Perfect match → **Points: 20**

### Callout Format

```
Location (20/20): remote✅ — matches preference exactly
```

## Title Match (0–10 points)

Measures whether the job title aligns with your target role types.

### Scoring

| Match | Points | Description |
|-------|--------|-------------|
| Exact match | 9-10 | Title matches your target role type precisely |
| Related match | 5-8 | Related but not exact (Backend ↔ Platform) |
| Loosely related | 2-4 | Tangentially related (Backend ↔ SRE) |
| Unrelated | 0-1 | No meaningful connection |

### Role Type Clusters

| Cluster | Titles |
|---------|--------|
| Backend | Backend Engineer, Server Engineer, API Engineer |
| Frontend | Frontend Engineer, UI Engineer, Web Developer |
| Full Stack | Full Stack Engineer, Software Engineer |
| Platform | Platform Engineer, Infrastructure Engineer, DevOps |
| DevEx | Developer Experience, Developer Tooling, DX Engineer |
| Data | Data Engineer, ML Engineer, Analytics Engineer |
| SRE | SRE, Reliability Engineer, Production Engineer |

### Cross-cluster Scoring

- Same cluster: 9-10 points
- Adjacent clusters (Backend ↔ Platform, Backend ↔ DevEx): 6-8 points
- Distant clusters (Backend ↔ Frontend): 3-5 points
- Unrelated: 0-2 points

### Example Scoring

Target roles: Backend, Platform, DevEx
Job title: Backend Engineer

Exact match within target → **Points: 10**

### Callout Format

```
Title (10/10): backend engineer✅ — exact match with target role type
```

## Threshold Behavior

| Score Range | Status | Action |
|-------------|--------|--------|
| 85-100 | Strong match | Always notify |
| 70-84 | Good match | Notify after reflection confirms |
| 55-69 | Weak match | Log but don't notify |
| 0-54 | No match | Skip |

## Minimum Score

The `min_match_score` in `config.yaml` (default: 70) determines the notification threshold. Jobs below this score are logged but never trigger notifications.

Adjust based on your preferences:
- **60**: More notifications, potentially more noise
- **70** (default): Balanced
- **80**: Fewer notifications, only strong matches
- **90**: Very selective, almost never notifies