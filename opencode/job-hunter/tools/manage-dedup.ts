import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

interface SeenJob {
  company: string
  title: string
  url: string
  score: number
  first_seen: string
  notified: boolean
}

interface SeenJobs {
  jobs: Record<string, SeenJob>
}

export default tool({
  description:
    "Manage the seen_jobs.json deduplication store. Check if a job has been seen before, add new jobs, list seen jobs, and prune old entries.",
  args: {
    action: tool
      .schema
      .enum(["check", "add", "list", "prune"])
      .describe(
        "Action to perform: check if a job exists, add a new job, list all seen jobs, or prune old entries"
      ),
    job_id: tool
      .schema
      .string()
      .optional()
      .describe(
        "Unique job identifier (slug format: company-title-id) for check and add actions"
      ),
    job_data: tool
      .schema
      .object({
        company: tool.schema.string().describe("Company name"),
        title: tool.schema.string().describe("Job title"),
        url: tool.schema.string().describe("Job posting URL"),
        score: tool.schema.number().describe("Match score (0-100)"),
        notified: tool.schema.boolean().default(false).describe("Whether notification was sent"),
      })
      .optional()
      .describe("Job data for add action"),
    max_age_days: tool
      .schema
      .number()
      .default(30)
      .describe(
        "Maximum age in days for prune action (removes entries older than this)"
      ),
  },
  async execute(args, context) {
    const filePath = path.join(context.worktree, "seen_jobs.json")

    const readStore = (): SeenJobs => {
      try {
        const data = fs.readFileSync(filePath, "utf-8")
        const parsed = JSON.parse(data)
        if (!parsed || typeof parsed !== "object" || !parsed.jobs || typeof parsed.jobs !== "object") {
          return { jobs: {} }
        }
        return parsed as SeenJobs
      } catch {
        return { jobs: {} }
      }
    }

    const writeStore = (store: SeenJobs) => {
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2))
    }

    const generateId = (company: string, title: string, url: string): string => {
      const base = `${company}-${title}-${url.split("/").pop() || ""}`
      return base
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }

    switch (args.action) {
      case "check": {
        if (!args.job_id) {
          return JSON.stringify({ error: "job_id is required for check action" })
        }
        const store = readStore()
        const exists = args.job_id in store.jobs
        const job = exists ? store.jobs[args.job_id] : null
        return JSON.stringify({
          exists,
          job,
          job_id: args.job_id,
        }, null, 2)
      }

      case "add": {
        if (!args.job_data) {
          return JSON.stringify({ error: "job_data is required for add action" })
        }
        const store = readStore()
        const id = args.job_id || generateId(
          args.job_data.company,
          args.job_data.title,
          args.job_data.url
        )
        const now = new Date().toISOString().split("T")[0]
        store.jobs[id] = {
          ...args.job_data,
          first_seen: now,
          notified: args.job_data.notified,
        }
        writeStore(store)
        return JSON.stringify({
          success: true,
          job_id: id,
          total_jobs: Object.keys(store.jobs).length,
        }, null, 2)
      }

      case "list": {
        const store = readStore()
        const jobs = Object.entries(store.jobs).map(([id, job]) => ({
          id,
          ...job,
        }))
        return JSON.stringify({
          total: jobs.length,
          jobs,
        }, null, 2)
      }

      case "prune": {
        const store = readStore()
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - args.max_age_days)
        const cutoffStr = cutoff.toISOString().split("T")[0]

        let pruned = 0
        for (const [id, job] of Object.entries(store.jobs)) {
          if (job.first_seen < cutoffStr) {
            delete store.jobs[id]
            pruned++
          }
        }
        writeStore(store)
        return JSON.stringify({
          success: true,
          pruned,
          remaining: Object.keys(store.jobs).length,
          max_age_days: args.max_age_days,
        }, null, 2)
      }

      default:
        return JSON.stringify({ error: `Unknown action: ${args.action}` })
    }
  },
})