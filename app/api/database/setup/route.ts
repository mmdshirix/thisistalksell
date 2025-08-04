import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { readFileSync } from "fs"
import { join } from "path"

export async function GET() {
  const sql = getSql()
  try {
    const schemaPath = join(process.cwd(), "schema.sql")
    const schema = readFileSync(schemaPath, "utf8")
    await sql.unsafe(schema)
    return NextResponse.json({ message: "Database schema setup successfully" })
  } catch (error) {
    console.error("Error setting up database schema:", error)
    return NextResponse.json(
      { message: "Failed to setup database schema", error: (error as Error).message },
      { status: 500 },
    )
  }
}
