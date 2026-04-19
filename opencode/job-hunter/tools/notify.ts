import { tool } from "@opencode-ai/plugin"

export default tool({
  description:
    "Send a Discord notification via webhook. Requires DISCORD_WEBHOOK_URL environment variable.",
  args: {
    message: tool
      .schema
      .string()
      .describe(
        "Discord message to send (supports Markdown formatting)"
      ),
    webhook_url: tool
      .schema
      .string()
      .optional()
      .describe(
        "Discord webhook URL (overrides DISCORD_WEBHOOK_URL env var)"
      ),
  },
  async execute(args, context) {
    const webhookUrl = args.webhook_url || process.env.DISCORD_WEBHOOK_URL

    if (!webhookUrl) {
      return JSON.stringify({
        success: false,
        error: "DISCORD_WEBHOOK_URL environment variable not set. Create a webhook in your Discord server: Server Settings > Integrations > Webhooks > New Webhook > Copy Webhook URL",
      }, null, 2)
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: args.message }),
      })

      if (response.ok) {
        return JSON.stringify({
          success: true,
          status: response.status,
          message: "Discord notification sent successfully",
        }, null, 2)
      } else {
        const body = await response.text()
        return JSON.stringify({
          success: false,
          status: response.status,
          error: `Discord API error: ${body}`,
        }, null, 2)
      }
    } catch (err: any) {
      return JSON.stringify({
        success: false,
        error: `Failed to call Discord webhook: ${err.message}`,
      }, null, 2)
    }
  },
})