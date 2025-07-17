import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"

export async function POST() {
  try {
    console.log("API: POST /api/database/init received. Starting complete database reset...")
    const result = await initializeDatabase()

    if (result.success) {
      console.log("API: Database reset and initialization successful.")
      return NextResponse.json(result)
    } else {
      console.error("API: Database reset and initialization failed.", result.message)
      return NextResponse.json(result, { status: 500 })
    }
  } catch (error) {
    console.error("API Error during database reset:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown server error"
    return NextResponse.json({ success: false, message: `خطای سرور: ${errorMessage}` }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message:
        "لطفاً از متد POST برای بازسازی کامل دیتابیس استفاده کنید. این کار معمولاً از طریق صفحه /database-setup انجام می‌شود.",
    },
    { status: 405 },
  )
}
