import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET() {
  const sql = getSql()
  try {
    const result = await sql`SELECT NOW();`
    return NextResponse.json({ message: "Database connection successful", time: result[0].now })
  } catch (error) {
    console.error("Database connection test failed:", error)
    return NextResponse.json(
      { message: "Database connection failed", error: (error as Error).message },
      { status: 500 },
    )
  }
}
