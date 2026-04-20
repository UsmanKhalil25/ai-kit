import { tool } from "@opencode-ai/plugin"

const MAX_DISCORD_LENGTH = 2000

export default tool({
  description:
    "Send a Discord notification via webhook. Requires DISCORD_WEBHOOK_URL environment variable.",
  args: {
    message: tool.schema
      .string()
      .describe("Discord message to send (supports Markdown formatting)"),
    webhook_url: tool.schema
      .string()
      .optional()
      .describe("Discord webhook URL (overrides DISCORD_WEBHOOK_URL env var)"),
  },
  async execute(args, context) {
    const webhookUrl = args.webhook_url || process.env.DISCORD_WEBHOOK_URL

    if (!webhookUrl) {
      return JSON.stringify(
        {
          success: false,
          error:
            "DISCORD_WEBHOOK_URL environment variable not set. Create a webhook in your Discord server: Server Settings > Integrations > Webhooks > New Webhook > Copy Webhook URL",
        },
        null,
        2,
      )
    }

    let content = args.message
    if (content.length > MAX_DISCORD_LENGTH) {
      content =
        content.slice(0, MAX_DISCORD_LENGTH - 20) + "\n... (truncated)"
    }

    const sendRequest = () =>
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        signal: AbortSignal.timeout(10_000),
      })

    try {
      let response = await sendRequest()

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("retry-after") || "2")
        await new Promise((r) => setTimeout(r, retryAfter * 1000))
        response = await sendRequest()
      }

      if (response.ok) {
        return JSON.stringify(
          {
            success: true,
            status: response.status,
            message: "Discord notification sent successfully",
          },
          null,
          2,
        )
      }

      const body = await response.text()
      return JSON.stringify(
        {
          success: false,
          status: response.status,
          error: `Discord API error: ${body}`,
        },
        null,
        2,
      )
    } catch (err: any) {
      const isTimeout =
        err.name === "AbortError" || err.name === "TimeoutError"
      return JSON.stringify(
        {
          success: false,
          error: isTimeout
            ? "Discord webhook request timed out after 10s"
            : `Failed to call Discord webhook: ${err.message}`,
        },
        null,
        2,
      )
    }
  },
})
