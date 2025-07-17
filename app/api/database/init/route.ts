import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"

export async function GET() {
  try {
    const result = await initializeDatabase()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      {
        error: "خطا در راه‌اندازی دیتابیس",
        details: error instanceof Error ? error.message : "خطای نامشخص",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    const result = await initializeDatabase()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      {
        error: "خطا در راه‌اندازی دیتابیس",
        details: error instanceof Error ? error.message : "خطای نامشخص",
      },
      { status: 500 },
    )
  }
}
