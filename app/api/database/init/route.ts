import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { readFileSync } from "fs"
import { join } from "path"

export async function GET() {
  const sql = getSql()
  try {
    const schemaPath = join(process.cwd(), "scripts", "liara-init.sql")
    const schema = readFileSync(schemaPath, "utf8")
    await sql.unsafe(schema)
    return NextResponse.json({ message: "Database initialized successfully from liara-init.sql" })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      { message: "Failed to initialize database", error: (error as Error).message },
      { status: 500 },
    )
  }
}
