import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai" // Using openai as a generic AI SDK provider

export async function GET() {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "DEEPSEEK_API_KEY is not set" }, { status: 500 })
    }

    const { text } = await generateText({
      model: openai("deepseek-chat"), // Assuming 'deepseek-chat' is a valid model for openai provider
      prompt: "Hello DeepSeek, how are you today?",
      apiKey: process.env.DEEPSEEK_API_KEY,
    })

    return NextResponse.json({ message: "DeepSeek test successful", response: text })
  } catch (error) {
    console.error("DeepSeek test failed:", error)
    return NextResponse.json({ message: "DeepSeek test failed", error: (error as Error).message }, { status: 500 })
  }
}
