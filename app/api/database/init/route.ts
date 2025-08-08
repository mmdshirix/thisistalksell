import { NextResponse } from "next/server"
import {
  initializeDatabase,
  testDatabaseConnection,
  getActiveDbEnvVar,
} from "@/lib/db"

// Keep POST as the initializer (idempotent)
export async function POST() {
  try {
    const result = await initializeDatabase()
    const health = await testDatabaseConnection()
    return NextResponse.json({
      success: result.success && health.success,
      message: result.message,
      connection: health,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Database initialization failed: ${error}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Make GET return diagnostics (avoid noisy 405 in production)
export async function GET() {
  const health = await testDatabaseConnection()
  const activeVar = getActiveDbEnvVar()
  return NextResponse.json({
    ok: true,
    message: "Use POST to initialize tables. This GET endpoint returns DB diagnostics.",
    connection: health,
    usingEnvVar: activeVar, // e.g., "DATABASE_URL" (safe; no secrets)
    timestamp: new Date().toISOString(),
  })
}
