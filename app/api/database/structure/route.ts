import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 503 })
    }

    // Get all table structures
    const tables = await sql`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `

    // Group by table name
    const tableStructure: Record<string, any[]> = {}
    tables.forEach((row) => {
      if (!tableStructure[row.table_name]) {
        tableStructure[row.table_name] = []
      }
      tableStructure[row.table_name].push(row)
    })

    return NextResponse.json({
      success: true,
      tables: tableStructure,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database structure check error:", error)
    return NextResponse.json(
      {
        error: "Failed to check database structure",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
