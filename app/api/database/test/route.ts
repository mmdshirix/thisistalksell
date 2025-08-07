import { NextResponse } from "next/server"
import { testDatabaseConnection } from "@/lib/db"

export async function GET() {
  try {
    const result = await testDatabaseConnection()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Database test failed: ${error}` },
      { status: 500 }
    )
  }
}
