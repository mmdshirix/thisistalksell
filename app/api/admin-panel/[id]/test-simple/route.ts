import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET() {
  const sql = getSql()
  try {
    const result = await sql`SELECT NOW();`
    return NextResponse.json({ message: "Database connection successful (simple test)", time: result[0].now })
  } catch (error) {
    console.error("Simple database test failed:", error)
    return NextResponse.json(
      { message: "Database connection failed (simple test)", error: (error as Error).message },
      { status: 500 },
    )
  }
}
