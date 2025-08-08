export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { testDatabaseConnection } from "@/lib/db"

export async function GET() {
  try {
    const result = await testDatabaseConnection()
    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: `Connection error: ${String(error?.message || error)}`,
        usingEnvVar: null,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    )
  }
}
