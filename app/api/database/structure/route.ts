import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { query } = await import("@/lib/db")

    const result = await query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `)

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error("Database structure error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در دریافت ساختار دیتابیس: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}
