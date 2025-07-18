import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { testDatabaseConnection } = await import("@/lib/db")
    const result = await testDatabaseConnection()

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    })
  } catch (error) {
    console.error("Error testing database connection:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در تست اتصال: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}
