import { NextRequest, NextResponse } from "next/server"
import { getChatbots, createChatbot } from "@/lib/db"

export async function GET() {
  try {
    const bots = await getChatbots()
    return NextResponse.json({ success: true, data: bots }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: String(error?.message || error),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body?.name || typeof body.name !== "string") {
      return NextResponse.json({ success: false, message: "name is required" }, { status: 400 })
    }
    const bot = await createChatbot({ name: body.name })
    return NextResponse.json({ success: true, data: bot }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: String(error?.message || error),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      },
      { status: 500 }
    )
  }
}
