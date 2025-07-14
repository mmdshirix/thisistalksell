import { type NextRequest, NextResponse } from "next/server"
import { createTicket, getChatbotTickets } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatbot_id, name, email, phone, subject, message, image_url } = body

    if (!chatbot_id || !name || !email || !subject || !message) {
      return NextResponse.json({ error: "داده‌های ناقص" }, { status: 400 })
    }

    // Get user IP and user agent
    const userIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const ticket = await createTicket({
      chatbotId: Number.parseInt(chatbot_id),
      name: name.trim(),
      email: email.trim(),
      phone: phone || undefined,
      subject: subject.trim(),
      message: message.trim(),
      imageUrl: image_url || undefined,
      userIp,
      userAgent,
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json(
      {
        error: "خطا در ساخت تیکت",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get("chatbotId")

    if (!chatbotId) {
      return NextResponse.json({ error: "chatbotId is required" }, { status: 400 })
    }

    const tickets = await getChatbotTickets(Number.parseInt(chatbotId))
    return NextResponse.json({ tickets })
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json(
      {
        error: "خطا در دریافت تیکت‌ها",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
