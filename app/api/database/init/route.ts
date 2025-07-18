import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Dynamic import to avoid build-time issues
    const { initializeDatabase } = await import("@/lib/db")

    const result = await initializeDatabase()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در راه‌اندازی دیتابیس: ${error.message}`,
        error: error.toString(),
      },
      { status: 500 },
    )
  }
}
