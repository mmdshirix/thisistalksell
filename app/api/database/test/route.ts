import { NextResponse } from "next/server"
import { testDatabaseConnection, getActiveDbEnvVar } from "@/lib/db"

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
