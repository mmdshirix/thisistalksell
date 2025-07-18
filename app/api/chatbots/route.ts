import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const { getAllChatbots } = await import("@/lib/db")
    const result = await getAllChatbots()

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    })
  } catch (error) {
    console.error("Error fetching chatbots:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در دریافت چت‌بات‌ها: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { createChatbot } = await import("@/lib/db")

    const result = await createChatbot({
      name: body.name,
      description: body.description,
      website_url: body.website_url,
      primary_color: body.primary_color,
      secondary_color: body.secondary_color,
      position: body.position,
      welcome_message: body.welcome_message,
    })

    return NextResponse.json(result, {
      status: result.success ? 201 : 500,
    })
  } catch (error) {
    console.error("Error creating chatbot:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در ایجاد چت‌بات: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}
