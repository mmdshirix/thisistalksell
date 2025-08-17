import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 })
    }

    // Test different model names
    const modelsToTest = ["deepseek-chat", "deepseek-coder", "deepseek-r1", "deepseek-v2"]
    const results = []

    for (const model of modelsToTest) {
      try {
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: "test" }],
            max_tokens: 1,
          }),
        })

        if (response.ok) {
          results.push({ model, status: "available" })
        } else {
          const errorData = await response.json()
          results.push({
            model,
            status: "error",
            error: errorData.error?.message || "Unknown error",
          })
        }
      } catch (error) {
        results.push({
          model,
          status: "error",
          error: String(error),
        })
      }
    }

    return NextResponse.json({
      results,
      apiKeyPresent: !!apiKey,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to test models",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
