import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { query } = await import("@/lib/db")

    const result = await query("SELECT * FROM chatbots ORDER BY created_at DESC")

    return NextResponse.json({
      success: true,
      data: result.rows,
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
    const { query } = await import("@/lib/db")
    const body = await request.json()

    const {
      name,
      description,
      website_url,
      primary_color,
      secondary_color,
      welcome_message,
      placeholder_text,
      position,
      size,
    } = body

    const result = await query(
      `
      INSERT INTO chatbots (name, description, website_url, primary_color, secondary_color, welcome_message, placeholder_text, position, size)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
      [
        name,
        description,
        website_url,
        primary_color,
        secondary_color,
        welcome_message,
        placeholder_text,
        position,
        size,
      ],
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0],
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
