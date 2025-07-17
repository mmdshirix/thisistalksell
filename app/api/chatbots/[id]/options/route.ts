import { type NextRequest, NextResponse } from "next/server"
import { getChatbotOptions, createChatbotOption, deleteChatbotOption } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const options = await getChatbotOptions(id)
    return NextResponse.json(options)
  } catch (error) {
    console.error("Error fetching options:", error)
    return NextResponse.json({ error: "Failed to fetch options" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbot_id = Number.parseInt(params.id)

    if (isNaN(chatbot_id)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const body = await request.json()

    if (!body.label) {
      return NextResponse.json({ error: "Label is required" }, { status: 400 })
    }

    const option = await createChatbotOption({
      chatbot_id,
      label: body.label,
      emoji: body.emoji || null,
      position: body.position || 0,
    })

    return NextResponse.json(option)
  } catch (error) {
    console.error("Error creating option:", error)
    return NextResponse.json({ error: "Failed to create option" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const optionId = searchParams.get("optionId")

    if (!optionId || isNaN(Number.parseInt(optionId))) {
      return NextResponse.json({ error: "Invalid option ID" }, { status: 400 })
    }

    const success = await deleteChatbotOption(Number.parseInt(optionId))

    if (!success) {
      return NextResponse.json({ error: "Failed to delete option" }, { status: 500 })
    }

    return NextResponse.json({ message: "Option deleted successfully" })
  } catch (error) {
    console.error("Error deleting option:", error)
    return NextResponse.json({ error: "Failed to delete option" }, { status: 500 })
  }
}
