import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"

export async function POST(request: NextRequest) {
  try {
    const { query } = await import("@/lib/db")
    const body = await request.json()
    const { message, chatbotId } = body

    if (!message || !chatbotId) {
      return NextResponse.json(
        {
          success: false,
          message: "پیام و شناسه چت‌بات الزامی است",
        },
        { status: 400 },
      )
    }

    // Get chatbot info
    const chatbotResult = await query("SELECT * FROM chatbots WHERE id = $1", [chatbotId])
    if (chatbotResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "چت‌بات یافت نشد",
        },
        { status: 404 },
      )
    }

    const chatbot = chatbotResult.rows[0]

    // Get FAQs for context
    const faqsResult = await query("SELECT question, answer FROM faqs WHERE chatbot_id = $1", [chatbotId])
    const faqs = faqsResult.rows

    // Get products for context
    const productsResult = await query("SELECT name, description, price FROM products WHERE chatbot_id = $1", [
      chatbotId,
    ])
    const products = productsResult.rows

    // Create context for AI
    let context = `شما یک دستیار هوشمند برای وب‌سایت ${chatbot.website_url || "این شرکت"} هستید. نام شما ${chatbot.name} است.`

    if (faqs.length > 0) {
      context += "\n\nسوالات متداول:\n"
      faqs.forEach((faq: any) => {
        context += `سوال: ${faq.question}\nجواب: ${faq.answer}\n\n`
      })
    }

    if (products.length > 0) {
      context += "\n\nمحصولات موجود:\n"
      products.forEach((product: any) => {
        context += `نام: ${product.name}\nتوضیحات: ${product.description}\nقیمت: ${product.price}\n\n`
      })
    }

    context += "\n\nلطفاً پاسخ مفیدی به زبان فارسی ارائه دهید."

    // Generate AI response
    const { text } = await generateText({
      model: deepseek("deepseek-chat"),
      system: context,
      prompt: message,
    })

    // Save message to database
    await query(
      `
      INSERT INTO messages (chatbot_id, user_message, bot_response, user_ip, user_agent)
      VALUES ($1, $2, $3, $4, $5)
    `,
      [
        chatbotId,
        message,
        text,
        request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        request.headers.get("user-agent") || "unknown",
      ],
    )

    return NextResponse.json({
      success: true,
      data: {
        message: text,
      },
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در پردازش پیام: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}
