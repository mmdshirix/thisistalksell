import { testDatabaseConnection } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const status = await testDatabaseConnection()
  if (status.success) {
    return NextResponse.json(status)
  } else {
    return NextResponse.json(status, { status: 500 })
  }
}
