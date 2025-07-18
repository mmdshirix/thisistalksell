import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    // Dynamic import to avoid build-time issues
    const { getChatbotOptions } = await import("@/lib/db")

    const options = await getChatbotOptions(chatbotId)
    return NextResponse.json(options)
  } catch (error) {
    console.error("Error fetching options:", error)
    return NextResponse.json({ error: "Failed to fetch options" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const body = await request.json()

    // Dynamic import to avoid build-time issues
    const { createChatbotOption } = await import("@/lib/db")

    const option = await createChatbotOption({
      chatbot_id: chatbotId,
      label: body.label,
      emoji: body.emoji || null,
      position: body.position || 0,
    })

    return NextResponse.json(option, { status: 201 })
  } catch (error) {
    console.error("Error creating option:", error)
    return NextResponse.json({ error: "Failed to create option" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const optionId = searchParams.get("optionId")

    if (!optionId) {
      return NextResponse.json({ error: "Option ID is required" }, { status: 400 })
    }

    // Dynamic import to avoid build-time issues
    const { deleteChatbotOption } = await import("@/lib/db")

    const success = await deleteChatbotOption(Number.parseInt(optionId))

    if (!success) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Option deleted successfully" })
  } catch (error) {
    console.error("Error deleting option:", error)
    return NextResponse.json({ error: "Failed to delete option" }, { status: 500 })
  }
}
