import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { query } = await import("@/lib/db")
    const { id } = params

    const result = await query("SELECT * FROM chatbots WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "چت‌بات یافت نشد",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error("Error fetching chatbot:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در دریافت چت‌بات: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { query } = await import("@/lib/db")
    const { id } = params
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
      UPDATE chatbots 
      SET name = $1, description = $2, website_url = $3, primary_color = $4, secondary_color = $5, 
          welcome_message = $6, placeholder_text = $7, position = $8, size = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
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
        id,
      ],
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "چت‌بات یافت نشد",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error("Error updating chatbot:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در بروزرسانی چت‌بات: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { query } = await import("@/lib/db")
    const { id } = params

    const result = await query("DELETE FROM chatbots WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "چت‌بات یافت نشد",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "چت‌بات با موفقیت حذف شد",
    })
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در حذف چت‌بات: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}
