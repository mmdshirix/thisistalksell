import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Dynamic import to avoid build-time issues
    const { sql } = await import("@/lib/db")

    // Get all tables and their columns
    const tables = await sql`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position
    `

    // Group columns by table
    const tableStructure: Record<string, any[]> = {}
    for (const row of tables) {
      if (!tableStructure[row.table_name]) {
        tableStructure[row.table_name] = []
      }
      tableStructure[row.table_name].push({
        column_name: row.column_name,
        data_type: row.data_type,
        is_nullable: row.is_nullable,
        column_default: row.column_default,
      })
    }

    return NextResponse.json({
      success: true,
      tables: tableStructure,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Database structure error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در دریافت ساختار دیتابیس: ${error.message}`,
        error: error.toString(),
      },
      { status: 500 },
    )
  }
}
