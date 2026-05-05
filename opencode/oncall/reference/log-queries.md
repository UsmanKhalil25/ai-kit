# Canned `gcloud logging read` Filters

All commands assume the active project is set (`gcloud config set project <project>`).
Use `--limit=N --format=json --freshness=<dur>` or explicit `timestamp` filters.

## Errors from any Cloud Run service in window

```bash
gcloud logging read \
  'resource.type="cloud_run_revision"
   AND severity>=ERROR
   AND timestamp>="<START_RFC3339>"
   AND timestamp<="<END_RFC3339>"' \
  --format=json --limit=500
```

## Warnings + errors, all platform resources

```bash
gcloud logging read \
  '(resource.type="cloud_run_revision"
    OR resource.type="cloud_run_job"
    OR resource.type="cloud_function"
    OR resource.type="apigateway.googleapis.com/Gateway"
    OR resource.type="http_load_balancer")
   AND severity>=WARNING
   AND timestamp>="<START_RFC3339>"
   AND timestamp<="<END_RFC3339>"' \
  --format=json --limit=1000
```

## Errors for a single service

```bash
gcloud logging read \
  'resource.type="cloud_run_revision"
   AND resource.labels.service_name="<SERVICE>"
   AND severity>=ERROR
   AND timestamp>="<START_RFC3339>"' \
  --format=json --limit=200
```

## Dead-letter Pub/Sub messages

```bash
gcloud logging read \
  'resource.type="pubsub_subscription"
   AND textPayload:"dead-letter"
   AND timestamp>="<START_RFC3339>"' \
  --format=json --limit=200
```

## Audit log changes (compliance metrics)

```bash
gcloud logging read \
  'logName:"cloudaudit.googleapis.com"
   AND (protoPayload.methodName:"SetIamPolicy"
        OR protoPayload.methodName:"compute.firewalls"
        OR protoPayload.methodName:"compute.networks")
   AND timestamp>="<START_RFC3339>"' \
  --format=json --limit=200
```

## High instance count (Cloud Run scaling signal)

Threshold from infra alerts: 8 instances for `app` service.

```bash
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/container/instance_count"
            AND resource.labels.service_name="app"' \
  --interval-start-time="<START_RFC3339>" \
  --interval-end-time="<END_RFC3339>"
```

## OOM / panic signatures (textPayload search)

```bash
gcloud logging read \
  'resource.type="cloud_run_revision"
   AND (textPayload:"OOMKilled"
        OR textPayload:"out of memory"
        OR textPayload:"panic:"
        OR textPayload:"FATAL")
   AND timestamp>="<START_RFC3339>"' \
  --format=json --limit=200
```

## Tips

- Use `--format='value(timestamp,resource.labels.service_name,severity,textPayload)'` for compact tabular output instead of JSON.
- For repeated runs, `--freshness=2h` is shorter than computing timestamps but only goes backward from now.
- `gcloud logging read` paginates; always cap with `--limit` to avoid context blowup. Aggregate counts via subsequent `jq` rather than fetching everything.
