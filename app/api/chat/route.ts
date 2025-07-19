import { streamText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import type { NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { messages, chatbotId } = await req.json()

    if (!chatbotId) {
      return new Response("chatbotId is required", { status: 400 })
    }

    // دریافت اطلاعات چت‌بات
    const chatbotResult = await sql`
      SELECT * FROM chatbots WHERE id = ${chatbotId}
    `

    if (chatbotResult.length === 0) {
      return new Response("Chatbot not found", { status: 404 })
    }

    const chatbot = chatbotResult[0]

    // دریافت محصولات
    const products = await sql`
      SELECT * FROM products WHERE chatbot_id = ${chatbotId}
    `

    // دریافت سوالات متداول
    const faqs = await sql`
      SELECT * FROM faqs WHERE chatbot_id = ${chatbotId}
    `

    const lastMessage = messages[messages.length - 1]?.content || ""

    // ذخیره پیام کاربر
    try {
      const userIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
      const userAgent = req.headers.get("user-agent") || "unknown"

      await sql`
        INSERT INTO messages (chatbot_id, content, role, user_ip, user_agent, created_at)
        VALUES (${chatbotId}, ${lastMessage}, 'user', ${userIp}, ${userAgent}, NOW())
      `
    } catch (error) {
      console.error("Error saving user message:", error)
    }

    const systemPrompt = `
شما یک دستیار فروش هوشمند برای ${chatbot.name} هستید.

اطلاعات شرکت:
- نام: ${chatbot.name}
- پیام خوش‌آمدگویی: ${chatbot.welcome_message}
- پیام راهنمایی: ${chatbot.navigation_message}

محصولات موجود:
${products.map((p) => `- ${p.name}: ${p.description} (قیمت: ${p.price} تومان)`).join("\n")}

سوالات متداول:
${faqs.map((f) => `- ${f.question}: ${f.answer}`).join("\n")}

دستورالعمل‌ها:
1. پاسخ‌های مفید و دوستانه ارائه دهید
2. اگر محصول مناسبی پیدا کردید، آن را پیشنهاد دهید
3. برای پیشنهاد محصولات از فرمت زیر استفاده کنید:
   SUGGESTED_PRODUCTS: [{"id": 1, "name": "نام محصول", "description": "توضیحات", "price": 1000, "image_url": "url", "product_url": "url", "button_text": "خرید"}]

4. برای پیشنهاد سوالات بعدی از فرمت زیر استفاده کنید:
   NEXT_SUGGESTIONS: [{"text": "متن سوال", "emoji": "😊"}]

5. همیشه به فارسی پاسخ دهید
6. اگر سوالی خارج از حوزه کاری است، کاربر را به تیکت پشتیبانی راهنمایی کنید
`

    const result = streamText({
      model: deepseek("deepseek-chat"),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // ذخیره پاسخ بات (async)
    result
      .then(async (response) => {
        try {
          const fullText = await response.text
          await sql`
          INSERT INTO messages (chatbot_id, content, role, created_at)
          VALUES (${chatbotId}, ${fullText}, 'assistant', NOW())
        `
        } catch (error) {
          console.error("Error saving assistant message:", error)
        }
      })
      .catch(console.error)

    return result.toDataStreamResponse({
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
