import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY || ""}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: "سلام، این یک تست اتصال است.",
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      console.error("DeepSeek API Error:", response.status, response.statusText)
      try {
        const errorBody = await response.json()
        console.error("Error Body:", errorBody)
      } catch (jsonError) {
        console.error("Error parsing error body:", jsonError)
      }
      return NextResponse.json({ error: "DeepSeek API Error" }, { status: response.status || 500 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error during DeepSeek API call:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
