import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"

export async function POST() {
  try {
    console.log("API: Initializing database...")
    const result = await initializeDatabase()

    if (result.success) {
      console.log("API: Database initialization successful")
      return NextResponse.json(result)
    } else {
      console.error("API: Database initialization failed:", result.message)
      return NextResponse.json(result, { status: 500 })
    }
  } catch (error) {
    console.error("API: Database initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در راه‌اندازی دیتابیس: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST method to initialize database" }, { status: 405 })
}
