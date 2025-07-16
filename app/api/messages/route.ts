import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { generateText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"

export async function POST(request: NextRequest) {
  try {
    const { message, chatbotId, userIp } = await request.json()

    if (!message || !chatbotId) {
      return NextResponse.json({ error: "پیام و شناسه چت‌بات الزامی است" }, { status: 400 })
    }

    // Store user message in database with real-time tracking
    try {
      await sql`
        INSERT INTO chatbot_messages (chatbot_id, message, user_ip, timestamp, message_type)
        VALUES (${chatbotId}, ${message}, ${userIp || "unknown"}, NOW(), 'user')
      `
    } catch (dbError) {
      console.error("Error storing user message:", dbError)
      // Continue processing even if storage fails
    }

    // Get chatbot configuration
    const chatbotResult = await sql`
      SELECT * FROM chatbots WHERE id = ${chatbotId}
    `

    if (chatbotResult.length === 0) {
      return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }

    const chatbot = chatbotResult[0]

    // Get FAQs for this chatbot
    const faqs = await sql`
      SELECT question, answer FROM chatbot_faqs WHERE chatbot_id = ${chatbotId}
    `

    // Get products for this chatbot
    const products = await sql`
      SELECT name, description, price, url FROM chatbot_products WHERE chatbot_id = ${chatbotId}
    `

    // Build context for AI
    let context = `شما یک دستیار هوشمند برای ${chatbot.name} هستید.`

    if (chatbot.knowledge_base_text) {
      context += `\n\nاطلاعات پایه:\n${chatbot.knowledge_base_text}`
    }

    if (faqs.length > 0) {
      context += `\n\nسوالات متداول:\n`
      faqs.forEach((faq: any) => {
        context += `س: ${faq.question}\nج: ${faq.answer}\n\n`
      })
    }

    if (products.length > 0) {
      context += `\n\nمحصولات موجود:\n`
      products.forEach((product: any) => {
        context += `- ${product.name}: ${product.description} (قیمت: ${product.price})\n`
      })
    }

    context += `\n\nلطفاً به زبان فارسی و به صورت مفید و دوستانه پاسخ دهید.`

    // Generate AI response
    const { text: aiResponse } = await generateText({
      model: deepseek("deepseek-chat"),
      messages: [
        { role: "system", content: context },
        { role: "user", content: message },
      ],
      maxTokens: 500,
    })

    // Store AI response in database
    try {
      await sql`
        INSERT INTO chatbot_messages (chatbot_id, message, user_ip, timestamp, message_type)
        VALUES (${chatbotId}, ${aiResponse}, ${userIp || "unknown"}, NOW(), 'bot')
      `
    } catch (dbError) {
      console.error("Error storing AI response:", dbError)
      // Continue processing even if storage fails
    }

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "خطا در پردازش پیام" }, { status: 500 })
  }
}
