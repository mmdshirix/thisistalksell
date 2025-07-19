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
    const { messages, chatbotId, conversationHistory } = await req.json()

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

    // ذخیره پیام کاربر در دیتابیس برای حافظه
    const userMessage = messages[messages.length - 1]
    if (userMessage && userMessage.role === "user") {
      try {
        await sql`
          INSERT INTO chatbot_messages (chatbot_id, user_message, timestamp, user_ip, user_agent)
          VALUES (${chatbotId}, ${userMessage.content}, NOW(), null, null)
        `
      } catch (error) {
        console.error("Error saving user message:", error)
      }
    }

    // دریافت تاریخچه مکالمات اخیر برای حافظه چت‌بات
    let conversationContext = ""
    if (conversationHistory) {
      try {
        const recentMessages = await sql`
          SELECT user_message, bot_response, timestamp 
          FROM chatbot_messages 
          WHERE chatbot_id = ${chatbotId} 
          ORDER BY timestamp DESC 
          LIMIT 10
        `

        if (recentMessages.length > 0) {
          conversationContext = recentMessages
            .reverse()
            .map((msg: any) => `کاربر: ${msg.user_message}\nچت‌بات: ${msg.bot_response || "در حال پردازش..."}`)
            .join("\n\n")
        }
      } catch (error) {
        console.error("Error fetching conversation history:", error)
      }
    }

    // ساخت system prompt بهینه‌سازی شده برای سرعت و دقت با حافظه
    const systemPrompt = `
شما یک دستیار فروش هوشمند، سریع و بسیار کارآمد برای فروشگاه "${chatbot.name}" هستید. وظیفه شما کمک به کاربران برای یافتن سریع محصولات مورد نیازشان است.

**اطلاعات کلیدی:**
- دانش کلی: ${chatbot.knowledge_base_text || "شما یک دستیار فروش عمومی هستید."}
- لیست محصولات:
${products.map((p: any) => `- نام: ${p.name} | توضیحات: ${p.description} | قیمت: ${p.price} | لینک: ${p.product_url}`).join("\n")}
- سوالات متداول:
${faqs.map((f: any) => `- پرسش: ${f.question} | پاسخ: ${f.answer}`).join("\n")}

**تاریخچه مکالمه اخیر:**
${conversationContext || "این اولین مکالمه کاربر است."}

**دستورالعمل‌های حیاتی:**
1. **سرعت اولویت اصلی است.** پاسخ‌های کوتاه، مفید و مستقیم بدهید.
2. **همیشه به فارسی روان صحبت کنید.**
3. **حافظه مکالمه:** به پیام‌های قبلی کاربر اشاره کنید و پاسخ‌های مرتبط بدهید.
4. **پیشنهاد محصول:** اگر کاربر قصد خرید داشت یا سوالی مرتبط با محصول پرسید، **فقط و فقط** از لیست محصولات موجود، مناسب‌ترین‌ها را پیشنهاد دهید.
5. **فرمت خروجی JSON:** در انتهای پیام خود، **حتماً** دو بخش JSON زیر را قرار دهید:
    - SUGGESTED_PRODUCTS: لیستی از محصولات پیشنهادی (حداکثر ۲ مورد). اگر محصولی برای پیشنهاد نبود، لیست خالی \`[]\` بگذارید.
    - فرمت نمونه: SUGGESTED_PRODUCTS: [{"id":1,"name":"نام","description":"توضیحات","price":1000,"image_url":"url","product_url":"url","button_text":"خرید"}]
    - NEXT_SUGGESTIONS: لیستی از ۳ سوال هوشمندانه و مرتبط برای ادامه گفتگو.
    - فرمت نمونه: NEXT_SUGGESTIONS: [{"text":"متن سوال","emoji":"😊"}]
6. **متن اصلی پاسخ شما نباید شامل JSON باشد.** JSONها را فقط در انتهای پیام قرار دهید.
7. **لینک‌های محصولات:** هنگام ذکر نام محصولات، آن‌ها را به صورت لینک کلیکی نمایش دهید.
`

    const result = streamText({
      model: deepseek("deepseek-chat"),
      system: systemPrompt,
      messages,
      temperature: 0.5,
      maxTokens: 1000,
      // افزایش سرعت تایپ 3 برابر
      streamOptions: {
        includeUsage: false,
        includeFinishReason: false,
      },
    })

    // ذخیره پاسخ چت‌بات در دیتابیس
    result.then(async (response) => {
      try {
        const fullResponse = await response.text
        await sql`
          UPDATE chatbot_messages 
          SET bot_response = ${fullResponse}
          WHERE chatbot_id = ${chatbotId} 
          AND user_message = ${userMessage.content}
          AND bot_response IS NULL
          ORDER BY timestamp DESC
          LIMIT 1
        `
      } catch (error) {
        console.error("Error saving bot response:", error)
      }
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
