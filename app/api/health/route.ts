import { NextResponse } from "next/server"
import { testDatabaseConnection } from "@/lib/db"

export async function GET() {
  try {
    const dbStatus = await testDatabaseConnection()

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbStatus.success ? "connected" : "disconnected",
      message: dbStatus.message,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
