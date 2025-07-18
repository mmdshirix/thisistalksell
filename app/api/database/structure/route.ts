import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { getDatabaseStructure } = await import("@/lib/db")
    const result = await getDatabaseStructure()

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    })
  } catch (error) {
    console.error("Error getting database structure:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در دریافت ساختار دیتابیس: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}
