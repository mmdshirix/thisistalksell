import { NextResponse } from "next/server"
import { getAllChatbots, createChatbot } from "@/lib/db"

export async function GET() {
  try {
    const chatbots = await getAllChatbots()
    return NextResponse.json({ success: true, chatbots, count: chatbots.length })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch chatbots: ${error?.message || error}`,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const name = (body?.name || "").trim()
    if (!name) {
      return NextResponse.json({ success: false, message: "name is required" }, { status: 400 })
    }
    const chatbot = await createChatbot({ name, description: body?.description ?? null })
    return NextResponse.json({ success: true, chatbot }, { status: 201 })
  } catch (error: any) {
    const errorMessage = error?.message || error
    if (errorMessage.includes('relation "chatbots" does not exist')) {
      return NextResponse.json(
        {
          success: false,
          message: "Database tables not found. Please run POST /api/database/init first to initialize the database.",
          error: "TABLES_NOT_INITIALIZED",
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: `Failed to create chatbot: ${errorMessage}`,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 500 },
    )
  }
}
