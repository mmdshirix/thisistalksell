import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Dynamic import to avoid build-time issues
    const { testDatabaseConnection } = await import("@/lib/db")

    const result = await testDatabaseConnection()

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 500 })
    }
  } catch (error: any) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در تست اتصال: ${error.message}`,
        error: error.toString(),
      },
      { status: 500 },
    )
  }
}
