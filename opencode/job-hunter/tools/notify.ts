import { tool } from "@opencode-ai/plugin"

export default tool({
  description:
    "Send a WhatsApp notification via CallMeBot API. Requires CALLMEBOT_PHONE and CALLMEBOT_APIKEY environment variables.",
  args: {
    message: tool
      .schema
      .string()
      .describe(
        "WhatsApp message to send"
      ),
    phone: tool
      .schema
      .string()
      .optional()
      .describe(
        "WhatsApp phone number with country code (overrides CALLMEBOT_PHONE env var)"
      ),
    apikey: tool
      .schema
      .string()
      .optional()
      .describe(
        "CallMeBot API key (overrides CALLMEBOT_APIKEY env var)"
      ),
  },
  async execute(args, context) {
    const phone = args.phone || process.env.CALLMEBOT_PHONE
    const apikey = args.apikey || process.env.CALLMEBOT_APIKEY

    if (!phone) {
      return JSON.stringify({
        success: false,
        error: "CALLMEBOT_PHONE environment variable not set. Get your phone number configured at https://www.callmebot.com/blog/free-api-whatsapp-messages/",
      }, null, 2)
    }

    if (!apikey) {
      return JSON.stringify({
        success: false,
        error: "CALLMEBOT_APIKEY environment variable not set. Get your API key from https://www.callmebot.com/blog/free-api-whatsapp-messages/",
      }, null, 2)
    }

    const encodedMessage = encodeURIComponent(args.message)
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apikey}`

    try {
      const response = await fetch(url)
      const body = await response.text()

      if (response.ok) {
        return JSON.stringify({
          success: true,
          status: response.status,
          message: "Notification sent successfully",
        }, null, 2)
      } else {
        return JSON.stringify({
          success: false,
          status: response.status,
          error: `CallMeBot API error: ${body}`,
        }, null, 2)
      }
    } catch (err: any) {
      return JSON.stringify({
        success: false,
        error: `Failed to call CallMeBot API: ${err.message}`,
      }, null, 2)
    }
  },
})