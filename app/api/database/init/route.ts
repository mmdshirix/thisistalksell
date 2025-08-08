import { NextResponse } from "next/server"
import { getActiveDbEnvVar, initializeDatabase, testDatabaseConnection } from "@/lib/db"

// GET: diagnostics (200 instead of 405)
export async function GET() {
  const diag = await testDatabaseConnection()
  return NextResponse.json({
    ...diag,
    usingEnvVar: getActiveDbEnvVar(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
}

// POST: initialize tables idempotently
export async function POST() {
  const result = await initializeDatabase()
  return NextResponse.json({
    ...result,
    timestamp: new Date().toISOString(),
  })
}
