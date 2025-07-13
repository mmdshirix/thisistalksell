import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST() {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 503 })
    }

    // Check if column exists
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'chatbots' AND column_name = 'stats_multiplier'
    `

    if (columnCheck.length === 0) {
      // Add the column
      await sql`ALTER TABLE chatbots ADD COLUMN stats_multiplier DECIMAL(10,2) DEFAULT 1.0`

      // Update existing records
      await sql`UPDATE chatbots SET stats_multiplier = 1.0 WHERE stats_multiplier IS NULL`

      return NextResponse.json({
        success: true,
        message: "Column stats_multiplier added successfully",
        action: "added",
      })
    } else {
      return NextResponse.json({
        success: true,
        message: "Column stats_multiplier already exists",
        action: "exists",
      })
    }
  } catch (error) {
    console.error("Fix stats_multiplier error:", error)
    return NextResponse.json(
      {
        error: "Failed to fix stats_multiplier column",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
