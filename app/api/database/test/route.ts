import { NextResponse } from "next/server"
import { testDatabaseConnection } from "@/lib/db"

export async function GET() {
  const result = await testDatabaseConnection()
  if (result.ok) {
    return NextResponse.json({
      ok: true,
      usingEnvVar: result.usingEnvVar,
      environment: process.env.NODE_ENV || "production",
      timestamp: new Date().toISOString(),
    })
  }
  return NextResponse.json(
    {
      ok: false,
      message: `Connection error: ${result.error}`,
      usingEnvVar: result.usingEnvVar,
      environment: process.env.NODE_ENV || "production",
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  )
}
