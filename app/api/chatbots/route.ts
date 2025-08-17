import { type NextRequest, NextResponse } from "next/server"
import { getChatbots, createChatbot, testDatabaseConnection } from "@/lib/db"

export async function GET() {
  try {
    console.log("[v0] API: Getting all chatbots...")

    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      console.error("[v0] Database connection failed:", connectionTest.message)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: connectionTest.message,
          success: false,
        },
        { status: 500 },
      )
    }

    const chatbots = await getChatbots()
    console.log(`[v0] API: Found ${chatbots.length} chatbots`)
    return NextResponse.json({ success: true, data: chatbots })
  } catch (error) {
    console.error("[v0] API Error fetching chatbots:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch chatbots",
        details: String(error),
        success: false,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] API: Creating new chatbot...")

    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      console.error("[v0] Database connection failed:", connectionTest.message)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: connectionTest.message,
          success: false,
        },
        { status: 500 },
      )
    }

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("[v0] Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          details: String(parseError),
          success: false,
        },
        { status: 400 },
      )
    }

    console.log("[v0] API: Request body:", body)

    // اعتبارسنجی داده‌های ورودی
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      console.error("[v0] API: Invalid name provided:", body.name)
      return NextResponse.json(
        {
          error: "نام چت‌بات الزامی است",
          success: false,
        },
        { status: 400 },
      )
    }

    const chatbotData = {
      name: body.name.trim(),
      welcome_message: body.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟",
      navigation_message: body.navigation_message || "چه چیزی شما را به اینجا آورده است؟",
      primary_color: body.primary_color || "#14b8a6",
      text_color: body.text_color || "#ffffff",
      background_color: body.background_color || "#f3f4f6",
      chat_icon: body.chat_icon || "💬",
      position: body.position || "bottom-right",
      margin_x: body.margin_x || 20,
      margin_y: body.margin_y || 20,
      deepseek_api_key: body.deepseek_api_key || null,
      knowledge_base_text: body.knowledge_base_text || null,
      knowledge_base_url: body.knowledge_base_url || null,
      store_url: body.store_url || null,
      ai_url: body.ai_url || null,
      stats_multiplier: body.stats_multiplier || 1.0,
    }

    console.log("[v0] API: Creating chatbot with data:", { name: chatbotData.name })
    const chatbot = await createChatbot(chatbotData)
    console.log("[v0] API: Chatbot created successfully with ID:", chatbot.id)

    return NextResponse.json(
      {
        success: true,
        data: chatbot,
        message: "چت‌بات با موفقیت ایجاد شد",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] API Error creating chatbot:", error)

    let errorMessage = "Failed to create chatbot"
    let statusCode = 500

    if (String(error).includes("Failed to fetch")) {
      errorMessage = "Database connection error - please check your connection"
      statusCode = 503
    } else if (String(error).includes("duplicate key")) {
      errorMessage = "A chatbot with this name already exists"
      statusCode = 409
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: String(error),
        success: false,
      },
      { status: statusCode },
    )
  }
}
