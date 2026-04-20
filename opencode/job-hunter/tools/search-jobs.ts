import { tool } from "@opencode-ai/plugin"

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
    const cmdArgs: string[] = ["search", args.query, "--depth", args.depth, "--max-results", String(args.max_results)]

    if (args.include_domains) {
      cmdArgs.push("--include-domains", args.include_domains)
    }
    if (args.exclude_domains) {
      cmdArgs.push("--exclude-domains", args.exclude_domains)
    }
    if (args.time_range) {
      cmdArgs.push("--time-range", args.time_range)
    }

    cmdArgs.push("--json")

    try {
      const proc = Bun.spawn(["tvly", ...cmdArgs], {
        stdout: "pipe",
        stderr: "pipe",
      })
      const stdout = await new Response(proc.stdout).text()
      const stderr = await new Response(proc.stderr).text()
      await proc.exited

      if (proc.exitCode !== 0) {
        return JSON.stringify({
          error: `tvly exited with code ${proc.exitCode}`,
          stderr: stderr.trim(),
          stdout: stdout.trim().slice(0, 2000),
        }, null, 2)
      }

      try {
        return JSON.parse(stdout.trim())
      } catch {
        return stdout.trim()
      }
    } catch (err: any) {
      return JSON.stringify({
        error: `Failed to run tvly: ${err.message}`,
      }, null, 2)
    }
  },
})