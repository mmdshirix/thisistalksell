import { NextResponse } from "next/server"
import { testDatabaseConnection, initializeDatabase, getActiveDbEnvVar } from "@/lib/db"

// GET diagnostics (avoid 405)
export async function GET() {
  const result = await testDatabaseConnection()
  return NextResponse.json(
    {
      ok: result.ok,
      usingEnvVar: result.usingEnvVar ?? getActiveDbEnvVar(),
      error: result.error ?? null,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    },
    { status: result.ok ? 200 : 500 }
  )
}

// POST idempotent initializer
export async function POST() {
  const res = await initializeDatabase()
  return NextResponse.json(
    {
      success: res.success,
      message: res.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    },
    { status: res.success ? 200 : 500 }
  )
}
