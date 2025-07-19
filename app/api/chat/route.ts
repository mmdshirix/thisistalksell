import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

const sql = neon(process.env.DATABASE_URL!)

// DeepSeek API configuration
const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: "https://api.deepseek.com",
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, chatbotId, userPhone } = body

    if (!message || !chatbotId) {
      return NextResponse.json(
        { error: "Message and chatbot ID are required" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        },
      )
    }

    // دریافت اطلاعات چت‌بات
    const chatbots = await sql`
      SELECT * FROM chatbots WHERE id = ${chatbotId}
    `

    if (chatbots.length === 0) {
      return NextResponse.json(
        { error: "Chatbot not found" },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        },
      )
    }

    const chatbot = chatbots[0]

    // دریافت FAQ ها
    const faqs = await sql`
      SELECT question, answer FROM faqs WHERE chatbot_id = ${chatbotId}
    `

    // دریافت محصولات
    const products = await sql`
      SELECT name, description, price, image_url FROM products WHERE chatbot_id = ${chatbotId}
    `

    // ساخت context برای AI
    let context = `شما یک دستیار فروش هوشمند هستید برای ${chatbot.name}.\n\n`

    if (faqs.length > 0) {
      context += "سوالات متداول:\n"
      faqs.forEach((faq: any) => {
        context += `س: ${faq.question}\nج: ${faq.answer}\n\n`
      })
    }

    if (products.length > 0) {
      context += "محصولات موجود:\n"
      products.forEach((product: any) => {
        context += `- ${product.name}: ${product.description} (قیمت: ${product.price})\n`
      })
    }

    context += `\nلطفاً به صورت مفید و دوستانه پاسخ دهید. اگر سوال مربوط به محصولات است، محصولات مناسب را پیشنهاد دهید.`

    // تولید پاسخ با AI
    const result = await generateText({
      model: deepseek("deepseek-chat"),
      messages: [
        {
          role: "system",
          content: context,
        },
        {
          role: "user",
          content: message,
        },
      ],
      maxTokens: 500,
      temperature: 0.7,
    })

    // ذخیره پیام در دیتابیس
    try {
      await sql`
        INSERT INTO messages (chatbot_id, user_phone, message, response, created_at)
        VALUES (${chatbotId}, ${userPhone || "anonymous"}, ${message}, ${result.text}, NOW())
      `
    } catch (dbError) {
      console.error("Database error:", dbError)
      // ادامه می‌دهیم حتی اگر ذخیره در دیتابیس مشکل داشته باشد
    }

    // بررسی محصولات مرتبط
    const suggestedProducts = products
      .filter(
        (product: any) =>
          message.toLowerCase().includes(product.name.toLowerCase()) ||
          product.description.toLowerCase().includes(message.toLowerCase()),
      )
      .slice(0, 3)

    return NextResponse.json(
      {
        response: result.text,
        suggestedProducts: suggestedProducts.length > 0 ? suggestedProducts : null,
        chatbotName: chatbot.name,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    )
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
