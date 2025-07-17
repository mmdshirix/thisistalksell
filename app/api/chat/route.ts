import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import { getChatbot, saveMessage, getChatbotFAQs, getChatbotProducts } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { message, chatbotId, userIp, userAgent } = await request.json()

    if (!message || !chatbotId) {
      return NextResponse.json({ error: "Message and chatbot ID are required" }, { status: 400 })
    }

    // Get chatbot configuration
    const chatbot = await getChatbot(Number.parseInt(chatbotId))
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    // Get FAQs and Products for context
    const faqs = await getChatbotFAQs(chatbot.id)
    const products = await getChatbotProducts(chatbot.id)

    // Build context for AI
    let context = `شما یک دستیار هوشمند برای ${chatbot.name} هستید.\n\n`

    if (chatbot.knowledge_base_text) {
      context += `اطلاعات کسب و کار:\n${chatbot.knowledge_base_text}\n\n`
    }

    if (faqs.length > 0) {
      context += `سوالات متداول:\n`
      faqs.forEach((faq) => {
        context += `- ${faq.question}: ${faq.answer}\n`
      })
      context += `\n`
    }

    if (products.length > 0) {
      context += `محصولات موجود:\n`
      products.forEach((product) => {
        context += `- ${product.name}: ${product.description} (قیمت: ${product.price})\n`
      })
      context += `\n`
    }

    context += `لطفاً به صورت مفید، دوستانه و مختصر پاسخ دهید. اگر سوال مربوط به محصولات است، می‌توانید آنها را پیشنهاد دهید.`

    let botResponse = ""

    // Use AI if API key is available
    if (chatbot.deepseek_api_key) {
      try {
        const { text } = await generateText({
          model: deepseek("deepseek-chat", {
            apiKey: chatbot.deepseek_api_key,
          }),
          system: context,
          prompt: message,
          maxTokens: 500,
        })
        botResponse = text
      } catch (aiError) {
        console.error("AI generation error:", aiError)
        botResponse =
          "متأسفانه در حال حاضر نمی‌توانم پاسخ مناسبی ارائه دهم. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید."
      }
    } else {
      // Fallback response without AI
      botResponse = "سلام! متأسفانه هوش مصنوعی فعال نیست. لطفاً با پشتیبانی تماس بگیرید."
    }

    // Save message to database
    try {
      await saveMessage({
        chatbot_id: chatbot.id,
        user_message: message,
        bot_response: botResponse,
        user_ip: userIp,
        user_agent: userAgent,
      })
    } catch (dbError) {
      console.error("Database save error:", dbError)
      // Continue even if saving fails
    }

    return NextResponse.json({
      response: botResponse,
      suggestions: faqs.slice(0, 3).map((faq) => ({
        text: faq.question,
        emoji: faq.emoji,
      })),
      products: products.slice(0, 2),
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
