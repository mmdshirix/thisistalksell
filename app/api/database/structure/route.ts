import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"

export async function GET() {
  const sql = getSql()
  try {
    const tables = await sql`
      SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';
    `
    const tableNames = tables.map((t) => t.tablename)

    const structure: { [key: string]: any[] } = {}
    for (const tableName of tableNames) {
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${tableName};
      `
      structure[tableName] = columns
    }

    return NextResponse.json({ message: "Database structure fetched successfully", structure })
  } catch (error) {
    console.error("Error fetching database structure:", error)
    return NextResponse.json(
      { message: "Failed to fetch database structure", error: (error as Error).message },
      { status: 500 },
    )
  }
}
