import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    // Dynamic import to avoid build-time issues
    const { getChatbot, getChatbotFAQs, getChatbotProducts } = await import("@/lib/db")

    const [chatbot, faqs, products] = await Promise.all([
      getChatbot(chatbotId),
      getChatbotFAQs(chatbotId),
      getChatbotProducts(chatbotId),
    ])

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    return NextResponse.json({
      chatbot,
      faqs,
      products,
    })
  } catch (error) {
    console.error("Error fetching chatbot:", error)
    return NextResponse.json({ error: "Failed to fetch chatbot" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const body = await request.json()

    // Dynamic import to avoid build-time issues
    const { updateChatbot } = await import("@/lib/db")

    const updatedChatbot = await updateChatbot(chatbotId, body)

    if (!updatedChatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    return NextResponse.json(updatedChatbot)
  } catch (error) {
    console.error("Error updating chatbot:", error)
    return NextResponse.json({ error: "Failed to update chatbot" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    // Dynamic import to avoid build-time issues
    const { deleteChatbot } = await import("@/lib/db")

    const deletedChatbot = await deleteChatbot(chatbotId)

    if (!deletedChatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Chatbot deleted successfully" })
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    return NextResponse.json({ error: "Failed to delete chatbot" }, { status: 500 })
  }
}
