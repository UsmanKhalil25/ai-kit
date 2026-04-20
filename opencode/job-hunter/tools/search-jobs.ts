import { tool } from "@opencode-ai/plugin"
import { runTavily } from "./lib/run-tavily.ts"

export default tool({
  description:
    "Search for job listings at target companies using Tavily CLI. Returns structured JSON with job titles, URLs, companies, and relevance scores.",
  args: {
    query: tool.schema
      .string()
      .describe("Search query, e.g. 'Stripe backend engineer jobs'"),
    depth: tool.schema
      .enum(["ultra-fast", "fast", "basic", "advanced"])
      .default("advanced")
      .describe("Search depth: ultra-fast, fast, basic, or advanced"),
    max_results: tool.schema
      .number()
      .min(1)
      .max(20)
      .default(10)
      .describe("Maximum number of results to return (1-20)"),
    include_domains: tool.schema
      .string()
      .optional()
      .describe(
        "Comma-separated domains to include, e.g. 'linkedin.com,lever.co,greenhouse.io'",
      ),
    exclude_domains: tool.schema
      .string()
      .optional()
      .describe("Comma-separated domains to exclude"),
    time_range: tool.schema
      .enum(["day", "week", "month", "year"])
      .optional()
      .describe("Time range for results: day, week, month, or year"),
  },
  async execute(args, context) {
    const query = args.query.replace(/[\x00-\x1f\x7f]/g, "").slice(0, 500)

    const cmdArgs: string[] = [
      "search",
      query,
      "--depth",
      args.depth,
      "--max-results",
      String(args.max_results),
    ]

    if (args.include_domains && args.include_domains.length > 0) {
      cmdArgs.push("--include-domains", args.include_domains)
    }
    if (args.exclude_domains && args.exclude_domains.length > 0) {
      cmdArgs.push("--exclude-domains", args.exclude_domains)
    }
    if (args.time_range) {
      cmdArgs.push("--time-range", args.time_range)
    }

    cmdArgs.push("--json")

    const result = await runTavily(cmdArgs)

    if (!result.success) {
      return JSON.stringify(
        {
          error: result.error,
          query: args.query,
          ...(result.stderr ? { stderr: result.stderr } : {}),
          ...(result.timedOut ? { timedOut: true } : {}),
        },
        null,
        2,
      )
    }

    return JSON.stringify(
      {
        query: args.query,
        results: result.data,
      },
      null,
      2,
    )
  },
})
