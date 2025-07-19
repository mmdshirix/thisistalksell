import { streamText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import type { NextRequest } from "next/server"
import { saveMessage } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    // اضافه کردن CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }

    const { messages, chatbotId } = await req.json()

    if (!chatbotId) {
      return new Response(JSON.stringify({ error: "chatbotId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    }

    // دریافت اطلاعات چت‌بات
    const chatbotResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/chatbots/${chatbotId}`,
    )

    if (!chatbotResponse.ok) {
      return new Response(JSON.stringify({ error: "Chatbot not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    }

    const { chatbot, faqs, products } = await chatbotResponse.json()

    // آخرین پیام کاربر
    const lastMessage = messages[messages.length - 1]

    // ذخیره پیام کاربر
    try {
      await saveMessage({
        chatbot_id: Number.parseInt(chatbotId),
        user_message: lastMessage.content,
        bot_response: "", // هنوز پاسخ تولید نشده
        user_ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
      })
    } catch (error) {
      console.error("Error saving user message:", error)
    }

    // تولید prompt سیستم
    const systemPrompt = `
شما یک دستیار فروش هوشمند برای ${chatbot.name} هستید.

اطلاعات مهم:
- نام کسب‌وکار: ${chatbot.name}
- پیام خوش‌آمدگویی: ${chatbot.welcome_message}
- پیام راهنمایی: ${chatbot.navigation_message}

محصولات موجود:
${products.map((p: any) => `- ${p.name}: ${p.description} (قیمت: ${p.price} تومان)`).join("\n")}

سوالات متداول:
${faqs.map((f: any) => `- ${f.question}: ${f.answer}`).join("\n")}

دستورالعمل‌ها:
1. همیشه به زبان فارسی پاسخ دهید
2. مودب، دوستانه و مفید باشید
3. اگر سوال مرتبط با محصولات است، محصولات مناسب را پیشنهاد دهید
4. اگر محصولی مناسب سوال کاربر است، آن را در فرمت زیر پیشنهاد دهید:

SUGGESTED_PRODUCTS: [{"id": شناسه_محصول, "name": "نام_محصول", "description": "توضیحات", "price": قیمت, "image_url": "آدرس_تصویر", "product_url": "لینک_محصول", "button_text": "متن_دکمه"}]

5. برای ادامه مکالمه، سوالات پیشنهادی ارائه دهید:

NEXT_SUGGESTIONS: [{"text": "متن سوال پیشنهادی", "emoji": "ایموجی مناسب"}]

6. فقط محصولاتی را پیشنهاد دهید که واقعاً مرتبط با سوال کاربر هستند
7. حداکثر 2 محصول و 3 سوال پیشنهادی ارائه دهید
`

    const result = await streamText({
      model: deepseek("deepseek-chat"),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // ذخیره پاسخ بات (async)
    result.text.then(async (botResponse) => {
      try {
        await saveMessage({
          chatbot_id: Number.parseInt(chatbotId),
          user_message: lastMessage.content,
          bot_response: botResponse,
          user_ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown",
        })
      } catch (error) {
        console.error("Error saving bot response:", error)
      }
    })

    return result.toDataStreamResponse({
      headers: corsHeaders,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
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
