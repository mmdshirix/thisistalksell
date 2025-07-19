import { type NextRequest, NextResponse } from "next/server"
import { getAllChatbots, createChatbot } from "@/lib/db"

export async function GET() {
  const result = await getAllChatbots()
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ success: false, message: "Name is required." }, { status: 400 })
    }

    const result = await createChatbot(name)
    return NextResponse.json(result, { status: result.success ? 201 : 500 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 })
  }
}
