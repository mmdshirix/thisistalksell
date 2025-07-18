import { NextResponse } from "next/server"

export async function POST() {
  try {
    const { initializeDatabase } = await import("@/lib/db")
    const result = await initializeDatabase()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در راه‌اندازی دیتابیس: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}
