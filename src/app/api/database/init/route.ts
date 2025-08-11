export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"

async function runInit() {
  const res = await initializeDatabase()
  return NextResponse.json(
    {
      success: res.success,
      message: res.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
    { status: res.success ? 200 : 500 }
  )
}

export async function GET() {
  return runInit()
}

export async function POST() {
  return runInit()
}
