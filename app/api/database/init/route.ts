import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"

// This route is specifically for initializing or updating the database schema.
// It should be protected in a real production environment.
export async function POST() {
  try {
    console.log("API: POST /api/database/init received. Initializing database...")
    const result = await initializeDatabase()

    if (result.success) {
      console.log("API: Database initialization successful.")
      return NextResponse.json(result)
    } else {
      console.error("API: Database initialization failed.", result.message)
      return NextResponse.json(result, { status: 500 })
    }
  } catch (error) {
    console.error("API Error initializing database:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown server error"
    return NextResponse.json({ success: false, message: `خطای سرور: ${errorMessage}` }, { status: 500 })
  }
}

// We add a GET handler to inform users how to use the endpoint correctly if they visit it in a browser.
export async function GET() {
  return NextResponse.json(
    {
      message:
        "لطفاً از متد POST برای راه‌اندازی دیتابیس استفاده کنید. این کار معمولاً از طریق صفحه /database-setup انجام می‌شود.",
    },
    { status: 405 },
  )
}
