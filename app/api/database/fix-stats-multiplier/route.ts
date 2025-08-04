import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET() {
  const sql = getSql()
  try {
    // This script ensures the stats_multiplier column exists and has a default value
    await sql`
      ALTER TABLE chatbots
      ADD COLUMN IF NOT EXISTS stats_multiplier NUMERIC DEFAULT 1.0;
    `
    return NextResponse.json({ message: "Stats multiplier column ensured/fixed." })
  } catch (error) {
    console.error("Error fixing stats multiplier column:", error)
    return NextResponse.json(
      { message: "Failed to fix stats multiplier column", error: (error as Error).message },
      { status: 500 },
    )
  }
}
