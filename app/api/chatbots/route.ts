import { type NextRequest, NextResponse } from "next/server"
import { getAllChatbots, createChatbot } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const chatbots = await getAllChatbots()
    return NextResponse.json(chatbots)
  } catch (error) {
    console.error("Error fetching chatbots:", error)
    return NextResponse.json({ error: "خطا در دریافت لیست چت‌بات‌ها" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json({ error: "نام چت‌بات الزامی است" }, { status: 400 })
    }

    const newChatbot = await createChatbot(body)
    return NextResponse.json(newChatbot, { status: 201 })
  } catch (error) {
    console.error("Error creating chatbot:", error)
    const errorMessage = error instanceof Error ? error.message : "خطای ناشناخته در ساخت چت‌بات"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
