import { tool } from "@opencode-ai/plugin"
import { runTavily } from "./lib/run-tavily.ts"

export default tool({
  description:
    "Extract full content from a job posting URL using Tavily extract. Returns structured job data including title, company, location, skills, seniority, and description.",
  args: {
    url: tool.schema
      .string()
      .describe("URL of the job posting to extract content from"),
  },
  async execute(args, context) {
    let validUrl: URL
    try {
      validUrl = new URL(args.url)
    } catch {
      return JSON.stringify(
        {
          url: args.url,
          title: null,
          content: null,
          raw_content: null,
          extraction_confidence: "failed",
          error: "Invalid URL provided",
        },
        null,
        2,
      )
    }

    const result = await runTavily(["extract", validUrl.href, "--json"])

    if (!result.success) {
      return JSON.stringify(
        {
          url: args.url,
          title: null,
          content: null,
          raw_content: null,
          extraction_confidence: "failed",
          error: result.error,
        },
        null,
        2,
      )
    }

    const raw = result.data as any

    return JSON.stringify(
      {
        url: args.url,
        title: raw?.title || null,
        content: raw?.content || null,
        raw_content: raw?.raw_content || null,
        extraction_confidence: raw?.content ? "high" : "low",
      },
      null,
      2,
    )
  },
})
