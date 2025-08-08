import { NextResponse } from "next/server"
import { getActiveDbEnvVar, testDatabaseConnection } from "@/lib/db"

export async function GET() {
  const diag = await testDatabaseConnection()
  return NextResponse.json({
    ok: diag.success,
    message: diag.message,
    usingEnvVar: getActiveDbEnvVar(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  }, { status: diag.success ? 200 : 500 })
}
