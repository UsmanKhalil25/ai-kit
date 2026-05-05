# Actionable vs Non-actionable Rubric

Used by the `log-analyzer` subagent to classify warnings and errors before surfacing them.
Treat this as a living document — reclassifications discovered during the rotation should be added here at EOD.

## ✅ Always actionable

- **5xx error spikes** on any Cloud Run service (>10 in a 5-minute window, or any sustained baseline change).
- **OOMKilled / container restarts** on any service.
- **`panic:` / `FATAL` / unhandled exception** in `textPayload`.
- **Dead-letter Pub/Sub messages** — every one needs eyes; if a topic is filling its DLQ, escalate.
- **Cloud SQL connection exhaustion** or `too many connections`.
- **Compliance log metric fires**: `audit-config-changes`, `bucket-iam-changes`, `custom-role-changes`, `firewall-changes`, `network-changes`, `owner-changes`, `route-changes`. Any unexpected change here is a security event.
- **Cloud Run "Cannot serve traffic"** alert.
- **Pub/Sub UnACKed messages** age > threshold (configured per subscription, see infra).
- **High instance count** on `app` ≥ 8 (capacity / cost signal).
- **Surescripts / Epic / partner integration 4xx repeated for the same partner** — usually contract drift, file a ticket.

## 🔇 Always suppress (known noise)

- **Redis warnings** (connection blips, eviction notices) — confirmed non-actionable, see PR #4257.
- **Grant-revocation info messages** — confirmed non-actionable, see PR #4257.
- **Liveness/readiness probe 4xx during cold start** — Cloud Run normal behavior.
- **One-off 401/403** from a single IP — usually scanner traffic on public endpoints.
- **`shipLogToAxiom` / `shipDeadLetterLogToAxiom` self-traffic logs** — already excluded by the platform sink filter, but if any leak through, suppress.
- **`easypostwebhooklistener`: `Invalid pubsub message, unable to record first delivery latency`** — fires on inbound webhook Pub/Sub messages missing `deliveryAttempt` metadata (typically cold-start). Downstream processing succeeds; no customer impact. Confirmed non-actionable 2026-04-15.
- **`[Intermountain Import] Some prescriptions/patients could not be parsed from CSV`** (cloud_run_job) — known CSV row-parse warning from the Intermountain importer; expected at low baseline rate. Only flag if rate climbs meaningfully above baseline.
- **Single-IP scanner / exploit attempts returning all-404s** (directory enumeration, path traversal, PHP RCE probes, `.git/config` probes, etc.) — Cloud Armor WAF already covers these patterns; residual 404 log entries are expected noise. Only flag if any request from these patterns gets a non-404 response (2xx/3xx/5xx). Reclassified 2026-04-18.

## 🤔 Investigate — could be either

- **404s spike on a single endpoint** — could be a removed route or a partner cache. Check service deploys before flagging.
- **Latency P95 doubling** but not P99 — often deploy-related; check recent revisions.
- **Single Cloud Function timeout** — usually retry handles it; flag if pattern emerges.
- **Cloud Scheduler job failures** — depends on the job; look up the job's purpose first.

## Output format the subagent should produce

```markdown
### 🚨 Actionable
| First seen (UTC) | Service | Severity | Count | Sample | Reason |
| ... | ... | ... | ... | ... | ... |

### 🔇 Suppressed
| Service | Pattern | Count | Suppression reason (rubric) |
| ... | ... | ... | ... |
```

Keep `Sample` to one short line. Never include full stack traces in the summary — link to a `gcloud logging read` command the user can run if they want details.
