import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { generateText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, chatbotId, userIp: providedUserIp } = body

    if (!message || !chatbotId) {
      return NextResponse.json({ error: "پیام و شناسه چت‌بات الزامی است" }, { status: 400 })
    }

    // Get user IP and agent from headers for more reliability
    const headersList = headers()
    const userIp = providedUserIp || (headersList.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0].trim()
    const userAgent = headersList.get("user-agent") ?? "Unknown"

    console.log(`Processing message for chatbot ${chatbotId}: "${message.substring(0, 50)}..."`)

    // Store user message in database with real-time tracking
    try {
      const userMessageResult = await sql`
        INSERT INTO chatbot_messages (chatbot_id, user_message, user_ip, user_agent, timestamp)
        VALUES (${Number(chatbotId)}, ${message}, ${userIp}, ${userAgent}, NOW())
        RETURNING id
      `
      console.log(`User message stored with ID: ${userMessageResult[0]?.id}`)
    } catch (dbError) {
      console.error("Error storing user message:", dbError)
      // Continue processing even if storage fails
    }

    // Get chatbot configuration
    const chatbotResult = await sql`
      SELECT * FROM chatbots WHERE id = ${Number(chatbotId)}
    `

    if (chatbotResult.length === 0) {
      return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }

    const chatbot = chatbotResult[0]

    // Get FAQs for this chatbot
    const faqs = await sql`
      SELECT question, answer FROM chatbot_faqs WHERE chatbot_id = ${Number(chatbotId)} ORDER BY position ASC
    `

    // Get products for this chatbot
    const products = await sql`
      SELECT name, description, price, product_url FROM chatbot_products WHERE chatbot_id = ${Number(chatbotId)} ORDER BY position ASC
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
        context += `- ${product.name}: ${product.description}`
        if (product.price) context += ` (قیمت: ${product.price})`
        if (product.product_url) context += ` - لینک: ${product.product_url}`
        context += `\n`
      })
    }

    context += `\n\nلطفاً به زبان فارسی و به صورت مفید و دوستانه پاسخ دهید.`

    // Generate AI response if API key is available
    let aiResponse = "متشکرم از پیام شما. در حال حاضر سیستم پاسخگویی خودکار فعال نیست."

    if (chatbot.deepseek_api_key) {
      try {
        const { text } = await generateText({
          model: deepseek("deepseek-chat"),
          messages: [
            { role: "system", content: context },
            { role: "user", content: message },
          ],
          maxTokens: 500,
          apiKey: chatbot.deepseek_api_key,
        })
        aiResponse = text
      } catch (aiError) {
        console.error("Error generating AI response:", aiError)
        aiResponse = "متشکرم از پیام شما. در حال حاضر امکان پاسخگویی خودکار وجود ندارد."
      }
    }

    // Store AI response in database
    try {
      const botMessageResult = await sql`
        INSERT INTO chatbot_messages (chatbot_id, bot_response, user_ip, user_agent, timestamp)
        VALUES (${Number(chatbotId)}, ${aiResponse}, ${userIp}, ${userAgent}, NOW())
        RETURNING id
      `
      console.log(`Bot response stored with ID: ${botMessageResult[0]?.id}`)
    } catch (dbError) {
      console.error("Error storing AI response:", dbError)
      // Continue processing even if storage fails
    }

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      chatbotId: Number(chatbotId),
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "خطا در پردازش پیام" }, { status: 500 })
  }
}
