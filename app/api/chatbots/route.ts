import { type NextRequest, NextResponse } from "next/server"
import { getAllChatbots, createChatbot } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const chatbots = await getAllChatbots()
    return NextResponse.json(chatbots)
  } catch (error) {
    console.error("[API_ERROR] /api/chatbots GET:", error)
    return NextResponse.json({ error: "خطا در دریافت لیست چت‌بات‌ها" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let body
  try {
    body = await request.json()
    console.log("[API_LOG] /api/chatbots POST request body:", body)

    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json({ error: "نام چت‌بات الزامی است" }, { status: 400 })
    }

    // The createChatbot function now handles default values
    const newChatbot = await createChatbot(body)

    console.log("[API_SUCCESS] Chatbot created successfully:", newChatbot)
    return NextResponse.json(newChatbot, { status: 201 })
  } catch (error) {
    console.error("[API_ERROR] /api/chatbots POST:", error)
    const errorMessage = error instanceof Error ? error.message : "خطای ناشناخته در سرور"
    return NextResponse.json(
      {
        error: "خطا در ساخت چت‌بات",
        details: errorMessage,
        requestBody: body, // include body for easier debugging
      },
      { status: 500 },
    )
  }
}
