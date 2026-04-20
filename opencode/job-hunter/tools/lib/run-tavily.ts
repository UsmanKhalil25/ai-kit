export interface TavilyResult {
  success: boolean
  data?: unknown
  error?: string
  stderr?: string
  timedOut?: boolean
}

const CONTENT_FILTER_PATTERNS = [
  "DataInspectionFailed",
  "inappropriate content",
  "InternalError.Algo",
]

function isContentFilterError(text: string): boolean {
  return CONTENT_FILTER_PATTERNS.some((p) => text.includes(p))
}

export async function runTavily(
  args: string[],
  timeoutMs = 30_000,
): Promise<TavilyResult> {
  try {
    const proc = Bun.spawn(["tvly", ...args], {
      stdout: "pipe",
      stderr: "pipe",
      signal: AbortSignal.timeout(timeoutMs),
    })

    const stdout = await new Response(proc.stdout).text()
    const stderr = await new Response(proc.stderr).text()
    await proc.exited

    if (isContentFilterError(stdout) || isContentFilterError(stderr)) {
      return {
        success: false,
        error:
          "Tavily content filter blocked this query. Try rephrasing or using different keywords.",
        stderr: (stderr || stdout).slice(0, 500),
      }
    }

    if (proc.exitCode !== 0) {
      return {
        success: false,
        error: `tvly exited with code ${proc.exitCode}`,
        stderr: stderr.trim().slice(0, 500),
      }
    }

    try {
      const data = JSON.parse(stdout.trim())
      return { success: true, data }
    } catch {
      return { success: true, data: stdout.trim() }
    }
  } catch (err: any) {
    if (err.name === "AbortError" || err.name === "TimeoutError") {
      return {
        success: false,
        error: `Tavily CLI timed out after ${timeoutMs / 1000}s`,
        timedOut: true,
      }
    }
    return {
      success: false,
      error: `Failed to run tvly: ${err.message}`,
    }
  }
}
