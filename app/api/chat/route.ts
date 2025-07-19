import { streamText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import type { NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const { messages, chatbotId } = await req.json()

    // دریافت اطلاعات چت‌بات
    const chatbotResult = await sql`
      SELECT * FROM chatbots WHERE id = ${chatbotId}
    `

    if (chatbotResult.length === 0) {
      return new Response("Chatbot not found", { status: 404 })
    }

    const chatbot = chatbotResult[0]

    // دریافت محصولات
    const productsResult = await sql`
      SELECT * FROM products WHERE chatbot_id = ${chatbotId} ORDER BY id
    `

    // دریافت سوالات متداول
    const faqsResult = await sql`
      SELECT * FROM faqs WHERE chatbot_id = ${chatbotId} ORDER BY id
    `

    // ساخت system prompt با حافظه مکالمه
    const conversationHistory = messages
      .slice(0, -1)
      .map((msg: any) => `${msg.role === "user" ? "کاربر" : "دستیار"}: ${msg.content}`)
      .join("\n")

    const systemPrompt = `
شما یک دستیار هوشمند فروش برای ${chatbot.name} هستید.

تاریخچه مکالمه قبلی:
${conversationHistory ? conversationHistory : "این اولین پیام کاربر است."}

اطلاعات مهم:
- همیشه به تاریخچه مکالمه توجه کنید و از اطلاعات قبلی کاربر استفاده کنید
- اگر کاربر قبلاً چیزی گفته، به آن اشاره کنید
- پاسخ‌های شما باید بر اساس کل مکالمه باشد، نه فقط آخرین پیام

محصولات موجود:
${productsResult.map((p) => `- ${p.name}: ${p.description} - قیمت: ${p.price} تومان - لینک: ${p.product_url}`).join("\n")}

سوالات متداول:
${faqsResult.map((f) => `- ${f.question}: ${f.answer}`).join("\n")}

دستورالعمل‌ها:
1. پاسخ‌های مفید و دوستانه ارائه دهید
2. در صورت مناسب بودن، محصولات را پیشنهاد دهید
3. از لینک‌های محصولات در متن استفاده کنید
4. اگر محصولی پیشنهاد می‌دهید، در انتهای پاسخ JSON زیر را اضافه کنید:

\`\`\`json
{
  "SUGGESTED_PRODUCTS": [
    {
      "id": شناسه_محصول,
      "name": "نام محصول",
      "description": "توضیحات",
      "price": قیمت,
      "image_url": "آدرس تصویر",
      "product_url": "لینک محصول",
      "button_text": "متن دکمه"
    }
  ],
  "NEXT_SUGGESTIONS": [
    {
      "text": "سوال پیشنهادی 1",
      "emoji": "😊"
    },
    {
      "text": "سوال پیشنهادی 2", 
      "emoji": "🤔"
    }
  ]
}
\`\`\`

مهم: JSON را فقط در صورت وجود محصول مناسب یا سوال پیشنهادی اضافه کنید.
`

    const result = await streamText({
      model: deepseek("deepseek-chat"),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
