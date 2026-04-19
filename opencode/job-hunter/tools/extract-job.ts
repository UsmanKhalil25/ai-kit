import { tool } from "@opencode-ai/plugin"

export default tool({
  description:
    "Extract full content from a job posting URL using Tavily extract. Returns structured job data including title, company, location, skills, seniority, and description.",
  args: {
    url: tool
      .schema
      .string()
      .describe("URL of the job posting to extract content from"),
  },
  async execute(args, context) {
    const cmd = `tvly extract "${args.url}" --json`
    const result = await Bun.$`bash -c ${cmd}`.text()

    try {
      const raw = JSON.parse(result.trim())

      const extracted = {
        url: args.url,
        title: raw.title || null,
        content: raw.content || null,
        raw_content: raw.raw_content || null,
        extraction_confidence: raw.content ? "high" : "low",
      }

      return JSON.stringify(extracted, null, 2)
    } catch {
      return JSON.stringify({
        url: args.url,
        title: null,
        content: null,
        raw_content: null,
        extraction_confidence: "failed",
        error: result.trim(),
      }, null, 2)
    }
  },
})