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
      sql`SELECT id, name, description, price, image_url, product_url, button_text FROM chatbot_products WHERE chatbot_id = ${chatbotId}`,
      sql`SELECT question, answer FROM chatbot_faqs WHERE chatbot_id = ${chatbotId}`,
    ])

    // ساخت system prompt بهینه‌سازی شده برای سرعت و دقت
    const systemPrompt = `
شما یک دستیار فروش هوشمند، سریع و بسیار کارآمد برای فروشگاه "${chatbot.name}" هستید. وظیفه شما کمک به کاربران برای یافتن سریع محصولات مورد نیازشان است.

**اطلاعات کلیدی:**
- دانش کلی: ${chatbot.knowledge_base_text || "شما یک دستیار فروش عمومی هستید."}
- لیست محصولات:
${products.map((p: any) => `- نام: ${p.name} | توضیحات: ${p.description} | قیمت: ${p.price}`).join("\n")}
- سوالات متداول:
${faqs.map((f: any) => `- پرسش: ${f.question} | پاسخ: ${f.answer}`).join("\n")}

**دستورالعمل‌های حیاتی:**
1.  **سرعت اولویت اصلی است.** پاسخ‌های کوتاه، مفید و مستقیم بدهید.
2.  **همیشه به فارسی روان صحبت کنید.**
3.  **پیشنهاد محصول:** اگر کاربر قصد خرید داشت یا سوالی مرتبط با محصول پرسید، **فقط و فقط** از لیست محصولات موجود، مناسب‌ترین‌ها را پیشنهاد دهید.
4.  **فرمت خروجی JSON:** در انتهای پیام خود، **حتماً** دو بخش JSON زیر را قرار دهید:
    -   SUGGESTED_PRODUCTS: لیستی از محصولات پیشنهادی (حداکثر ۲ مورد). اگر محصولی برای پیشنهاد نبود، لیست خالی \`[]\` بگذارید.
    -   فرمت نمونه:  SUGGESTED_PRODUCTS: [{"id":1,"name":"نام","description":"توضیحات","price":1000,"image_url":"url","product_url":"url","button_text":"خرید"}]
    -   NEXT_SUGGESTIONS: لیستی از ۳ سوال هوشمندانه و مرتبط برای ادامه گفتگو.
    -   فرمت نمونه:  NEXT_SUGGESTIONS: [{"text":"متن سوال","emoji":"😊"}]
5.  **متن اصلی پاسخ شما نباید شامل JSON باشد.** JSONها را فقط در انتهای پیام قرار دهید.
`

    const result = streamText({
      model: deepseek("deepseek-chat"),
      system: systemPrompt,
      messages,
      temperature: 0.6, // کمی کاهش دما برای پاسخ‌های دقیق‌تر
      maxTokens: 800, // کاهش برای سرعت بیشتر
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
