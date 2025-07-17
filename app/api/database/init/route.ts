import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"

export async function POST() {
  try {
    console.log("🔄 Starting database initialization...")
    const result = await initializeDatabase()
    console.log("✅ Database initialization completed successfully")
    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در راه‌اندازی دیتابیس: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return POST() // Same functionality for both GET and POST
}
