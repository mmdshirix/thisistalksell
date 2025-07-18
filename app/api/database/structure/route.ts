import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Dynamic import to avoid build-time issues
    const { getDatabaseStructure } = await import("@/lib/db")

    const result = await getDatabaseStructure()

    return NextResponse.json(result)
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
