import { NextResponse } from "next/server"
import { getActiveDbEnvVar, initializeDatabase, testDatabaseConnection } from "@/lib/db"

// GET: diagnostics to avoid 405 and help verify env wiring in production
export async function GET() {
  const diag = await testDatabaseConnection()
  return NextResponse.json({
    ok: diag.success,
    message: diag.message,
    usingEnvVar: getActiveDbEnvVar(), // e.g. "DATABASE_URL" — no secrets
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
}

// POST: idempotent table initialization
export async function POST() {
  const result = await initializeDatabase()
  const diag = await testDatabaseConnection()
  return NextResponse.json({
    success: result.success && diag.success,
    message: result.message,
    connection: diag,
    timestamp: new Date().toISOString(),
  })
}
