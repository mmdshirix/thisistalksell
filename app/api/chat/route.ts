import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, chatbotId } = body

    if (!message || !chatbotId) {
      return NextResponse.json({ error: "Message and chatbotId are required" }, { status: 400 })
    }

    // Dynamic import to avoid build-time issues
    const { getChatbot, saveChatbotMessage } = await import("@/lib/db")

    // Get chatbot configuration
    const chatbot = await getChatbot(Number.parseInt(chatbotId))
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    let botResponse = "متاسفانه در حال حاضر قادر به پاسخگویی نیستم."

    // Generate AI response if API key is available
    if (chatbot.deepseek_api_key) {
      try {
        const systemPrompt = `
          شما یک دستیار هوشمند هستید که به زبان فارسی پاسخ می‌دهید.
          ${chatbot.knowledge_base_text ? `اطلاعات پایه شما: ${chatbot.knowledge_base_text}` : ""}
          ${chatbot.store_url ? `آدرس فروشگاه: ${chatbot.store_url}` : ""}
          لطفاً پاسخ‌های مفید و دوستانه ارائه دهید.
        `

        const { text } = await generateText({
          model: deepseek("deepseek-chat", {
            apiKey: chatbot.deepseek_api_key,
          }),
          system: systemPrompt,
          prompt: message,
          maxTokens: 500,
        })

        botResponse = text
      } catch (aiError) {
        console.error("AI generation error:", aiError)
        botResponse = "متاسفانه در حال حاضر قادر به پاسخگویی نیستم. لطفاً بعداً تلاش کنید."
      }
    }

    // Save message to database
    try {
      await saveChatbotMessage(
        Number.parseInt(chatbotId),
        message,
        botResponse,
        request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      )
    } catch (dbError) {
      console.error("Database save error:", dbError)
      // Continue even if saving fails
    }

    return NextResponse.json({ response: botResponse })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
