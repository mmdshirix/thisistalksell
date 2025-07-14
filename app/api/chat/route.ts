import { type NextRequest, NextResponse } from "next/server"
import { streamText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import { getChatbot, saveMessage } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { messages, chatbotId } = await request.json()

    if (!chatbotId) {
      return NextResponse.json({ error: "Chatbot ID is required" }, { status: 400 })
    }

    // Get chatbot configuration
    const chatbot = await getChatbot(chatbotId)
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    // Get user IP and user agent
    const userIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json({ error: "Invalid message format" }, { status: 400 })
    }

    // Use DeepSeek API key from chatbot or environment
    const apiKey = chatbot.deepseekApiKey || process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "DeepSeek API key not configured" }, { status: 500 })
    }

    // Create system prompt
    const systemPrompt = `
شما یک دستیار هوشمند برای ${chatbot.name} هستید.

${chatbot.knowledgeBaseText ? `اطلاعات پایه: ${chatbot.knowledgeBaseText}` : ""}

${chatbot.promptTemplate || "لطفاً به صورت مفید، دوستانه و حرفه‌ای پاسخ دهید."}

همیشه به زبان فارسی پاسخ دهید.
    `.trim()

    // Stream response from DeepSeek
    const result = await streamText({
      model: deepseek("deepseek-chat", { apiKey }),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // Save the conversation to database
    let botResponse = ""
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.textStream) {
          botResponse += chunk
          controller.enqueue(new TextEncoder().encode(chunk))
        }

        // Save message after streaming is complete
        try {
          await saveMessage({
            chatbotId,
            userMessage: lastMessage.content,
            botResponse,
            userIp,
            userAgent,
          })
        } catch (error) {
          console.error("Error saving message:", error)
        }

        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
