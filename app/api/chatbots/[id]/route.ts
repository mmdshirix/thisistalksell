import { type NextRequest, NextResponse } from "next/server"
import { getChatbotById, updateChatbot, deleteChatbot } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ success: false, message: "Invalid ID." }, { status: 400 })
  }
  const result = await getChatbotById(id)
  return NextResponse.json(result, { status: result.success ? 200 : 404 })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ success: false, message: "Invalid ID." }, { status: 400 })
  }
  try {
    const body = await request.json()
    const result = await updateChatbot(id, body)
    return NextResponse.json(result, { status: result.success ? 200 : 500 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ success: false, message: "Invalid ID." }, { status: 400 })
  }
  const result = await deleteChatbot(id)
  return NextResponse.json(result)
}
