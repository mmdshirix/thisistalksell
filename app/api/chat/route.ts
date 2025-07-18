import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"

export async function POST(request: NextRequest) {
  try {
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

    // Get chatbot data and FAQs
    const { getChatbotById, getChatbotFAQs, getChatbotProducts, saveChatMessage } = await import("@/lib/db")

    const chatbotResult = await getChatbotById(Number.parseInt(chatbotId))
    if (!chatbotResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "چت‌بات یافت نشد",
        },
        { status: 404 },
      )
    }

    const faqsResult = await getChatbotFAQs(Number.parseInt(chatbotId))
    const productsResult = await getChatbotProducts(Number.parseInt(chatbotId))

    const chatbot = chatbotResult.data
    const faqs = faqsResult.success ? faqsResult.data : []
    const products = productsResult.success ? productsResult.data : []

    // Create context for AI
    let context = `شما یک دستیار هوشمند برای وب‌سایت ${chatbot.name} هستید.`

    if (chatbot.description) {
      context += ` توضیحات: ${chatbot.description}`
    }

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
      maxTokens: 500,
    })

    // Save message to database
    const userIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    await saveChatMessage(Number.parseInt(chatbotId), message, text, userIp)

    return NextResponse.json({
      success: true,
      response: text,
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
