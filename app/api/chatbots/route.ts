import { NextResponse } from "next/server"
import { getAllChatbots, createChatbot } from "@/lib/db"

export async function GET() {
  try {
    const bots = await getAllChatbots()
    return NextResponse.json({ success: true, data: bots })
  } catch (e: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Connection or query error: ${String(e?.message || e)}`,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "production",
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = body?.name as string
    const description = (body?.description as string) ?? null
    if (!name || typeof name !== "string") {
      return NextResponse.json({ success: false, message: "name is required" }, { status: 400 })
    }
    const bot = await createChatbot({ name, description })
    return NextResponse.json({ success: true, data: bot })
  } catch (e: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Connection or query error: ${String(e?.message || e)}`,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "production",
      },
      { status: 500 }
    )
  }
}
