import { NextResponse } from "next/server"
import { testDatabaseConnection, dbLogger } from "@/lib/db"

export async function GET() {
  try {
    const status = await testDatabaseConnection()
    const logs = dbLogger.getLogs()

    return NextResponse.json({
      status,
      logs,
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? "configured" : "not configured",
        DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ? "configured" : "not configured",
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: {
          success: false,
          message: `خطا در تست دیتابیس: ${error.message}`,
        },
        logs: [],
        error: error.message,
      },
      { status: 500 },
    )
  }
}
