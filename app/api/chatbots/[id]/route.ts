import { type NextRequest, NextResponse } from "next/server"
import { getChatbotById, getChatbotFAQs, getChatbotProducts } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number(params.id)

    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    // دریافت اطلاعات چت‌بات
    const chatbot = await getChatbotById(chatbotId)

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    // دریافت FAQs و Products
    const [faqs, products] = await Promise.all([getChatbotFAQs(chatbotId), getChatbotProducts(chatbotId)])

    const response = {
      chatbot: {
        id: chatbot.id,
        name: chatbot.name,
        primary_color: chatbot.primary_color || "#0D9488",
        text_color: chatbot.text_color || "#FFFFFF",
        background_color: chatbot.background_color || "#F9FAFB",
        chat_icon: chatbot.chat_icon || "💬",
        position: chatbot.position || "bottom-right",
        margin_x: chatbot.margin_x || 20,
        margin_y: chatbot.margin_y || 20,
        welcome_message: chatbot.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟",
        navigation_message: chatbot.navigation_message || "چه چیزی شما را به اینجا آورده است؟",
        knowledge_base_text: chatbot.knowledge_base_text,
        knowledge_base_url: chatbot.knowledge_base_url,
        store_url: chatbot.store_url,
        ai_url: chatbot.ai_url,
        stats_multiplier: chatbot.stats_multiplier || 1.0,
      },
      faqs: faqs || [],
      products: products || [],
    }

    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error fetching chatbot:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
