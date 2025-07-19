import { streamText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import type { NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    const { messages, chatbotId } = await req.json()

    if (!chatbotId) {
      return new Response(JSON.stringify({ error: "chatbotId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // دریافت اطلاعات چت‌بات
    const chatbotResult = await sql`
      SELECT * FROM chatbots WHERE id = ${Number.parseInt(chatbotId)}
    `

    if (chatbotResult.length === 0) {
      return new Response(JSON.stringify({ error: "Chatbot not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const chatbot = chatbotResult[0]

    // دریافت محصولات و FAQs
    let products = []
    let faqs = []

    try {
      // اطمینان از وجود جداول
      await sql`
        CREATE TABLE IF NOT EXISTS chatbot_products (
          id SERIAL PRIMARY KEY,
          chatbot_id INTEGER NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2),
          image_url TEXT,
          product_url TEXT,
          button_text VARCHAR(100) DEFAULT 'خرید',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      await sql`
        CREATE TABLE IF NOT EXISTS chatbot_faqs (
          id SERIAL PRIMARY KEY,
          chatbot_id INTEGER NOT NULL,
          question TEXT NOT NULL,
          answer TEXT NOT NULL,
          emoji VARCHAR(10) DEFAULT '❓',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      products = await sql`
        SELECT * FROM chatbot_products WHERE chatbot_id = ${Number.parseInt(chatbotId)}
      `

      faqs = await sql`
        SELECT * FROM chatbot_faqs WHERE chatbot_id = ${Number.parseInt(chatbotId)}
      `
    } catch (error) {
      console.error("Error fetching products/faqs:", error)
    }

    const lastMessage = messages[messages.length - 1]?.content || ""

    // ذخیره پیام کاربر
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          chatbot_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          role VARCHAR(20) NOT NULL,
          user_ip VARCHAR(100),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      const userIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
      const userAgent = req.headers.get("user-agent") || "unknown"

      await sql`
        INSERT INTO messages (chatbot_id, content, role, user_ip, user_agent, created_at)
        VALUES (${Number.parseInt(chatbotId)}, ${lastMessage}, 'user', ${userIp}, ${userAgent}, NOW())
      `
    } catch (error) {
      console.error("Error saving user message:", error)
    }

    const systemPrompt = `
شما یک دستیار فروش هوشمند برای ${chatbot.name || "فروشگاه"} هستید.

اطلاعات شرکت:
- نام: ${chatbot.name || "فروشگاه"}
- پیام خوش‌آمدگویی: ${chatbot.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟"}
- پیام راهنمایی: ${chatbot.navigation_message || "چه چیزی شما را به اینجا آورده است؟"}

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

    const result = await streamText({
      model: deepseek("deepseek-chat"),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // ذخیره پاسخ بات (async)
    result.text
      .then(async (fullText) => {
        try {
          await sql`
          INSERT INTO messages (chatbot_id, content, role, created_at)
          VALUES (${Number.parseInt(chatbotId)}, ${fullText}, 'assistant', NOW())
        `
        } catch (error) {
          console.error("Error saving assistant message:", error)
        }
      })
      .catch(console.error)

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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
