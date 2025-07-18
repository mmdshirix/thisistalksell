import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Dynamic import to avoid build-time issues
    const { testDatabaseConnection } = await import("@/lib/db")
    const result = await testDatabaseConnection()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در تست اتصال: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
