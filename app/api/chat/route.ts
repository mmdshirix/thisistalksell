import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import { getChatbotById, saveMessage, getFAQsByChatbotId, getProductsByChatbotId } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { message, chatbotId, userIp, userAgent } = await request.json()

    if (!message || !chatbotId) {
      return NextResponse.json({ error: "پیام و شناسه چت‌بات الزامی است" }, { status: 400 })
    }

    // Get chatbot configuration
    const chatbot = await getChatbotById(Number.parseInt(chatbotId))
    if (!chatbot) {
      return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }

    // Get FAQs and Products for context
    const [faqs, products] = await Promise.all([
      getFAQsByChatbotId(Number.parseInt(chatbotId)),
      getProductsByChatbotId(Number.parseInt(chatbotId)),
    ])

    // Build context for AI
    let context = `شما یک دستیار هوشمند برای ${chatbot.name} هستید.\n\n`

    if (chatbot.knowledge_base_text) {
      context += `اطلاعات کسب‌وکار:\n${chatbot.knowledge_base_text}\n\n`
    }

    if (faqs.length > 0) {
      context += `سوالات متداول:\n`
      faqs.forEach((faq) => {
        context += `س: ${faq.question}\nج: ${faq.answer}\n\n`
      })
    }

    if (products.length > 0) {
      context += `محصولات موجود:\n`
      products.forEach((product) => {
        context += `- ${product.name}: ${product.description || "توضیحات موجود نیست"}`
        if (product.price) context += ` - قیمت: ${product.price} تومان`
        context += `\n`
      })
    }

    context += `\nلطفاً به صورت مفید، دوستانه و مختصر پاسخ دهید. اگر سوال خارج از حوزه کاری شما است، کاربر را به تیکت یا تماس مستقیم راهنمایی کنید.`

    // Use chatbot's API key or fallback to system default
    const apiKey = chatbot.deepseek_api_key || process.env.DEEPSEEK_API_KEY

    if (!apiKey) {
      // Simple response without AI
      const response = "سلام! من دستیار هوشمند هستم. چطور می‌توانم به شما کمک کنم؟"

      // Save message to database
      await saveMessage({
        chatbot_id: Number.parseInt(chatbotId),
        user_message: message,
        bot_response: response,
        user_ip: userIp,
        user_agent: userAgent,
      })

      return NextResponse.json({ response })
    }

    try {
      // Generate AI response
      const { text } = await generateText({
        model: deepseek("deepseek-chat", { apiKey }),
        system: context,
        prompt: message,
        maxTokens: 500,
        temperature: 0.7,
      })

      // Save message to database
      await saveMessage({
        chatbot_id: Number.parseInt(chatbotId),
        user_message: message,
        bot_response: text,
        user_ip: userIp,
        user_agent: userAgent,
      })

      return NextResponse.json({ response: text })
    } catch (aiError) {
      console.error("AI generation error:", aiError)

      // Fallback response
      const fallbackResponse =
        "متأسفانه در حال حاضر امکان پاسخگویی وجود ندارد. لطفاً بعداً تلاش کنید یا با پشتیبانی تماس بگیرید."

      await saveMessage({
        chatbot_id: Number.parseInt(chatbotId),
        user_message: message,
        bot_response: fallbackResponse,
        user_ip: userIp,
        user_agent: userAgent,
      })

      return NextResponse.json({ response: fallbackResponse })
    }
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "خطا در پردازش پیام" }, { status: 500 })
  }
}
