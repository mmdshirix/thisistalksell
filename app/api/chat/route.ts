import { deepseek } from "@ai-sdk/deepseek"
import { streamText } from "ai"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const maxDuration = 30

export async function POST(req: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    const { messages, chatbotId } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array is required and cannot be empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (!chatbotId) {
      return new Response(JSON.stringify({ error: "Chatbot ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // دریافت اطلاعات چت‌بات
    const chatbots = await sql`
      SELECT * FROM chatbots WHERE id = ${chatbotId}
    `

    if (chatbots.length === 0) {
      return new Response(JSON.stringify({ error: "Chatbot not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const chatbot = chatbots[0]

    // دریافت محصولات و FAQs
    const [products, faqs] = await Promise.all([
      sql`SELECT * FROM chatbot_products WHERE chatbot_id = ${chatbotId}`,
      sql`SELECT * FROM chatbot_faqs WHERE chatbot_id = ${chatbotId}`,
    ])

    // ساخت system prompt
    const systemPrompt = `
شما یک دستیار هوشمند فروش هستید که به کاربران کمک می‌کنید محصولات مناسب پیدا کنند.

اطلاعات چت‌بات:
- نام: ${chatbot.name}
- پیام خوش‌آمدگویی: ${chatbot.welcome_message}
- دانش پایه: ${chatbot.knowledge_base_text || "اطلاعات خاصی ارائه نشده"}

محصولات موجود:
${products.map((p: any) => `- ${p.name}: ${p.description} (قیمت: ${p.price} تومان)`).join("\n")}

سوالات متداول:
${faqs.map((f: any) => `- ${f.question}: ${f.answer}`).join("\n")}

دستورالعمل‌ها:
1. پاسخ‌های مفید و دوستانه ارائه دهید
2. اگر کاربر به دنبال محصول خاصی است، محصولات مناسب را پیشنهاد دهید
3. در انتهای پاسخ، محصولات پیشنهادی را در فرمت JSON ارائه دهید:

SUGGESTED_PRODUCTS: [{"id": 1, "name": "نام محصول", "description": "توضیحات", "price": 1000, "image_url": "url", "product_url": "url", "button_text": "خرید"}]

4. سوالات پیشنهادی برای ادامه مکالمه ارائه دهید:

NEXT_SUGGESTIONS: [{"text": "متن سوال", "emoji": "😊"}]

5. همیشه به فارسی پاسخ دهید
6. اگر محصول مناسبی نداشتید، لیست خالی ارائه دهید: []
`

    const result = streamText({
      model: deepseek("deepseek-chat"),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return result.toDataStreamResponse({
      headers: corsHeaders,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
