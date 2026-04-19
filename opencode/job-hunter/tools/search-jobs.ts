import { tool } from "@opencode-ai/plugin"
import path from "path"

export default tool({
  description:
    "Search for job listings at target companies using Tavily CLI. Returns structured JSON with job titles, URLs, companies, and relevance scores.",
  args: {
    query: tool
      .schema
      .string()
      .describe(
        "Search query, e.g. 'Stripe backend engineer jobs'"
      ),
    depth: tool
      .schema
      .enum(["ultra-fast", "fast", "basic", "advanced"])
      .default("advanced")
      .describe(
        "Search depth: ultra-fast, fast, basic, or advanced"
      ),
    max_results: tool
      .schema
      .number()
      .min(1)
      .max(20)
      .default(10)
      .describe(
        "Maximum number of results to return (1-20)"
      ),
    include_domains: tool
      .schema
      .string()
      .optional()
      .describe(
        "Comma-separated domains to include, e.g. 'linkedin.com,lever.co,greenhouse.io'"
      ),
    exclude_domains: tool
      .schema
      .string()
      .optional()
      .describe(
        "Comma-separated domains to exclude"
      ),
    time_range: tool
      .schema
      .enum(["day", "week", "month", "year"])
      .optional()
      .describe(
        "Time range for results: day, week, month, or year"
      ),
  },
  async execute(args, context) {
    const cmdParts: string[] = ["tvly", "search", `"${args.query}"`]
    cmdParts.push("--depth", args.depth)
    cmdParts.push("--max-results", String(args.max_results))

    if (args.include_domains) {
      cmdParts.push("--include-domains", args.include_domains)
    }
    if (args.exclude_domains) {
      cmdParts.push("--exclude-domains", args.exclude_domains)
    }
    if (args.time_range) {
      cmdParts.push("--time-range", args.time_range)
    }

    cmdParts.push("--json")

    const cmd = cmdParts.join(" ")
    const result = await Bun.$`bash -c ${cmd}`.text()

    try {
      return JSON.parse(result.trim())
    } catch {
      return result.trim()
    }
  },
})