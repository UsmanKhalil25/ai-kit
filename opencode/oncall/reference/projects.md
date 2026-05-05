# GCP Projects & Services

Reference table of `fh-platform-*` projects and the Cloud Run services deployed in each.
Sourced from `~/Code/infrastructure/platform/post-deploy/` Terraform.

> **Oncall target project: `fh-platform-production-us`.** `/oncall start` sets this automatically.

## Projects

| Project ID                       | Environment   | Region        | Notes                                  |
| :------------------------------- | :------------ | :------------ | :------------------------------------- |
| `fh-platform-main`               | shared        | europe-west1  | Artifact registry, docs CDN, CI SA     |
| `fh-platform-development-6197`   | dev           | europe-west1  | Default dev environment                |
| `fh-platform-uat`                | uat           | europe-west1  | UAT / pre-prod                         |
| `fh-platform-sandbox`            | sandbox EU    | europe-west1  | Customer-facing sandbox                |
| `fh-platform-sandbox-us`         | sandbox US    | us-east4      | US customer-facing sandbox             |
| `fh-platform-production-6197`    | prod EU       | europe-west1  | Production EU                          |
| `fh-platform-production-us`      | prod US       | us-east4      | Production US                          |

## Cloud Run services (per env)

- `app` — main platform API
- `admin-app` — admin dashboard
- `client-dashboard` — provider-facing dashboard (SvelteKit)
- `pharmacist-dashboard`
- `pharmacy-app`
- `partner-integrations` — partner webhook handler
- `product-information-management` (PIM)
- `surescripts` — Surescripts integration
- `process-automation` — workflow orchestration
- `clinical-automation` — refill auth LangGraph pipeline
- `compliance-340b-claims`
- `media-service`
- `redaction-service` (FastAPI, PHI/PII redaction)
- `mock-ehr` — testing only
- `refill-auth-app` — Epic refill auth UI
- `voice-ai`
- `import-job` / `import-service`
- `amazon-integration`

## Supporting infra (each env)

- Cloud SQL Postgres (primary + replica)
- Cloud Redis
- Cloud Storage buckets
- Pub/Sub topics + dead-letter topics
- Cloud Functions (`shipLogToAxiom`, `shipDeadLetterLogToAxiom`)
- API Gateway, Cloud Load Balancer (mTLS)
- Cloud Scheduler

## Alerting

- Slack channel: `#alerts` (token in Secret Manager)
- Pub/Sub topic: `axiom-notifications-topic`
- Log destination: `platform-log-sink-topic` → `shipLogToAxiom` → Axiom

## Compliance log metrics

Defined in `~/Code/infrastructure/platform/platform-main/modules/monitoring/main.tf`:
- `audit-config-changes`, `bucket-iam-changes`, `custom-role-changes`
- `firewall-changes`, `network-changes`, `owner-changes`, `route-changes`
