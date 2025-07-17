import { NextResponse } from "next/server"
import { testDatabaseConnection } from "@/lib/db"

export async function GET() {
  try {
    console.log("API: Testing database connection...")
    const result = await testDatabaseConnection()

    if (result.success) {
      console.log("API: Database connection test successful")
      return NextResponse.json(result)
    } else {
      console.error("API: Database connection test failed:", result.message)
      return NextResponse.json(result, { status: 500 })
    }
  } catch (error) {
    console.error("API: Database connection test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در تست اتصال: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  return GET() // Same functionality for both GET and POST
}
