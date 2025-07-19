import { streamText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import type { NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { saveMessage } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { messages, chatbotId } = await req.json()

    if (!chatbotId) {
      return new Response("Chatbot ID is required", { status: 400 })
    }

    // دریافت اطلاعات چت‌بات
    const chatbotResult = await sql`
      SELECT * FROM chatbots WHERE id = ${chatbotId}
    `

    if (chatbotResult.length === 0) {
      return new Response("Chatbot not found", { status: 404 })
    }

    const chatbot = chatbotResult[0]
    const lastMessage = messages[messages.length - 1]

    // ذخیره پیام کاربر
    try {
      await saveMessage({
        chatbot_id: chatbotId,
        message: lastMessage.content,
        sender: "user",
        user_ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
      })
    } catch (error) {
      console.error("Error saving user message:", error)
    }

    // دریافت FAQ ها
    const faqResult = await sql`
      SELECT question, answer FROM chatbot_faqs 
      WHERE chatbot_id = ${chatbotId}
      ORDER BY id
    `

    // دریافت محصولات
    const productsResult = await sql`
      SELECT name, description, price, image_url, link_url 
      FROM chatbot_products 
      WHERE chatbot_id = ${chatbotId}
      ORDER BY id
    `

    // ساخت context
    let context = `شما یک دستیار هوشمند برای ${chatbot.name} هستید.`

    if (chatbot.description) {
      context += `\n\nدرباره کسب‌وکار: ${chatbot.description}`
    }

    if (faqResult.length > 0) {
      context += "\n\nسوالات متداول:\n"
      faqResult.forEach((faq: any) => {
        context += `س: ${faq.question}\nج: ${faq.answer}\n\n`
      })
    }

    if (productsResult.length > 0) {
      context += "\n\nمحصولات موجود:\n"
      productsResult.forEach((product: any) => {
        context += `- ${product.name}: ${product.description}`
        if (product.price) context += ` (قیمت: ${product.price})`
        context += "\n"
      })
    }

    context +=
      "\n\nلطفاً پاسخ‌های مفید، دقیق و مرتبط ارائه دهید. اگر سوال مربوط به محصولات است، اطلاعات کاملی ارائه دهید."

    const result = await streamText({
      model: deepseek("deepseek-chat"),
      messages: [{ role: "system", content: context }, ...messages],
      onFinish: async (result) => {
        // ذخیره پاسخ بات
        try {
          await saveMessage({
            chatbot_id: chatbotId,
            message: result.text,
            sender: "bot",
            user_ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
            user_agent: req.headers.get("user-agent") || "unknown",
          })
        } catch (error) {
          console.error("Error saving bot message:", error)
        }
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
