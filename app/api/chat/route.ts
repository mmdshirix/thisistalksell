import { streamText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: Request) {
  try {
    const { messages, chatbotId } = await req.json()

    // Get chatbot data
    const chatbotResult = await sql`
      SELECT * FROM chatbots WHERE id = ${chatbotId}
    `

    if (chatbotResult.length === 0) {
      return new Response("Chatbot not found", { status: 404 })
    }

    const chatbot = chatbotResult[0]

    // Get FAQs
    const faqsResult = await sql`
      SELECT * FROM chatbot_faqs WHERE chatbot_id = ${chatbotId} ORDER BY id
    `

    // Get products
    const productsResult = await sql`
      SELECT * FROM chatbot_products WHERE chatbot_id = ${chatbotId} ORDER BY id
    `

    // Create context for the AI
    const context = `
شما یک دستیار هوشمند فروش برای ${chatbot.name} هستید.

اطلاعات مهم:
- نام کسب‌وکار: ${chatbot.name}
- پیام خوش‌آمدگویی: ${chatbot.welcome_message}
- پیام راهنمایی: ${chatbot.navigation_message}

سوالات متداول:
${faqsResult.map((faq) => `- ${faq.question}: ${faq.answer}`).join("\n")}

محصولات موجود:
${productsResult.map((product) => `- ${product.name}: ${product.description} - قیمت: ${product.price} تومان`).join("\n")}

دستورالعمل‌ها:
1. همیشه به زبان فارسی پاسخ دهید
2. مودب و دوستانه باشید
3. اگر کاربر درباره محصولی سوال کرد، محصولات مرتبط را پیشنهاد دهید
4. اگر محصولی مناسب یافتید، آن را در فرمت زیر ارائه دهید:

SUGGESTED_PRODUCTS: [{"id": شناسه_محصول, "name": "نام_محصول", "description": "توضیحات", "price": قیمت, "image_url": "آدرس_تصویر", "product_url": "لینک_محصول", "button_text": "متن_دکمه"}]

5. همچنین سوالات پیشنهادی در فرمت زیر ارائه دهید:

NEXT_SUGGESTIONS: [{"text": "متن سوال", "emoji": "ایموجی مناسب"}]

6. فقط در صورت وجود محصول مرتبط، SUGGESTED_PRODUCTS را ارسال کنید
7. همیشه 2-3 سوال پیشنهادی ارائه دهید
`

    const result = await streamText({
      model: deepseek("deepseek-chat"),
      system: context,
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
